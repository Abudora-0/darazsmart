"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/lib/toast";

export function SetAlertForm({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [targetPrice, setTargetPrice] = useState(
    Math.floor(currentPrice * 0.9).toString()
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, targetPrice }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      toast(`We'll email you when the price drops to ${formatPrice(Number(targetPrice))}`, {
        variant: "success",
      });
    } catch {
      setStatus("error");
      toast("Couldn't save the alert. Please try again.", { variant: "error" });
    }
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        <Bell className="h-4 w-4 text-brand-500" />
        Set price alert
      </h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            Rs.
          </span>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            min={1}
          />
        </div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-600 active:scale-95 disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : "Alert me"}
        </button>
      </form>
      <p className="mt-1.5 text-xs text-gray-400">
        Current price: {formatPrice(currentPrice)}
        {!session && " · Sign in to save alerts"}
      </p>
    </div>
  );
}
