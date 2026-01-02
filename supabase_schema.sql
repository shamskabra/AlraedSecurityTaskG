-- Create the profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  role text check (role in ('admin', 'user')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  assigned_to text, -- Could be a uuid referencing profiles, keeping simple for now
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Policies for tasks
create policy "Tasks are viewable by everyone." on public.tasks
  for select using (true);

create policy "Authenticated users can create tasks." on public.tasks
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update any task." on public.tasks
  for update using (auth.role() = 'authenticated'); -- Simplified for demo

create policy "Users can delete any task." on public.tasks
  for delete using (auth.role() = 'authenticated'); -- Simplified for demo

-- Create activity_logs table
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  details text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activity_logs enable row level security;

create policy "Activity logs viewable by everyone" on public.activity_logs
  for select using (true);

create policy "Authenticated users can insert logs" on public.activity_logs
  for insert with check (auth.role() = 'authenticated');

-- Function to handle new user signup (auto-create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (new.id, new.raw_user_meta_data->>'username', coalesce(new.raw_user_meta_data->>'role', 'user'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
