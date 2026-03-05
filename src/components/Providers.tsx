"use client";

import { InventoryProvider } from "@/lib/inventoryStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <InventoryProvider>{children}</InventoryProvider>;
}
