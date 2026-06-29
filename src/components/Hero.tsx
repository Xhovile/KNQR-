import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import EditableHeroImage from "./EditableHeroImage";

interface HeroProps {
  onShopClick: () => void;
  heroImage: string;
  onUpdateHeroImage: (url: string) => Promise<void>;
}

export default function Hero({ onShopClick, heroImage, onUpdateHeroImage }: HeroProps) {
  return (
    <section 
      className="relative min-h-[55vh] flex flex-col justify-center items-center px-6 py-6 overflow-hidden border-b-4 border-chocolate bg-white"
      id="knqr-hero-section"
    >
      {/* Decorative Elegant Abstract Lines Behind the Image */}
      <div className="absolute inset-0 pointer-events-none opacity-40 select-none z-0">
        <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract curve lines reflecting fashion patterns */}
          <path 
            d="M-50 150C80 180 120 300 280 220C440 140 420 380 500 420" 
            stroke="#d4af37" 
            strokeWidth="0.75" 
            strokeDasharray="4 4" 
          />
          <path 
            d="M350 50C250 180 180 80 50 250C-80 420 150 500 100 650" 
            stroke="#d4af37" 
            strokeWidth="1" 
            className="opacity-75"
          />
          <circle cx="280" cy="220" r="4" fill="#d4af37" />
          <circle cx="50" cy="250" r="3" fill="#d4af37" className="opacity-50" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {/* Reusable Editable Portrait Lifestyle Image */}
        <div className="w-full mb-5">
          <EditableHeroImage
            src={heroImage}
            onSave={onUpdateHeroImage}
            alt="KNQR Premium Lifestyle Campaign Model"
            aspectClass="aspect-[3/2]"
          />
        </div>

        {/* Text Area */}
        <div className="text-center max-w-md px-2 relative mt-4" id="hero-text-content">
          {/* Elegant top-left accent bracket representing luxury layout */}
          <div className="absolute -left-2 -top-6 w-12 h-12 border-l border-t border-chocolate/20 pointer-events-none" />

          {/* Serif Headings */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
          >
            <h2 className="font-serif text-5xl sm:text-6xl font-normal tracking-tight text-chocolate mb-5 leading-tight select-none">
              Choose your
              <span className="block italic text-gold font-light mt-2 font-serif">best outfit</span>
            </h2>
          </motion.div>

          {/* Large Outlined Shop Now Button from Elegant Dark design with Dark Royal background */}
          <motion.button
            onClick={onShopClick}
            className="group px-10 py-4 border border-[#0b1b33] bg-[#0b1b33] hover:bg-[#122c54] text-cream hover:text-gold hover:border-gold font-sans text-[10px] tracking-[0.4em] uppercase transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 mx-auto cursor-pointer rounded-sm"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            id="hero-shop-now-btn"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
