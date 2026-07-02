import React, { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Truck, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  RefreshCw, 
  Package, 
  CreditCard, 
  ExternalLink 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Order } from "../types";
import { fetchUserOrders } from "../services/orderService";

interface OrderHistoryProps {
  user: any;
  priceCurrency: "USD" | "MWK";
  onExploreShop?: () => void;
}

export default function OrderHistory({ user, priceCurrency, onExploreShop }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await fetchUserOrders(user.uid);
      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError("Failed to load your order history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const toggleExpand = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const getStatusConfig = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending Verification",
          classes: "bg-amber-500/15 border-amber-500/30 text-amber-400",
          icon: Clock,
        };
      case "preparing":
        return {
          label: "Preparing Shipment",
          classes: "bg-blue-500/15 border-blue-500/30 text-blue-400",
          icon: Package,
        };
      case "shipped":
        return {
          label: "In Transit",
          classes: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
          icon: Truck,
        };
      case "delivered":
        return {
          label: "Delivered",
          classes: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
          icon: CheckCircle,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          classes: "bg-red-500/15 border-red-500/30 text-red-400",
          icon: AlertCircle,
        };
      default:
        return {
          label: "Processing",
          classes: "bg-cream/10 border-cream/20 text-cream/70",
          icon: Clock,
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4 py-6" id="order-history-loading">
        <h3 className="font-serif text-lg text-cream mb-4 flex items-center space-x-2 select-none">
          <ShoppingBag className="w-4 h-4 text-gold" />
          <span>Authenticating Vault Orders...</span>
        </h3>
        {[1, 2].map((i) => (
          <div 
            key={i} 
            className="w-full bg-chocolate/40 border border-cream/5 rounded-xl p-5 animate-pulse flex flex-col space-y-4"
            id={`order-skeleton-${i}`}
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-cream/10 rounded" />
              <div className="h-5 w-24 bg-cream/10 rounded-full" />
            </div>
            <div className="h-[1px] w-full bg-cream/5" />
            <div className="flex justify-between items-center">
              <div className="h-3 w-40 bg-cream/10 rounded" />
              <div className="h-4 w-16 bg-cream/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="w-full border border-red-500/25 bg-red-500/5 rounded-xl p-6 text-center space-y-4 my-4"
        id="order-history-error"
      >
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <div>
          <h4 className="font-serif text-base text-cream font-medium">Error Retrieving Archives</h4>
          <p className="text-xs text-cream/60 mt-1 max-w-xs mx-auto font-sans">
            {error}
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="px-5 py-2 border border-cream/15 hover:border-gold hover:text-gold rounded-full text-xs font-mono tracking-widest uppercase transition-all flex items-center space-x-2 mx-auto cursor-pointer"
          id="order-retry-btn"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Conn</span>
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div 
        className="w-full border border-cream/5 bg-chocolate/30 rounded-2xl p-8 text-center space-y-5 my-4 select-none"
        id="order-history-empty"
      >
        <div className="w-12 h-12 rounded-full border border-cream/10 bg-chocolate-light flex items-center justify-center text-cream/40 mx-auto">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-serif text-lg text-cream font-medium">No Order History Found</h4>
          <p className="text-xs text-cream/50 mt-1.5 max-w-sm mx-auto font-sans leading-relaxed">
            Your premium lifestyle catalog is ready. Begin your journey and your purchase archive will be securely saved here.
          </p>
        </div>
        {onExploreShop && (
          <button
            onClick={onExploreShop}
            className="px-6 py-2.5 bg-cream hover:bg-gold text-chocolate text-xs tracking-widest uppercase rounded-full transition-all duration-300 font-semibold cursor-pointer shadow-lg inline-flex items-center space-x-1.5"
            id="order-empty-explore-btn"
          >
            <span>Browse Outlets</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 py-4" id="order-history-container">
      <div className="flex items-center justify-between border-b border-cream/5 pb-3 mb-2 select-none">
        <h3 className="font-serif text-xl text-cream font-medium tracking-wide flex items-center space-x-2.5">
          <ShoppingBag className="w-5 h-5 text-gold" />
          <span>Purchase History</span>
        </h3>
        <span className="font-mono text-[10px] text-gold tracking-widest uppercase bg-gold/10 px-2.5 py-1 rounded-md border border-gold/20">
          {orders.length} {orders.length === 1 ? "Acquisition" : "Acquisitions"}
        </span>
      </div>

      <div className="space-y-4" id="order-cards-list">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const statusInfo = getStatusConfig(order.status);
          const StatusIcon = statusInfo.icon;
          const totalText = order.currency === "USD" 
            ? `$${order.totalUSD}`
            : `MK ${order.totalMWK.toLocaleString()}`;

          const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

          return (
            <div 
              key={order.id}
              className={`bg-chocolate-light/50 border rounded-xl overflow-hidden transition-all duration-300 ${
                isExpanded ? "border-gold/30 bg-chocolate-light/90 shadow-xl" : "border-cream/5 hover:border-cream/15"
              }`}
              id={`order-card-${order.id}`}
            >
              {/* Header Header */}
              <div 
                onClick={() => toggleExpand(order.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                id={`order-header-trigger-${order.id}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-serif text-sm text-cream font-medium">
                      Order ID: #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-[9px] font-mono tracking-wider uppercase border px-2 py-0.5 rounded-full ${statusInfo.classes} flex items-center space-x-1`}>
                      <StatusIcon className="w-2.5 h-2.5 animate-pulse" />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-mono text-cream/40">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(order.createdAt)}</span>
                    </span>
                    <span>•</span>
                    <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-mono text-cream/40 tracking-wider">Acquisition Price</p>
                    <p className="font-mono text-base text-gold font-semibold">{totalText}</p>
                  </div>
                  <div className="p-1.5 rounded-full border border-cream/5 bg-chocolate text-cream/50">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    id={`order-details-${order.id}`}
                  >
                    <div className="px-5 pb-5 border-t border-cream/5 bg-chocolate-dark/30 space-y-5 pt-4 text-cream">
                      {/* Items */}
                      <div className="space-y-3" id={`order-items-list-${order.id}`}>
                        <h4 className="text-[10px] font-mono text-gold uppercase tracking-wider select-none">Acquired Items</h4>
                        <div className="divide-y divide-cream/5">
                          {order.items.map((item, index) => {
                            const itemPrice = order.currency === "USD"
                              ? `$${item.product.priceUSD * item.quantity}`
                              : `MK ${(item.product.priceMWK * item.quantity).toLocaleString()}`;

                            return (
                              <div 
                                key={index}
                                className="py-3 flex items-start space-x-4 first:pt-0 last:pb-0"
                                id={`order-item-detail-${order.id}-${index}`}
                              >
                                <div className="w-12 h-15 rounded overflow-hidden border border-cream/10 bg-chocolate-light shrink-0">
                                  <img 
                                    src={item.product.image} 
                                    alt={item.product.name} 
                                    className="w-full h-full object-cover object-center"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h5 className="font-serif text-sm text-cream truncate">{item.product.name}</h5>
                                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] font-mono text-cream/40 mt-0.5 select-none">
                                    {item.selectedSize && <span>SIZE: {item.selectedSize}</span>}
                                    {item.selectedColor && <span>ACCENT: {item.selectedColor}</span>}
                                    <span>QTY: {item.quantity}</span>
                                  </div>
                                </div>
                                <div className="text-right font-mono text-xs text-cream/80 font-medium shrink-0">
                                  {itemPrice}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delivery and Payment details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-cream/5 select-none">
                        {/* Shipping details */}
                        <div className="space-y-1.5 p-3.5 rounded-lg bg-chocolate-light/40 border border-cream/5" id={`order-shipping-block-${order.id}`}>
                          <h5 className="text-[10px] font-mono text-gold uppercase tracking-wider flex items-center space-x-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            <span>Destination details</span>
                          </h5>
                          <div className="text-xs space-y-1 font-sans text-cream/80 pt-1">
                            <p className="font-medium text-cream">{order.deliveryDetails.name}</p>
                            <p>{order.deliveryDetails.phone}</p>
                            <p className="text-cream/60">{order.deliveryDetails.address}, {order.deliveryDetails.city}, Malawi</p>
                          </div>
                        </div>

                        {/* Payment details */}
                        <div className="space-y-1.5 p-3.5 rounded-lg bg-chocolate-light/40 border border-cream/5" id={`order-payment-block-${order.id}`}>
                          <h5 className="text-[10px] font-mono text-gold uppercase tracking-wider flex items-center space-x-1.5">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Transaction Info</span>
                          </h5>
                          <div className="text-xs space-y-1 font-sans text-cream/80 pt-1">
                            <p>Method: <span className="text-cream uppercase font-mono font-medium">{order.deliveryDetails.paymentMethod} Payment System</span></p>
                            <p>Authorized Amount: <span className="text-gold font-mono font-semibold">{totalText}</span></p>
                            <p className="text-[10px] text-cream/40 italic">Transaction fully verified through KNQR Malawian Direct Gateway.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
