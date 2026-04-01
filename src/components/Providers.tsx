"use client";

import { BranchProvider } from "@/lib/branchStore";
import { InventoryProvider } from "@/lib/inventoryStore";
import { TransactionProvider } from "@/lib/transactionStore";
import { CategoryProvider } from "@/lib/categoryStore";
import { AssetProvider } from "@/lib/assetStore";
import { ItemProvider } from "@/lib/itemStore";
import { AuthProvider } from "@/lib/authStore";
import { RentalProvider } from "@/lib/rentalStore";
import { RentalEquipTypeProvider } from "@/lib/rentalEquipTypeStore";
import { OrgProvider } from "@/lib/orgStore";
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
                  <RentalProvider>
                    <RentalEquipTypeProvider>
                    <OrgProvider>
                      <AuthGuard>
                        {children}
                      </AuthGuard>
                    </OrgProvider>
                    </RentalEquipTypeProvider>
                  </RentalProvider>
                </ItemProvider>
              </AssetProvider>
            </TransactionProvider>
          </InventoryProvider>
        </BranchProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}
