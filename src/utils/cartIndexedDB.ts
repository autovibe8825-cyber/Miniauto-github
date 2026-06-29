import { CartItem } from '../types';

const DB_NAME = 'tiemxe_store_db';
const DB_VERSION = 1;
const STORE_NAME = 'cart_store';
const CART_KEY = 'current_cart';

/**
 * Opens the IndexedDB database.
 */
export function openCartDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Saves the entire cart to IndexedDB.
 */
export function saveCartToIndexedDB(cart: CartItem[]): Promise<void> {
  return openCartDB()
    .then((db) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(cart, CART_KEY);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error || new Error('Failed to save cart to IndexedDB'));
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    })
    .catch((err) => {
      console.error('[IndexedDB] saveCartToIndexedDB error:', err);
    });
}

/**
 * Retrieves the cart from IndexedDB.
 */
export function getCartFromIndexedDB(): Promise<CartItem[]> {
  return openCartDB()
    .then((db) => {
      return new Promise<CartItem[]>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(CART_KEY);

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error || new Error('Failed to get cart from IndexedDB'));
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    })
    .catch((err) => {
      console.error('[IndexedDB] getCartFromIndexedDB error:', err);
      return [];
    });
}

/**
 * Retrieves the cart, migrating it from localStorage if found there.
 */
export async function getCartAndMigrate(): Promise<CartItem[]> {
  try {
    const cart = await getCartFromIndexedDB();
    if (cart && cart.length > 0) {
      // Already has data in IndexedDB, clear localStorage cart to save space
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('miniauto_cart');
      }
      return cart;
    }

    // If IndexedDB is empty, check localStorage
    if (typeof window !== 'undefined') {
      const savedLocal = window.localStorage.getItem('miniauto_cart');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('[IndexedDB Migration] Migrating cart from localStorage to IndexedDB:', parsed);
            await saveCartToIndexedDB(parsed);
            window.localStorage.removeItem('miniauto_cart');
            return parsed;
          }
        } catch (e) {
          console.error('[IndexedDB Migration] Failed to parse localStorage cart', e);
        }
      }
    }
  } catch (error) {
    console.error('[IndexedDB] Error during load or migration:', error);
  }
  return [];
}
