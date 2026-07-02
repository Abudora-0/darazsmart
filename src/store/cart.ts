"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProduct {
  id: string;
  darazUrl: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  seller?: string;
}

interface CartState {
  items: CartProduct[];
  addItem: (product: CartProduct) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  hasItem: (id: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (get().hasItem(product.id)) return;
        set((s) => ({ items: [...s.items, product] }));
      },
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
      hasItem: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "darazsmart-cart" }
  )
);
