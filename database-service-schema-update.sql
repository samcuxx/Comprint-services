-- Update service_request_updates table to include all update types used in the API
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

-- Update the log_service_request_update function to handle payment updates
CREATE OR REPLACE FUNCTION public.log_service_request_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.service_request_updates (
      service_request_id,
      updated_by,
      update_type,
      title,
      description,
      status_from,
      status_to,
      is_customer_visible
    ) VALUES (
      NEW.id,
      NEW.updated_at::text::uuid, -- This should be the user ID from the application
      'status_change',
      'Status changed from ' || COALESCE(OLD.status, 'none') || ' to ' || NEW.status,
      CASE 
        WHEN NEW.status = 'completed' THEN 'Service request has been completed'
        WHEN NEW.status = 'in_progress' THEN 'Work has started on this service request'
        WHEN NEW.status = 'assigned' THEN 'Service request has been assigned to a technician'
        ELSE 'Status updated'
      END,
      OLD.status,
      NEW.status,
      true
    );
  END IF;

  -- Log technician assignment changes
  IF OLD.assigned_technician_id IS DISTINCT FROM NEW.assigned_technician_id THEN
    INSERT INTO public.service_request_updates (
      service_request_id,
      updated_by,
      update_type,
      title,
      description,
      is_customer_visible
    ) VALUES (
      NEW.id,
      NEW.updated_at::text::uuid,
      'technician_assigned',
      CASE 
        WHEN NEW.assigned_technician_id IS NULL THEN 'Technician unassigned'
        WHEN OLD.assigned_technician_id IS NULL THEN 'Technician assigned'
        ELSE 'Technician changed'
      END,
      'Technician assignment updated',
      true
    );
  END IF;

  -- Log cost changes (including payment updates)
  IF OLD.final_cost IS DISTINCT FROM NEW.final_cost OR 
     OLD.estimated_cost IS DISTINCT FROM NEW.estimated_cost OR
     OLD.payment_status IS DISTINCT FROM NEW.payment_status OR
     OLD.payment_method IS DISTINCT FROM NEW.payment_method THEN
    INSERT INTO public.service_request_updates (
      service_request_id,
      updated_by,
      update_type,
      title,
      description,
      is_customer_visible
    ) VALUES (
      NEW.id,
      NEW.updated_at::text::uuid,
      'cost_update',
      CASE 
        WHEN OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN 
          'Payment status updated to ' || COALESCE(NEW.payment_status, 'pending')
        WHEN OLD.final_cost IS DISTINCT FROM NEW.final_cost THEN 
          'Final cost updated'
        ELSE 'Cost information updated'
      END,
      CASE 
        WHEN OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN 
          'Payment status: ' || COALESCE(NEW.payment_status, 'pending') || 
          CASE WHEN NEW.payment_method IS NOT NULL THEN ' via ' || NEW.payment_method ELSE '' END
        ELSE 'Cost details have been updated'
      END,
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS log_service_request_update_trigger ON public.service_requests;
CREATE TRIGGER log_service_request_update_trigger
  AFTER UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_service_request_update(); 