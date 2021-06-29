const { log } = require('../logging')

module.exports.install = async ({ client }) => {
  const start = Date.now()
  await client.query(`
      create table if not exists public.pg_journal_events
      (
          global_index bigserial,
          sequence_number bigint not null,
          stream_id  varchar(255) not null,
          event_type varchar(255) not null,
          event_payload jsonb not null,
          timestamp timestamptz not null default now(),
          primary key (stream_id, sequence_number)
      );
      create index journal_global_idx on public.pg_journal_events using brin(global_index);

      create table if not exists public.pg_journal_snapshots
      (
          stream_id  varchar(255)   not null,
          sequence_number bigint not null,
          state        jsonb  not null,
          timestamp timestamptz not null default now(),
          primary key (stream_id, sequence_number)
      );

      create table if not exists public.pg_journal_system_projections
      (
          checkpoint      bigint not null,
          name    varchar(255) not null unique
      );

      create table if not exists public.pg_journal_persistent_subscriptions
      (
          checkpoint      bigint not null,
          stream_id    varchar(255) not null,
          consumer_group_name varchar(255) not null
      );
`)

  log.debug(`Installed +${Date.now() - start}ms`)
}
