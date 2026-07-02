import React, { useEffect, useMemo, useState } from "react";
import { Undo, Eye, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ProductDraftValues,
  PRODUCT_SCHEMA,
  createEmptyProductDraft,
  SUBCATEGORIES_MAP,
  ProductDeliveryMethod,
  ProductSchemaField,
  ProductCollectionCategory,
} from "../productSchema";
import { Product } from "../types";
import { uploadToCloudinary } from "../utils/cloudinary";

import FormAccordion from "./FormAccordion";
import FormField from "./FormField";
import ProductImageUploader from "./ProductImageUploader";
import FormActions from "./FormActions";

interface ProductFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<ProductDraftValues> | Product;
  onCancel: () => void;
  onSubmit: (values: ProductDraftValues) => void | Promise<void>;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function getExistingImages(values: ProductDraftValues): string[] {
  return uniqueStrings([values.image, ...(values.images || [])]);
}

export default function ProductForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductDraftValues>(() => {
    const defaultDraft = createEmptyProductDraft();
    if (!initialValues) return defaultDraft;

    const isFullProduct = "id" in initialValues;

    if (isFullProduct) {
      const prod = initialValues as Product;
      return {
        name: prod.name || "",
        priceUSD: prod.priceUSD ?? null,
        priceMWK: prod.priceMWK ?? null,
        collectionCategory: (prod.collectionCategory as ProductCollectionCategory) || "Apparel",
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

        fit: (prod as any).fit || "Regular Fit",
        material: (prod as any).material || "100% Malawian Cotton",
        apparelGender: (prod as any).apparelGender || "Unisex",
        sleeveType: (prod as any).sleeveType || "Short Sleeve",

        bagType: (prod as any).bagType || "Backpack",
        bagMaterial: (prod as any).bagMaterial || "Full-Grain Genuine Leather",
        strapType: (prod as any).strapType || "Adjustable Padded Shoulder Straps",
        bagCapacity: (prod as any).bagCapacity || "15L - 30L (Daily)",
        useCase: (prod as any).useCase || "Daily Commute & Office",

        volume: (prod as any).volume || "100ml",
        scentFamily: (prod as any).scentFamily || "Woody & Earthy",
        fragranceGender: (prod as any).fragranceGender || "Unisex / Fluid",
        concentration: (prod as any).concentration || "Eau de Parfum (EDP)",
        longevity: (prod as any).longevity || "Long-Lasting (6-8 Hours)",
        notes: (prod as any).notes || [],
      };
    }

    return {
      ...defaultDraft,
      ...initialValues,
    } as ProductDraftValues;
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    pricing: false,
    media: false,
    variants: false,
    delivery: false,
    extras: false,
  });
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const existingImages = useMemo(() => getExistingImages(values), [values.image, values.images]);

  useEffect(() => {
    if (mediaFiles.length === 0) {
      setMediaPreviewUrl("");
      return;
    }

    const preview = URL.createObjectURL(mediaFiles[0]);
    setMediaPreviewUrl(preview);

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [mediaFiles]);

  const isFieldActive = (field: ProductSchemaField, currentValues: ProductDraftValues) => {
    if (!field.dependsOn) return true;
    const { field: dependField, value: dependValue } = field.dependsOn;
    const actualValue = currentValues[dependField as keyof ProductDraftValues];
    if (Array.isArray(dependValue)) {
      return dependValue.includes(actualValue as string);
    }
    return actualValue === dependValue;
  };

  const doesSectionHaveError = (sectionKey: string) => {
    const sectionFields = PRODUCT_SCHEMA.sections.find((s) => s.key === sectionKey)?.fields || [];
    return sectionFields.some((fKey) => !!errors[fKey]);
  };

  const handleToggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleChange = (key: string, val: any) => {
    setValues((prev) => {
      const next = { ...prev, [key]: val };

      if (key === "collectionCategory") {
        const subcategories = SUBCATEGORIES_MAP[val] || [];
        next.category = subcategories[0] || "";
      }

      return next;
    });

    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const removeSavedImage = (url: string) => {
    setValues((prev) => {
      const current = uniqueStrings([prev.image, ...(prev.images || [])]);
      const next = current.filter((image) => image !== url);
      return {
        ...prev,
        image: next[0] || "",
        images: next.slice(1),
      };
    });
  };

  const setPrimarySavedImage = (url: string) => {
    setValues((prev) => {
      const current = uniqueStrings([prev.image, ...(prev.images || [])]);
      const next = current.filter((image) => image !== url);
      return {
        ...prev,
        image: url,
        images: next,
      };
    });
  };

  const handlePublish = async () => {
    const validationErrors: Record<string, string> = {};

    PRODUCT_SCHEMA.fields.forEach((field) => {
      if (!isFieldActive(field, values)) return;
      if (field.key === "image" || field.key === "images") return;

      const val = values[field.key as keyof ProductDraftValues];
      if (field.required && (val === null || val === undefined || val === "")) {
        validationErrors[field.key] = `${field.label} is required.`;
      }
    });

    const hasAnySavedOrStagedMedia = existingImages.length > 0 || mediaFiles.length > 0;
    if (!hasAnySavedOrStagedMedia) {
      validationErrors.images = "At least one product image is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const newOpenState = { ...openSections };
      PRODUCT_SCHEMA.sections.forEach((section) => {
        const hasSectionError = section.fields.some((fKey) => !!validationErrors[fKey]);
        if (hasSectionError) {
          newOpenState[section.key] = true;
        }
      });
      setOpenSections(newOpenState);

      const firstErrorKey = Object.keys(validationErrors)[0];
      setTimeout(() => {
        const errorElement = document.getElementById(`field-group-${firstErrorKey}`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);

      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgressMsg("Preparing product media...");

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        setUploadProgressMsg(`Uploading image ${i + 1} of ${mediaFiles.length} to Cloudinary...`);
        const secureUrl = await uploadToCloudinary(file);
        uploadedUrls.push(secureUrl);
      }

      const finalGallery = uniqueStrings([...uploadedUrls, ...existingImages]);
      const finalPrimaryImage = finalGallery[0] || "";

      const finalValues: ProductDraftValues = {
        ...values,
        image: finalPrimaryImage,
        images: finalGallery.slice(1),
      };

      setUploadProgressMsg("Finalizing and saving product to Firestore...");
      await onSubmit(finalValues);
      setIsUploading(false);
    } catch (err: any) {
      console.error("Upload process failed:", err?.message || String(err));
      setUploadError(err?.message || "An unexpected error occurred during image upload.");
      setIsUploading(false);
    }
  };

  const displayPriceUSD = values.priceUSD ? `$${Number(values.priceUSD).toLocaleString()}` : "$0";
  const displayPriceMWK = values.priceMWK ? `MK ${Number(values.priceMWK).toLocaleString()}` : "MK 0";
  const previewImage = mediaPreviewUrl || values.image || existingImages[0] || "";

  return (
    <div className="min-h-screen bg-light-brown text-chocolate flex flex-col font-sans" id="product-form-root">
      <div className="sticky top-0 z-40 bg-white/40 border-b border-chocolate/10 backdrop-blur-md py-4 px-6 md:px-12 flex items-center justify-between text-chocolate">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-chocolate/5 rounded-full text-chocolate/70 hover:text-gold transition-colors cursor-pointer"
            id="product-form-back-btn"
            title="Cancel and return"
          >
            <Undo className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-gold uppercase font-bold">
              KNQR Curator
            </span>
            <h1 className="text-xl font-serif text-chocolate tracking-wide">
              {mode === "create" ? "Add New Product" : `Edit ${values.name || "Product"}`}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex p-1 bg-white/40 border border-chocolate/10 rounded-xl space-x-1">
            <button
              type="button"
              onClick={() => setPreviewTab("edit")}
              className={`px-4 py-1.5 text-xs tracking-wider rounded-lg uppercase transition-all cursor-pointer select-none ${
                previewTab === "edit" ? "bg-chocolate text-cream font-semibold" : "text-chocolate/50 hover:text-chocolate"
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("preview")}
              className={`px-4 py-1.5 text-xs tracking-wider rounded-lg uppercase transition-all cursor-pointer select-none ${
                previewTab === "preview" ? "bg-chocolate text-cream font-semibold" : "text-chocolate/50 hover:text-chocolate"
              }`}
            >
              Live Preview
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`space-y-6 lg:col-span-7 ${previewTab === "preview" ? "hidden lg:block" : "block"}`}>
          {PRODUCT_SCHEMA.sections.map((section) => {
            const hasError = doesSectionHaveError(section.key);
            const activeFields = PRODUCT_SCHEMA.fields.filter(
              (f) => f.section === section.key && isFieldActive(f, values)
            );

            if (activeFields.length === 0) return null;

            return (
              <FormAccordion
                key={section.key}
                sectionKey={section.key}
                title={section.title}
                description={section.description}
                isOpen={!!openSections[section.key]}
                onToggle={() => handleToggleSection(section.key)}
                hasError={hasError}
              >
                {section.key === "media" ? (
                  <div className="space-y-5">
                    {existingImages.length > 0 && (
                      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Current saved images</p>
                            <p className="mt-1 text-sm text-slate-600">
                              Remove or set a different cover image before you publish changes.
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                            {existingImages.length} saved
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {existingImages.map((url, idx) => {
                            const isPrimary = values.image === url;
                            return (
                              <div key={`${url}-${idx}`} className={`overflow-hidden rounded-xl border bg-slate-50 ${isPrimary ? "border-gold ring-1 ring-gold/20" : "border-slate-200"}`}>
                                <div className="aspect-square w-full bg-slate-100">
                                  <img src={url} alt={`Current product image ${idx + 1}`} className="h-full w-full object-cover" />
                                </div>
                                <div className="border-t border-slate-200 px-2 py-2 space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-[11px] font-medium text-slate-600 truncate">
                                      {isPrimary ? "Primary image" : `Saved image ${idx + 1}`}
                                    </p>
                                    {isPrimary && (
                                      <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
                                        Cover
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setPrimarySavedImage(url)}
                                      className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100"
                                    >
                                      Set primary
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeSavedImage(url)}
                                      className="flex-1 rounded-lg border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-600 transition hover:bg-rose-50"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <ProductImageUploader
                      files={mediaFiles}
                      onFilesChange={setMediaFiles}
                      maxFiles={10}
                    />

                    {errors.images && (
                      <p className="text-sm font-medium text-rose-600">{errors.images}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {activeFields.map((field) => {
                      let fieldWithDynamicOptions = field;
                      if (field.key === "category") {
                        fieldWithDynamicOptions = {
                          ...field,
                          options: SUBCATEGORIES_MAP[values.collectionCategory] || [],
                        };
                      }

                      return (
                        <FormField
                          key={field.key}
                          field={fieldWithDynamicOptions}
                          value={values[field.key as keyof ProductDraftValues]}
                          onChange={(val) => handleChange(field.key, val)}
                          error={errors[field.key]}
                        />
                      );
                    })}
                  </div>
                )}
              </FormAccordion>
            );
          })}
        </div>

        <div className={`lg:col-span-5 lg:sticky lg:top-28 self-start space-y-6 ${previewTab === "edit" ? "hidden lg:block" : "block"}`}>
          <div className="bg-chocolate-dark border border-cream/15 rounded-2xl p-6 shadow-2xl space-y-6 text-cream">
            <div className="flex items-center justify-between border-b border-cream/10 pb-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gold" />
                <span className="text-[10px] font-mono tracking-[0.3em] text-gold uppercase font-bold">
                  Live Client Card View
                </span>
              </div>
              <span className="text-[9px] font-mono text-cream/40 uppercase tracking-widest">
                Real-Time Render
              </span>
            </div>

            <div className="group flex flex-col items-center bg-transparent w-full max-w-sm mx-auto">
              <div className="relative w-full aspect-[3/4] mb-5 rounded-2xl overflow-hidden border border-cream/15 bg-chocolate-light/50">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={values.name || "Preview"}
                    className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-cream/20">
                    <Eye className="w-8 h-8 mb-2 stroke-1" />
                    <span className="text-xs font-mono tracking-wider uppercase">Image Awaiting Designation</span>
                  </div>
                )}

                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <span className="inline-flex items-center rounded-full bg-chocolate text-cream px-3 py-1 text-[10px] font-semibold tracking-[0.25em] uppercase shadow-md border border-cream/10">
                    {values.collectionCategory}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full text-white px-3 py-1 text-[10px] font-semibold tracking-[0.25em] uppercase shadow-md ${
                      values.status === "active" ? "bg-emerald-600" : "bg-zinc-600"
                    }`}
                  >
                    {values.status}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-bold tracking-[0.25em] uppercase text-cream/90 z-10 bg-chocolate-dark/50 p-2 rounded-xl backdrop-blur-sm border border-cream/5">
                  <span>{values.stock !== null && values.stock >= 0 ? `${values.stock} in stock` : "0 in stock"}</span>
                  <span>{values.deliveryMethod ? `${values.deliveryMethod} available` : "Pickup only"}</span>
                </div>
              </div>

              <div className="text-center w-full px-2">
                <p className="text-[10px] font-mono tracking-widest uppercase text-gold mb-1">{values.category}</p>
                <h4 className="font-serif text-xl font-normal text-cream tracking-wide leading-tight">
                  {values.name || "Product Title"}
                </h4>
                <div className="mt-2.5 flex items-center justify-center space-x-2 font-mono text-sm">
                  <span className="text-gold font-semibold">{displayPriceUSD}</span>
                  <span className="text-cream/40">|</span>
                  <span className="text-cream/60">{displayPriceMWK}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-cream/10 pt-4 space-y-3.5 text-xs">
              {values.sizes && values.sizes.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-cream/50">Curated Sizes:</span>
                  <span className="font-mono text-cream font-medium">{values.sizes.join(", ")}</span>
                </div>
              )}
              {values.colors && values.colors.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-cream/50">Accent Tones:</span>
                  <span className="font-mono text-cream font-medium">{values.colors.join(", ")}</span>
                </div>
              )}

              {values.collectionCategory === "Apparel" && (
                <>
                  {values.fit && (
                    <div className="flex justify-between">
                      <span className="text-cream/50">Fit Style:</span>
                      <span className="font-mono text-cream font-medium">{values.fit}</span>
                    </div>
                  )}
                  {values.material && (
                    <div className="flex justify-between">
                      <span className="text-cream/50">Fabric composition:</span>
                      <span className="font-mono text-cream font-medium">{values.material}</span>
                    </div>
                  )}
                  {values.apparelGender && (
                    <div className="flex justify-between">
                      <span className="text-cream/50">Profile:</span>
                      <span className="font-mono text-cream font-medium">{values.apparelGender}</span>
                    </div>
                  )}
                </>
              )}

              {values.collectionCategory === "Bags & Accessories" && (
                <>
                  {values.bagType && (
                    <div className="flex justify-between">
                      <span className="text-cream/50">Accessory class:</span>
                      <span className="font-mono text-cream font-medium">{values.bagType}</span>
                    </div>
                  )}
                  {values.bagMaterial && (
                    <div className="flex justify-between">
                      <span className="text-cream/50">Sourced material:</span>
                      <span className="font-mono text-cream font-medium">{values.bagMaterial}</span>
                    </div>
                  )}
                  {values.bagCapacity && (
                    <div className="flex justify-between">
                      <span className="text-cream/50">Volume capacity:</span>
                      <span className="font-mono text-cream font-medium">{values.bagCapacity}</span>
                    </div>
                  )}
                </>
              )}

              {values.collectionCategory === "Fragrances" && (
                <>
                  {values.scentFamily && (
                    <div className="flex justify-between">
                      <span className="text-cream/50">Scent family:</span>
                      <span className="font-mono text-cream font-medium">{values.scentFamily}</span>
                    </div>
                  )}
                  {values.concentration && (
                    <div className="flex justify-between">
                      <span className="text-cream/50">Strength:</span>
                      <span className="font-mono text-cream font-medium">{values.concentration}</span>
                    </div>
                  )}
                  {values.longevity && (
                    <div className="flex justify-between">
                      <span className="text-cream/50">Longevity:</span>
                      <span className="font-mono text-cream font-medium">{values.longevity}</span>
                    </div>
                  )}
                </>
              )}

              {values.deliveryNote && (
                <div className="bg-chocolate/40 p-3 rounded-xl border border-cream/5 mt-2">
                  <p className="text-[9px] font-mono text-gold uppercase mb-1 tracking-wider">Fulfillment Note</p>
                  <p className="text-[11px] text-cream/70 leading-relaxed font-sans">{values.deliveryNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Extra bottom spacing to prevent overlapping with floating buttons and allow comfortable scrolling */}
        <div className="h-32 lg:col-span-12" />
      </div>

      <FormActions
        onCancel={onCancel}
        onSubmit={handlePublish}
        isSubmitting={isUploading}
        submitText={mode === "create" ? "Publish" : "Save Changes"}
      />

      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-chocolate-dark/95 backdrop-blur-md p-6"
            id="cloudinary-upload-overlay"
          >
            <div className="max-w-md w-full bg-chocolate border border-cream/15 rounded-2xl p-8 space-y-6 text-center shadow-2xl relative overflow-hidden text-cream">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-gold/5 rounded-full blur-xl" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-gold/5 rounded-full blur-xl" />

              {!uploadError ? (
                <>
                  <div className="flex justify-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-gold/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-gold rounded-full animate-spin" />
                      <Sparkles className="w-6 h-6 text-gold animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-lg tracking-wide text-cream">Processing Media</h3>
                    <p className="text-xs font-mono text-gold tracking-widest uppercase">Publishing product</p>
                  </div>

                  <div className="bg-chocolate-light/40 border border-cream/5 p-4 rounded-xl">
                    <p className="text-xs text-cream/70 leading-relaxed font-sans animate-pulse">{uploadProgressMsg}</p>
                  </div>

                  <p className="text-[10px] font-mono text-cream/40 uppercase">Securing your product visuals...</p>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400">
                      <X className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-lg tracking-wide text-rose-400">Sync Failed</h3>
                    <p className="text-xs font-mono text-rose-400/65 tracking-widest uppercase">Cloudinary Connection Error</p>
                  </div>

                  <div className="bg-rose-950/20 border border-rose-500/10 p-4 rounded-xl text-left max-h-36 overflow-y-auto">
                    <p className="text-xs text-rose-300 leading-relaxed font-mono">{uploadError}</p>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUploading(false)}
                      className="flex-1 py-3 border border-cream/15 hover:border-cream/35 rounded-xl text-xs font-mono tracking-wider uppercase text-cream/70 hover:text-cream transition-all cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
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
