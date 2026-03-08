-- Event admin upgrade: map coords + storage bucket + active view

begin;

alter table public.events
add column if not exists latitude double precision,
add column if not exists longitude double precision;

create index if not exists idx_events_lat_lng
on public.events (latitude, longitude);

create or replace view public.active_events as
select *
from public.events
where end_at >= now()
order by start_at asc;

insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do nothing;

commit;
