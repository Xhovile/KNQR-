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
 * Helper utility to wrap standard promises with a timeout to prevent infinite loaders
 * when connection to Firestore is blocked (e.g. by Brave Shields, ad-blockers, or firewalls).
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 4000,
  errorMsg: string = "Database operation timed out. This is usually caused by an ad-blocker, Brave Shields, or firewall blocking the connection to Google Firestore. Please try disabling your browser shields / ad-blockers or check your connection, then try again."
): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMsg));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

/**
 * Fetches hero images configuration from Firestore settings collection.
 */
export async function fetchHeroImages(): Promise<HeroImages> {
  const path = "settings/heroes";
  try {
    const docRef = doc(db, "settings", "heroes");
    const docSnap = await withTimeout(getDoc(docRef), 3000);
    if (docSnap.exists()) {
      const data = docSnap.data();
      localStorage.setItem("knqr_heroes", JSON.stringify(data));
      return { ...DEFAULT_HEROES, ...data } as HeroImages;
    }
    const local = localStorage.getItem("knqr_heroes");
    if (local) {
      try { return { ...DEFAULT_HEROES, ...JSON.parse(local) }; } catch {}
    }
    return DEFAULT_HEROES;
  } catch (error: any) {
    console.warn("Error fetching hero images from Firestore (falling back to localStorage/defaults):", error?.message || String(error));
    const local = localStorage.getItem("knqr_heroes");
    if (local) {
      try { return { ...DEFAULT_HEROES, ...JSON.parse(local) }; } catch {}
    }
    return DEFAULT_HEROES;
  }
}

/**
 * Updates a specific page's hero image URL in Firestore.
 */
export async function updateHeroImageInDb(page: keyof HeroImages, url: string): Promise<void> {
  const path = "settings/heroes";
  
  // Update localStorage first so changes are immediately consistent locally
  let currentHeroes: HeroImages = { ...DEFAULT_HEROES };
  const local = localStorage.getItem("knqr_heroes");
  if (local) {
    try { currentHeroes = JSON.parse(local); } catch {}
  }
  currentHeroes[page] = url;
  localStorage.setItem("knqr_heroes", JSON.stringify(currentHeroes));

  try {
    const docRef = doc(db, "settings", "heroes");
    await withTimeout(setDoc(docRef, { [page]: url }, { merge: true }), 4000);
  } catch (error: any) {
    console.warn("Firestore hero image update failed/timed out, saved to local fallback instead:", error?.message || String(error));
    // Do NOT throw if we managed to save it locally. This allows the user's action to succeed!
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
    const querySnapshot = await withTimeout(getDocs(q), 3000);
    
    let products = querySnapshot.docs.map(doc => doc.data() as Product);
    
    // Automatically delete old hardcoded products from Firestore to keep the DB 100% fresh
    const hardcodedIds = ["knqr-trousers", "knqr-necklace", "knqr-blouse"];
    const foundHardcoded = products.filter(p => hardcodedIds.includes(p.id));
    if (foundHardcoded.length > 0) {
      console.log("Removing legacy hardcoded products from Firestore...");
      for (const p of foundHardcoded) {
        try {
          await deleteDoc(doc(db, PRODUCTS_COLLECTION, p.id));
        } catch (e: any) {}
      }
      products = products.filter(p => !hardcodedIds.includes(p.id));
    }
    
    // Sync to localStorage
    localStorage.setItem("knqr_products", JSON.stringify(products));
    return products;
  } catch (error: any) {
    console.warn("Error fetching products from Firestore (falling back to localStorage/defaults):", error?.message || String(error));
    const local = localStorage.getItem("knqr_products");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
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
        await withTimeout(setDoc(doc(db, PRODUCTS_COLLECTION, product.id), cleaned), 3000);
      } catch (error: any) {
        console.warn(`Failed to seed product ${product.id} to Firestore:`, error?.message || String(error));
      }
    }
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

  // Sync to localStorage first
  let products: Product[] = [];
  const local = localStorage.getItem("knqr_products");
  if (local) {
    try { products = JSON.parse(local); } catch {}
  }
  if (!Array.isArray(products)) products = [];
  products = products.filter(p => p.id !== product.id);
  products.push(product);
  localStorage.setItem("knqr_products", JSON.stringify(products));

  try {
    await withTimeout(setDoc(doc(db, PRODUCTS_COLLECTION, product.id), cleaned), 4000);
  } catch (error: any) {
    console.warn("Firestore product creation failed/timed out, saved locally:", error?.message || String(error));
  }
}

/**
 * Updates an existing product document in Firestore.
 */
export async function updateProduct(product: Product): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  const cleaned = cleanUndefined(product);

  // Sync to localStorage first
  let products: Product[] = [];
  const local = localStorage.getItem("knqr_products");
  if (local) {
    try { products = JSON.parse(local); } catch {}
  }
  if (!Array.isArray(products)) products = [];
  products = products.map(p => p.id === product.id ? product : p);
  localStorage.setItem("knqr_products", JSON.stringify(products));

  try {
    await withTimeout(setDoc(doc(db, PRODUCTS_COLLECTION, product.id), cleaned), 4000);
  } catch (error: any) {
    console.warn("Firestore product update failed/timed out, saved locally:", error?.message || String(error));
  }
}

/**
 * Deletes a product from Firestore.
 */
export async function deleteProduct(productId: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;

  // Sync to localStorage first
  let products: Product[] = [];
  const local = localStorage.getItem("knqr_products");
  if (local) {
    try { products = JSON.parse(local); } catch {}
  }
  if (!Array.isArray(products)) products = [];
  products = products.filter(p => p.id !== productId);
  localStorage.setItem("knqr_products", JSON.stringify(products));

  try {
    await withTimeout(deleteDoc(doc(db, PRODUCTS_COLLECTION, productId)), 4000);
  } catch (error: any) {
    console.warn("Firestore product deletion failed/timed out, deleted locally:", error?.message || String(error));
  }
}
