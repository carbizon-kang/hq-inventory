// 지사 정보 타입
export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  contact: string;
}

// 재고 항목 타입
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  branchId: string;
  lastUpdated: string;
}

// 재고 카테고리 타입
export type InventoryCategory =
  | "사무용품"
  | "전산장비"
  | "청소용품"
  | "비품"
  | "기타";

// 재고 상태 타입
export type StockStatus = "정상" | "부족" | "위험";

// 사용자 역할 타입
export type UserRole = "본사" | "지사";
