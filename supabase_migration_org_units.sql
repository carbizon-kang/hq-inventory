-- =============================================
-- 조직 계층 관리 테이블 (부문/본부/팀)
-- Supabase > SQL Editor 에서 실행하세요.
-- =============================================

create table if not exists org_units (
  id          text primary key,
  type        text not null,          -- '부문' | '본부' | '팀'
  name        text not null,
  parent_name text not null default '' -- 본부→부문명, 팀→본부명, 부문→''
);

alter table org_units enable row level security;
create policy "public_all" on org_units for all using (true) with check (true);
