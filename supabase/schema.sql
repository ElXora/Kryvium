-- Run this in the Supabase SQL editor after creating your project.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  custom_instructions text default '',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Chats
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default 'New chat',
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.chats enable row level security;

create policy "Users manage own chats"
  on public.chats for all using (auth.uid() = user_id);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null default '',
  model text,
  thinking text,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users manage messages in own chats"
  on public.messages for all using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Generated images
create table if not exists public.generated_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt text not null,
  image_url text not null,
  created_at timestamptz default now()
);

alter table public.generated_images enable row level security;

create policy "Users manage own images"
  on public.generated_images for all using (auth.uid() = user_id);

-- Keep chats.updated_at fresh when a message is added
create or replace function public.touch_chat_updated_at()
returns trigger as $$
begin
  update public.chats set updated_at = now() where id = new.chat_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_message_inserted on public.messages;
create trigger on_message_inserted
  after insert on public.messages
  for each row execute procedure public.touch_chat_updated_at();

-- If you already ran an earlier version of this schema (before the
-- Kryvium Instructions / settings feature), run this once to add the
-- missing column safely:
alter table public.profiles add column if not exists custom_instructions text default '';
