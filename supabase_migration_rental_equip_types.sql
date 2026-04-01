-- =============================================
-- 렌트 장비 유형 테이블 추가 마이그레이션
-- Supabase > SQL Editor 에서 실행하세요.
-- =============================================

create table if not exists rental_equip_types (
  id text primary key,
  name text not null unique,
  is_default boolean default false
);

alter table rental_equip_types enable row level security;
create policy "public_all" on rental_equip_types for all using (true) with check (true);

-- 기본 장비 유형 데이터 삽입
insert into rental_equip_types (id, name, is_default) values
  ('ret_copier',    '복합기', true),
  ('ret_purifier',  '정수기', true),
  ('ret_etc',       '기타',   true)
on conflict (id) do nothing;
