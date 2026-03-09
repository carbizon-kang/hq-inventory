-- =============================================
-- 앱 설정 테이블 (비밀번호 등 시스템 설정)
-- Supabase > SQL Editor 에서 실행하세요.
-- =============================================

create table if not exists app_settings (
  key text primary key,
  value text not null
);

alter table app_settings enable row level security;
create policy "public_all" on app_settings for all using (true) with check (true);
