// 앱 기본 설정
export const APP_NAME = "HQ Inventory";
export const APP_DESCRIPTION = "본사 및 지사 통합 재고 관리 시스템";

// 재고 상태 기준 (비율)
export const STOCK_WARNING_THRESHOLD = 0.5; // 50% 이하: 부족
export const STOCK_DANGER_THRESHOLD = 0.2;  // 20% 이하: 위험

// 네비게이션 메뉴
export const NAV_ITEMS = [
  { label: "자산 현황", href: "/inventory" },
  { label: "유형자산", href: "/assets" },
  { label: "지사 관리", href: "/branches" },
  { label: "설정", href: "/settings" },
] as const;
