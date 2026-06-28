export interface Product {
  id: string;
  name: string;
  priceUSD: number;
  priceMWK: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  sizes?: string[];
  colors?: string[];
  details?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type ActiveTab = "home" | "shop" | "contact";
