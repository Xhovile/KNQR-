import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, 
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
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import Shop from "./Shop";
import ApparelPage from "./ApparelPage";
import BagsAndAccessoriesPage from "./BagsAndAccessoriesPage";
import FragrancesPage from "./FragrancesPage";
import ContactPage from "./ContactPage";
import Skeleton from "./components/Skeleton";
import { ProductDraftValues } from "./productSchema";

import { PRODUCTS } from "./data";
import { Product, CartItem, ActiveTab } from "./types";

export default function App() {
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceCurrency] = useState<"USD" | "MWK">("MWK");
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [currentSkeletonType, setCurrentSkeletonType] = useState<"grid" | "detail" | "form" | "home">("home");

  const transitionTo = (
    tab: ActiveTab,
    product: Product | null = null,
    isCreating = false,
    editing: Product | null = null,
    skipPush = false
  ) => {
    let skeletonType: "grid" | "detail" | "form" | "home" = "grid";
    if (isCreating || editing) {
      skeletonType = "form";
    } else if (product) {
      skeletonType = "detail";
    } else if (tab === "home") {
      skeletonType = "home";
    }

    setCurrentSkeletonType(skeletonType);
    setIsPageLoading(true);

    setActiveTab(tab);
    setSelectedProduct(product);
    setIsCreatingProduct(isCreating);
    setEditingProduct(editing);

    // Scroll to top of the page on transition
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!skipPush) {
      const stateObj = {
        activeTab: tab,
        selectedProductId: product ? product.id : null,
        isCreatingProduct: isCreating,
        editingProductId: editing ? editing.id : null,
      };
      window.history.pushState(stateObj, "");
    }

    setTimeout(() => {
      setIsPageLoading(false);
    }, 450);
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.length > 1) {
      window.history.back();
    } else {
      transitionTo("home", null, false, null);
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        const foundProduct = PRODUCTS.find((p) => p.id === state.selectedProductId) || null;
        const actualProduct = productsList.find((p) => p.id === state.selectedProductId) || foundProduct;
        
        const foundEditing = PRODUCTS.find((p) => p.id === state.editingProductId) || null;
        const actualEditing = productsList.find((p) => p.id === state.editingProductId) || foundEditing;

        transitionTo(
          state.activeTab || "home",
          actualProduct,
          !!state.isCreatingProduct,
          actualEditing,
          true
        );
      } else {
        transitionTo("home", null, false, null, true);
      }
    };

    window.addEventListener("popstate", handlePopState);

    // Initial state setup
    if (!window.history.state) {
      const initialState = {
        activeTab: "home",
        selectedProductId: null,
        isCreatingProduct: false,
        editingProductId: null,
      };
      window.history.replaceState(initialState, "");
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [productsList]);


  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "contact") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveTab("home");
  };

  const handleCreateProductSubmit = (values: ProductDraftValues) => {
    const newId = `knqr-${values.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const newProduct: Product = {
      id: newId,
      name: values.name,
      priceUSD: values.priceUSD || 0,
      priceMWK: values.priceMWK || 0,
      image: values.image || "",
      images: values.images || [],
      category: values.category || "T-shirts",
      collectionCategory: values.collectionCategory,
      description: values.description,
      sizes: values.sizes,
      colors: values.colors,
      details: values.details,
      status: values.status,
      stock: values.stock || 0,
      delivery: {
        available: values.deliveryMethod !== "Pickup",
        methods: [values.deliveryMethod].filter(Boolean) as string[],
        note: values.deliveryNote
      }
    };

    setProductsList((prev) => [newProduct, ...prev]);
    setIsCreatingProduct(false);
  };

  const handleEditProductSubmit = (values: ProductDraftValues) => {
    if (!editingProduct) return;

    const updatedProduct: Product = {
      ...editingProduct,
      name: values.name,
      priceUSD: values.priceUSD || 0,
      priceMWK: values.priceMWK || 0,
      image: values.image || "",
      images: values.images || [],
      category: values.category || "T-shirts",
      collectionCategory: values.collectionCategory,
      description: values.description,
      sizes: values.sizes,
      colors: values.colors,
      details: values.details,
      status: values.status,
      stock: values.stock || 0,
      delivery: {
        available: values.deliveryMethod !== "Pickup",
        methods: [values.deliveryMethod].filter(Boolean) as string[],
        note: values.deliveryNote
      }
    };

    setProductsList((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
  };

  return (
    <div className="bg-chocolate min-h-screen text-cream flex flex-col relative" id="app-root-container">
      <AnimatePresence mode="wait">
        {isPageLoading ? (
          <motion.div
            key="skeleton-loader-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-grow flex flex-col justify-center"
          >
            {currentSkeletonType === "grid" || currentSkeletonType === "home" ? (
              <div className="flex flex-col min-h-screen">
                <Header />
                <Navigation 
                  activeTab={activeTab} 
                  setActiveTab={(tab) => transitionTo(tab, null, false, null)} 
                  onNavigate={handleNavigation} 
                  onCreateProduct={() => transitionTo(activeTab, null, true, null)}
                />
                <Skeleton type={currentSkeletonType} />
                <Footer />
              </div>
            ) : (
              <Skeleton type={currentSkeletonType} />
            )}
          </motion.div>
        ) : isCreatingProduct ? (
          <AddProduct
            key="add-product-screen"
            onCancel={handleGoBack}
            onSubmit={handleCreateProductSubmit}
          />
        ) : editingProduct ? (
          <EditProduct
            key="edit-product-screen"
            product={editingProduct}
            onCancel={handleGoBack}
            onSubmit={handleEditProductSubmit}
          />
        ) : selectedProduct ? (
          <ProductDetailPage
            key="product-detail-screen"
            product={selectedProduct}
            onBack={handleGoBack}
            onAddToCart={handleAddToCart}
            priceCurrency={priceCurrency}
            onEditProduct={(prod) => {
              transitionTo(activeTab, null, false, prod);
            }}
          />
        ) : (
          <motion.div
            key="main-catalog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col min-h-screen"
          >
            {/* 1. Header Area */}
            <Header />

            {/* 2. Horizontal Navigation */}
            <Navigation 
              activeTab={activeTab} 
              setActiveTab={(tab) => transitionTo(tab, null, false, null)} 
              onNavigate={handleNavigation} 
              onCreateProduct={() => transitionTo(activeTab, null, true, null)}
            />

            <AnimatePresence mode="wait">
              {activeTab === "shop" ? (
                <motion.div
                  key="shop-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col flex-grow bg-light-brown text-chocolate border-b border-chocolate/5"
                >
                  <Shop
                    products={productsList}
                    onViewDetails={(product) => transitionTo(activeTab, product, false, null)}
                    onAddToCart={(product, size, color) => handleAddToCart(product, 1, size, color.name)}
                    onToggleWishlist={handleToggleWishlist}
                    wishlist={wishlist}
                    priceCurrency={priceCurrency}
                  />
                </motion.div>
              ) : activeTab === "apparel" ? (
                <motion.div
                  key="apparel-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col flex-grow bg-light-brown text-chocolate border-b border-chocolate/5"
                >
                  <ApparelPage
                    products={productsList}
                    onViewDetails={(product) => transitionTo(activeTab, product, false, null)}
                    onAddToCart={(product, size, color) => handleAddToCart(product, 1, size, color.value)}
                    onToggleWishlist={handleToggleWishlist}
                    wishlist={wishlist}
                    priceCurrency={priceCurrency}
                    onBackToHome={handleGoBack}
                  />
                </motion.div>
              ) : activeTab === "bags-accessories" ? (
                <motion.div
                  key="bags-accessories-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col flex-grow bg-light-brown text-chocolate border-b border-chocolate/5"
                >
                  <BagsAndAccessoriesPage
                    products={productsList}
                    onViewDetails={(product) => transitionTo(activeTab, product, false, null)}
                    onAddToCart={(product, size, color) => handleAddToCart(product, 1, size, color.value)}
                    onToggleWishlist={handleToggleWishlist}
                    wishlist={wishlist}
                    priceCurrency={priceCurrency}
                    onBackToHome={handleGoBack}
                  />
                </motion.div>
              ) : activeTab === "fragrances" ? (
                <motion.div
                  key="fragrances-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col flex-grow bg-light-brown text-chocolate border-b border-chocolate/5"
                >
                  <FragrancesPage
                    products={productsList}
                    onViewDetails={(product) => transitionTo(activeTab, product, false, null)}
                    onAddToCart={(product, size, color) => handleAddToCart(product, 1, size, color.value)}
                    onToggleWishlist={handleToggleWishlist}
                    wishlist={wishlist}
                    priceCurrency={priceCurrency}
                    onBackToHome={handleGoBack}
                  />
                </motion.div>
              ) : activeTab === "contact" ? (
                <motion.div
                  key="contact-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col flex-grow bg-light-brown text-chocolate border-b border-chocolate/5"
                >
                  <ContactPage />
                </motion.div>
              ) : (
                <motion.div
                  key="home-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col"
                >
                  {/* 3. Hero Section */}
                  <Hero onShopClick={() => transitionTo("shop", null, false, null)} />

                  {/* 4. Featured Collections Shelf */}
                  <Collection
                    products={productsList}
                    onSelectCollection={(collectionCategory) => {
                      const lower = collectionCategory.toLowerCase();
                      let tab: ActiveTab = "apparel";
                      if (lower.includes("bags") || lower.includes("accessories")) {
                        tab = "bags-accessories";
                      } else if (lower.includes("fragrance")) {
                        tab = "fragrances";
                      }
                      transitionTo(tab, null, false, null);
                    }}
                    onAddToCart={(prod) => handleAddToCart(prod, 1, prod.sizes?.[0], prod.colors?.[0])}
                    priceCurrency={priceCurrency}
                  />

                  {/* 5. Promotional Banner Overlay */}
                  <Promo onShopClick={() => transitionTo("shop", null, false, null)} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 6. Centered Chocolate Footer */}
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Access Floating Cart Button */}
      {!isCreatingProduct && !editingProduct && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 bg-[#0b1b33] text-cream hover:bg-[#122c54] hover:text-gold border border-gold/30 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center justify-center cursor-pointer group"
          id="floating-cart-trigger"
        >
          <ShoppingCart className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-[10px] text-chocolate font-bold rounded-full flex items-center justify-center border border-chocolate animate-bounce">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </button>
      )}

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
