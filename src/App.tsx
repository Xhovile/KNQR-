import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  ShoppingCart, 
  ArrowUp,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
const Collection = React.lazy(() => import("./components/Collection"));
const Promo = React.lazy(() => import("./components/Promo"));
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
import { auth } from "./lib/firebase";
import AuthForm from "./components/AuthForm";
import OrderHistory from "./components/OrderHistory";

import { PRODUCTS } from "./data";
import { Product, CartItem, ActiveTab } from "./types";
import { 
  fetchProducts, 
  createProduct, 
  updateProduct,
  fetchHeroImages,
  updateHeroImageInDb,
  DEFAULT_HEROES,
  HeroImages
} from "./services/productService";

export default function App() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceCurrency] = useState<"USD" | "MWK">("MWK");
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImages>(DEFAULT_HEROES);
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [showAdminGuardModal, setShowAdminGuardModal] = useState(false);
  const [adminGuardAction, setAdminGuardAction] = useState<"add" | "edit" | "hero" | "restock" | "record_sale" | null>(null);
  const [authInitialIsSignUp, setAuthInitialIsSignUp] = useState(false);

  const isAdmin = user && user.email === "xhovilepublications@gmail.com";

  // Subscribe to Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      transitionTo("home");
    } catch (err: any) {
      console.error("Failed to sign out:", err?.message || String(err));
    }
  };

  // Load products and hero images from Firestore on boot
  useEffect(() => {
    async function initApp() {
      setIsLoadingProducts(true);
      try {
        const fetchedProducts = await fetchProducts();
        setProductsList(fetchedProducts);
        setProductsError(null);
      } catch (err: any) {
        setProductsError(err?.message || "An error occurred while loading catalog.");
      } finally {
        setIsLoadingProducts(false);
      }

      // fetch hero images after first paint
      fetchHeroImages()
        .then(setHeroImages)
        .catch((err) => console.error("Failed to load hero images:", err?.message || String(err)));
    }

    initApp();
  }, []);

  const handleUpdateHeroImage = async (page: keyof HeroImages, url: string) => {
    try {
      await updateHeroImageInDb(page, url);
      setHeroImages((prev) => ({
        ...prev,
        [page]: url
      }));
    } catch (err: any) {
      console.error(`Failed to update hero image for page ${page}:`, err?.message || String(err));
      alert("Failed to save customizable hero image. Please try again.");
      throw new Error(err?.message || String(err));
    }
  };

  const transitionTo = (
    tab: ActiveTab,
    product: Product | null = null,
    isCreating = false,
    editing: Product | null = null,
    skipPush = false
  ) => {
    // If we are explicitly opening the editor, reset the published flag so they can use it
    if (isCreating || editing) {
      (window as any).hasPublishedProduct = false;
    }

    // Guard: If they have published, bypass any back-navigation attempt to restore the editor state
    let finalIsCreating = isCreating;
    let finalEditing = editing;
    if ((window as any).hasPublishedProduct && (isCreating || editing)) {
      finalIsCreating = false;
      finalEditing = null;
    }

    setActiveTab(tab);
    setSelectedProduct(product);
    setIsCreatingProduct(finalIsCreating);
    setEditingProduct(finalEditing);

    // Scroll to top of the page on transition instantly
    window.scrollTo(0, 0);

    if (!skipPush) {
      const stateObj = {
        activeTab: tab,
        selectedProductId: product ? product.id : null,
        isCreatingProduct: finalIsCreating,
        editingProductId: finalEditing ? finalEditing.id : null,
      };
      window.history.pushState(stateObj, "");
    }
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

        const shouldSkipEditor = (window as any).hasPublishedProduct;
        const isCreatingParam = shouldSkipEditor ? false : !!state.isCreatingProduct;
        const editingParam = shouldSkipEditor ? null : actualEditing;

        transitionTo(
          state.activeTab || "home",
          actualProduct,
          isCreatingParam,
          editingParam,
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


  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const handleToggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const handleViewDetails = useCallback((product: Product) => {
    transitionTo(activeTabRef.current, product, false, null);
  }, []);

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

  const handleAddToCart = useCallback((product: Product, quantity = 1, size?: string, color?: string) => {
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
  }, []);

  const handleAddToCartFromShop = useCallback((product: Product, size: string, color: { name: string; value: string }) => {
    handleAddToCart(product, 1, size, color.name);
  }, [handleAddToCart]);

  const handleAddToCartFromPages = useCallback((product: Product, size: string, color: { name: string; value: string }) => {
    handleAddToCart(product, 1, size, color.value);
  }, [handleAddToCart]);

  const handleUpdateApparelHero = useCallback((url: string) => {
    return handleUpdateHeroImage("apparel", url);
  }, [handleUpdateHeroImage]);

  const handleUpdateBagsHero = useCallback((url: string) => {
    return handleUpdateHeroImage("bagsAccessories", url);
  }, [handleUpdateHeroImage]);

  const handleUpdateFragrancesHero = useCallback((url: string) => {
    return handleUpdateHeroImage("fragrances", url);
  }, [handleUpdateHeroImage]);

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
      window.scrollTo(0, 0);
    } else if (tab === "shop") {
      window.scrollTo(0, 0);
    } else if (tab === "contact") {
      window.scrollTo(0, 0);
    }
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
    setActiveTab("home");
  };

  const handleCreateProductSubmit = async (values: ProductDraftValues) => {
    if (!isAdmin) {
      setAdminGuardAction("add");
      setShowAdminGuardModal(true);
      return;
    }
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
      },
      fit: values.fit,
      material: values.material,
      apparelGender: values.apparelGender,
      sleeveType: values.sleeveType,
      bagType: values.bagType,
      bagMaterial: values.bagMaterial,
      strapType: values.strapType,
      bagCapacity: values.bagCapacity,
      useCase: values.useCase,
      volume: values.volume,
      scentFamily: values.scentFamily,
      fragranceGender: values.fragranceGender,
      concentration: values.concentration,
      longevity: values.longevity,
      notes: values.notes,
    };

    try {
      await createProduct(newProduct);
      setProductsList((prev) => [newProduct, ...prev]);
      // Set the published flag to prevent back-navigation to this editor state
      (window as any).hasPublishedProduct = true;
      setIsCreatingProduct(false);

      // Replace the current history state with the collection tab view
      const stateObj = {
        activeTab: activeTab,
        selectedProductId: null,
        isCreatingProduct: false,
        editingProductId: null,
      };
      window.history.replaceState(stateObj, "");
    } catch (err: any) {
      console.error("Failed to create product in Firestore:", err?.message || String(err));
      alert("Failed to save product to database. Please try again.");
    }
  };

  const handleEditProductSubmit = async (values: ProductDraftValues) => {
    if (!isAdmin) {
      setAdminGuardAction("edit");
      setShowAdminGuardModal(true);
      return;
    }
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
      },
      fit: values.fit,
      material: values.material,
      apparelGender: values.apparelGender,
      sleeveType: values.sleeveType,
      bagType: values.bagType,
      bagMaterial: values.bagMaterial,
      strapType: values.strapType,
      bagCapacity: values.bagCapacity,
      useCase: values.useCase,
      volume: values.volume,
      scentFamily: values.scentFamily,
      fragranceGender: values.fragranceGender,
      concentration: values.concentration,
      longevity: values.longevity,
      notes: values.notes,
    };

    try {
      await updateProduct(updatedProduct);
      setProductsList((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
      
      if (selectedProduct && selectedProduct.id === editingProduct.id) {
        setSelectedProduct(updatedProduct);
      }

      // Set the published flag to prevent back-navigation to this editor state
      (window as any).hasPublishedProduct = true;
      setEditingProduct(null);

      // Replace the current history state with the detail view of the updated product
      const stateObj = {
        activeTab: activeTab,
        selectedProductId: updatedProduct.id,
        isCreatingProduct: false,
        editingProductId: null,
      };
      window.history.replaceState(stateObj, "");
    } catch (err: any) {
      console.error("Failed to update product in Firestore:", err?.message || String(err));
      alert("Failed to save product modifications. Please try again.");
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (!isAdmin) {
      setAdminGuardAction("edit");
      setShowAdminGuardModal(true);
      return;
    }
    try {
      await updateProduct(updatedProduct);
      setProductsList((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      if (selectedProduct && selectedProduct.id === updatedProduct.id) {
        setSelectedProduct(updatedProduct);
      }
    } catch (err: any) {
      console.error("Failed to update product:", err?.message || String(err));
      throw new Error(err?.message || String(err));
    }
  };

  return (
    <div className="bg-chocolate min-h-screen text-cream flex flex-col relative" id="app-root-container">
      <AnimatePresence mode="wait">
        {isCreatingProduct ? (
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
              if (!isAdmin) {
                setAdminGuardAction("edit");
                setShowAdminGuardModal(true);
              } else {
                transitionTo(activeTab, null, false, prod);
              }
            }}
            isAdmin={isAdmin}
            onUpdateProduct={handleUpdateProduct}
            onTriggerAdminGuard={(action) => {
              setAdminGuardAction(action);
              setShowAdminGuardModal(true);
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
            <Header onClick={() => {
              transitionTo("home", null, false, null);
              handleNavigation("home");
            }} />

            {/* 2. Horizontal Navigation */}
            <Navigation 
              activeTab={activeTab} 
              setActiveTab={(tab) => transitionTo(tab, null, false, null)} 
              onNavigate={handleNavigation} 
              onCreateProduct={() => {
                if (!isAdmin) {
                  setAdminGuardAction("add");
                  setShowAdminGuardModal(true);
                } else {
                  transitionTo(activeTab, null, true, null);
                }
              }}
              user={user}
              onSignOut={handleSignOut}
              onAuthAction={(isSignUp) => setAuthInitialIsSignUp(isSignUp)}
            />

            <AnimatePresence mode="wait">
              {isLoadingProducts ? (
                <motion.div
                  key="loading-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-grow bg-light-brown"
                >
                  <Skeleton type={activeTab === "home" ? "home" : selectedProduct ? "detail" : "grid"} />
                </motion.div>
              ) : productsError ? (
                <motion.div
                  key="error-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-grow flex flex-col items-center justify-center py-20 px-6 text-center bg-light-brown text-chocolate"
                >
                  <p className="text-sm font-mono tracking-widest uppercase text-rose-600 mb-2">Connection Interrupted</p>
                  <h3 className="font-serif text-2xl mb-4">Could Not Synchronize Catalog</h3>
                  <p className="max-w-md text-sm text-chocolate/70 leading-relaxed mb-6">
                    We encountered an issue retrieving the latest bespoke pieces from the database: {productsError}
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-chocolate text-cream font-mono text-xs uppercase tracking-wider hover:bg-gold hover:text-chocolate rounded-xl transition-all font-bold cursor-pointer"
                  >
                    Reconnect Database
                  </button>
                </motion.div>
              ) : activeTab === "shop" ? (
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
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCartFromShop}
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
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCartFromPages}
                    onToggleWishlist={handleToggleWishlist}
                    wishlist={wishlist}
                    priceCurrency={priceCurrency}
                    onBackToHome={handleGoBack}
                    heroImage={heroImages.apparel}
                    onUpdateHeroImage={handleUpdateApparelHero}
                    isAdmin={isAdmin}
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
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCartFromPages}
                    onToggleWishlist={handleToggleWishlist}
                    wishlist={wishlist}
                    priceCurrency={priceCurrency}
                    onBackToHome={handleGoBack}
                    heroImage={heroImages.bagsAccessories}
                    onUpdateHeroImage={handleUpdateBagsHero}
                    isAdmin={isAdmin}
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
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCartFromPages}
                    onToggleWishlist={handleToggleWishlist}
                    wishlist={wishlist}
                    priceCurrency={priceCurrency}
                    onBackToHome={handleGoBack}
                    heroImage={heroImages.fragrances}
                    onUpdateHeroImage={handleUpdateFragrancesHero}
                    isAdmin={isAdmin}
                  />
                </motion.div>
              ) : activeTab === "auth" ? (
                <motion.div
                  key="auth-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex-grow flex flex-col items-center justify-center py-12 px-4 bg-light-brown text-chocolate"
                >
                  {user ? (
                    <div className="max-w-2xl w-full mx-auto space-y-8 my-8 flex flex-col items-center" id="profile-and-orders-container">
                      {/* Profile Card */}
                      <div className="bg-chocolate-dark text-cream p-8 sm:p-12 rounded-2xl shadow-2xl border border-cream/10 w-full luxury-glow" id="knqr-profile-card">
                        <div className="flex flex-col items-center text-center">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.displayName || "User Avatar"} 
                              className="w-24 h-24 rounded-full border-2 border-gold mb-6 object-cover shadow-lg"
                              referrerPolicy="no-referrer"
                              id="profile-avatar-img"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full border-2 border-gold bg-chocolate flex items-center justify-center text-gold text-3xl font-serif mb-6 shadow-lg" id="profile-avatar-fallback">
                              {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "U")}
                            </div>
                          )}
                          
                          <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] tracking-[0.2em] font-mono uppercase rounded-full mb-3 border border-gold/20" id="profile-badge">
                            Bespoke VIP Patron
                          </span>
                          
                          <h2 className="font-serif text-3xl text-cream mb-1" id="profile-display-name">{user.displayName || "Elite Member"}</h2>
                          <p className="font-mono text-xs text-gold tracking-widest uppercase mb-8" id="profile-id-text">KNQR Club ID: #{user.uid.substring(0, 8).toUpperCase()}</p>
                          
                          <div className="w-full space-y-4 border-t border-cream/5 pt-6 text-left max-w-sm" id="profile-details-table">
                            <div className="flex justify-between items-center text-xs font-mono py-1.5 border-b border-cream/5" id="profile-email-row">
                              <span className="text-cream/40 uppercase tracking-wider">Email Address</span>
                              <span className="text-cream font-medium select-all">{user.email || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-mono py-1.5 border-b border-cream/5" id="profile-status-row">
                              <span className="text-cream/40 uppercase tracking-wider">Status</span>
                              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-1" />
                                <span>Active Session</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-sm" id="profile-actions">
                            <button
                              onClick={() => transitionTo("shop")}
                              className="flex-1 px-6 py-3 bg-gold text-chocolate hover:bg-cream hover:text-chocolate font-mono text-xs uppercase tracking-wider rounded-xl transition-all font-bold cursor-pointer text-center shadow-lg hover:scale-[1.02]"
                              id="profile-shop-btn"
                            >
                              Explore Collections
                            </button>
                            <button
                              onClick={handleSignOut}
                              className="flex-1 px-6 py-3 border border-cream/10 hover:border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-400 font-mono text-xs uppercase tracking-wider rounded-xl transition-all text-center cursor-pointer hover:scale-[1.02]"
                              id="profile-signout-btn"
                            >
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Order History Panel */}
                      <div className="bg-chocolate-dark text-cream p-6 sm:p-8 rounded-2xl shadow-2xl border border-cream/10 w-full luxury-glow" id="knqr-orders-card">
                        <OrderHistory 
                          user={user} 
                          priceCurrency={priceCurrency} 
                          onExploreShop={() => transitionTo("shop")}
                        />
                      </div>
                    </div>
                  ) : (
                    <AuthForm 
                      initialIsSignUp={authInitialIsSignUp}
                      onSuccess={(u) => {
                        setUser(u);
                        transitionTo("home");
                      }} 
                    />
                  )}
                </motion.div>
              ) : activeTab === "contact" ? (
                null
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
                  <Hero 
                    onShopClick={() => transitionTo("shop", null, false, null)} 
                    heroImage={heroImages.home}
                    onUpdateHeroImage={(url) => handleUpdateHeroImage("home", url)}
                    isAdmin={isAdmin}
                  />

                  {/* 4. Featured Collections Shelf */}
                  <React.Suspense fallback={
                    <div className="py-12 flex items-center justify-center text-xs font-mono tracking-widest text-chocolate/40 bg-light-brown">
                      Loading Curated Collections...
                    </div>
                  }>
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
                  </React.Suspense>

                  {/* 5. Promotional Banner Overlay */}
                  <React.Suspense fallback={null}>
                    <Promo onShopClick={() => transitionTo("shop", null, false, null)} />
                  </React.Suspense>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Persistent Contact Page view to prevent Google Maps iframe and asset reloading lag */}
            <div className={!isLoadingProducts && !productsError && activeTab === "contact" ? "flex flex-col flex-grow bg-light-brown" : "hidden"}>
              <ContactPage />
            </div>

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
        user={user}
      />

      {/* Admin Guard Dialog Modal */}
      <AnimatePresence>
        {showAdminGuardModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-chocolate-dark/80 backdrop-blur-sm p-4" id="admin-guard-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xs w-full bg-[#18191b] border border-cream/15 rounded-xl p-6 text-center shadow-2xl relative overflow-hidden text-cream"
              id="admin-guard-modal-content"
            >
              {/* Premium Geometric Accent */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-gold/50 via-gold to-gold/50" />
              
              <div className="w-12 h-12 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6 text-gold" />
              </div>
              
              <h3 className="font-serif text-lg tracking-widest text-gold uppercase mb-1" id="admin-guard-title">
                Admin Access
              </h3>
              <p className="font-mono text-[8px] tracking-[0.2em] text-cream/40 uppercase mb-3">
                Authorized Personnel Only
              </p>
              
              <p className="text-xs text-cream/70 leading-relaxed mb-6 font-sans">
                {adminGuardAction === "add" 
                  ? "Adding new products is restricted to Authorized Brand Administrators."
                  : adminGuardAction === "restock"
                  ? "Restocking product inventory is restricted to Authorized Brand Administrators."
                  : adminGuardAction === "record_sale"
                  ? "Recording custom sales is restricted to Authorized Brand Administrators."
                  : "Modifying catalog products is restricted to Authorized Brand Administrators."}
                {" "}Please sign in with an administrator account.
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAdminGuardModal(false)}
                  className="flex-1 py-2 border border-cream/10 hover:border-cream/30 rounded-lg text-[10px] font-mono tracking-wider uppercase text-cream/60 hover:text-cream transition-all cursor-pointer"
                  id="admin-guard-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminGuardModal(false);
                    transitionTo("auth");
                  }}
                  className="flex-1 py-2 bg-gold text-chocolate font-bold hover:bg-cream rounded-lg text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer"
                  id="admin-guard-signin-btn"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

}
