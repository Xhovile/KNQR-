export type ProductStatus = "draft" | "active" | "sold_out" | "archived";
export type ProductDeliveryMethod = "Pickup" | "Local delivery" | "Courier" | "Shipping";

export type ProductFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "boolean"
  | "image[]";

export interface ProductSchemaField {
  key: string;
  label: string;
  type: ProductFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  section?: string;
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
  collectionCategory: string;
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
}

export const PRODUCT_SCHEMA: ProductSchema = {
  key: "product",
  title: "Product Schema",
  description: "The source of truth for product create/edit forms, validation, and media.",
  requiredKeys: [
    "name",
    "priceUSD",
    "priceMWK",
    "collectionCategory",
    "category",
    "image",
    "images",
    "description",
    "status",
    "stock",
    "deliveryMethod",
  ],
  sections: [
    {
      key: "basic",
      title: "Basic Info",
      fields: ["name", "collectionCategory", "category", "description", "status"],
    },
    {
      key: "pricing",
      title: "Pricing",
      fields: ["priceUSD", "priceMWK", "stock"],
    },
    {
      key: "media",
      title: "Media",
      fields: ["image", "images"],
    },
    {
      key: "variants",
      title: "Variants",
      fields: ["sizes", "colors"],
    },
    {
      key: "delivery",
      title: "Delivery",
      fields: ["deliveryMethod", "deliveryNote"],
    },
    {
      key: "extras",
      title: "Details",
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
        "T-shirts", "Hoodies", "Sweaters", "Tracksuits", "Golf shirts", "Jackets", "3/4 sleeve shirts",
        "Backpacks", "Sling bags", "Gym bags", "Hustle bags", "Toilet bags",
        "Perfumes", "Colognes"
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
      type: "select",
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
      label: "Stock",
      type: "number",
      required: true,
      section: "pricing",
      placeholder: "12",
    },
    {
      key: "image",
      label: "Primary Image",
      type: "text",
      required: true,
      section: "media",
      placeholder: "Main image URL",
    },
    {
      key: "images",
      label: "Gallery Images",
      type: "image[]",
      required: true,
      section: "media",
      helpText: "Store uploaded image URLs here.",
    },
    {
      key: "sizes",
      label: "Sizes",
      type: "multiselect",
      section: "variants",
      options: ["XS", "S", "M", "L", "XL", "One Size", "50ml", "100ml"],
    },
    {
      key: "colors",
      label: "Colors",
      type: "multiselect",
      section: "variants",
      options: ["Earthy Brown", "Desert Sand", "Slate Charcoal", "24K Gold Plated", "Original Essence"],
    },
    {
      key: "deliveryMethod",
      label: "Delivery Method",
      type: "select",
      required: true,
      section: "delivery",
      options: ["Pickup", "Local delivery", "Courier", "Shipping"],
    },
    {
      key: "deliveryNote",
      label: "Delivery Note",
      type: "textarea",
      section: "delivery",
      placeholder: "Any special delivery notes",
    },
    {
      key: "details",
      label: "Details",
      type: "multiselect",
      section: "extras",
      options: ["Premium finish", "Limited edition", "Handmade", "Locally sourced"],
    },
  ],
};

export function createEmptyProductDraft(): ProductDraftValues {
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

export function getProductSchemaField(key: string): ProductSchemaField | undefined {
  return PRODUCT_SCHEMA.fields.find((field) => field.key === key);
}
