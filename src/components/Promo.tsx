import React from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

interface PromoProps {
  onShopClick: () => void;
}

export default function Promo({ onShopClick }: PromoProps) {
  return (
    <section 
      className="relative py-24 px-6 overflow-hidden flex flex-col items-center justify-center bg-cover bg-center border-b border-cream/5"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80')` }}
      id="knqr-promo-section"
    >
      {/* Dark premium overlay for magazine look & high text readability */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" />

      {/* Content overlay with elegant white/gold styling */}
      <div className="relative z-10 w-full max-w-md text-center px-6 py-10 bg-chocolate-dark/40 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center shadow-2xl" id="promo-content-wrapper">
        {/* Short promotional paragraph */}
        <p 
          className="text-sm sm:text-base font-sans font-light text-white/90 tracking-wide mb-8 leading-relaxed"
          id="promo-paragraph"
        >
          Explore our latest curation of premium tailored essentials. Crafted to elevate daily styling, each piece represents an unyielding commitment to exceptional quality, modern silhouette, and effortless self-expression.
        </p>

        {/* Elegant Gold/Cream Sharp Button in Deep Royal Blue */}
        <motion.button
          onClick={onShopClick}
          className="w-full py-4 bg-[#0b1b33] hover:bg-[#122c54] border border-[#0b1b33] hover:border-gold text-cream hover:text-gold font-sans text-xs tracking-[0.35em] uppercase transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 cursor-pointer font-bold rounded-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          id="promo-shop-now-btn"
        >
          <span>View All</span>
          <ArrowUpRight className="w-4 h-4 shrink-0" />
        </motion.button>
      </div>
    </section>
  );
}
