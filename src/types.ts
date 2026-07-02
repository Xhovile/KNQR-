export interface Product {
  id: string;
  name: string;
  priceUSD: number;
  priceMWK: number;
  image: string;
  images?: string[];
  category: string;
  collectionCategory: string;
  description: string;
  sizes?: string[];
  colors?: string[];
  details?: string[];
  status: "draft" | "active" | "sold_out" | "archived";
  stock: number;
  sold?: number;
  totalStock?: number;
  delivery: {
    available: boolean;
    methods: string[];
    note?: string;
  };

  // Apparel-specific fields
  fit?: string;
  material?: string;
  apparelGender?: string;
  sleeveType?: string;

  // Bags & Accessories-specific fields
  bagType?: string;
  bagMaterial?: string;
  strapType?: string;
  bagCapacity?: string;
  useCase?: string;

  // Fragrance-specific fields
  volume?: string;
  scentFamily?: string;
  fragranceGender?: string;
  concentration?: string;
  longevity?: string;
  notes?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string | null;
  items: CartItem[];
  totalUSD: number;
  totalMWK: number;
  currency: "USD" | "MWK";
  deliveryDetails: {
    name: string;
    phone: string;
    city: string;
    address: string;
    paymentMethod: string;
  };
  status: "pending" | "preparing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export type ActiveTab = "home" | "shop" | "contact" | "apparel" | "bags-accessories" | "fragrances" | "auth";
