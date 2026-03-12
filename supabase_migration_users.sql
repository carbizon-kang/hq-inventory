-- =============================================
-- 사용자 관리 테이블
-- Supabase > SQL Editor 에서 실행하세요.
-- =============================================
create table if not exists users (
  id          text primary key,
  username    text unique not null,
  password_hash text not null,
  role        text not null default 'user',   -- 'admin' | 'user'
  branch_id   text not null default '',       -- '' = 관리자(전체 접근)
  created_at  timestamptz default now()
);

alter table users enable row level security;
create policy "public_all" on users for all using (true) with check (true);
