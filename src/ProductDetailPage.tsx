import React, { useState, useEffect } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { Product } from "./types";
import { motion, AnimatePresence } from "motion/react";

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  priceCurrency: "USD" | "MWK";
}

export default function ProductDetailPage({
  product,
  onBack,
  onAddToCart,
  priceCurrency,
}: ProductDetailPageProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
    // Scroll to top when opening a product detail page
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [product.id]);

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
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen bg-chocolate text-cream flex flex-col"
      id="product-detail-page-container"
    >
      {/* Top Standalone Nav Bar */}
      <div className="border-b border-cream/5 bg-chocolate-dark/50 backdrop-blur-md sticky top-0 z-30 py-4 px-6 md:px-12 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cream/70 hover:text-gold font-sans text-xs tracking-widest uppercase transition-colors duration-200 cursor-pointer group"
          id="detail-back-button"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Curation</span>
        </button>
        <span className="font-mono text-[9px] tracking-[0.4em] text-gold uppercase font-bold">
          KNQR / {product.category}
        </span>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        
        {/* Left Column: Premium Gallery Layout */}
        <div className="space-y-6 flex flex-col justify-start">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden luxury-border bg-chocolate-dark shadow-2xl">
            <img
              src={imagesList[activeImageIndex] || product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-500"
              referrerPolicy="no-referrer"
              id="detail-main-preview-image"
            />
            {/* Dark premium vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-chocolate-dark/40 via-transparent to-transparent pointer-events-none" />
            
            {/* Ambient Corner Brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gold/40 rounded-tl-sm" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold/40 rounded-tr-sm" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold/40 rounded-bl-sm" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gold/40 rounded-br-sm" />
          </div>

          {/* Thumbnails Gallery */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-2 scrollbar-thin select-none" id="detail-thumbnails-row">
              {imagesList.map((imgSrc, idx) => {
                const isSelected = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer shrink-0 ${
                      isSelected 
                        ? "border-gold scale-105 shadow-md shadow-gold/10" 
                        : "border-cream/10 opacity-50 hover:opacity-100 hover:scale-102"
                    }`}
                    id={`detail-thumb-${idx}`}
                  >
                    <img
                      src={imgSrc}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Premium Form and Info Area */}
        <div className="flex flex-col justify-start space-y-8">
          
          {/* Title & Price Header */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-[0.4em] text-gold uppercase font-bold" id="detail-category-badge">
              {product.category} Collection
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-cream font-semibold tracking-wide leading-tight" id="detail-product-name">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 pt-1" id="detail-price-wrapper">
              <span className="font-mono text-xl md:text-2xl text-gold font-semibold tracking-wider">
                {displayPrice}
              </span>
              <span className="text-sm text-cream/40 line-through">
                ({otherPrice})
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-cream/10" />

          {/* Product Description */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono tracking-widest text-cream/40 uppercase">
              The Story
            </h4>
            <p className="text-sm font-sans font-light text-cream/80 leading-relaxed tracking-wide" id="detail-product-desc">
              {product.description}
            </p>
          </div>

          {/* Sizes and Accent Options Block */}
          <div className="space-y-6">
            
            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center select-none">
                  <span className="text-[10px] font-mono tracking-widest text-gold uppercase">
                    Select Size
                  </span>
                  <span className="text-[10px] font-sans text-cream/40 uppercase">
                    Fit Guide
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 text-xs font-mono tracking-wider border rounded-lg transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-cream text-chocolate border-cream font-semibold shadow-lg"
                          : "border-cream/15 text-cream/70 hover:border-cream/40 hover:text-cream"
                      }`}
                      id={`detail-size-btn-${size.toLowerCase()}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Accent Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase select-none">
                  Select Accent Color
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-5 py-2.5 text-xs font-sans tracking-wide border rounded-lg transition-all cursor-pointer ${
                        selectedColor === color
                          ? "bg-cream text-chocolate border-cream font-semibold shadow-lg"
                          : "border-cream/15 text-cream/70 hover:border-cream/40 hover:text-cream"
                      }`}
                      id={`detail-color-btn-${color.toLowerCase().replace(" ", "-")}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sourcing & Specifications Bullets */}
          {product.details && product.details.length > 0 && (
            <div className="space-y-3 border-t border-cream/10 pt-6">
              <span className="text-[10px] font-mono tracking-widest text-gold uppercase select-none">
                Sourcing & Specifications
              </span>
              <ul className="space-y-2.5 pl-1">
                {product.details.map((detail, index) => (
                  <li
                    key={index}
                    className="text-xs font-sans font-light text-cream/70 flex items-start space-x-2.5 leading-relaxed"
                  >
                    <span className="text-gold text-lg leading-none mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-cream/10" />

          {/* Buy Section: Quantity and Add to Bag */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-gold uppercase select-none">
                Order Quantity
              </span>
              <div className="flex items-center space-x-4 border border-cream/15 rounded-xl p-1 bg-chocolate-dark shadow-inner">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-cream/70 hover:text-cream hover:bg-cream/5 rounded-lg transition-colors cursor-pointer"
                  id="detail-qty-decrement"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-sm text-cream px-3 font-semibold select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-cream/70 hover:text-cream hover:bg-cream/5 rounded-lg transition-colors cursor-pointer"
                  id="detail-qty-increment"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA Buy Button */}
            <button
              onClick={handleAddToCart}
              disabled={addedMessage}
              className={`w-full py-4 rounded-xl font-sans text-xs tracking-[0.3em] uppercase transition-all duration-300 flex items-center justify-center space-x-3 cursor-pointer shadow-xl font-semibold ${
                addedMessage
                  ? "bg-green-600 text-white"
                  : "bg-cream text-chocolate hover:bg-gold hover:text-chocolate hover:scale-[1.01]"
              }`}
              id="detail-add-to-cart-cta"
            >
              {addedMessage ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Curation</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
