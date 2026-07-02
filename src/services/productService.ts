import { db, auth } from "../lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { Product } from "../types";
import { PRODUCTS } from "../data";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  let serializedErr = "";
  try {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid || null,
        email: auth.currentUser?.email || null,
        emailVerified: auth.currentUser?.emailVerified || null,
        isAnonymous: auth.currentUser?.isAnonymous || null,
        tenantId: auth.currentUser?.tenantId || null,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    serializedErr = JSON.stringify(errInfo);
  } catch (serializationError) {
    serializedErr = JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid || null,
        email: auth.currentUser?.email || null
      },
      operationType,
      path,
      serializationFailed: true
    });
  }
  console.error("Firestore Error: ", serializedErr);
  throw new Error(serializedErr);
}

export interface HeroImages {
  home: string;
  apparel: string;
  bagsAccessories: string;
  fragrances: string;
}

export const DEFAULT_HEROES: HeroImages = {
  home: "",
  apparel: "",
  bagsAccessories: "",
  fragrances: "",
};

/**
 * Fetches hero images configuration from Firestore settings collection.
 */
export async function fetchHeroImages(): Promise<HeroImages> {
  const path = "settings/heroes";
  try {
    const docRef = doc(db, "settings", "heroes");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_HEROES, ...docSnap.data() } as HeroImages;
    }
    return DEFAULT_HEROES;
  } catch (error: any) {
    if (error?.message?.includes("permission") || error?.code === "permission-denied") {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.warn("Error fetching hero images from Firestore (falling back to defaults):", error?.message || String(error));
    return DEFAULT_HEROES;
  }
}

/**
 * Updates a specific page's hero image URL in Firestore.
 */
export async function updateHeroImageInDb(page: keyof HeroImages, url: string): Promise<void> {
  const path = "settings/heroes";
  try {
    const docRef = doc(db, "settings", "heroes");
    await setDoc(docRef, { [page]: url }, { merge: true });
  } catch (error: any) {
    if (error?.message?.includes("permission") || error?.code === "permission-denied") {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    throw new Error(error?.message || String(error));
  }
}

// Helper to remove any undefined properties recursively to prevent Firestore write crashes
function cleanUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanUndefined(v)])
    );
  }
  return obj;
}

const PRODUCTS_COLLECTION = "products";

/**
 * Fetches all products from Firestore.
 * If the collection is empty, seeds the database with initial products.
 */
export async function fetchProducts(): Promise<Product[]> {
  const path = PRODUCTS_COLLECTION;
  try {
    const productsCol = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsCol);
    const querySnapshot = await getDocs(q);
    
    let products = querySnapshot.docs.map(doc => doc.data() as Product);
    
    // Automatically delete old hardcoded products from Firestore to keep the DB 100% fresh
    const hardcodedIds = ["knqr-trousers", "knqr-necklace", "knqr-blouse"];
    const foundHardcoded = products.filter(p => hardcodedIds.includes(p.id));
    if (foundHardcoded.length > 0) {
      console.log("Removing legacy hardcoded products from Firestore...");
      for (const p of foundHardcoded) {
        try {
          await deleteDoc(doc(db, PRODUCTS_COLLECTION, p.id));
        } catch (e: any) {
          console.error(`Failed to delete legacy product ${p.id}:`, e?.message || String(e));
        }
      }
      products = products.filter(p => !hardcodedIds.includes(p.id));
    }
    
    return products;
  } catch (error: any) {
    if (error?.message?.includes("permission") || error?.code === "permission-denied") {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.warn("Error fetching products from Firestore (falling back to offline list):", error?.message || String(error));
    // Return hard-coded products as fallback
    return PRODUCTS;
  }
}

/**
 * Seeds initial products into Firestore.
 */
async function seedInitialProducts(): Promise<void> {
  try {
    for (const product of PRODUCTS) {
      const cleaned = cleanUndefined(product);
      try {
        await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), cleaned);
      } catch (error: any) {
        if (error?.message?.includes("permission") || error?.code === "permission-denied") {
          handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${product.id}`);
        }
        throw new Error(error?.message || String(error));
      }
    }
    console.log("Initial products successfully seeded to Firestore.");
  } catch (error: any) {
    console.error("Failed to seed initial products:", error?.message || String(error));
  }
}

/**
 * Creates a new product document in Firestore.
 */
export async function createProduct(product: Product): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  const cleaned = cleanUndefined(product);
  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), cleaned);
  } catch (error: any) {
    if (error?.message?.includes("permission") || error?.code === "permission-denied") {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    throw new Error(error?.message || String(error));
  }
}

/**
 * Updates an existing product document in Firestore.
 */
export async function updateProduct(product: Product): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  const cleaned = cleanUndefined(product);
  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), cleaned);
  } catch (error: any) {
    if (error?.message?.includes("permission") || error?.code === "permission-denied") {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    throw new Error(error?.message || String(error));
  }
}

/**
 * Deletes a product from Firestore.
 */
export async function deleteProduct(productId: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error: any) {
    if (error?.message?.includes("permission") || error?.code === "permission-denied") {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    throw new Error(error?.message || String(error));
  }
}
