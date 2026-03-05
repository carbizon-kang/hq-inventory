# HQ Inventory - 본사·지사 통합 재고 관리 시스템

본사와 지사가 함께 사용하는 웹 기반 재고 관리 솔루션입니다.

## 주요 기능

- **대시보드** - 전체 재고 현황 요약, 부족 재고 목록, 지사별 재고 상태 바
- **재고 현황** - 품목별 조회, 지사·카테고리·상태 필터, 검색, 정렬, 추가·수정·삭제
- **지사 관리** - 지사별 재고 현황 카드 및 상세 페이지
- **실시간 연동** - 전 페이지가 동일한 상태(Context)를 공유하여 즉시 반영

## 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 상태 관리 | React Context API |

## 프로젝트 구조

```
src/
├── app/
│   ├── dashboard/          # 대시보드
│   ├── inventory/
│   │   ├── new/            # 재고 추가
│   │   └── [id]/edit/      # 재고 수정
│   └── branches/
│       └── [id]/           # 지사 상세
├── components/
│   ├── layout/             # 공통 헤더
│   ├── inventory/          # 재고 테이블, 폼
│   ├── branches/           # 지사 카드
│   └── ui/                 # StatCard, StockBadge
├── lib/
│   ├── constants.ts        # 앱 상수
│   ├── inventory.ts        # 재고 상태 계산 유틸
│   ├── inventoryStore.tsx  # 전역 상태 (Context)
│   └── mockData.ts         # 샘플 데이터
└── types/
    └── index.ts            # 공통 타입 정의
```

## 재고 상태 기준

| 상태 | 조건 |
|------|------|
| 정상 | 현재 수량 > 최소 재고 × 50% |
| 부족 | 현재 수량 ≤ 최소 재고 × 50% |
| 위험 | 현재 수량 ≤ 최소 재고 × 20% |

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

개발 서버 실행 후 [http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.
