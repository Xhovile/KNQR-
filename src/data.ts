import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "knqr-trousers",
    name: "Apparel",
    priceUSD: 100,
    priceMWK: 175000,
    image: "/src/assets/images/knqr_apparel_new_1782625253891.jpg",
    images: [
      "/src/assets/images/knqr_apparel_new_1782625253891.jpg",
      "/src/assets/images/knqr_trousers_1782618856513.jpg",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80"
    ],
    category: "Tracksuits",
    collectionCategory: "Apparel",
    description: "Expertly tailored relaxed-fit apparel made from lightweight Malawian-sourced fabric. Features double pleats, comfortable side pockets, and custom organic fastenings. Designed for ultimate versatility and effortless elegance.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Earthy Brown", "Desert Sand", "Slate Charcoal"],
    details: [
      "Premium Organic Fibers",
      "Locally designed and ethically manufactured in Blantyre, Malawi",
      "Breathable material perfect for warm climates",
      "Dry clean recommended"
    ],
    status: "active",
    stock: 14,
    fit: "Relaxed Fit",
    material: "100% Malawian Cotton",
    apparelGender: "Unisex",
    sleeveType: "Long Sleeve",
    delivery: {
      available: true,
      methods: ["Pickup", "Local delivery"],
      note: "Delivery available within Blantyre and selected nearby areas."
    }
  },
  {
    id: "knqr-necklace",
    name: "Bags & Accessories",
    priceUSD: 100,
    priceMWK: 175000,
    image: "/src/assets/images/knqr_accessory_new_1782625265014.jpg",
    images: [
      "/src/assets/images/knqr_accessory_new_1782625265014.jpg",
      "/src/assets/images/knqr_necklace_1782618869518.jpg",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
    ],
    category: "Sling bags",
    collectionCategory: "Bags & Accessories",
    description: "An elegant, minimalist accessory designed as a physical representation of the KNQR spirit—unyielding, ambitious, and bold. Hand-polished to a reflective mirror finish, built to elevate any curated look.",
    sizes: ["One Size"],
    colors: ["24K Gold Plated"],
    details: [
      "Fine craftsmanship and luxury finishes",
      "Hypoallergenic and tarnish-resistant coating",
      "Packaged in a premium signature velvet pouch"
    ],
    status: "active",
    stock: 8,
    bagType: "Sling Bag",
    bagMaterial: "Full-Grain Genuine Leather",
    strapType: "Removable Chain Strap",
    bagCapacity: "One Size (Accessory)",
    useCase: "Formal & Evening Accents",
    delivery: {
      available: true,
      methods: ["Pickup", "Courier"],
      note: "Courier delivery available on request."
    }
  },
  {
    id: "knqr-blouse",
    name: "Fragrances",
    priceUSD: 100,
    priceMWK: 175000,
    image: "/src/assets/images/knqr_fragrance_new_1782625278359.jpg",
    images: [
      "/src/assets/images/knqr_fragrance_new_1782625278359.jpg",
      "/src/assets/images/knqr_blouse_1782618882678.jpg",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80"
    ],
    category: "Perfumes",
    collectionCategory: "Fragrances",
    description: "An evocative, premium-grade signature fragrance with a sophisticated fluid character. Crafted with clean natural notes. Perfect for transitioning seamlessly from creative workspace to high-end evening experiences.",
    sizes: ["50ml", "100ml"],
    colors: ["Original Essence"],
    details: [
      "Premium heavyweight natural fragrance oils",
      "Exquisite bottle design and crafted packaging",
      "Long-lasting luxury scent projection"
    ],
    status: "active",
    stock: 20,
    volume: "100ml",
    scentFamily: "Woody & Earthy",
    fragranceGender: "Unisex / Fluid",
    concentration: "Eau de Parfum (EDP)",
    longevity: "Long-Lasting (6-8 Hours)",
    notes: ["Sandalwood", "Amber Noir", "Bergamot"],
    delivery: {
      available: true,
      methods: ["Pickup", "Shipping"],
      note: "Carefully packed for local and regional delivery."
    }
  }
];

export const AMBITION_QUOTES = [
  {
    quote: "Do not wait for opportunities. CONQUER the present and carve your own path.",
    author: "Hayze Engola, Founder"
  },
  {
    quote: "Our struggles are just chapters in our masterclass of greatness. Keep building, keep inspiring.",
    author: "KNQR Collective"
  },
  {
    quote: "From Blantyre to the world, Malawian creativity is limitless. Ambition is our fuel.",
    author: "KNQR Mindset"
  }
];
