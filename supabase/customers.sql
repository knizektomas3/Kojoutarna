create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, name)
);

alter table customers enable row level security;
create policy "Users see own customers" on customers for all using (auth.uid() = user_id);

-- Naplnit stávající zákazníky z příjmů
insert into customers (user_id, name)
select distinct user_id, customer_name
from incomes
where customer_name is not null
on conflict (user_id, name) do nothing;
