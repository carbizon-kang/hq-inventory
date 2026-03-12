import { Branch, InventoryItem, Asset, AssetTransfer, Category } from "@/types";

// 지사 목록 샘플 데이터
export const MOCK_BRANCHES: Branch[] = [
  { id: "hq", name: "본사", location: "서울", manager: "김본사", contact: "02-1234-5678", division: "", headquarters: "", team: "" },
  { id: "b1", name: "부산지사", location: "부산", manager: "이부산", contact: "051-111-2222", division: "", headquarters: "", team: "" },
  { id: "b2", name: "대구지사", location: "대구", manager: "박대구", contact: "053-333-4444", division: "", headquarters: "", team: "" },
  { id: "b3", name: "인천지사", location: "인천", manager: "최인천", contact: "032-555-6666", division: "", headquarters: "", team: "" },
  { id: "b4", name: "광주지사", location: "광주", manager: "정광주", contact: "062-777-8888", division: "", headquarters: "", team: "" },
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

// 기본 카테고리 데이터
export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat1", name: "사무용품", isDefault: true },
  { id: "cat2", name: "전산장비", isDefault: true },
  { id: "cat3", name: "청소용품", isDefault: true },
  { id: "cat4", name: "비품", isDefault: true },
  { id: "cat5", name: "기타", isDefault: true },
];

// 자산 샘플 데이터
export const MOCK_ASSETS: Asset[] = [
  { id: "a1", assetNumber: "NB-001", name: "노트북", category: "전산장비", branchId: "hq", status: "사용중", purchaseDate: "2024-01-15", purchasePrice: 0, depreciationYears: 0, note: "대표이사용" },
  { id: "a2", assetNumber: "NB-002", name: "노트북", category: "전산장비", branchId: "hq", status: "사용중", purchaseDate: "2024-01-15", purchasePrice: 0, depreciationYears: 0, note: "기획팀" },
  { id: "a3", assetNumber: "NB-003", name: "노트북", category: "전산장비", branchId: "b1", status: "사용중", purchaseDate: "2024-03-01", purchasePrice: 0, depreciationYears: 0, note: "부산지사 팀장" },
  { id: "a4", assetNumber: "DK-001", name: "책상", category: "비품", branchId: "hq", status: "사용중", purchaseDate: "2023-06-01", purchasePrice: 0, depreciationYears: 0, note: "" },
  { id: "a5", assetNumber: "DK-002", name: "책상", category: "비품", branchId: "b1", status: "사용중", purchaseDate: "2023-06-01", purchasePrice: 0, depreciationYears: 0, note: "" },
  { id: "a6", assetNumber: "MN-001", name: "모니터", category: "전산장비", branchId: "hq", status: "사용중", purchaseDate: "2024-02-10", purchasePrice: 0, depreciationYears: 0, note: "27인치" },
  { id: "a7", assetNumber: "MN-002", name: "모니터", category: "전산장비", branchId: "b2", status: "보관중", purchaseDate: "2023-11-20", purchasePrice: 0, depreciationYears: 0, note: "" },
  { id: "a8", assetNumber: "PR-001", name: "복합기", category: "전산장비", branchId: "hq", status: "수리중", purchaseDate: "2022-09-05", purchasePrice: 0, depreciationYears: 0, note: "A/S 접수중" },
];

// 자산 이동 이력 샘플 데이터
export const MOCK_TRANSFERS: AssetTransfer[] = [
  { id: "tr1", assetId: "a3", fromBranchId: "hq", toBranchId: "b1", transferDate: "2024-03-05", manager: "김본사", reason: "부산지사 인력 보강으로 노트북 지원" },
  { id: "tr2", assetId: "a5", fromBranchId: "hq", toBranchId: "b1", transferDate: "2023-06-10", manager: "이부산", reason: "부산지사 신규 개소 비품 배치" },
  { id: "tr3", assetId: "a7", fromBranchId: "hq", toBranchId: "b2", transferDate: "2024-01-15", manager: "박대구", reason: "대구지사 모니터 지원" },
];
