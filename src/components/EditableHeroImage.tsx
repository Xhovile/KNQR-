import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { uploadToCloudinary } from "../utils/cloudinary";

interface EditableHeroImageProps {
  src: string;
  onSave: (url: string) => Promise<void>;
  alt?: string;
  aspectClass?: string;
  isAdmin?: boolean;
}

export default function EditableHeroImage({
  src,
  onSave,
  alt = "KNQR Premium Campaign Asset",
  aspectClass = "aspect-[3/2]",
  isAdmin = false
}: EditableHeroImageProps) {
  const [showEditButton, setShowEditButton] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<"idle" | "cloudinary" | "firestore">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLongPress = () => {
    if (!isAdmin) return;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setShowEditButton(true);
    }, 600); // 600ms long press threshold
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setShowConfirmDialog(true);
        setShowEditButton(false);
        setUploadError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const SAVE_TIMEOUT_MS = 20000;

  const handleConfirmSave = async () => {
    if (!rawFile) return;

    setIsUploading(true);
    setUploadPhase("cloudinary");
    setUploadError(null);

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const secureUrl = await uploadToCloudinary(rawFile);

      setUploadPhase("firestore");

      await Promise.race([
        onSave(secureUrl),
        new Promise<void>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Saving hero image timed out. Check Firestore rules, auth, or network.")),
            SAVE_TIMEOUT_MS
          );
        }),
      ]);

      setTempImage(null);
      setRawFile(null);
      setShowConfirmDialog(false);
    } catch (err: any) {
      console.error("Failed to update hero image:", err?.message || String(err));
      setUploadError(err?.message || "Failed to save hero image. Please try again.");
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setIsUploading(false);
      setUploadPhase("idle");
    }
  };

  const handleCancelConfirm = () => {
    if (isUploading) return;
    setTempImage(null);
    setRawFile(null);
    setShowConfirmDialog(false);
    setUploadError(null);
  };

  return (
    <div className="relative w-full h-full">
      <motion.div
        className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden luxury-border luxury-glow group bg-chocolate-light cursor-pointer select-none`}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-chocolate-dark border border-cream/10 p-6 text-center select-none">
            <ImageIcon className="w-8 h-8 text-gold/40 mb-2 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-cream/50 uppercase">No Image Uploaded</span>
          </div>
        )}

        {/* Floating subtle helper hint for better user discoverability */}
        {isAdmin && (
          <div className="absolute top-3 right-3 bg-chocolate/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Hold to Edit
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Edit button pop-up overlay */}
        <AnimatePresence>
          {showEditButton && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-chocolate/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-20 space-y-3"
            >
              <span className="p-2 bg-gold/10 text-gold rounded-full">
                <ImageIcon className="w-5 h-5" />
              </span>
              <p className="text-xs font-mono text-gold tracking-widest uppercase">Admin Controls</p>
              <button
                onClick={handleEditClick}
                className="px-5 py-2.5 bg-cream hover:bg-gold text-chocolate font-bold rounded-xl text-xs font-mono tracking-widest uppercase transition-all cursor-pointer shadow-md"
              >
                Change Image
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditButton(false);
                }}
                className="text-xs font-mono text-cream/70 hover:text-cream underline uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Luxury dark gradient overlay to give a premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-chocolate via-chocolate/5 to-transparent opacity-45 pointer-events-none" />

        {/* Ambient Corner Accents */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gold/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gold/40 rounded-br-sm pointer-events-none" />
      </motion.div>

      {/* Confirmation Modal Overlay */}
      <AnimatePresence>
        {showConfirmDialog && tempImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-chocolate-dark/95 backdrop-blur-md p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-chocolate border border-cream/15 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden text-cream space-y-6"
            >
              <h3 className="font-serif text-xl tracking-wide text-cream">
                Confirm New Hero Image?
              </h3>
              <p className="text-[10px] font-mono text-gold tracking-widest uppercase">
                Preview of selected image
              </p>

              <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border border-cream/15 bg-chocolate-light/50 shadow-inner">
                <img
                  src={tempImage}
                  alt="New Hero Preview"
                  className="w-full h-full object-cover object-center"
                />
                
                {isUploading && (
                  <div className="absolute inset-0 bg-chocolate/85 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                    <p className="text-xs font-mono text-cream uppercase tracking-widest animate-pulse">
                      {uploadPhase === "cloudinary" 
                        ? "Uploading to Cloudinary..." 
                        : "Saving to secure database..."}
                    </p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono text-left">
                  {uploadError}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancelConfirm}
                  disabled={isUploading}
                  className="flex-1 py-3 border border-cream/15 hover:border-cream/35 rounded-xl text-xs font-mono tracking-wider uppercase text-cream/70 hover:text-cream transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isUploading}
                  className="flex-1 py-3 bg-cream hover:bg-gold text-chocolate font-bold rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
