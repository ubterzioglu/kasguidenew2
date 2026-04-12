alter table places
  drop constraint if exists places_intake_channel_check;

alter table places
  add constraint places_intake_channel_check
  check (intake_channel in ('sweep', 'manual', 'import', 'migrated', 'user_submission'));
