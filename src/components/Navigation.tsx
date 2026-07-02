import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ActiveTab } from "../types";
import { Menu, X, Plus, User, Settings as SettingsIcon, LogIn, LogOut } from "lucide-react";

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNavigate: (tab: ActiveTab) => void;
  onCreateProduct?: () => void;
  user?: any;
  onSignOut?: () => void;
  onAuthAction?: (isSignUp: boolean) => void;
}

export default function Navigation({ activeTab, setActiveTab, onNavigate, onCreateProduct, user, onSignOut, onAuthAction }: NavigationProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [activeNotification, setActiveNotification] = React.useState<string | null>(null);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "shop", label: "Shop" },
    { id: "contact", label: "Contact" },
  ];

  const menuItems = user
    ? [
        { label: "Profile", icon: User },
        { label: "Add Product", icon: Plus },
        { label: "Settings", icon: SettingsIcon },
        { label: "Sign Out", icon: LogOut },
      ]
    : [
        { label: "Sign In", icon: LogIn },
        { label: "Sign Up", icon: User },
      ];

  const handlePlaceholderClick = (actionName: string) => {
    if (actionName === "Add Product" && onCreateProduct) {
      onCreateProduct();
      setDropdownOpen(false);
      return;
    }
    if (actionName === "Profile" || actionName === "Sign In") {
      if (onAuthAction) {
        onAuthAction(false);
      }
      setActiveTab("auth");
      onNavigate("auth");
      setDropdownOpen(false);
      return;
    }
    if (actionName === "Sign Up") {
      if (onAuthAction) {
        onAuthAction(true);
      }
      setActiveTab("auth");
      onNavigate("auth");
      setDropdownOpen(false);
      return;
    }
    if (actionName === "Sign Out" && onSignOut) {
      onSignOut();
      setDropdownOpen(false);
      return;
    }
    setActiveNotification(`${actionName} active`);
    setDropdownOpen(false);
    setTimeout(() => {
      setActiveNotification(null);
    }, 2500);
  };

  return (
    <>
      <nav className="py-6 flex justify-center items-center border-b border-cream/5 bg-chocolate/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center space-x-10 sm:space-x-12 md:space-x-16" id="knqr-nav-links">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onNavigate(item.id);
                  setDropdownOpen(false);
                }}
                className={`relative py-1 font-sans text-xs tracking-[0.3em] uppercase transition-colors duration-300 select-none cursor-pointer ${
                  isActive ? "text-cream font-medium" : "text-cream/50 hover:text-cream"
                }`}
                id={`nav-link-${item.id}`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0.6 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.6 }}
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-cream origin-center"
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                )}
              </button>
            );
          })}

          {/* Menu Dropdown Section to the right of Contact */}
          <div className="relative flex items-center">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1 text-cream/50 hover:text-gold transition-colors duration-300 cursor-pointer flex items-center justify-center focus:outline-none"
              aria-label="Toggle navigation menu"
              id="menu-trigger-button"
            >
              {dropdownOpen ? (
                <X className="w-5 h-5 text-gold" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Dropdown Card panel */}
            <AnimatePresence>
              {dropdownOpen && (
                <>
                  {/* Backdrop click away listener */}
                  <div 
                    className="fixed inset-0 z-40 bg-black/5" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-4 w-52 py-2.5 bg-chocolate-dark border border-cream/10 rounded-xl shadow-2xl z-50 origin-top-right backdrop-blur-md"
                    id="menu-dropdown-panel"
                  >
                    <div className="absolute top-0 right-4 -mt-1.5 w-3 h-3 bg-chocolate-dark border-t border-l border-cream/10 rotate-45" />
                    
                    {menuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handlePlaceholderClick(item.label)}
                        className="w-full text-left px-5 py-2.5 text-xs tracking-wider uppercase font-sans font-light text-cream/70 hover:text-gold hover:bg-cream/5 transition-all duration-200 flex items-center space-x-3 cursor-pointer"
                        id={`menu-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <item.icon className="w-3.5 h-3.5 text-gold/80" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Floating Tactical Alert Notification */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#0b1b33]/95 border border-gold/40 text-cream px-6 py-3 rounded-full shadow-2xl text-xs font-mono tracking-widest uppercase flex items-center space-x-3"
            id="menu-notification-toast"
          >
            <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
            <span className="text-gold/90 font-semibold">{activeNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
