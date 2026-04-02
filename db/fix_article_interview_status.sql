-- Fix status for articles and interviews
-- getAllItems() default status is 'approved', but we inserted with 'active'

UPDATE items
SET status = 'approved'
WHERE item_type IN ('article', 'interview');
