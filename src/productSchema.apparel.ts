import {
  BASE_PRODUCT_SCHEMA,
  ProductDraftValues,
  ProductSchema,
  ProductSchemaField,
  createEmptyBaseProductDraft,
} from "./productSchema.base";

export const APPAREL_SCHEMA: ProductSchema = {
  key: "product-apparel",
  title: "Apparel Schema",
  description: "Schema for shirts, hoodies, jackets, tracksuits, caps, and other clothing products.",
  requiredKeys: [...BASE_PRODUCT_SCHEMA.requiredKeys, "fit", "material", "apparelGender", "sleeveType"],
  sections: [
    ...BASE_PRODUCT_SCHEMA.sections,
    {
      key: "apparel-variants",
      title: "Apparel Variants",
      description: "Clothing-specific sizing and construction details.",
      fields: ["sizes", "colors", "fit", "material", "apparelGender", "sleeveType"],
    },
  ],
  fields: [
    ...BASE_PRODUCT_SCHEMA.fields,
    {
      key: "fit",
      label: "Product Fit Style",
      type: "select",
      section: "apparel-variants",
      options: ["Regular Fit", "Slim Fit", "Oversized", "Relaxed Fit", "Athletic Fit"],
      dependsOn: {
        field: "collectionCategory",
        value: "Apparel",
      },
    },
    {
      key: "material",
      label: "Fabric Composition",
      type: "select",
      section: "apparel-variants",
      options: [
        "100% Malawian Cotton",
        "Heavyweight Fleece Cotton",
        "Premium Linen Blend",
        "Polyester Tech Blend",
        "Nylon Sport",
        "Merino Wool Blend",
      ],
      dependsOn: {
        field: "collectionCategory",
        value: "Apparel",
      },
    },
    {
      key: "apparelGender",
      label: "Target Gender Profile",
      type: "radio",
      section: "apparel-variants",
      options: ["Unisex", "Men", "Women"],
      dependsOn: {
        field: "collectionCategory",
        value: "Apparel",
      },
    },
    {
      key: "sleeveType",
      label: "Sleeve Type",
      type: "select",
      section: "apparel-variants",
      options: ["Short Sleeve", "Long Sleeve", "Sleeveless", "3/4 Sleeve", "None"],
      dependsOn: {
        field: "collectionCategory",
        value: "Apparel",
      },
    },
  ],
};

export function createEmptyApparelProductDraft(): ProductDraftValues {
  return {
    ...createEmptyBaseProductDraft(),
    collectionCategory: "Apparel",
    category: "T-shirts",
    fit: "Regular Fit",
    material: "100% Malawian Cotton",
    apparelGender: "Unisex",
    sleeveType: "Short Sleeve",
  };
}

export function getApparelSchemaField(key: string): ProductSchemaField | undefined {
  return APPAREL_SCHEMA.fields.find((field) => field.key === key);
}
