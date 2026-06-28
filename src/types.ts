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
  delivery: {
    available: boolean;
    methods: string[];
    note?: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type ActiveTab = "home" | "shop" | "contact" | "apparel" | "bags-accessories" | "fragrances";
