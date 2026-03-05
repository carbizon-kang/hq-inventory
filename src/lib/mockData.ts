import { Branch, InventoryItem } from "@/types";

// 지사 목록 샘플 데이터
export const MOCK_BRANCHES: Branch[] = [
  { id: "hq", name: "본사", location: "서울", manager: "김본사", contact: "02-1234-5678" },
  { id: "b1", name: "부산지사", location: "부산", manager: "이부산", contact: "051-111-2222" },
  { id: "b2", name: "대구지사", location: "대구", manager: "박대구", contact: "053-333-4444" },
  { id: "b3", name: "인천지사", location: "인천", manager: "최인천", contact: "032-555-6666" },
  { id: "b4", name: "광주지사", location: "광주", manager: "정광주", contact: "062-777-8888" },
];

// 재고 항목 샘플 데이터
export const MOCK_INVENTORY: InventoryItem[] = [
  // 본사
  { id: "i1", name: "A4 용지", category: "사무용품", quantity: 150, unit: "박스", minimumStock: 50, branchId: "hq", lastUpdated: "2026-03-04" },
  { id: "i2", name: "볼펜", category: "사무용품", quantity: 80, unit: "타", minimumStock: 30, branchId: "hq", lastUpdated: "2026-03-03" },
  { id: "i3", name: "노트북", category: "전산장비", quantity: 12, unit: "대", minimumStock: 5, branchId: "hq", lastUpdated: "2026-03-01" },
  { id: "i4", name: "청소포", category: "청소용품", quantity: 8, unit: "박스", minimumStock: 20, branchId: "hq", lastUpdated: "2026-03-02" },
  // 부산지사
  { id: "i5", name: "A4 용지", category: "사무용품", quantity: 30, unit: "박스", minimumStock: 20, branchId: "b1", lastUpdated: "2026-03-04" },
  { id: "i6", name: "토너", category: "사무용품", quantity: 3, unit: "개", minimumStock: 10, branchId: "b1", lastUpdated: "2026-03-01" },
  { id: "i7", name: "마우스", category: "전산장비", quantity: 15, unit: "개", minimumStock: 5, branchId: "b1", lastUpdated: "2026-03-03" },
  // 대구지사
  { id: "i8", name: "A4 용지", category: "사무용품", quantity: 5, unit: "박스", minimumStock: 20, branchId: "b2", lastUpdated: "2026-03-05" },
  { id: "i9", name: "볼펜", category: "사무용품", quantity: 25, unit: "타", minimumStock: 20, branchId: "b2", lastUpdated: "2026-03-04" },
  { id: "i10", name: "키보드", category: "전산장비", quantity: 6, unit: "개", minimumStock: 5, branchId: "b2", lastUpdated: "2026-03-02" },
  // 인천지사
  { id: "i11", name: "A4 용지", category: "사무용품", quantity: 60, unit: "박스", minimumStock: 20, branchId: "b3", lastUpdated: "2026-03-03" },
  { id: "i12", name: "청소포", category: "청소용품", quantity: 4, unit: "박스", minimumStock: 10, branchId: "b3", lastUpdated: "2026-03-04" },
  // 광주지사
  { id: "i13", name: "A4 용지", category: "사무용품", quantity: 18, unit: "박스", minimumStock: 20, branchId: "b4", lastUpdated: "2026-03-05" },
  { id: "i14", name: "볼펜", category: "사무용품", quantity: 10, unit: "타", minimumStock: 20, branchId: "b4", lastUpdated: "2026-03-04" },
  { id: "i15", name: "모니터", category: "전산장비", quantity: 8, unit: "대", minimumStock: 3, branchId: "b4", lastUpdated: "2026-03-01" },
];
