-- Fix service_request_updates table constraint to include all update types used in the API
-- This fixes the constraint violation error when adding payment updates

-- Add payment_notes column to service_requests table
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Drop the existing constraint
ALTER TABLE public.service_request_updates 
DROP CONSTRAINT IF EXISTS service_request_updates_update_type_check;

-- Add the updated constraint with all the update types from the API
ALTER TABLE public.service_request_updates 
ADD CONSTRAINT service_request_updates_update_type_check 
CHECK (update_type IN (
  'status_change', 
  'note_added', 
  'assignment', 
  'cost_update', 
  'completion',
  'technician_assigned',
  'parts_added',
  'customer_contacted',
  'payment_received',
  'completion_notice',
  'issue_found',
  'progress_update',
  'general_update'
)); 