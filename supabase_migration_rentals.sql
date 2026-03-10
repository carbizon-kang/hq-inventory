-- =============================================
-- 렌트 현황 테이블
-- Supabase > SQL Editor 에서 실행하세요.
-- =============================================

create table if not exists rentals (
  id              text primary key,
  branch_id       text not null,
  equip_type      text not null,          -- '복합기' | '정수기' | '기타'
  model_name      text not null default '',
  vendor          text not null default '',
  monthly_fee     integer not null default 0,
  start_date      text not null,
  end_date        text not null,
  deposit         boolean not null default false,
  deposit_amount  integer not null default 0,
  water_purifier_type text not null default '',  -- '냉온정수기' | '얼음정수기' | ''
  status          text not null default '렌트중',
  note            text not null default ''
);

alter table rentals enable row level security;
create policy "public_all" on rentals for all using (true) with check (true);
