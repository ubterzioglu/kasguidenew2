-- Add 'article' and 'interview' to valid item types
-- This extends the unified items system to support articles and interviews

-- Drop old constraint
ALTER TABLE items DROP CONSTRAINT IF EXISTS valid_item_type;

-- Add new constraint with article and interview
ALTER TABLE items ADD CONSTRAINT valid_item_type
  CHECK (item_type IN ('place', 'pet', 'hotel', 'artist', 'article', 'interview'));
