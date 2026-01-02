-- Add status column to profiles
alter table public.profiles add column if not exists status text check (status in ('pending', 'active', 'blocked')) default 'pending';

-- Update trigger function to handle status
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role, status)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    'pending' -- Default to pending for new signups
  );
  return new;
end;
$$ language plpgsql security definer;

-- Set existing admins to active
update public.profiles set status = 'active' where role = 'admin';
