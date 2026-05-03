-- 1) Reassign places with 'etkinlik' category to 'aktivite'
update public.places
set category_primary = 'aktivite',
    category_ids = array_replace(category_ids, 'etkinlik', 'aktivite')
where category_primary = 'etkinlik'
   or 'etkinlik' = any(category_ids);

-- 2) Delete 'etkinlik' row from categories reference table
delete from public.categories where slug = 'etkinlik';

-- 3) Remove tone_type column from place_content (always 'guide', no longer used)
alter table public.place_content
drop column if exists tone_type;
