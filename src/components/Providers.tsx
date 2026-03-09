"use client";

import { BranchProvider } from "@/lib/branchStore";
import { InventoryProvider } from "@/lib/inventoryStore";
import { TransactionProvider } from "@/lib/transactionStore";
import { CategoryProvider } from "@/lib/categoryStore";
import { AssetProvider } from "@/lib/assetStore";
import { ItemProvider } from "@/lib/itemStore";
import { AuthProvider } from "@/lib/authStore";
import AuthGuard from "@/components/AuthGuard";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CategoryProvider>
        <BranchProvider>
          <InventoryProvider>
            <TransactionProvider>
              <AssetProvider>
                <ItemProvider>
                  <AuthGuard>
                    {children}
                  </AuthGuard>
                </ItemProvider>
              </AssetProvider>
            </TransactionProvider>
          </InventoryProvider>
        </BranchProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}
