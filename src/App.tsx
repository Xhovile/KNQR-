import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  ArrowUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Collection from "./components/Collection";
import Promo from "./components/Promo";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import ProductDetailPage from "./ProductDetailPage";

import { PRODUCTS } from "./data";
import { Product, CartItem, ActiveTab } from "./types";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceCurrency] = useState<"USD" | "MWK">("MWK");
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll for "back to top" button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleAddToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      return [...prev, { product, quantity, selectedSize: size, selectedColor: color }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleNavigation = (tab: ActiveTab) => {
    if (tab === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "shop") {
      const shopEl = document.getElementById("knqr-collection-section");
      if (shopEl) {
        shopEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (tab === "contact") {
      const contactEl = document.getElementById("knqr-footer-section");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveTab("home");
  };

  return (
    <div className="bg-chocolate min-h-screen text-cream flex flex-col relative" id="app-root-container">
      <AnimatePresence mode="wait">
        {selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            priceCurrency={priceCurrency}
          />
        ) : (
          <motion.div
            key="main-catalog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
          >
            {/* 1. Header Area */}
            <Header />

            {/* 2. Horizontal Navigation */}
            <Navigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onNavigate={handleNavigation} 
            />

            {/* 3. Hero Section */}
            <Hero onShopClick={() => handleNavigation("shop")} />

            {/* 4. Featured Collections Shelf */}
            <Collection
              products={PRODUCTS}
              onSelectProduct={(product) => setSelectedProduct(product)}
              onAddToCart={(prod) => handleAddToCart(prod, 1, prod.sizes?.[0], prod.colors?.[0])}
              priceCurrency={priceCurrency}
            />

            {/* 5. Promotional Banner Overlay */}
            <Promo onShopClick={() => handleNavigation("shop")} />

            {/* 6. Centered Chocolate Footer */}
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Access Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-[#0b1b33] text-cream hover:bg-[#122c54] hover:text-gold border border-gold/30 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center justify-center cursor-pointer group"
        id="floating-cart-trigger"
      >
        <ShoppingBag className="w-5 h-5" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-[10px] text-chocolate font-bold rounded-full flex items-center justify-center border border-chocolate animate-bounce">
            {cart.reduce((acc, item) => acc + item.quantity, 0)}
          </span>
        )}
      </button>

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 p-3 bg-chocolate-light text-cream/70 hover:text-cream rounded-full border border-cream/10 transition-colors shadow-lg cursor-pointer"
          id="scroll-to-top-btn"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Cart Drawer Modal */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        priceCurrency={priceCurrency}
      />
    </div>
  );
}
