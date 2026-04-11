-- Generace slepic
create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  started_at date not null,
  ended_at date,
  hen_count integer,
  notes text,
  created_at timestamptz default now()
);

-- Denní produkce vajec
create table productions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  generation_id uuid references generations(id) on delete cascade not null,
  date date not null,
  egg_count integer not null,
  created_at timestamptz default now(),
  unique(user_id, generation_id, date)
);

-- Příjmy z prodeje
create table incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  generation_id uuid references generations(id) on delete cascade not null,
  date date not null,
  income_type text not null default 'Prodej',
  amount integer not null,
  customer_name text,
  customer_type text,
  created_at timestamptz default now()
);

-- Náklady
create table costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  generation_id uuid references generations(id) on delete cascade not null,
  date date not null,
  cost_category text not null check (cost_category in ('Pořizovací', 'Provozní')),
  cost_subcategory text not null,
  amount integer not null,
  notes text,
  created_at timestamptz default now()
);

-- RLS
alter table generations enable row level security;
alter table productions enable row level security;
alter table incomes enable row level security;
alter table costs enable row level security;

create policy "Users see own generations" on generations for all using (auth.uid() = user_id);
create policy "Users see own productions" on productions for all using (auth.uid() = user_id);
create policy "Users see own incomes" on incomes for all using (auth.uid() = user_id);
create policy "Users see own costs" on costs for all using (auth.uid() = user_id);
