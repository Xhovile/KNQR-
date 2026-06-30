import React, { useState, useMemo, useDeferredValue } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "./types";
import ProductCard from "./components/ProductCard";

interface ShopProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; value: string }) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  priceCurrency: "USD" | "MWK";
}

type SortOption = "price-asc" | "price-desc" | "modified-new" | "modified-old" | "delivery-available" | "delivery-unavailable";

export default function Shop({
  products,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  priceCurrency,
}: ShopProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("modified-new");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // Extract categories dynamically from current products list
  const categories = useMemo(() => {
    const list = products.map((p) => p.collectionCategory || p.category || "Apparel");
    const unique = Array.from(new Set(list));
    return ["All", ...unique];
  }, [products]);

  // Precomputed order map for stable O(1) index lookup
  const productOrder = useMemo(() => {
    return new Map(products.map((p, index) => [p.id, index]));
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => (p.collectionCategory || p.category || "Apparel") === selectedCategory
      );
    }

    // 2. Search Filter
    const q = deferredSearchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.collectionCategory && p.collectionCategory.toLowerCase().includes(q))
      );
    }

    // 3. Sort logic
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
        result.sort((a, b) => (productOrder.get(a.id) ?? 0) - (productOrder.get(b.id) ?? 0));
        break;
      case "modified-old":
        result.sort((a, b) => (productOrder.get(b.id) ?? 0) - (productOrder.get(a.id) ?? 0));
        break;
      case "delivery-available":
        result.sort((a, b) => {
          const aAvail = a.delivery?.available ?? false;
          const bAvail = b.delivery?.available ?? false;
          if (aAvail === bAvail) return 0;
          return aAvail ? -1 : 1;
        });
        break;
      case "delivery-unavailable":
        result.sort((a, b) => {
          const aAvail = a.delivery?.available ?? false;
          const bAvail = b.delivery?.available ?? false;
          if (aAvail === bAvail) return 0;
          return aAvail ? 1 : -1;
        });
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, deferredSearchQuery, sortBy, priceCurrency, productOrder]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("modified-new");
  };

  return (
    <section 
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow flex flex-col"
      id="knqr-shop-container"
    >
      {/* Decorative Golden Ambient Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none select-none z-0" />

      {/* Shop Title & Sub-header */}
      <div className="text-center mb-12 relative z-10" id="shop-header-text">
        <h2 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-chocolate uppercase mb-4">
          All Products
        </h2>
        <div className="w-16 h-[1px] bg-chocolate/30 mx-auto mb-4" />
        <p className="text-xs font-mono tracking-[0.3em] uppercase text-chocolate/70">
          Tailored Premium Essentials
        </p>
      </div>

      {/* Search and Filters Controller Rail */}
      <div className="bg-white/40 border border-chocolate/10 rounded-2xl p-4 sm:p-6 mb-10 space-y-4 relative z-10 backdrop-blur-md shadow-sm" id="shop-controls-container">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-chocolate/40">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search catalog by name, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/80 text-chocolate placeholder-chocolate/40 border border-chocolate/10 rounded-xl text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-light"
              id="shop-search-input"
            />
          </div>

          {/* Action Buttons: Filter Toggle & Sort Toggle */}
          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center justify-end gap-3">
            
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
                showFilters || selectedCategory !== "All"
                  ? "border-chocolate text-chocolate bg-chocolate/5 font-semibold"
                  : "border-chocolate/10 text-chocolate/70 hover:text-chocolate hover:border-chocolate/35 bg-white/40"
              }`}
              id="shop-filter-toggle-btn"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {selectedCategory !== "All" && `(${selectedCategory})`}</span>
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
              id="shop-sort-toggle-btn"
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
        </div>

        {/* Expandable Category Filtering Row */}
        <AnimatePresence>
          {(showFilters || (selectedCategory !== "All" && !showSort)) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-chocolate/5 pt-4"
              id="shop-expandable-filters"
            >
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-mono uppercase text-chocolate/45 mr-2">
                  Collections:
                </span>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
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
              id="shop-expandable-sort"
            >
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-mono uppercase text-chocolate/45 mr-2">
                  Sort By:
                </span>
                {[
                  { value: "price-desc", label: "Price: High" },
                  { value: "price-asc", label: "Price: Low" },
                  { value: "modified-new", label: "Modified: New" },
                  { value: "modified-old", label: "Modified: Old" },
                  { value: "delivery-available", label: "Delivery: Available" },
                  { value: "delivery-unavailable", label: "Delivery: Not Available" },
                ].map((opt) => {
                  const isSelected = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value as SortOption)}
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

      {/* Grid of Product Cards */}
      <div className="relative z-10 flex-grow" id="shop-cards-grid-wrapper">
        {filteredAndSortedProducts.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
            id="shop-products-grid"
          >
            <AnimatePresence>
              {filteredAndSortedProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                return (
                  <motion.div
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
          /* Empty Catalog State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-24 px-6 border border-chocolate/10 rounded-2xl bg-white/20 backdrop-blur-xs space-y-6"
            id="shop-empty-state"
          >
            <div className="w-16 h-16 bg-chocolate/5 border border-chocolate/10 rounded-full flex items-center justify-center text-chocolate/30">
              <RefreshCw className="w-6 h-6 animate-spin-slow text-chocolate/50" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-serif text-xl tracking-wide text-chocolate">
                No products match your selection
              </h3>
              <p className="text-xs text-chocolate/60 max-w-xs mx-auto leading-relaxed font-light">
                Adjust your filters or query, or restore the catalog parameters to discover luxury apparel garments.
              </p>
            </div>

            <button
              onClick={handleResetFilters}
              className="px-6 py-3 bg-chocolate hover:bg-chocolate-light text-cream font-mono text-xs tracking-widest uppercase font-bold rounded-xl transition-all cursor-pointer shadow-lg"
              id="shop-reset-filters-btn"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
