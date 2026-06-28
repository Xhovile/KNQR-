import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, SlidersHorizontal, Sparkles, ArrowUpDown } from "lucide-react";
import { Product } from "./types";
import ProductCard from "./components/ProductCard";

interface FragrancesPageProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; value: string }) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  priceCurrency: "USD" | "MWK";
  onBackToHome: () => void;
}

export default function FragrancesPage({
  products,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  priceCurrency,
  onBackToHome,
}: FragrancesPageProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("price-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const subcategories = ["All", "Perfumes", "Colognes"];

  // Filter fragrances products
  const fragranceProducts = useMemo(() => {
    return products.filter((p) => (p.collectionCategory || "").toLowerCase() === "fragrances");
  }, [products]);

  // Apply filters and sort
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...fragranceProducts];

    // Subcategory Filter
    if (selectedSubcategory !== "All") {
      result = result.filter(
        (p) => (p.category || "").toLowerCase() === selectedSubcategory.toLowerCase()
      );
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => {
          const priceA = priceCurrency === "USD" ? a.priceUSD : a.priceMWK;
          const priceB = priceCurrency === "USD" ? b.priceUSD : b.priceMWK;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        result.sort((a, b) => {
          const priceA = priceCurrency === "USD" ? a.priceUSD : a.priceMWK;
          const priceB = priceCurrency === "USD" ? b.priceUSD : b.priceMWK;
          return priceB - priceA;
        });
        break;
      case "modified-new":
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "modified-old":
        result.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "delivery-available":
        result = result.filter((p) => p.delivery?.available);
        break;
      case "delivery-unavailable":
        result = result.filter((p) => !p.delivery?.available);
        break;
    }

    return result;
  }, [fragranceProducts, selectedSubcategory, searchQuery, sortBy, priceCurrency]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow"
    >
      {/* Back to Home Button */}
      <button
        onClick={onBackToHome}
        className="group mb-8 flex items-center space-x-3 text-xs font-mono tracking-widest uppercase text-chocolate/60 hover:text-gold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        <span>Return to Collections</span>
      </button>

      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden mb-12 border border-chocolate/10 bg-white/30 p-8 sm:p-12 lg:p-16 shadow-sm">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-chocolate leading-tight tracking-tight">
              Signature
              <span className="block italic text-gold font-light mt-1 font-serif">Fragrances</span>
            </h1>
          </div>

          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden luxury-border shadow-md bg-chocolate-light/5">
            <img
              src="/src/assets/images/knqr_fragrance_new_1782625278359.jpg"
              alt="Fragrance perfume bottle campaign asset"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-chocolate-dark/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Filters Section (Shop Style Card) */}
      <div className="bg-white/40 border border-chocolate/10 rounded-2xl p-4 sm:p-6 mb-10 space-y-4 relative z-10 backdrop-blur-md shadow-sm" id="collection-controls-container">
        <div className="flex flex-wrap items-center justify-start gap-3">
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => {
                if (showSort) {
                  setShowSort(false);
                  setShowFilters(true);
                } else {
                  setShowFilters(!showFilters);
                }
              }}
              className={`px-4 py-3 border rounded-xl text-xs font-mono tracking-wider uppercase flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer w-full sm:w-auto ${
                showFilters || selectedSubcategory !== "All"
                  ? "border-chocolate text-chocolate bg-chocolate/5 font-semibold"
                  : "border-chocolate/10 text-chocolate/70 hover:text-chocolate hover:border-chocolate/35 bg-white/40"
              }`}
              id="collection-filter-toggle-btn"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {selectedSubcategory !== "All" && `(${selectedSubcategory})`}</span>
            </button>

            {/* Sort Toggle Button */}
            <button
              onClick={() => {
                if (showSort) {
                  setShowSort(false);
                  setShowFilters(true);
                } else {
                  setShowSort(true);
                  setShowFilters(false);
                }
              }}
              className={`px-4 py-3 border rounded-xl text-xs font-mono tracking-wider uppercase flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer w-full sm:w-auto ${
                showSort
                  ? "border-chocolate text-chocolate bg-chocolate/5 font-semibold"
                  : "border-chocolate/10 text-chocolate/70 hover:text-chocolate hover:border-chocolate/35 bg-white/40"
              }`}
              id="collection-sort-toggle-btn"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort: {
                sortBy === "price-desc" ? "Price: High" :
                sortBy === "price-asc" ? "Price: Low" :
                sortBy === "modified-new" ? "Newest" :
                sortBy === "modified-old" ? "Oldest" :
                sortBy === "delivery-available" ? "Delivery" : "No Delivery"
              }</span>
            </button>

        </div>

        {/* Expandable Category Filtering Row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-chocolate/5 pt-4"
              id="collection-expandable-filters"
            >
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-mono uppercase text-chocolate/45 mr-2">
                  Subcategories:
                </span>
                {subcategories.map((cat) => {
                  const isSelected = selectedSubcategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedSubcategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? "bg-chocolate text-cream font-bold shadow-md shadow-chocolate/10"
                          : "bg-white/60 hover:bg-white border border-chocolate/10 text-chocolate/70 hover:text-chocolate"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expandable Sort Options Row */}
        <AnimatePresence>
          {showSort && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-chocolate/5 pt-4"
              id="collection-expandable-sort"
            >
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-mono uppercase text-chocolate/45 mr-2">
                  Sort By:
                </span>
                {[
                  { value: "price-desc", label: "Price: High to Low" },
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "modified-new", label: "Newest Arrivals" },
                  { value: "modified-old", label: "Oldest Specs" },
                  { value: "delivery-available", label: "Delivery Available" },
                  { value: "delivery-unavailable", label: "Pickup Only" },
                ].map((opt) => {
                  const isSelected = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? "bg-chocolate text-cream font-bold shadow-md shadow-chocolate/10"
                          : "bg-white/60 hover:bg-white border border-chocolate/10 text-chocolate/70 hover:text-chocolate"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fragrances Products Grid */}
      <div className="min-h-[400px]">
        {filteredAndSortedProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredAndSortedProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    key={product.id}
                  >
                    <ProductCard
                      product={product}
                      onViewDetails={onViewDetails}
                      onAddToCart={onAddToCart}
                      onToggleWishlist={onToggleWishlist}
                      isWishlisted={isWishlisted}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6 border border-chocolate/10 rounded-2xl bg-white/20 space-y-4">
            <h3 className="font-serif text-xl tracking-wide text-chocolate/80">
              No Fragrances Found
            </h3>
            <p className="text-xs text-chocolate/60 max-w-xs mx-auto leading-relaxed font-light">
              No matching fragrances are currently in our showroom catalog. Try adjusting your subcategory or search keywords.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
