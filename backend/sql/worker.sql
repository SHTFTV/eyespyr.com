begin;
create table eyespyr_private.operators(user_id uuid primary key references auth.users(id),revoked_at timestamptz);
alter table eyespyr_private.operators enable row level security;
alter table eyespyr_private.operators force row level security;
revoke all on eyespyr_private.operators from public,anon,authenticated;
grant all on eyespyr_private.operators to service_role;
create table eyespyr_private.approved_criteria(revision text primary key,source_ref text not null,approved_at timestamptz not null,revoked_at timestamptz);
create table eyespyr_private.jobs(
 id uuid primary key default gen_random_uuid(),event_key text unique not null,kind text not null check(kind in ('health','scan','orphan_cleanup')),
 payload jsonb not null default '{}',state text not null default 'pending' check(state in ('pending','running','completed','blocked')),
 attempts integer not null default 0,max_attempts integer not null default 5 check(max_attempts between 1 and 10),
 available_at timestamptz not null default now(),lease_until timestamptz,lease_token uuid,last_error text,
 sot_hash text,created_at timestamptz not null default now(),completed_at timestamptz
);
create index due_jobs on eyespyr_private.jobs(available_at) where state in ('pending','running');
create table eyespyr_private.worker_runs(id uuid primary key,worker_id text not null,sot_hash text not null,started_at timestamptz not null default now(),finished_at timestamptz,state text not null);
create table eyespyr_private.blockers(code text primary key,severity text not null default 'red',first_seen timestamptz not null default now(),last_seen timestamptz not null default now(),next_action text not null,resolved_at timestamptz,alert_attempts integer not null default 0,alert_receipt text);
alter table eyespyr_private.approved_criteria enable row level security;
alter table eyespyr_private.approved_criteria force row level security;
alter table eyespyr_private.jobs enable row level security;
alter table eyespyr_private.jobs force row level security;
alter table eyespyr_private.worker_runs enable row level security;
alter table eyespyr_private.worker_runs force row level security;
alter table eyespyr_private.blockers enable row level security;
alter table eyespyr_private.blockers force row level security;
revoke all on eyespyr_private.approved_criteria,eyespyr_private.jobs,eyespyr_private.worker_runs,eyespyr_private.blockers from public,anon,authenticated;
grant all on eyespyr_private.approved_criteria,eyespyr_private.jobs,eyespyr_private.worker_runs,eyespyr_private.blockers to service_role;
commit;
