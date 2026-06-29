import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  ChevronDown, 
  Instagram, 
  Facebook, 
  ExternalLink, 
  HelpCircle, 
  FileText, 
  Truck, 
  RefreshCw, 
  Maximize2,
  X,
  AlertCircle
} from "lucide-react";

export default function ContactPage() {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Support Drawer modal state
  const [activeSupportModal, setActiveSupportModal] = useState<{
    title: string;
    content: React.ReactNode;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setFormError("Please fill in all required fields marked with an asterisk (*).");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    // Simulate luxury API response
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    }, 1500);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const supportTopics = [
    {
      id: "track-order",
      title: "Track Order",
      icon: FileText,
      description: "Check the status of your bespoke custom-crafted piece.",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-chocolate/80">
            Every KNQR order undergoes meticulous quality inspection before departure. To track your dispatch:
          </p>
          <div className="bg-chocolate/5 p-4 rounded-xl border border-chocolate/10 space-y-3">
            <label className="block text-[10px] font-mono tracking-wider uppercase text-chocolate/60">Enter Order Reference ID</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. KNQR-7826-MW" 
                className="flex-1 bg-white border border-chocolate/20 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-gold"
              />
              <button className="bg-chocolate text-cream px-4 py-2 rounded-lg text-xs font-mono uppercase hover:bg-gold hover:text-chocolate transition-colors">
                Search
              </button>
            </div>
          </div>
          <p className="text-[11px] text-chocolate/50 italic">
            * Note: Tracking information typically becomes live 24-48 hours after payment confirmation.
          </p>
        </div>
      )
    },
    {
      id: "shipping-info",
      title: "Shipping Information",
      icon: Truck,
      description: "Courier, regional, and worldwide premium shipping options.",
      content: (
        <div className="space-y-3 text-sm text-chocolate/80">
          <p>
            We offer professional shipping solutions curated for safety and prompt delivery:
          </p>
          <ul className="space-y-2.5 mt-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
              <span><strong>Blantyre Pickup:</strong> Available free of charge at our flagship KNQR Outlet.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
              <span><strong>Local Courier & Delivery:</strong> Express delivery across Lilongwe, Zomba, Mzuzu, and nationwide regional centers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
              <span><strong>International Delivery:</strong> DHL express service to premium worldwide destinations. Delivery rates calculated on checkout.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "returns-exchanges",
      title: "Returns & Exchanges",
      icon: RefreshCw,
      description: "Our luxury assurance pledge & worry-free exchange terms.",
      content: (
        <div className="space-y-3 text-sm text-chocolate/80">
          <p>
            At KNQR, we pride ourselves on absolute luxury. If your curated apparel or accessory does not fit perfectly:
          </p>
          <p>
            We accept size exchanges within <strong>7 days</strong> of delivery, provided the item is in pristine, unworn condition with all original tags and signature packaging intact.
          </p>
          <p className="text-xs text-chocolate/60">
            * Due to hygiene standards, custom bespoke fragrances and intimate apparel are excluded from general return policies unless a material variance is found.
          </p>
        </div>
      )
    },
    {
      id: "size-guide",
      title: "Size Guide",
      icon: Maximize2,
      description: "Precise dimensions for our curated apparel collections.",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-chocolate/80">
            Our premium garments are tailored with modern silhouettes. Refer to the table below to select your precise fit:
          </p>
          <div className="overflow-x-auto border border-chocolate/10 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-chocolate/5 border-b border-chocolate/10">
                  <th className="p-2.5 text-chocolate/60 font-semibold uppercase">Size</th>
                  <th className="p-2.5 text-chocolate/60 font-semibold uppercase">Chest (Inches)</th>
                  <th className="p-2.5 text-chocolate/60 font-semibold uppercase">Length (Inches)</th>
                  <th className="p-2.5 text-chocolate/60 font-semibold uppercase">Shoulder (Inches)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chocolate/5 text-chocolate/80">
                <tr>
                  <td className="p-2.5 font-bold text-chocolate">XS</td>
                  <td className="p-2.5">34 - 36"</td>
                  <td className="p-2.5">26.5"</td>
                  <td className="p-2.5">16.5"</td>
                </tr>
                <tr className="bg-chocolate/[0.02]">
                  <td className="p-2.5 font-bold text-chocolate">S</td>
                  <td className="p-2.5">36 - 38"</td>
                  <td className="p-2.5">27.5"</td>
                  <td className="p-2.5">17.5"</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-chocolate">M</td>
                  <td className="p-2.5">38 - 40"</td>
                  <td className="p-2.5">28.5"</td>
                  <td className="p-2.5">18.5"</td>
                </tr>
                <tr className="bg-chocolate/[0.02]">
                  <td className="p-2.5 font-bold text-chocolate">L</td>
                  <td className="p-2.5">40 - 42"</td>
                  <td className="p-2.5">29.5"</td>
                  <td className="p-2.5">19.5"</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-chocolate">XL</td>
                  <td className="p-2.5">42 - 44"</td>
                  <td className="p-2.5">30.5"</td>
                  <td className="p-2.5">20.5"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    }
  ];

  const faqItems = [
    {
      question: "How do I place an order?",
      answer: "Select your desired masterpiece from our collection pages (Apparel, Bags & Accessories, or Fragrances). Choose your custom variants (size, color, volume) and click 'Add to Cart'. You can review your selection in the side drawer cart at any time and click checkout to place your luxury order."
    },
    {
      question: "Do you offer nationwide delivery?",
      answer: "Yes, we proudly provide nationwide delivery services. For residents in Blantyre, we offer premium local delivery and free in-store collection at our flagship KNQR Outlet. For customers across Lilongwe, Mzuzu, Zomba, and other regions, we coordinate delivery via reliable courier services."
    },
    {
      question: "How long does delivery take?",
      answer: "Pickup at our Blantyre Outlet is ready immediately or next business day. Local premium Blantyre deliveries are completed within 24 hours. Regional shipments across Malawi via courier typically arrive in 1 to 3 business days, while international express shipments via DHL take 5 to 7 days."
    },
    {
      question: "Can I exchange an item?",
      answer: "Absolutely. We offer a curated exchange policy for sizes and tags. If you require a different fit, contact us via WhatsApp or Email within 7 days of receiving your item, and our team will coordinate a replacement."
    },
    {
      question: "How do I become a distributor?",
      answer: "We are always eager to partner with luxury visionaries. If you are interested in wholesale placement, dealership, or retail integration, please reach out directly to our Business Enquiries department via knqronline@gmail.com with your proposal overview."
    }
  ];

  return (
    <div className="w-full bg-light-brown text-chocolate py-12 md:py-16 px-6 md:px-12 flex flex-col font-sans border-b border-chocolate/5" id="knqr-contact-page-root">
      
      {/* 1. Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
        <span className="text-[10px] font-mono tracking-[0.4em] text-gold uppercase font-bold" id="contact-small-sub">
          CONTACT
        </span>
        <h2 className="text-3xl md:text-5xl font-serif text-chocolate tracking-tight" id="contact-main-heading">
          LET'S CONNECT
        </h2>
        <p className="text-sm md:text-base text-chocolate/80 leading-relaxed max-w-2xl mx-auto font-light">
          Questions? We're here to help. Whether you have a question about an order, our products, collaborations, or anything else, we'd love to hear from you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 2. Left Column: Direct Contact Info & Map */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="bg-white/50 border border-chocolate/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-serif text-chocolate tracking-wide border-b border-chocolate/10 pb-3">
              CONTACT INFORMATION
            </h3>

            {/* Direct Cards */}
            <div className="space-y-6">
              
              {/* Call Us */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-chocolate/5 rounded-xl border border-chocolate/10 text-gold mt-1">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-mono tracking-wider text-chocolate/50 uppercase">📞 Call Us</p>
                  <p className="text-base font-semibold text-chocolate">+265 883 184 144</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#25d366]/10 rounded-xl border border-[#25d366]/20 text-[#25d366] mt-1">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-grow">
                  <div>
                    <p className="text-[11px] font-mono tracking-wider text-chocolate/50 uppercase">💬 WhatsApp</p>
                    <p className="text-base font-semibold text-chocolate">+265 883 184 144</p>
                  </div>
                  <a 
                    href="https://wa.me/265883184144" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 bg-[#25d366] hover:bg-[#20ba59] text-white text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-xl transition-all shadow-md font-bold cursor-pointer select-none"
                    id="contact-whatsapp-btn"
                  >
                    <span>Chat on WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#ea4335]/10 rounded-xl border border-[#ea4335]/20 text-[#ea4335] mt-1">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-grow">
                  <div>
                    <p className="text-[11px] font-mono tracking-wider text-chocolate/50 uppercase">✉️ Email</p>
                    <p className="text-base font-semibold text-chocolate">knqronline@gmail.com</p>
                  </div>
                  <a 
                    href="mailto:knqronline@gmail.com"
                    className="inline-flex items-center space-x-2 bg-chocolate text-cream hover:bg-gold hover:text-chocolate text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-xl transition-all shadow-md font-bold cursor-pointer select-none border border-chocolate"
                    id="contact-email-btn"
                  >
                    <span>Send an Email</span>
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Visit store */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-chocolate/5 rounded-xl border border-chocolate/10 text-gold mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-grow">
                  <div>
                    <p className="text-[11px] font-mono tracking-wider text-chocolate/50 uppercase">📍 Visit Our Store</p>
                    <p className="text-sm font-semibold text-chocolate leading-snug">
                      KNQR Outlet<br />Blantyre, Malawi
                    </p>
                  </div>
                  <a 
                    href="https://maps.google.com/?q=Blantyre,Malawi"
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 bg-white hover:bg-chocolate hover:text-white text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-xl transition-all shadow-md font-bold border border-chocolate/20 cursor-pointer select-none"
                    id="contact-directions-btn"
                  >
                    <span>Get Directions</span>
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Store information box */}
          <div className="bg-white/30 border border-chocolate/5 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-mono tracking-widest uppercase text-gold font-bold">
              STORE INFORMATION
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-chocolate/50 uppercase font-mono text-[10px]">Location</p>
                <p className="text-chocolate font-medium">KNQR Outlet<br />Blantyre, Malawi</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-chocolate/50 uppercase font-mono text-[10px]">Business Hours</p>
                <p className="text-chocolate font-medium italic">Business hours coming soon.</p>
              </div>
            </div>

            {/* Embedded Live Google Maps */}
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-chocolate/10 bg-chocolate/5 shadow-inner mt-4 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122604.4069818826!2d34.93510525251642!3d-15.786111162451558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18db43f4b46231d5%3A0x67db23a496837130!2sBlantyre!5e0!3m2!1sen!2smw!4v1782620000000!5m2!1sen!2smw" 
                className="absolute inset-0 w-full h-full border-0" 
                allowFullScreen={false} 
                loading="lazy" 
                title="Google Maps Embed Blantyre Malawi"
                referrerPolicy="no-referrer-when-downgrade"
                id="contact-google-map"
              />
            </div>
          </div>

        </div>

        {/* 3. Right Column: Send us a Message form */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="bg-chocolate border border-cream/15 rounded-3xl p-6 md:p-10 text-cream shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-gold/5 rounded-full blur-xl" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-gold/5 rounded-full blur-xl" />

            <div className="space-y-2 mb-8">
              <span className="text-[10px] font-mono tracking-[0.3em] text-gold uppercase font-bold">
                SEND US A MESSAGE
              </span>
              <h3 className="text-2xl font-serif text-cream tracking-wide">
                Have a question or request?
              </h3>
              <p className="text-xs text-cream/60 font-light">
                Fill out the form below and our team will get back to you as soon as possible.
              </p>
            </div>

            {submitSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-cream/5 border border-gold/30 p-8 rounded-2xl text-center space-y-4"
                id="contact-form-success"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center text-gold">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>
                <h4 className="font-serif text-xl text-cream font-medium">Message Dispatched</h4>
                <p className="text-sm text-cream/70 leading-relaxed max-w-sm mx-auto font-light">
                  Your communication has been securely logged. The KNQR Curator team will reply within 24 hours of standard operations.
                </p>
                <button 
                  onClick={() => setSubmitSuccess(false)}
                  className="px-6 py-2.5 bg-gold hover:bg-gold-light text-chocolate rounded-xl text-xs font-mono tracking-widest uppercase font-bold transition-all cursor-pointer select-none"
                  id="contact-success-reset-btn"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" id="knqr-contact-form">
                
                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start space-x-2 text-rose-300 text-xs font-mono" id="contact-form-error-alert">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest uppercase text-gold" htmlFor="contact-form-name">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text"
                      id="contact-form-name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Hayze Engola"
                      className="w-full bg-chocolate-light border border-cream/10 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/20"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest uppercase text-gold" htmlFor="contact-form-email">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="email"
                      id="contact-form-email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. curated@knqr.com"
                      className="w-full bg-chocolate-light border border-cream/10 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest uppercase text-cream/40" htmlFor="contact-form-phone">
                      Phone Number (Optional)
                    </label>
                    <input 
                      type="text"
                      id="contact-form-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +265 883 184 144"
                      className="w-full bg-chocolate-light border border-cream/10 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/20"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest uppercase text-gold" htmlFor="contact-form-subject">
                      Subject <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text"
                      id="contact-form-subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Wholesale Order Placement"
                      className="w-full bg-chocolate-light border border-cream/10 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/20"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-gold" htmlFor="contact-form-message">
                    Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea 
                    id="contact-form-message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Provide detailed description of your query..."
                    className="w-full bg-chocolate-light border border-cream/10 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/20 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold hover:bg-gold-light text-chocolate rounded-xl py-3.5 text-xs font-mono tracking-widest uppercase font-bold transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none"
                  id="contact-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-chocolate border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

      </div>

      {/* 4. Customer Support Shelf Section */}
      <div className="max-w-6xl mx-auto w-full mt-20 border-t border-chocolate/10 pt-16 space-y-10" id="support-shelf">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono tracking-[0.3em] text-gold uppercase font-bold">
            CUSTOMER SUPPORT
          </span>
          <h3 className="text-2xl font-serif text-chocolate tracking-wide">
            Need help with your order?
          </h3>
          <p className="text-xs text-chocolate/60 leading-relaxed font-light">
            Tap on any Support card below to open real, contextual parameters.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {supportTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveSupportModal({ title: topic.title, content: topic.content })}
              className="bg-white/40 hover:bg-white border border-chocolate/10 rounded-2xl p-5 text-left space-y-3 shadow-sm hover:shadow-md transition-all group cursor-pointer focus:outline-none select-none"
              id={`support-card-${topic.id}`}
            >
              <div className="p-2 bg-chocolate/5 group-hover:bg-chocolate/10 rounded-lg text-gold inline-flex">
                <topic.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-chocolate group-hover:text-gold transition-colors">
                  {topic.title}
                </h4>
                <p className="text-[11px] text-chocolate/60 line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Business Enquiries & Follow Section */}
      <div className="max-w-6xl mx-auto w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Business Enquiries Card */}
        <div className="bg-white/40 border border-chocolate/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-3 text-gold">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-chocolate">
              BUSINESS ENQUIRIES
            </h4>
          </div>
          <p className="text-xs text-chocolate/80 leading-relaxed font-light">
            For partnerships, wholesale opportunities, media enquiries, or collaborations, contact us:
          </p>
          <div className="space-y-2.5 font-mono text-xs pt-2">
            <div className="flex justify-between border-b border-chocolate/5 pb-2">
              <span className="text-chocolate/50">Email:</span>
              <a href="mailto:knqronline@gmail.com" className="text-chocolate font-medium hover:text-gold transition-colors">
                knqronline@gmail.com
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-chocolate/50">Phone:</span>
              <a href="tel:+265883184144" className="text-chocolate font-medium hover:text-gold transition-colors">
                +265 883 184 144
              </a>
            </div>
          </div>
        </div>

        {/* Follow KNQR Card */}
        <div className="bg-white/40 border border-chocolate/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-3 text-gold">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-chocolate">
              FOLLOW KNQR
            </h4>
          </div>
          <p className="text-xs text-chocolate/80 leading-relaxed font-light">
            Stay connected and discover the latest collections, announcements, and lifestyle content.
          </p>
          
          <div className="flex space-x-3 pt-3">
            <a 
              href="https://www.instagram.com/knqrworld?igsh=MXQ5aWIxdGpoZmJ4cw==" 
              target="_blank" 
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-2 bg-chocolate text-cream hover:bg-gold hover:text-chocolate border border-chocolate rounded-xl px-4 py-3 text-xs font-mono tracking-wider uppercase transition-all shadow-sm font-bold cursor-pointer select-none"
              id="social-instagram-link"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </a>
            <a 
              href="https://www.facebook.com/knqronline" 
              target="_blank" 
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-2 bg-chocolate text-cream hover:bg-gold hover:text-chocolate border border-chocolate rounded-xl px-4 py-3 text-xs font-mono tracking-wider uppercase transition-all shadow-sm font-bold cursor-pointer select-none"
              id="social-facebook-link"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </a>
          </div>
        </div>

      </div>

      {/* 6. FAQ Section */}
      <div className="max-w-4xl mx-auto w-full mt-20 border-t border-chocolate/10 pt-16 space-y-8" id="faq-section">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono tracking-[0.3em] text-gold uppercase font-bold">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h3 className="text-2xl font-serif text-chocolate tracking-wide">
            Curated FAQ Answers
          </h3>
        </div>

        <div className="space-y-4" id="contact-faq-accordion">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="border border-chocolate/10 bg-white/40 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-chocolate/20"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-sans font-semibold text-chocolate text-xs tracking-wider uppercase focus:outline-none cursor-pointer"
                  id={`faq-accordion-trigger-${idx}`}
                >
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-4 h-4 text-gold shrink-0" />
                    <span>{item.question}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-chocolate/55 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-chocolate/80 leading-relaxed font-light border-t border-chocolate/5 bg-white/10">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Bottom Statement Section */}
      <div className="max-w-4xl mx-auto w-full mt-20 text-center space-y-5 bg-chocolate text-cream border border-cream/15 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-20 h-20 bg-gold/5 rounded-full blur-xl" />
        <div className="absolute -bottom-12 -right-12 w-20 h-20 bg-gold/5 rounded-full blur-xl" />
        
        <span className="text-[9px] font-mono tracking-[0.4em] text-gold uppercase font-bold">
          WE'RE HERE TO HELP
        </span>
        <p className="text-sm text-cream/85 max-w-xl mx-auto leading-relaxed font-light">
          Whether you're shopping for your next look, need assistance with an order, or want to collaborate with KNQR, our team is ready to assist you.
        </p>
      </div>

      {/* Premium Support Modal Overlays */}
      <AnimatePresence>
        {activeSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="support-modal-backdrop">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSupportModal(null)}
              className="absolute inset-0 bg-chocolate-dark/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-md w-full bg-cream border border-chocolate/10 rounded-2xl p-6 md:p-8 text-chocolate shadow-2xl z-10"
              id="support-modal-body"
            >
              <button
                onClick={() => setActiveSupportModal(null)}
                className="absolute top-4 right-4 p-1.5 bg-chocolate/5 hover:bg-chocolate/10 rounded-full text-chocolate/70 hover:text-chocolate transition-colors cursor-pointer"
                title="Close dialog"
                id="support-modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <h3 className="font-serif text-xl text-chocolate tracking-wide border-b border-chocolate/10 pb-2">
                  {activeSupportModal.title}
                </h3>
                <div className="pt-2 font-sans">
                  {activeSupportModal.content}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
