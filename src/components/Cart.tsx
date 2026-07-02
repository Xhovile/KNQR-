import React, { useState } from "react";
import { X, Trash2, ShieldCheck, CreditCard, Landmark, Check, ShoppingCart, Plus, Minus, RefreshCw } from "lucide-react";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { createOrder } from "../services/orderService";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  onRemoveItem: (productId: string, size?: string, color?: string) => void;
  onClearCart: () => void;
  priceCurrency: "USD" | "MWK";
  user?: any;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  priceCurrency,
  user,
}: CartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "success">("details");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "Blantyre",
    address: "",
    paymentMethod: "mpamba", // 'mpamba' | 'airtel' | 'card'
  });

  if (!isOpen) return null;

  const totalUSD = cartItems.reduce((acc, item) => acc + item.product.priceUSD * item.quantity, 0);
  const totalMWK = cartItems.reduce((acc, item) => acc + item.product.priceMWK * item.quantity, 0);

  const displayTotal =
    priceCurrency === "USD"
      ? `$${totalUSD}`
      : `MK ${totalMWK.toLocaleString()}`;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    setOrderError(null);

    try {
      const orderData = {
        userId: user ? user.uid : "guest",
        userEmail: user ? user.email : "guest@knqr-lifestyle.com",
        items: cartItems,
        totalUSD,
        totalMWK,
        currency: priceCurrency,
        deliveryDetails: {
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          paymentMethod: formData.paymentMethod,
        },
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };

      await createOrder(orderData);
      setCheckoutStep("success");
    } catch (err: any) {
      console.error("Order submission failed:", err);
      setOrderError(err?.message || "An unexpected error occurred during checkout. Please try again.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleFinishCheckout = () => {
    onClearCart();
    setIsCheckingOut(false);
    setCheckoutStep("details");
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex justify-end bg-chocolate/85 backdrop-blur-sm"
        id="shopping-cart-overlay"
      >
        {/* Click away area */}
        <div className="absolute inset-0 z-0" onClick={onClose} />

        {/* Sliding Panel */}
        <motion.div
          className="relative w-full max-w-md bg-chocolate border-l border-cream/10 h-full flex flex-col z-10 shadow-2xl"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 220 }}
          id="cart-panel-content"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-cream/5 select-none">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-gold" />
              <h3 className="font-serif text-xl text-cream font-medium tracking-wide">
                Your Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-cream/50 hover:text-cream hover:bg-cream/5 rounded-full transition-colors cursor-pointer"
              id="close-cart-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4 select-none">
                <div className="w-16 h-16 rounded-full border border-cream/10 flex items-center justify-center text-cream/30">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-cream font-medium">Your Cart is Empty</h4>
                  <p className="text-xs text-cream/50 mt-1 max-w-xs font-sans">
                    Browse our luxury collection of custom Malawian apparel and discover your perfect conquer vibe.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-cream hover:bg-gold text-chocolate text-xs tracking-[0.2em] uppercase rounded-full transition-all duration-300 font-medium cursor-pointer"
                  id="cart-explore-btn"
                >
                  Explore Shop
                </button>
              </div>
            ) : (
              <div className="space-y-6" id="cart-items-list">
                {cartItems.map((item, idx) => {
                  const productPrice =
                    priceCurrency === "USD"
                      ? `$${item.product.priceUSD * item.quantity}`
                      : `MK ${(item.product.priceMWK * item.quantity).toLocaleString()}`;

                  return (
                    <motion.div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex items-start space-x-4 border-b border-cream/5 pb-4 last:border-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      id={`cart-item-row-${item.product.id}`}
                    >
                      {/* Product Thumbnail */}
                      <div className="w-20 h-24 rounded-lg overflow-hidden border border-cream/10 bg-chocolate-light shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover object-center"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Product Details & Actions */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-base text-cream truncate tracking-wide">
                          {item.product.name}
                        </h4>
                        
                        {/* Selections */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-gold mt-1 select-none">
                          {item.selectedSize && (
                            <span>SIZE: {item.selectedSize}</span>
                          )}
                          {item.selectedColor && (
                            <span>ACCENT: {item.selectedColor}</span>
                          )}
                        </div>

                        {/* Price & Quantity Adjuster */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 border border-cream/10 rounded-md p-0.5 bg-chocolate-light">
                            <button
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  Math.max(1, item.quantity - 1),
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="p-1 text-cream/60 hover:text-cream cursor-pointer"
                              id={`cart-decrement-${item.product.id}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-xs text-cream px-2 font-medium select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="p-1 text-cream/60 hover:text-cream cursor-pointer"
                              id={`cart-increment-${item.product.id}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs text-cream font-semibold">
                              {productPrice}
                            </span>
                            <button
                              onClick={() =>
                                onRemoveItem(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="p-1.5 text-cream/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                              title="Delete item"
                              id={`cart-delete-${item.product.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checkout Panel Overlay if clicked */}
          <AnimatePresence>
            {isCheckingOut && (
              <motion.div
                className="absolute inset-0 bg-chocolate z-20 flex flex-col"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30 }}
                id="cart-checkout-screen"
              >
                {/* Checkout Header */}
                <div className="flex items-center justify-between p-6 border-b border-cream/5 select-none">
                  <h4 className="font-serif text-lg text-cream font-medium tracking-wide">
                    {checkoutStep === "details" ? "Secure Checkout" : "Order Complete"}
                  </h4>
                  {checkoutStep === "details" && (
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="p-2 text-cream/50 hover:text-cream rounded-full cursor-pointer"
                      id="close-checkout-sub-btn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {checkoutStep === "details" ? (
                  <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Sum */}
                    <div className="bg-chocolate-light p-4 rounded-xl border border-cream/10 flex justify-between items-center select-none">
                      <span className="text-xs text-cream/60">Grand Total to Pay:</span>
                      <span className="font-mono text-base text-gold font-bold">{displayTotal}</span>
                    </div>

                    {/* Delivery Form */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-mono tracking-wider text-gold uppercase select-none">
                        Delivery Information
                      </h5>

                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-cream/60 uppercase tracking-wider block select-none">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Kondwani Phiri"
                          className="w-full bg-chocolate-light border border-cream/15 rounded-md px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-cream/60 uppercase tracking-wider block select-none">
                          Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +265 888 123 456"
                          className="w-full bg-chocolate-light border border-cream/15 rounded-md px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>

                      {/* Malawian Cities selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-cream/60 uppercase tracking-wider block select-none">
                          Delivery City (Malawi)
                        </label>
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-chocolate-light border border-cream/15 rounded-md px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold transition-colors font-sans"
                        >
                          <option value="Blantyre">Blantyre (Physical Outlet Location)</option>
                          <option value="Lilongwe">Lilongwe (Capital Hub)</option>
                          <option value="Mzuzu">Mzuzu (Northern Region)</option>
                          <option value="Zomba">Zomba (Old Capital)</option>
                        </select>
                      </div>

                      {/* Delivery Address */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-cream/60 uppercase tracking-wider block select-none">
                          Specific Delivery Address / Landmark
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="e.g. Limbe, Near Clock Tower"
                          className="w-full bg-chocolate-light border border-cream/15 rounded-md px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>
                    </div>

                    {/* Local Payment Options */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-mono tracking-wider text-gold uppercase select-none">
                        Select Payment Method
                      </h5>

                      <div className="grid grid-cols-3 gap-2">
                        {/* TNM Mpamba */}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: "mpamba" })}
                          className={`p-3 rounded-lg border flex flex-col items-center justify-center space-y-1 text-center cursor-pointer transition-all ${
                            formData.paymentMethod === "mpamba"
                              ? "bg-cream/10 border-gold text-gold font-medium"
                              : "bg-transparent border-cream/10 text-cream/60 hover:border-cream/30"
                          }`}
                        >
                          <Landmark className="w-4 h-4 text-green-500" />
                          <span className="text-[10px] font-sans">TNM Mpamba</span>
                        </button>

                        {/* Airtel Money */}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: "airtel" })}
                          className={`p-3 rounded-lg border flex flex-col items-center justify-center space-y-1 text-center cursor-pointer transition-all ${
                            formData.paymentMethod === "airtel"
                              ? "bg-cream/10 border-gold text-gold font-medium"
                              : "bg-transparent border-cream/10 text-cream/60 hover:border-cream/30"
                          }`}
                        >
                          <Landmark className="w-4 h-4 text-red-500" />
                          <span className="text-[10px] font-sans">Airtel Money</span>
                        </button>

                        {/* International Cards */}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: "card" })}
                          className={`p-3 rounded-lg border flex flex-col items-center justify-center space-y-1 text-center cursor-pointer transition-all ${
                            formData.paymentMethod === "card"
                              ? "bg-cream/10 border-gold text-gold font-medium"
                              : "bg-transparent border-cream/10 text-cream/60 hover:border-cream/30"
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-blue-400" />
                          <span className="text-[10px] font-sans">Debit / Card</span>
                        </button>
                      </div>
                    </div>

                    {/* Error message */}
                    {orderError && (
                      <div 
                        className="p-3.5 rounded-lg border border-red-500/35 bg-red-500/10 text-red-400 text-xs text-left"
                        id="checkout-order-error"
                      >
                        {orderError}
                      </div>
                    )}

                    {/* Trust Factor */}
                    <div className="flex items-center space-x-2 text-[10px] text-cream/40 justify-center select-none pt-2" id="checkout-trust-factor">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                      <span>KNQR Direct Delivery: Handled within 24-48 hours.</span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full py-4 bg-cream hover:bg-gold disabled:bg-cream/40 disabled:text-chocolate/60 disabled:cursor-not-allowed text-chocolate font-sans text-xs tracking-[0.3em] uppercase rounded-full transition-all duration-300 shadow-lg font-semibold cursor-pointer flex items-center justify-center space-x-2"
                      id="submit-checkout-btn"
                    >
                      {isSubmittingOrder ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-chocolate/75" />
                          <span>Processing order...</span>
                        </>
                      ) : (
                        <span>Authorize Payment</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6 select-none">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500 flex items-center justify-center text-green-500">
                      <Check className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-serif text-2xl text-cream font-normal">Order Received!</h4>
                      <p className="text-xs text-cream/70 max-w-xs font-sans leading-relaxed">
                        Zikomo Kwambiri, <span className="text-gold font-medium">{formData.name}</span>! Your KNQR lifestyle shipment is authorized and currently being prepared at our Blantyre outlet.
                      </p>
                      <div className="bg-chocolate-light p-3 rounded-lg border border-cream/5 mt-4 text-[10px] text-cream/50 space-y-1">
                        <p>Delivery Destination: <span className="text-cream">{formData.city}, Malawi</span></p>
                        <p>Authorized via: <span className="text-gold uppercase font-mono">{formData.paymentMethod} Payment System</span></p>
                      </div>
                    </div>

                    <button
                      onClick={handleFinishCheckout}
                      className="px-8 py-3 bg-cream hover:bg-gold text-chocolate text-xs tracking-[0.2em] uppercase rounded-full transition-all duration-300 font-semibold cursor-pointer"
                      id="finish-checkout-btn"
                    >
                      Conquer Your Wardrobe
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grand Total Calculation Block & Secure Checkout CTA */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-cream/5 bg-chocolate-light space-y-4">
              <div className="flex justify-between items-baseline select-none">
                <span className="text-xs text-cream/60">Subtotal:</span>
                <span className="font-mono text-xl text-gold font-bold">{displayTotal}</span>
              </div>
              <p className="text-[10px] text-cream/40 text-center tracking-wide leading-none select-none">
                Complimentary delivery across Malawi. Duties & taxes included.
              </p>

              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-4 bg-cream hover:bg-gold text-chocolate font-sans text-xs tracking-[0.3em] uppercase rounded-full transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 cursor-pointer font-semibold"
                id="cart-checkout-trigger"
              >
                <span>Checkout</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
