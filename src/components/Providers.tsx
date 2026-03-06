"use client";

import { BranchProvider } from "@/lib/branchStore";
import { InventoryProvider } from "@/lib/inventoryStore";
import { TransactionProvider } from "@/lib/transactionStore";
import { CategoryProvider } from "@/lib/categoryStore";
import { AssetProvider } from "@/lib/assetStore";
import { ItemProvider } from "@/lib/itemStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CategoryProvider>
      <BranchProvider>
        <InventoryProvider>
          <TransactionProvider>
            <AssetProvider>
              <ItemProvider>
                {children}
              </ItemProvider>
            </AssetProvider>
          </TransactionProvider>
        </InventoryProvider>
      </BranchProvider>
    </CategoryProvider>
  );
}
