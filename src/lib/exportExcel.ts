import * as XLSX from "xlsx";
import { InventoryItem, Transaction, Branch } from "@/types";

// 재고 현황 엑셀 내보내기
export function exportInventoryToExcel(items: InventoryItem[], branches: Branch[]) {
  const rows = items.map((item) => {
    const branch = branches.find((b) => b.id === item.branchId);
    return {
      "품목명": item.name,
      "카테고리": item.category,
      "지사": branch?.name ?? "-",
      "현재 수량": item.quantity,
      "단위": item.unit,
      "최소 재고": item.minimumStock,
      "최근 업데이트": item.lastUpdated,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "재고 현황");
  XLSX.writeFile(wb, `재고현황_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// 입출고 이력 엑셀 내보내기
export function exportTransactionsToExcel(
  transactions: Transaction[],
  items: InventoryItem[],
  branches: Branch[]
) {
  const rows = transactions.map((t) => {
    const item = items.find((i) => i.id === t.itemId);
    const branch = branches.find((b) => b.id === t.branchId);
    return {
      "날짜": t.date,
      "지사": branch?.name ?? "-",
      "품목명": item?.name ?? "-",
      "구분": t.type,
      "수량": t.quantity,
      "담당자": t.manager,
      "비고": t.note,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "입출고 이력");
  XLSX.writeFile(wb, `입출고이력_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
