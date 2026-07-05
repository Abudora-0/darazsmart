export type ToastVariant = "default" | "success" | "error";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

type Listener = (toast: ToastItem) => void;

const listeners = new Set<Listener>();

/** Fire a toast from anywhere in a client component — no provider/context needed. */
export function toast(message: string, options: { variant?: ToastVariant } = {}) {
  const item: ToastItem = {
    id: Math.random().toString(36).slice(2),
    message,
    variant: options.variant ?? "default",
  };
  listeners.forEach((l) => l(item));
  return item.id;
}

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
