import { InventoryItem, StockStatus } from "@/types";
import { STOCK_DANGER_THRESHOLD, STOCK_WARNING_THRESHOLD } from "./constants";

// 재고 비율 계산
export function getStockRatio(item: InventoryItem): number {
  return item.quantity / item.minimumStock;
}

// 재고 상태 계산
export function getStockStatus(item: InventoryItem): StockStatus {
  const ratio = getStockRatio(item);
  if (ratio <= STOCK_DANGER_THRESHOLD) return "위험";
  if (ratio <= STOCK_WARNING_THRESHOLD) return "부족";
  return "정상";
}

// 부족 재고 필터링 (위험 + 부족)
export function getLowStockItems(items: InventoryItem[]): InventoryItem[] {
  return items.filter((item) => getStockStatus(item) !== "정상");
}

// 지사별 재고 요약
export function getBranchSummary(items: InventoryItem[], branchId: string) {
  const branchItems = items.filter((item) => item.branchId === branchId);
  const total = branchItems.length;
  const lowStock = getLowStockItems(branchItems).length;
  return { total, lowStock };
}
