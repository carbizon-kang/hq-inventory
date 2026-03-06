-- =============================================
-- 품명 관리 테이블 추가 마이그레이션
-- Supabase > SQL Editor 에서 실행하세요.
-- =============================================

create table if not exists item_names (
  id text primary key,
  name text not null unique,
  prefix text not null,
  is_default boolean default false
);

alter table item_names enable row level security;
create policy "public_all" on item_names for all using (true) with check (true);

-- 기본 품목 데이터 삽입
insert into item_names (id, name, prefix, is_default) values
  ('item_nb', '노트북', 'NB', true),
  ('item_mn', '모니터', 'MN', true),
  ('item_dk', '책상', 'DK', true),
  ('item_ch', '의자', 'CH', true),
  ('item_mf', '복합기', 'MF', true),
  ('item_pr', '프린터', 'PR', true),
  ('item_sv', '서버', 'SV', true),
  ('item_sc', '스캐너', 'SC', true),
  ('item_pj', '빔프로젝터', 'PJ', true),
  ('item_rf', '냉장고', 'RF', true),
  ('item_ac', '에어컨', 'AC', true),
  ('item_tv', 'TV', 'TV', true),
  ('item_wb', '화이트보드', 'WB', true),
  ('item_ph', '전화기', 'PH', true),
  ('item_lk', '사물함', 'LK', true),
  ('item_cb', '캐비닛', 'CB', true)
on conflict (id) do nothing;
