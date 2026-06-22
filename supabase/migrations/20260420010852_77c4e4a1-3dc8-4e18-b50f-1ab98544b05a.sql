-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  subscription_plan text not null default 'free',
  preferred_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- Trades
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pair text not null,
  side text not null check (side in ('buy', 'sell')),
  lot_size numeric(10,2) not null default 0,
  entry_price numeric(18,5) not null default 0,
  exit_price numeric(18,5),
  stop_loss numeric(18,5),
  take_profit numeric(18,5),
  risk_percent numeric(6,2),
  reward_percent numeric(6,2),
  rr_ratio numeric(8,2),
  pips numeric(10,2),
  pnl numeric(14,2),
  result text check (result in ('win', 'loss', 'breakeven', 'open')),
  strategy text,
  session text check (session in ('asia', 'london', 'new_york', 'other')),
  confidence smallint check (confidence between 1 and 5),
  emotion_before text,
  emotion_after text,
  mistakes text[] default '{}',
  notes text,
  screenshot_url text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trades_user_opened_idx on public.trades (user_id, opened_at desc);
create index trades_user_pair_idx on public.trades (user_id, pair);

alter table public.trades enable row level security;

create policy "trades_select_own" on public.trades for select to authenticated using (auth.uid() = user_id);
create policy "trades_insert_own" on public.trades for insert to authenticated with check (auth.uid() = user_id);
create policy "trades_update_own" on public.trades for update to authenticated using (auth.uid() = user_id);
create policy "trades_delete_own" on public.trades for delete to authenticated using (auth.uid() = user_id);

create trigger trades_set_updated_at before update on public.trades for each row execute function public.set_updated_at();

-- Journal
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  entry_type text not null default 'daily' check (entry_type in ('daily', 'weekly', 'lesson', 'goal', 'reflection')),
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_user_date_idx on public.journal_entries (user_id, entry_date desc);

alter table public.journal_entries enable row level security;

create policy "journal_select_own" on public.journal_entries for select to authenticated using (auth.uid() = user_id);
create policy "journal_insert_own" on public.journal_entries for insert to authenticated with check (auth.uid() = user_id);
create policy "journal_update_own" on public.journal_entries for update to authenticated using (auth.uid() = user_id);
create policy "journal_delete_own" on public.journal_entries for delete to authenticated using (auth.uid() = user_id);

create trigger journal_set_updated_at before update on public.journal_entries for each row execute function public.set_updated_at();

-- Storage bucket for trade screenshots (private)
insert into storage.buckets (id, name, public) values ('trade-screenshots', 'trade-screenshots', false)
on conflict (id) do nothing;

create policy "screenshots_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "screenshots_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "screenshots_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "screenshots_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);