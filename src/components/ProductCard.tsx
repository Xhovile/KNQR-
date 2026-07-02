import React, { useState } from "react";
import { Eye, ShoppingBag, Heart, Check, Sparkles } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; value: string }) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  key?: string;
}

function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Fallback default colors and sizes for safe interaction
  const defaultColor = product.colors?.[0] || "Default";
  const [selectedColor] = useState({ name: defaultColor, value: "#000" });

  const isSoldOut = product.stock <= 0 || product.status === "sold_out";
  const isDraft = product.status === "draft";
  const isComingSoon = product.stock === 999; // Special coding for Coming Soon mock state

  // Image swap on hover supporting single/multiple images
  const primaryImage = product.image || (product.images?.[0]) || "";
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut || isComingSoon) return;

    setIsAdding(true);
    // Grab first available size, or default to standard fallback size
    const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : ["One Size"];
    const size = sizesList[0] || "One Size";
    
    onAddToCart(product, size, selectedColor);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 1200);
  };

  const formattedMWK = product.priceMWK ? product.priceMWK.toLocaleString() : "0";
  const formattedUSD = product.priceUSD ? product.priceUSD.toLocaleString() : "0";

  return (
    <div
      onClick={() => onViewDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer group flex flex-col justify-between h-[225px] sm:h-[315px] bg-white/70 p-3 rounded-2xl border border-chocolate/10 hover:border-chocolate transition-all duration-300 shadow-2xs hover:shadow-lg relative"
      id={`product-card-${product.id}`}
    >
      {/* Draft Overlay Badge */}
      {isDraft && (
        <div className="absolute top-4 left-4 z-10 bg-amber-600/90 text-white text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded shadow-sm backdrop-blur-xs">
          DRAFT
        </div>
      )}

      {/* Image Gallery and Hover Effects */}
      <div className="aspect-square h-[135px] sm:h-[210px] w-full bg-chocolate/5 rounded-xl overflow-hidden relative border border-chocolate/5 flex-shrink-0 mx-auto">
        {/* Status Badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
          {isSoldOut ? (
            <span className="bg-rose-700 text-white text-[8px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
              SOLD OUT
            </span>
          ) : isComingSoon ? (
            <span className="bg-sky-800 text-white text-[8px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
              COMING SOON
            </span>
          ) : product.stock > 0 && product.stock < 5 ? (
            <span className="bg-amber-600 text-white text-[8px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs animate-pulse">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Alternate Image Swap on Hover with Smooth Scale Zoom */}
        {primaryImage ? (
          <img
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out scale-100 group-hover:scale-104"
            id={`product-card-image-${product.id}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-chocolate/5 p-4 text-center select-none">
            <Sparkles className="w-6 h-6 text-chocolate/20 mb-2 animate-pulse" />
            <span className="text-[9px] font-mono tracking-widest text-chocolate/40 uppercase">KNQR Premium</span>
          </div>
        )}

        {/* Quick View and Action Utility Overlay */}
        <div className="absolute inset-0 bg-chocolate/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          {/* Quick View Trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="p-2.5 bg-white hover:bg-chocolate hover:text-white text-chocolate rounded-full shadow-md transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 cursor-pointer"
            title="Quick View"
            id={`product-card-quick-view-${product.id}`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Wishlist Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`p-2.5 rounded-full shadow-md transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 delay-75 hover:scale-110 cursor-pointer ${
              isWishlisted 
                ? "bg-rose-600 text-white" 
                : "bg-white hover:bg-rose-50 text-chocolate hover:text-rose-600"
            }`}
            title="Add to Wishlist"
            id={`product-card-wishlist-${product.id}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="space-y-1 px-1 py-0.5">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-[11px] font-mono tracking-wider font-bold text-chocolate uppercase truncate group-hover:text-chocolate-light transition-colors">
            {product.name}
          </h4>
        </div>
        <div className="flex items-center justify-between font-mono text-[9px] text-chocolate/60 tracking-wider">
          <span>{product.collectionCategory || "KNQR"}</span>
          <span className="text-chocolate font-bold font-mono">
            MK {formattedMWK} <span className="text-chocolate/20">/</span> ${formattedUSD}
          </span>
        </div>
        {!isSoldOut && !isComingSoon && product.stock > 0 && product.stock < 5 && (
          <div className="text-[8px] font-mono font-semibold text-amber-600/90 flex items-center gap-1.5 animate-pulse mt-0.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-ping" />
            Urgent: {product.stock} left in stock
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ProductCard);
