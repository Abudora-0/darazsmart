"use client";

import { ShoppingBag, Check } from "lucide-react";
import { useCartStore, type CartProduct } from "@/store/cart";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const { addItem, removeItem, hasItem } = useCartStore();
  const inCart = hasItem(product.id);

  function toggle() {
    if (inCart) {
      removeItem(product.id);
      toast("Removed from cart");
    } else {
      addItem(product);
      toast(`Added "${product.title.slice(0, 40)}" to cart`, { variant: "success" });
    }
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all active:scale-95",
        inCart
          ? "border border-brand-200 bg-brand-50 text-brand-700"
          : "bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600"
      )}
    >
      {inCart ? (
        <>
          <Check className="h-4 w-4" />
          Saved to cart
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          Add to cart
        </>
      )}
    </button>
  );
}
