import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  unitPrice: number;
  maxQuantity: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + quantity, i.maxQuantity),
                    }
                  : i,
              ),
              isDrawerOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.maxQuantity) },
            ],
            isDrawerOpen: true,
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity: Math.max(1, Math.min(quantity, i.maxQuantity)),
                }
              : i,
          ),
        })),

      clear: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: "bytehaven-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
