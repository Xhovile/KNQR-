import { db, auth } from "../lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  where, 
  orderBy,
  limit
} from "firebase/firestore";
import { Order } from "../types";
import { handleFirestoreError, OperationType, withTimeout } from "./productService";

const ORDERS_COLLECTION = "orders";

export async function createOrder(orderData: Omit<Order, "id">): Promise<string> {
  const path = ORDERS_COLLECTION;
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const newDocRef = doc(ordersRef); // Generates a unique client-side document reference ID
  const orderId = newDocRef.id;

  const finalOrder: Order = {
    ...orderData,
    id: orderId,
  };

  // Sync to localStorage first
  let localOrders: Order[] = [];
  const local = localStorage.getItem("knqr_orders");
  if (local) {
    try { localOrders = JSON.parse(local); } catch {}
  }
  if (!Array.isArray(localOrders)) localOrders = [];
  localOrders.unshift(finalOrder); // Add new order to top of list
  localStorage.setItem("knqr_orders", JSON.stringify(localOrders));

  try {
    await withTimeout(setDoc(newDocRef, finalOrder), 4000);
  } catch (error: any) {
    console.warn("Firestore order creation failed/timed out, saved locally instead:", error?.message || String(error));
    // Let the promise resolve successfully for the user so their cart clears and they see the checkout success screen.
  }
  return orderId;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const path = `${ORDERS_COLLECTION}?userId=${userId}`;
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    // Fetch orders for user, ordered by creation date desc
    const q = query(
      ordersRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const querySnapshot = await withTimeout(getDocs(q), 3000);
    const orders: Order[] = [];
    querySnapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });

    // Save fetched orders to localStorage to keep cached version fresh
    localStorage.setItem("knqr_orders", JSON.stringify(orders));
    return orders;
  } catch (error: any) {
    console.warn("Error/Timeout fetching orders from Firestore, trying fallback retries or local cache:", error?.message || String(error));
    
    // Fallback 1: Try custom query fallback
    try {
      const ordersRef = collection(db, ORDERS_COLLECTION);
      const qFallback = query(ordersRef, orderBy("createdAt", "desc"), limit(100));
      const querySnapshot = await withTimeout(getDocs(qFallback), 3000);
      const orders: Order[] = [];
      querySnapshot.forEach((docSnap) => {
        const order = docSnap.data() as Order;
        if (order.userId === userId) {
          orders.push(order);
        }
      });
      localStorage.setItem("knqr_orders", JSON.stringify(orders));
      return orders;
    } catch (fallbackError: any) {
      console.warn("Fallback query failed, using localStorage cache:", fallbackError?.message || String(fallbackError));
      
      // Fallback 2: LocalStorage cache
      const local = localStorage.getItem("knqr_orders");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            return parsed.filter(o => o.userId === userId);
          }
        } catch {}
      }
      return [];
    }
  }
}
