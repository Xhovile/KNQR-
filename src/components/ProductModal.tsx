import React, { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { Product } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size: string, color: string) => void;
  priceCurrency: "USD" | "MWK";
}

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  priceCurrency,
}: ProductModalProps) {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  const imagesList = product.images || [product.image];

  const displayPrice =
    priceCurrency === "USD"
      ? `$${product.priceUSD}`
      : `MK ${product.priceMWK.toLocaleString()}`;

  const otherPrice =
    priceCurrency === "USD"
      ? `MK ${product.priceMWK.toLocaleString()}`
      : `$${product.priceUSD}`;

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end justify-center bg-chocolate/80 backdrop-blur-sm p-4"
        id="product-modal-backdrop"
      >
        {/* Semi-transparent click-away background zone */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          className="relative w-full max-w-lg bg-chocolate-light rounded-t-3xl border border-cream/10 overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          id="product-modal-content"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-6 border-b border-cream/5 select-none">
            <div>
              <span className="text-[9px] font-mono tracking-[0.3em] text-gold uppercase">
                {product.category}
              </span>
              <h4 className="font-serif text-lg text-cream font-medium tracking-wide">
                Product Details
              </h4>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-cream/60 hover:text-cream hover:bg-cream/5 rounded-full transition-colors cursor-pointer"
              id="close-product-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Core */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Product Feature image with thumbnails gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden luxury-border bg-chocolate">
                <img
                  src={imagesList[activeImageIndex] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate-light via-transparent to-transparent opacity-40" />
              </div>
              
              {/* Gallery Thumbnails List */}
              {imagesList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin select-none" id="product-gallery-thumbnails">
                  {imagesList.map((imgSrc, idx) => {
                    const isSelected = idx === activeImageIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer shrink-0 ${
                          isSelected ? "border-gold scale-105" : "border-cream/10 opacity-60 hover:opacity-100"
                        }`}
                        id={`gallery-thumb-${idx}`}
                      >
                        <img
                          src={imgSrc}
                          alt={`${product.name} view ${idx + 1}`}
                          className="w-full h-full object-cover object-center"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Meta */}
            <div>
              <h3 className="font-serif text-2xl text-cream font-normal tracking-wide">
                {product.name}
              </h3>
              <div className="flex items-baseline space-x-3 mt-1 select-none">
                <span className="font-mono text-base text-gold font-semibold tracking-wider">
                  {displayPrice}
                </span>
                <span className="text-xs text-cream/40 line-through">
                  ({otherPrice})
                </span>
              </div>
            </div>

            {/* Product Description */}
            <p className="text-xs font-sans font-light text-cream/70 leading-relaxed tracking-wide">
              {product.description}
            </p>

            {/* Sizes selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase select-none">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-mono tracking-wider border rounded-md transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-cream text-chocolate border-cream font-medium"
                          : "border-cream/15 text-cream/70 hover:border-cream/40"
                      }`}
                      id={`size-btn-${size.toLowerCase()}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase select-none">
                  Select Accent
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs font-sans tracking-wide border rounded-md transition-all cursor-pointer ${
                        selectedColor === color
                          ? "bg-cream text-chocolate border-cream font-medium"
                          : "border-cream/15 text-cream/70 hover:border-cream/40"
                      }`}
                      id={`color-btn-${color.toLowerCase().replace(" ", "-")}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Materials / Details Bullets */}
            {product.details && product.details.length > 0 && (
              <div className="space-y-3 border-t border-cream/5 pt-4">
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase select-none">
                  Sourcing & Specifications
                </span>
                <ul className="space-y-2 pl-1">
                  {product.details.map((detail, index) => (
                    <li
                      key={index}
                      className="text-xs font-sans font-light text-cream/60 flex items-start space-x-2 leading-relaxed"
                    >
                      <span className="text-gold text-lg leading-none mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector Zone */}
            <div className="flex items-center justify-between border-t border-cream/5 pt-4">
              <span className="text-[10px] font-mono tracking-widest text-gold uppercase select-none">
                Quantity
              </span>
              <div className="flex items-center space-x-3 border border-cream/15 rounded-lg p-1 bg-chocolate">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 text-cream/70 hover:text-cream hover:bg-cream/5 rounded-md transition-colors cursor-pointer"
                  id="qty-decrement"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs text-cream px-3 font-semibold select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-cream/70 hover:text-cream hover:bg-cream/5 rounded-md transition-colors cursor-pointer"
                  id="qty-increment"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer CTA area */}
          <div className="p-6 border-t border-cream/5 bg-chocolate">
            <button
              onClick={handleAddToCart}
              disabled={addedMessage}
              className={`w-full py-4 rounded-full font-sans text-xs tracking-[0.3em] uppercase transition-all duration-300 flex items-center justify-center space-x-3 cursor-pointer shadow-lg font-semibold ${
                addedMessage
                  ? "bg-green-600 text-white"
                  : "bg-cream text-chocolate hover:bg-gold hover:text-chocolate"
              }`}
              id="add-to-cart-drawer-cta"
            >
              {addedMessage ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
