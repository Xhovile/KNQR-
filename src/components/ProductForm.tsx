import React, { useState, useRef, useEffect } from "react";
import { 
  Check, 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  DollarSign, 
  Archive, 
  Truck, 
  ListPlus, 
  Eye, 
  HelpCircle,
  Undo
} from "lucide-react";
import { ProductDraftValues, PRODUCT_SCHEMA, createEmptyProductDraft, ProductStatus, ProductDeliveryMethod } from "../productSchema";
import { Product } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { uploadToCloudinary, isBase64Image } from "../utils/cloudinary";

interface ProductFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<ProductDraftValues> | Product;
  onCancel: () => void;
  onSubmit: (values: ProductDraftValues) => void;
}

// Preset luxury images from the workspace for quick selection
const PRESET_IMAGES = [
  { label: "Hero Model", url: "/src/assets/images/knqr_hero_model_1782618845727.jpg" },
  { label: "Earthy Apparel", url: "/src/assets/images/knqr_apparel_new_1782625253891.jpg" },
  { label: "Sculpted Accessory", url: "/src/assets/images/knqr_accessory_new_1782625265014.jpg" },
  { label: "Noir Essence Fragrance", url: "/src/assets/images/knqr_fragrance_new_1782625278359.jpg" },
  { label: "Luxe Necklace", url: "/src/assets/images/knqr_necklace_1782618869518.jpg" },
  { label: "Classic Black Shirt", url: "/src/assets/images/knqr_black_shirt_1782625829276.jpg" },
  { label: "Tailored Trousers", url: "/src/assets/images/knqr_trousers_1782618856513.jpg" },
];

export const SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Apparel": ["T-shirts", "Hoodies", "Sweaters", "Tracksuits", "Golf shirts", "Jackets", "3/4 sleeve shirts"],
  "Bags & Accessories": ["Backpacks", "Sling bags", "Gym bags", "Hustle bags", "Toilet bags"],
  "Fragrances": ["Perfumes", "Colognes"]
};

export default function ProductForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  // 1. Initialize state from initial values
  const [values, setValues] = useState<ProductDraftValues>(() => {
    const defaultDraft = createEmptyProductDraft();
    if (!initialValues) return defaultDraft;

    // Check if it's a full Product or ProductDraftValues
    const isFullProduct = "id" in initialValues;

    if (isFullProduct) {
      const prod = initialValues as Product;
      return {
        name: prod.name || "",
        priceUSD: prod.priceUSD ?? null,
        priceMWK: prod.priceMWK ?? null,
        collectionCategory: prod.collectionCategory || "Apparel",
        category: prod.category || "T-shirts",
        image: prod.image || "",
        images: prod.images || (prod.image ? [prod.image] : []),
        sizes: prod.sizes || [],
        colors: prod.colors || [],
        description: prod.description || "",
        status: prod.status || "draft",
        stock: prod.stock ?? null,
        deliveryMethod: (prod.delivery?.methods?.[0] as ProductDeliveryMethod) || "Pickup",
        deliveryNote: prod.delivery?.note || "",
        details: prod.details || [],
      };
    } else {
      return {
        ...defaultDraft,
        ...initialValues,
      } as ProductDraftValues;
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customDetailInput, setCustomDetailInput] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [customColorInput, setCustomColorInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle single field change
  const handleChange = (key: keyof ProductDraftValues, val: any) => {
    setValues((prev) => ({
      ...prev,
      [key]: val,
    }));
    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // 2. Variants handlers
  const handleToggleSize = (size: string) => {
    const current = values.sizes;
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    handleChange("sizes", next);
  };

  const handleAddCustomSize = () => {
    if (customSizeInput.trim() && !values.sizes.includes(customSizeInput.trim())) {
      handleChange("sizes", [...values.sizes, customSizeInput.trim()]);
      setCustomSizeInput("");
    }
  };

  const handleToggleColor = (color: string) => {
    const current = values.colors;
    const next = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    handleChange("colors", next);
  };

  const handleAddCustomColor = () => {
    if (customColorInput.trim() && !values.colors.includes(customColorInput.trim())) {
      handleChange("colors", [...values.colors, customColorInput.trim()]);
      setCustomColorInput("");
    }
  };

  // 3. Dynamic Specifications List handlers
  const handleAddDetail = (detail: string) => {
    if (detail.trim() && !values.details.includes(detail.trim())) {
      handleChange("details", [...values.details, detail.trim()]);
      setCustomDetailInput("");
    }
  };

  const handleRemoveDetail = (index: number) => {
    const next = values.details.filter((_, idx) => idx !== index);
    handleChange("details", next);
  };

  // 4. File uploads & drag & drop
  const processFiles = (files: FileList) => {
    const loadedUrls: string[] = [];
    let count = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === "string") {
          loadedUrls.push(e.target.result);
          count++;

          if (count === files.length) {
            // Append loaded URLs to gallery images
            const updatedImages = [...values.images, ...loadedUrls];
            // If primary image is empty, set the first uploaded as primary
            const updatedPrimary = values.image || loadedUrls[0];
            
            setValues((prev) => ({
              ...prev,
              images: updatedImages,
              image: updatedPrimary,
            }));

            // Clear errors
            if (errors.image) setErrors((prev) => { const n = { ...prev }; delete n.image; return n; });
            if (errors.images) setErrors((prev) => { const n = { ...prev }; delete n.images; return n; });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedUrl = values.images[indexToRemove];
    const nextImages = values.images.filter((_, idx) => idx !== indexToRemove);
    let nextPrimary = values.image;

    // If we removed the primary image, pick another one
    if (values.image === removedUrl) {
      nextPrimary = nextImages[0] || "";
    }

    setValues((prev) => ({
      ...prev,
      images: nextImages,
      image: nextPrimary,
    }));
  };

  const handleSelectPrimaryImage = (url: string) => {
    handleChange("image", url);
  };

  const handleSelectPresetImage = (url: string) => {
    if (!values.images.includes(url)) {
      setValues((prev) => ({
        ...prev,
        images: [...prev.images, url],
        image: prev.image || url,
      }));
    } else {
      handleChange("image", url);
    }
  };

  // 5. Validation and Submit
  const handlePublish = async () => {
    const validationErrors: Record<string, string> = {};

    if (!values.name.trim()) {
      validationErrors.name = "Product name is required.";
    }
    if (values.priceUSD === null || values.priceUSD === undefined || values.priceUSD <= 0) {
      validationErrors.priceUSD = "Valid USD price is required.";
    }
    if (values.priceMWK === null || values.priceMWK === undefined || values.priceMWK <= 0) {
      validationErrors.priceMWK = "Valid MWK price is required.";
    }
    if (!values.collectionCategory) {
      validationErrors.collectionCategory = "Please select a collection.";
    }
    if (!values.category) {
      validationErrors.category = "Please select a sub-category.";
    }
    if (!values.image) {
      validationErrors.image = "A primary image is required.";
    }
    if (!values.images || values.images.length === 0) {
      validationErrors.images = "At least one gallery image is required.";
    }
    if (!values.description.trim()) {
      validationErrors.description = "Product description is required.";
    }
    if (!values.status) {
      validationErrors.status = "Product status is required.";
    }
    if (values.stock === null || values.stock === undefined || values.stock < 0) {
      validationErrors.stock = "Stock quantity is required.";
    }
    if (!values.deliveryMethod) {
      validationErrors.deliveryMethod = "A default delivery method is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(`field-group-${firstErrorKey}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Set uploading state and start Cloudinary processing
    setIsUploading(true);
    setUploadError(null);
    setUploadProgressMsg("Checking specimen media for local uploads...");

    try {
      // Find all unique base64 images that need uploading
      const allImages = [values.image, ...values.images];
      const uniqueBase64s = Array.from(new Set(allImages.filter(isBase64Image)));

      const uploadedUrls: Record<string, string> = {};

      if (uniqueBase64s.length > 0) {
        for (let i = 0; i < uniqueBase64s.length; i++) {
          const base64 = uniqueBase64s[i];
          setUploadProgressMsg(`Uploading specimen image ${i + 1} of ${uniqueBase64s.length} to Cloudinary...`);
          const secureUrl = await uploadToCloudinary(base64);
          uploadedUrls[base64] = secureUrl;
        }
      }

      // Prepare final values with Cloudinary URLs substituted
      const finalPrimaryImage = uploadedUrls[values.image] || values.image;
      const finalGalleryImages = values.images.map((img) => uploadedUrls[img] || img);

      const finalValues: ProductDraftValues = {
        ...values,
        image: finalPrimaryImage,
        images: finalGalleryImages,
      };

      setUploadProgressMsg("Instantly syncing specimen to catalog...");
      onSubmit(finalValues);
    } catch (error: any) {
      console.error("Cloudinary upload failed:", error);
      setUploadError(error.message || "An unexpected error occurred during Cloudinary upload. Please check your credentials and connection.");
      // Keep isUploading true so they see the error dialog and can click "Close" or "Retry"
    }
  };

  const displayPriceUSD = values.priceUSD ? `$${Number(values.priceUSD).toLocaleString()}` : "$0";
  const displayPriceMWK = values.priceMWK ? `MK ${Number(values.priceMWK).toLocaleString()}` : "MK 0";

  return (
    <div className="min-h-screen bg-chocolate text-cream flex flex-col font-sans" id="product-form-root">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-40 bg-chocolate-dark/95 border-b border-cream/10 backdrop-blur-md py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-cream/5 rounded-full text-cream/70 hover:text-gold transition-colors cursor-pointer"
            id="product-form-back-btn"
            title="Cancel and return"
          >
            <Undo className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-gold uppercase font-bold">
              KNQR Curator
            </span>
            <h1 className="text-xl font-serif text-cream tracking-wide">
              {mode === "create" ? "Add New Specimen" : `Edit ${values.name || "Specimen"}`}
            </h1>
          </div>
        </div>

        {/* View toggles for real-time mobile preview layout */}
        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex p-1 bg-chocolate-dark border border-cream/10 rounded-xl space-x-1">
            <button
              onClick={() => setPreviewTab("edit")}
              className={`px-4 py-1.5 text-xs tracking-wider rounded-lg uppercase transition-all cursor-pointer ${
                previewTab === "edit" ? "bg-cream text-chocolate font-semibold" : "text-cream/50 hover:text-cream"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setPreviewTab("preview")}
              className={`px-4 py-1.5 text-xs tracking-wider rounded-lg uppercase transition-all cursor-pointer ${
                previewTab === "preview" ? "bg-cream text-chocolate font-semibold" : "text-cream/50 hover:text-cream"
              }`}
            >
              Live Preview
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: The actual form */}
        <div className={`space-y-8 lg:col-span-7 ${previewTab === "preview" ? "hidden lg:block" : "block"}`}>
          
          {/* Section 1: Basic Information */}
          <section className="bg-chocolate-dark/50 border border-cream/5 rounded-2xl p-6 space-y-6 luxury-glow" id="field-group-basic">
            <div className="flex items-center space-x-3 border-b border-cream/10 pb-4">
              <Sparkles className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-lg tracking-wide">Basic Specimen Information</h2>
            </div>

            <div className="space-y-4">
              {/* Product Name */}
              <div id="field-group-name" className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={values.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder={PRODUCT_SCHEMA.fields.find(f => f.key === "name")?.placeholder}
                  className="w-full bg-chocolate border border-cream/15 rounded-xl px-4 py-3.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/30"
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 font-mono tracking-wide">{errors.name}</p>
                )}
              </div>

              {/* Collection Category & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="field-group-collectionCategory" className="space-y-2">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                    Main Collection Category *
                  </label>
                  <select
                    value={values.collectionCategory}
                    onChange={(e) => {
                      const newColl = e.target.value;
                      setValues((prev) => ({
                        ...prev,
                        collectionCategory: newColl,
                        category: SUBCATEGORIES_MAP[newColl]?.[0] || ""
                      }));
                      // Clear errors for collection and category
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.collectionCategory;
                        delete next.category;
                        return next;
                      });
                    }}
                    className="w-full bg-chocolate border border-cream/15 rounded-xl px-4 py-3.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                  >
                    {PRODUCT_SCHEMA.fields.find(f => f.key === "collectionCategory")?.options?.map((opt) => (
                      <option key={opt} value={opt} className="bg-chocolate text-cream">
                        {opt} Collection
                      </option>
                    ))}
                  </select>
                </div>

                <div id="field-group-category" className="space-y-2">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                    Sub Category *
                  </label>
                  <select
                    value={values.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full bg-chocolate border border-cream/15 rounded-xl px-4 py-3.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                  >
                    {(SUBCATEGORIES_MAP[values.collectionCategory] || []).map((subopt) => (
                      <option key={subopt} value={subopt} className="bg-chocolate text-cream">
                        {subopt}
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] font-mono text-cream/40">Specific subcategory that changes dynamically based on the main category.</p>
                  {errors.category && (
                    <p className="text-xs text-rose-400 font-mono tracking-wide">{errors.category}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div id="field-group-status" className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                  Specimen Status *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["draft", "active", "sold_out", "archived"] as ProductStatus[]).map((status) => {
                    const isSelected = values.status === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleChange("status", status)}
                        className={`py-2 px-3 text-xs tracking-wider rounded-xl border font-mono uppercase transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gold border-gold text-chocolate font-bold"
                            : "border-cream/15 text-cream/60 hover:border-cream/30 hover:text-cream"
                        }`}
                      >
                        {status.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9px] font-mono text-cream/40">
                  {PRODUCT_SCHEMA.fields.find(f => f.key === "status")?.helpText}
                </p>
              </div>

              {/* Description */}
              <div id="field-group-description" className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                  The Story & Description *
                </label>
                <textarea
                  value={values.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder={PRODUCT_SCHEMA.fields.find(f => f.key === "description")?.placeholder}
                  rows={4}
                  className="w-full bg-chocolate border border-cream/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/30 resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-rose-400 font-mono tracking-wide">{errors.description}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Pricing & Inventory */}
          <section className="bg-chocolate-dark/50 border border-cream/5 rounded-2xl p-6 space-y-6 luxury-glow" id="field-group-pricing">
            <div className="flex items-center space-x-3 border-b border-cream/10 pb-4">
              <DollarSign className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-lg tracking-wide">Pricing & Inventory</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price MWK */}
              <div id="field-group-priceMWK" className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                  Malawian Kwacha (MWK) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xs font-mono text-cream/40">MK</span>
                  <input
                    type="number"
                    value={values.priceMWK !== null ? values.priceMWK : ""}
                    onChange={(e) => handleChange("priceMWK", e.target.value === "" ? null : Number(e.target.value))}
                    placeholder="175000"
                    className="w-full bg-chocolate border border-cream/15 rounded-xl pl-12 pr-4 py-3.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/30 font-mono"
                  />
                </div>
                {errors.priceMWK && (
                  <p className="text-xs text-rose-400 font-mono tracking-wide">{errors.priceMWK}</p>
                )}
              </div>

              {/* Price USD */}
              <div id="field-group-priceUSD" className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                  US Dollar (USD) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xs font-mono text-cream/40">$</span>
                  <input
                    type="number"
                    value={values.priceUSD !== null ? values.priceUSD : ""}
                    onChange={(e) => handleChange("priceUSD", e.target.value === "" ? null : Number(e.target.value))}
                    placeholder="100"
                    className="w-full bg-chocolate border border-cream/15 rounded-xl pl-10 pr-4 py-3.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/30 font-mono"
                  />
                </div>
                {errors.priceUSD && (
                  <p className="text-xs text-rose-400 font-mono tracking-wide">{errors.priceUSD}</p>
                )}
              </div>

              {/* Stock */}
              <div id="field-group-stock" className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                  Stock Specimen Count *
                </label>
                <input
                  type="number"
                  value={values.stock !== null ? values.stock : ""}
                  onChange={(e) => handleChange("stock", e.target.value === "" ? null : Number(e.target.value))}
                  placeholder="12"
                  className="w-full bg-chocolate border border-cream/15 rounded-xl px-4 py-3.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/30 font-mono"
                />
                {errors.stock && (
                  <p className="text-xs text-rose-400 font-mono tracking-wide">{errors.stock}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Media Gallery & Uploads */}
          <section className="bg-chocolate-dark/50 border border-cream/5 rounded-2xl p-6 space-y-6 luxury-glow" id="field-group-images">
            <div className="flex items-center space-x-3 border-b border-cream/10 pb-4">
              <Upload className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-lg tracking-wide">Specimen Media</h2>
            </div>

            <div className="space-y-6">
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-gold bg-gold/5" 
                    : "border-cream/15 hover:border-gold/45 bg-chocolate/30"
                }`}
                id="media-drop-zone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-gold mb-3 animate-pulse" />
                <p className="text-xs tracking-wider uppercase font-mono text-cream/80 text-center">
                  Drag & Drop Images here
                </p>
                <p className="text-[10px] text-cream/40 mt-1.5 text-center uppercase font-sans">
                  or click to browse local files (processed locally via base64)
                </p>
              </div>

              {/* Luxury Preset Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-cream/55 flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-gold" />
                  <span>Quick-select high-res preset images from the workspace</span>
                </label>
                <div className="flex gap-2 overflow-x-auto pb-3 select-none scrollbar-thin">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPresetImage(preset.url)}
                      className="px-3 py-1.5 bg-chocolate-dark border border-cream/10 rounded-lg text-[10px] tracking-wider uppercase font-mono text-cream/70 hover:text-gold hover:border-gold/50 transition-all shrink-0 cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Grid */}
              {values.images.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                    Media Gallery ({values.images.length} item{values.images.length > 1 ? "s" : ""})
                  </label>
                  <p className="text-[10px] font-mono text-cream/40 uppercase">
                    💡 Click on any image below to designate it as the <strong className="text-gold">Primary Cover Image</strong>.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="image-preview-grid">
                    {values.images.map((url, idx) => {
                      const isPrimary = values.image === url;
                      return (
                        <div
                          key={idx}
                          className={`relative aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all ${
                            isPrimary ? "border-gold ring-2 ring-gold/20" : "border-cream/10"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => handleSelectPrimaryImage(url)}
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Overlay indicators */}
                          {isPrimary && (
                            <div className="absolute top-2 left-2 bg-gold text-chocolate font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              Primary
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute bottom-2 right-2 p-1.5 bg-chocolate-dark/80 hover:bg-rose-600 rounded-lg text-cream/70 hover:text-white transition-colors cursor-pointer"
                            title="Remove image from gallery"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {errors.images && (
                <p className="text-xs text-rose-400 font-mono tracking-wide">{errors.images}</p>
              )}
              {errors.image && (
                <p className="text-xs text-rose-400 font-mono tracking-wide">{errors.image}</p>
              )}
            </div>
          </section>

          {/* Section 4: Variants & Options */}
          <section className="bg-chocolate-dark/50 border border-cream/5 rounded-2xl p-6 space-y-6 luxury-glow" id="field-group-variants">
            <div className="flex items-center space-x-3 border-b border-cream/10 pb-4">
              <Layers className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-lg tracking-wide">Variants & Adaptations</h2>
            </div>

            <div className="space-y-6">
              {/* Sizes Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                    Available Sizes / Capacities
                  </label>
                  <span className="text-[10px] font-mono text-cream/40 uppercase">
                    {values.sizes.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_SCHEMA.fields.find(f => f.key === "sizes")?.options?.map((size) => {
                    const isSelected = values.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggleSize(size)}
                        className={`px-4 py-2 text-xs font-mono tracking-wider border rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cream text-chocolate border-cream font-bold shadow-lg"
                            : "border-cream/15 text-cream/70 hover:border-cream/40"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Size */}
                <div className="flex items-center space-x-2 max-w-xs mt-3">
                  <input
                    type="text"
                    placeholder="Custom size..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomSize())}
                    className="flex-1 bg-chocolate border border-cream/15 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="p-2 bg-cream text-chocolate hover:bg-gold rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Colors Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                    Accent Tones / Material Colors
                  </label>
                  <span className="text-[10px] font-mono text-cream/40 uppercase">
                    {values.colors.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_SCHEMA.fields.find(f => f.key === "colors")?.options?.map((color) => {
                    const isSelected = values.colors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleToggleColor(color)}
                        className={`px-4 py-2 text-xs font-sans tracking-wide border rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cream text-chocolate border-cream font-semibold shadow-lg"
                            : "border-cream/15 text-cream/70 hover:border-cream/45"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Color */}
                <div className="flex items-center space-x-2 max-w-xs mt-3">
                  <input
                    type="text"
                    placeholder="Custom tone..."
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomColor())}
                    className="flex-1 bg-chocolate border border-cream/15 rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="p-2 bg-cream text-chocolate hover:bg-gold rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Delivery Details */}
          <section className="bg-chocolate-dark/50 border border-cream/5 rounded-2xl p-6 space-y-6 luxury-glow" id="field-group-deliveryMethod">
            <div className="flex items-center space-x-3 border-b border-cream/10 pb-4">
              <Truck className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-lg tracking-wide">Fulfillment & Delivery</h2>
            </div>

            <div className="space-y-4">
              {/* Delivery Methods */}
              <div id="field-group-deliveryMethod" className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                  Default Delivery Method *
                </label>
                <select
                  value={values.deliveryMethod}
                  onChange={(e) => handleChange("deliveryMethod", e.target.value)}
                  className="w-full bg-chocolate border border-cream/15 rounded-xl px-4 py-3.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-cream/30">Select fulfillment</option>
                  {PRODUCT_SCHEMA.fields.find(f => f.key === "deliveryMethod")?.options?.map((method) => (
                    <option key={method} value={method}>
                      {method} available
                    </option>
                  ))}
                </select>
                {errors.deliveryMethod && (
                  <p className="text-xs text-rose-400 font-mono tracking-wide">{errors.deliveryMethod}</p>
                )}
              </div>

              {/* Delivery Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                  Delivery Constraints or Notes
                </label>
                <textarea
                  value={values.deliveryNote}
                  onChange={(e) => handleChange("deliveryNote", e.target.value)}
                  placeholder="e.g. Free local handoff in Blantyre, courier dispatch..."
                  rows={2}
                  className="w-full bg-chocolate border border-cream/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/30 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Section 6: Sourcing & Specifications List */}
          <section className="bg-chocolate-dark/50 border border-cream/5 rounded-2xl p-6 space-y-6 luxury-glow" id="field-group-details">
            <div className="flex items-center space-x-3 border-b border-cream/10 pb-4">
              <ListPlus className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-lg tracking-wide">Sourcing & Craft Details</h2>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
                Specimen Specifications List ({values.details.length} defined)
              </label>

              {/* Added Items list */}
              <AnimatePresence>
                {values.details.length > 0 && (
                  <div className="space-y-2.5">
                    {values.details.map((detail, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between bg-chocolate/30 border border-cream/10 px-4 py-3 rounded-xl"
                      >
                        <div className="flex items-center space-x-2 text-sm text-cream/80">
                          <span className="text-gold">•</span>
                          <span>{detail}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDetail(index)}
                          className="text-cream/40 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Presets specify details quick select */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono uppercase text-cream/40">Suggested standard tags:</span>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_SCHEMA.fields.find(f => f.key === "details")?.options?.map((tag) => {
                    const isAdded = values.details.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddDetail(tag)}
                        className={`text-[10px] font-mono tracking-wider uppercase border rounded-lg px-2.5 py-1.5 transition-all ${
                          isAdded 
                            ? "border-cream/5 text-cream/20 cursor-default" 
                            : "border-cream/15 text-cream/60 hover:text-gold hover:border-gold/50 cursor-pointer"
                        }`}
                      >
                        + {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom specs text field */}
              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="text"
                  placeholder="Enter custom specification detail..."
                  value={customDetailInput}
                  onChange={(e) => setCustomDetailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDetail(customDetailInput))}
                  className="flex-1 bg-chocolate border border-cream/15 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/30"
                />
                <button
                  type="button"
                  onClick={() => handleAddDetail(customDetailInput)}
                  className="bg-cream hover:bg-gold text-chocolate px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all shrink-0 cursor-pointer"
                >
                  Add Detail
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Interactive Live Luxury Preview */}
        <div className={`lg:col-span-5 lg:sticky lg:top-28 self-start space-y-6 ${previewTab === "edit" ? "hidden lg:block" : "block"}`}>
          <div className="bg-chocolate-dark border border-cream/15 rounded-2xl p-6 shadow-2xl space-y-6 luxury-glow">
            <div className="flex items-center justify-between border-b border-cream/10 pb-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gold" />
                <span className="text-[10px] font-mono tracking-[0.3em] text-gold uppercase font-bold">
                  Live Client Card View
                </span>
              </div>
              <span className="text-[9px] font-mono text-cream/40 uppercase">
                Real-Time Render
              </span>
            </div>

            {/* Specimen Card Mock */}
            <div className="group flex flex-col items-center bg-transparent w-full max-w-sm mx-auto">
              <div className="relative w-full aspect-[3/4] mb-5 rounded-2xl overflow-hidden border border-cream/15 bg-chocolate-light/50">
                {values.image ? (
                  <img
                    src={values.image}
                    alt={values.name || "Preview"}
                    className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-cream/20">
                    <Upload className="w-8 h-8 mb-2 stroke-1" />
                    <span className="text-xs font-mono tracking-wider uppercase">Image Awaiting Designation</span>
                  </div>
                )}

                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <span className="inline-flex items-center rounded-full bg-chocolate text-cream px-3 py-1 text-[10px] font-semibold tracking-[0.25em] uppercase shadow-lg border border-cream/10">
                    {values.collectionCategory}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-500 text-white px-3 py-1 text-[10px] font-semibold tracking-[0.25em] uppercase shadow-lg">
                    {values.status.replace("_", " ")}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-bold tracking-[0.25em] uppercase text-cream/90 z-10 bg-chocolate-dark/50 p-2 rounded-xl backdrop-blur-sm border border-cream/5">
                  <span>{values.stock !== null && values.stock >= 0 ? `${values.stock} in stock` : "0 in stock"}</span>
                  <span>{values.deliveryMethod ? `${values.deliveryMethod} available` : "Pickup only"}</span>
                </div>
              </div>

              <div className="text-center w-full px-2">
                <h4 className="font-serif text-xl font-normal text-cream tracking-wide">
                  {values.name || "Specimen Title"}
                </h4>
                <div className="mt-2 flex items-center justify-center space-x-2 font-mono text-sm">
                  <span className="text-gold font-semibold">{displayPriceUSD}</span>
                  <span className="text-cream/40">|</span>
                  <span className="text-cream/60">{displayPriceMWK}</span>
                </div>
              </div>
            </div>

            {/* Sizes & Colors Preview list */}
            <div className="border-t border-cream/10 pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-cream/50">Curated Sizes:</span>
                <span className="font-mono text-cream font-medium">
                  {values.sizes.length > 0 ? values.sizes.join(", ") : "None specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/50">Accent Tones:</span>
                <span className="font-mono text-cream font-medium">
                  {values.colors.length > 0 ? values.colors.join(", ") : "None specified"}
                </span>
              </div>
              {values.deliveryNote && (
                <div className="bg-chocolate/40 p-3 rounded-xl border border-cream/5">
                  <p className="text-[10px] font-mono text-gold uppercase mb-1">Fulfillment Note</p>
                  <p className="text-[11px] text-cream/70 leading-relaxed font-sans">{values.deliveryNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 z-40 bg-chocolate-dark/95 border-t border-cream/10 backdrop-blur-md py-4 px-6 md:px-12 flex items-center justify-between shadow-2xl">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-cream/15 hover:border-cream/40 rounded-xl text-xs font-mono tracking-widest uppercase text-cream/70 hover:text-cream transition-all cursor-pointer"
          id="product-form-cancel-btn"
        >
          Cancel
        </button>

        <button
          onClick={handlePublish}
          className="px-8 py-3 bg-cream hover:bg-gold text-chocolate rounded-xl text-xs font-mono tracking-widest uppercase font-bold transition-all shadow-xl hover:scale-[1.01] cursor-pointer flex items-center space-x-2"
          id="product-form-publish-btn"
        >
          <Check className="w-4 h-4 text-chocolate" />
          <span>Publish Specimen</span>
        </button>
      </div>

      {/* Cloudinary Uploading & Status Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-chocolate-dark/95 backdrop-blur-md p-6"
            id="cloudinary-upload-overlay"
          >
            <div className="max-w-md w-full bg-chocolate border border-cream/15 rounded-2xl p-8 space-y-6 text-center shadow-2xl relative overflow-hidden luxury-glow">
              
              {/* Golden circular decorative background elements */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-gold/5 rounded-full blur-xl" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-gold/5 rounded-full blur-xl" />

              {!uploadError ? (
                <>
                  {/* Premium Spinner */}
                  <div className="flex justify-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-gold/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-gold rounded-full animate-spin" />
                      <Sparkles className="w-6 h-6 text-gold animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-lg tracking-wide text-cream">
                      Processing Media
                    </h3>
                    <p className="text-xs font-mono text-gold tracking-widest uppercase">
                      Direct Cloudinary Handshake
                    </p>
                  </div>

                  <div className="bg-chocolate-light/40 border border-cream/5 p-4 rounded-xl">
                    <p className="text-xs text-cream/70 leading-relaxed font-sans animate-pulse">
                      {uploadProgressMsg}
                    </p>
                  </div>

                  <p className="text-[10px] font-mono text-cream/40 uppercase">
                    Securing your high-res specimen visuals...
                  </p>
                </>
              ) : (
                <>
                  {/* Error State */}
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400">
                      <X className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-lg tracking-wide text-rose-400">
                      Sync Failed
                    </h3>
                    <p className="text-xs font-mono text-rose-400/65 tracking-widest uppercase">
                      Cloudinary Connection Error
                    </p>
                  </div>

                  <div className="bg-rose-950/20 border border-rose-500/10 p-4 rounded-xl text-left max-h-36 overflow-y-auto">
                    <p className="text-xs text-rose-300 leading-relaxed font-mono">
                      {uploadError}
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => setIsUploading(false)}
                      className="flex-1 py-3 border border-cream/15 hover:border-cream/35 rounded-xl text-xs font-mono tracking-wider uppercase text-cream/70 hover:text-cream transition-all cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={handlePublish}
                      className="flex-1 py-3 bg-gold hover:bg-gold-light text-chocolate rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all cursor-pointer"
                    >
                      Retry Upload
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
