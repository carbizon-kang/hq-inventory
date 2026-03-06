-- =============================================
-- HQ Inventory - Supabase 테이블 생성 SQL
-- Supabase > SQL Editor 에서 실행하세요.
-- =============================================

-- 1. 지사 테이블
create table if not exists branches (
  id text primary key,
  name text not null,
  location text not null,
  manager text not null,
  contact text not null
);

-- 2. 카테고리 테이블
create table if not exists categories (
  id text primary key,
  name text not null unique,
  is_default boolean default false
);

-- 3. 자산 테이블
create table if not exists assets (
  id text primary key,
  asset_number text not null unique,
  name text not null,
  category text not null,
  branch_id text references branches(id) on delete set null,
  status text not null check (status in ('사용중', '보관중', '수리중', '폐기')),
  purchase_date text not null,
  note text default ''
);

-- 4. 자산 이동 이력 테이블
create table if not exists asset_transfers (
  id text primary key,
  asset_id text references assets(id) on delete cascade,
  from_branch_id text references branches(id) on delete set null,
  to_branch_id text references branches(id) on delete set null,
  transfer_date text not null,
  manager text not null,
  reason text default ''
);

-- =============================================
-- RLS (Row Level Security) - 공개 접근 허용
-- 인증 없이 모든 사용자가 읽기/쓰기 가능
-- =============================================
alter table branches enable row level security;
alter table categories enable row level security;
alter table assets enable row level security;
alter table asset_transfers enable row level security;

create policy "public_all" on branches for all using (true) with check (true);
create policy "public_all" on categories for all using (true) with check (true);
create policy "public_all" on assets for all using (true) with check (true);
create policy "public_all" on asset_transfers for all using (true) with check (true);

-- =============================================
-- 초기 데이터 삽입
-- =============================================

-- 지사
insert into branches (id, name, location, manager, contact) values
  ('hq', '본사', '서울', '김본사', '02-1234-5678'),
  ('b1', '부산지사', '부산', '이부산', '051-111-2222'),
  ('b2', '대구지사', '대구', '박대구', '053-333-4444'),
  ('b3', '인천지사', '인천', '최인천', '032-555-6666'),
  ('b4', '광주지사', '광주', '정광주', '062-777-8888')
on conflict (id) do nothing;

-- 카테고리
insert into categories (id, name, is_default) values
  ('cat1', '사무용품', true),
  ('cat2', '전산장비', true),
  ('cat3', '청소용품', true),
  ('cat4', '비품', true),
  ('cat5', '기타', true)
on conflict (id) do nothing;

-- 자산 샘플
insert into assets (id, asset_number, name, category, branch_id, status, purchase_date, note) values
  ('a1', 'NB-001', '노트북', '전산장비', 'hq', '사용중', '2024-01-15', '대표이사용'),
  ('a2', 'NB-002', '노트북', '전산장비', 'hq', '사용중', '2024-01-15', '기획팀'),
  ('a3', 'NB-003', '노트북', '전산장비', 'b1', '사용중', '2024-03-01', '부산지사 팀장'),
  ('a4', 'DK-001', '책상', '비품', 'hq', '사용중', '2023-06-01', ''),
  ('a5', 'DK-002', '책상', '비품', 'b1', '사용중', '2023-06-01', ''),
  ('a6', 'MN-001', '모니터', '전산장비', 'hq', '사용중', '2024-02-10', '27인치'),
  ('a7', 'MN-002', '모니터', '전산장비', 'b2', '보관중', '2023-11-20', ''),
  ('a8', 'PR-001', '복합기', '전산장비', 'hq', '수리중', '2022-09-05', 'A/S 접수중')
on conflict (id) do nothing;

-- 자산 이동 이력 샘플
insert into asset_transfers (id, asset_id, from_branch_id, to_branch_id, transfer_date, manager, reason) values
  ('tr1', 'a3', 'hq', 'b1', '2024-03-05', '김본사', '부산지사 인력 보강으로 노트북 지원'),
  ('tr2', 'a5', 'hq', 'b1', '2023-06-10', '이부산', '부산지사 신규 개소 비품 배치'),
  ('tr3', 'a7', 'hq', 'b2', '2024-01-15', '박대구', '대구지사 모니터 지원')
on conflict (id) do nothing;
