export type ProductStatus = "draft" | "active" | "sold_out" | "archived";
export type ProductDeliveryMethod = "Pickup" | "Local delivery" | "Courier" | "Shipping";
export type ProductCollectionCategory = "Apparel" | "Bags & Accessories" | "Fragrances";

export type ProductFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "boolean"
  | "image[]"
  | "checkbox"
  | "radio";

export interface ProductSchemaField {
  key: string;
  label: string;
  type: ProductFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  section?: string;
  dependsOn?: {
    field: string;
    value: string | string[];
  };
}

export interface ProductSchemaSection {
  key: string;
  title: string;
  description?: string;
  fields: string[];
}

export interface ProductSchema {
  key: string;
  title: string;
  description: string;
  fields: ProductSchemaField[];
  sections: ProductSchemaSection[];
  requiredKeys: string[];
}

export interface ProductDraftValues {
  name: string;
  priceUSD: number | null;
  priceMWK: number | null;
  collectionCategory: ProductCollectionCategory;
  category: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  description: string;
  status: ProductStatus;
  stock: number | null;
  deliveryMethod: ProductDeliveryMethod | "";
  deliveryNote: string;
  details: string[];

  // Apparel specific
  fit?: string;
  material?: string;
  apparelGender?: string;
  sleeveType?: string;

  // Bags & Accessories specific
  bagType?: string;
  bagMaterial?: string;
  strapType?: string;
  bagCapacity?: string;
  useCase?: string;

  // Fragrances specific
  volume?: string;
  scentFamily?: string;
  fragranceGender?: string;
  concentration?: string;
  longevity?: string;
  notes?: string[];
}

export const SUBCATEGORIES_MAP: Record<ProductCollectionCategory, string[]> = {
  Apparel: ["T-shirts", "Hoodies", "Sweaters", "Tracksuits", "Golf shirts", "Jackets", "3/4 sleeve shirts", "Caps"],
  "Bags & Accessories": ["Backpacks", "Sling bags", "Gym bags", "Hustle bags", "Toilet bags"],
  Fragrances: ["Perfumes", "Colognes"],
};

export const BASE_PRODUCT_SCHEMA: ProductSchema = {
  key: "product-base",
  title: "Base Product Schema",
  description: "Shared product fields used by every collection category.",
  requiredKeys: [
    "name",
    "priceUSD",
    "priceMWK",
    "collectionCategory",
    "category",
    "description",
    "status",
    "stock",
    "deliveryMethod",
  ],
  sections: [
    {
      key: "basic",
      title: "Basic Info",
      description: "Define the visual identity, title, story, and status of the product.",
      fields: ["name", "collectionCategory", "category", "description", "status"],
    },
    {
      key: "pricing",
      title: "Pricing",
      description: "Set the cost and track available warehouse quantity.",
      fields: ["priceUSD", "priceMWK", "stock"],
    },
    {
      key: "media",
      title: "Media",
      description: "Select product images from the device. Files stay staged locally until Publish.",
      fields: ["image", "images"],
    },
    {
      key: "delivery",
      title: "Delivery",
      description: "Configure shipment modes and regional handoff instructions.",
      fields: ["deliveryMethod", "deliveryNote"],
    },
    {
      key: "extras",
      title: "Details",
      description: "Add key sourcing, craft, and highlight tags for the buyer.",
      fields: ["details"],
    },
  ],
  fields: [
    {
      key: "name",
      label: "Product Name",
      type: "text",
      required: true,
      section: "basic",
      placeholder: "Enter product name",
    },
    {
      key: "collectionCategory",
      label: "Collection Category",
      type: "select",
      required: true,
      section: "basic",
      options: ["Apparel", "Bags & Accessories", "Fragrances"],
    },
    {
      key: "category",
      label: "Sub Category",
      type: "select",
      required: true,
      section: "basic",
      options: [
        "T-shirts",
        "Hoodies",
        "Sweaters",
        "Tracksuits",
        "Golf shirts",
        "Jackets",
        "3/4 sleeve shirts",
        "Caps",
        "Backpacks",
        "Sling bags",
        "Gym bags",
        "Hustle bags",
        "Toilet bags",
        "Perfumes",
        "Colognes",
      ],
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      required: true,
      section: "basic",
      placeholder: "Describe the product clearly",
    },
    {
      key: "status",
      label: "Status",
      type: "radio",
      required: true,
      section: "basic",
      options: ["draft", "active", "sold_out", "archived"],
      helpText: "Controls whether the product is public, hidden, or out of stock.",
    },
    {
      key: "priceUSD",
      label: "Price (USD)",
      type: "number",
      required: true,
      section: "pricing",
      placeholder: "100",
    },
    {
      key: "priceMWK",
      label: "Price (MWK)",
      type: "number",
      required: true,
      section: "pricing",
      placeholder: "175000",
    },
    {
      key: "stock",
      label: "Stock Count",
      type: "number",
      required: true,
      section: "pricing",
      placeholder: "12",
    },
    {
      key: "image",
      label: "Primary Image",
      type: "text",
      required: false,
      section: "media",
      placeholder: "Managed after publish",
      helpText: "The editor stages device images locally and saves Cloudinary URLs only when you publish.",
    },
    {
      key: "images",
      label: "Gallery Images",
      type: "image[]",
      required: false,
      section: "media",
      helpText: "Device-selected photos are uploaded on Publish and stored as URLs in the product record.",
    },
    {
      key: "deliveryMethod",
      label: "Default Delivery Method",
      type: "select",
      required: true,
      section: "delivery",
      options: ["Pickup", "Local delivery", "Courier", "Shipping"],
    },
    {
      key: "deliveryNote",
      label: "Delivery Guidelines / Notes",
      type: "textarea",
      section: "delivery",
      placeholder: "Provide special local handoff or delivery notes here...",
    },
    {
      key: "details",
      label: "Highlighted Selling Points",
      type: "multiselect",
      section: "extras",
      options: ["Premium finish", "Limited edition", "Handmade", "Locally sourced", "Ethically Crafted", "Waterproof Materials"],
    },
  ],
};

export function createEmptyBaseProductDraft(): ProductDraftValues {
  return {
    name: "",
    priceUSD: null,
    priceMWK: null,
    collectionCategory: "Apparel",
    category: "T-shirts",
    image: "",
    images: [],
    sizes: [],
    colors: [],
    description: "",
    status: "draft",
    stock: null,
    deliveryMethod: "",
    deliveryNote: "",
    details: [],
  };
}

export function getBaseProductSchemaField(key: string): ProductSchemaField | undefined {
  return BASE_PRODUCT_SCHEMA.fields.find((field) => field.key === key);
}
