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

// 입출고 이력 타입
export interface Transaction {
  id: string;
  itemId: string;
  branchId: string;
  type: "입고" | "출고";
  quantity: number;
  date: string;
  manager: string;
  note: string;
}

// 카테고리 타입
export interface Category {
  id: string;
  name: string;
  isDefault: boolean; // 기본 카테고리는 삭제 불가
}

// 자산 상태 타입
export type AssetStatus = "사용중" | "보관중" | "수리중" | "폐기";

// 개별 자산 타입 (유형자산 라벨링)
export interface Asset {
  id: string;
  assetNumber: string; // 예: NB-001, DK-001
  name: string;
  category: string;
  branchId: string;
  status: AssetStatus;
  purchaseDate: string;
  purchasePrice: number;     // 매입금액 (0 = 미입력)
  depreciationYears: number; // 감가상각 내용연수 (0 = 미설정)
  note: string;
}

// 자산 이동 이력 타입
export interface AssetTransfer {
  id: string;
  assetId: string;
  fromBranchId: string;
  toBranchId: string;
  transferDate: string;
  manager: string;
  reason: string;
}

// 렌트 장비 유형
export type RentalEquipType = "복합기" | "정수기" | "기타";

// 정수기 세부 유형
export type WaterPurifierType = "냉온정수기" | "얼음정수기";

// 렌트 상태
export type RentalStatus = "렌트중" | "만료" | "해지";

// 렌트 현황 타입
export interface RentalItem {
  id: string;
  branchId: string;              // 지사
  equipType: RentalEquipType;    // 장비 유형
  modelName: string;             // 모델명
  vendor: string;                // 렌탈 업체
  monthlyFee: number;            // 월 렌트비 (원)
  startDate: string;             // 렌트 시작일
  endDate: string;               // 렌트 종료일
  deposit: boolean;              // 보증금 유무
  depositAmount: number;         // 보증금 금액 (0 = 없음)
  waterPurifierType: WaterPurifierType | "";  // 정수기 유형 (정수기만)
  status: RentalStatus;
  note: string;
}
