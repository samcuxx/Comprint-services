-- Service Request System Database Schema
-- Following the patterns from existing products, customers, and sales tables

-- Create service categories table (similar to product_categories)
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  estimated_duration INTEGER DEFAULT 60, -- in minutes
  base_price DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service requests table (main service request entity)
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  service_category_id UUID NOT NULL REFERENCES public.service_categories(id),
  assigned_technician_id UUID REFERENCES public.users(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  
  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  device_type TEXT, -- e.g., 'Desktop', 'Laptop', 'Smartphone', 'Tablet'
  device_brand TEXT,
  device_model TEXT,
  device_serial_number TEXT,
  
  -- Service details
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'waiting_parts', 'completed', 'cancelled', 'on_hold')) DEFAULT 'pending',
  
  -- Dates and timing
  requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_date TIMESTAMP WITH TIME ZONE,
  started_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  
  -- Pricing
  estimated_cost DECIMAL(10, 2),
  final_cost DECIMAL(10, 2),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'partial', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'check', 'other')),
  
  -- Additional info
  customer_notes TEXT,
  technician_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service request updates/logs table (for tracking progress)
CREATE TABLE IF NOT EXISTS public.service_request_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES public.users(id),
  
  -- Update details
  status_from TEXT,
  status_to TEXT,
  update_type TEXT CHECK (update_type IN ('status_change', 'note_added', 'assignment', 'cost_update', 'completion')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Visibility
  is_customer_visible BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service parts used table (for tracking parts used in repairs)
CREATE TABLE IF NOT EXISTS public.service_parts_used (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  added_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service request attachments table (for photos, documents)
CREATE TABLE IF NOT EXISTS public.service_request_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  
  -- File details
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'image', 'document', 'other'
  file_size INTEGER, -- in bytes
  
  -- Metadata
  description TEXT,
  is_customer_visible BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON public.service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_technician_id ON public.service_requests(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON public.service_requests(priority);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_by ON public.service_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_category_id ON public.service_requests(service_category_id);
CREATE INDEX IF NOT EXISTS idx_service_request_updates_service_request_id ON public.service_request_updates(service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_parts_used_service_request_id ON public.service_parts_used(service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_request_attachments_service_request_id ON public.service_request_attachments(service_request_id);

-- Enable Row Level Security
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_parts_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_categories
-- Admin can manage all service categories
CREATE POLICY "Admin can manage service categories" ON public.service_categories
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- All authenticated users can view active service categories
CREATE POLICY "Users can view active service categories" ON public.service_categories
  FOR SELECT USING (
    is_active = TRUE AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sales', 'technician'))
  );

-- RLS Policies for service_requests
-- Admin can manage all service requests
CREATE POLICY "Admin can manage all service requests" ON public.service_requests
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Sales can create and view all service requests
CREATE POLICY "Sales can create service requests" ON public.service_requests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('sales', 'admin'))
  );

CREATE POLICY "Sales can view all service requests" ON public.service_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('sales', 'admin'))
  );

CREATE POLICY "Sales can update service requests" ON public.service_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('sales', 'admin'))
  );

-- Technicians can view and update assigned service requests
CREATE POLICY "Technicians can view assigned requests" ON public.service_requests
  FOR SELECT USING (
    assigned_technician_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Technicians can update assigned requests" ON public.service_requests
  FOR UPDATE USING (
    assigned_technician_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for service_request_updates
-- Admin can manage all updates
CREATE POLICY "Admin can manage all service updates" ON public.service_request_updates
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Users can view updates for requests they have access to
CREATE POLICY "Users can view relevant service updates" ON public.service_request_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_requests sr 
      WHERE sr.id = service_request_id 
      AND (
        sr.assigned_technician_id = auth.uid() OR
        sr.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sales'))
      )
    )
  );

-- Users can create updates for requests they have access to
CREATE POLICY "Users can create service updates" ON public.service_request_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_requests sr 
      WHERE sr.id = service_request_id 
      AND (
        sr.assigned_technician_id = auth.uid() OR
        sr.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sales'))
      )
    )
  );

-- RLS Policies for service_parts_used
-- Admin can manage all service parts
CREATE POLICY "Admin can manage all service parts" ON public.service_parts_used
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Users can view parts for requests they have access to
CREATE POLICY "Users can view relevant service parts" ON public.service_parts_used
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_requests sr 
      WHERE sr.id = service_request_id 
      AND (
        sr.assigned_technician_id = auth.uid() OR
        sr.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sales'))
      )
    )
  );

-- Technicians and sales can add parts to requests they have access to
CREATE POLICY "Users can add service parts" ON public.service_parts_used
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_requests sr 
      WHERE sr.id = service_request_id 
      AND (
        sr.assigned_technician_id = auth.uid() OR
        sr.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sales'))
      )
    )
  );

-- RLS Policies for service_request_attachments
-- Admin can manage all attachments
CREATE POLICY "Admin can manage all service attachments" ON public.service_request_attachments
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Users can view attachments for requests they have access to
CREATE POLICY "Users can view relevant service attachments" ON public.service_request_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_requests sr 
      WHERE sr.id = service_request_id 
      AND (
        sr.assigned_technician_id = auth.uid() OR
        sr.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sales'))
      )
    )
  );

-- Users can add attachments to requests they have access to
CREATE POLICY "Users can add service attachments" ON public.service_request_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_requests sr 
      WHERE sr.id = service_request_id 
      AND (
        sr.assigned_technician_id = auth.uid() OR
        sr.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sales'))
      )
    )
  );

-- Create functions for service request management

-- Function to generate unique service request number
CREATE OR REPLACE FUNCTION public.generate_service_request_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get the current date in YYYYMMDD format
  new_number := 'SR' || TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get the count of requests created today
  SELECT COUNT(*) + 1 INTO counter
  FROM public.service_requests
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Append the counter with leading zeros
  new_number := new_number || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-generate request number on insert
CREATE OR REPLACE FUNCTION public.set_service_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := public.generate_service_request_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update service request timestamps
CREATE OR REPLACE FUNCTION public.update_service_request_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at := NOW();
  
  -- Set assigned_date when technician is assigned
  IF OLD.assigned_technician_id IS NULL AND NEW.assigned_technician_id IS NOT NULL THEN
    NEW.assigned_date := NOW();
    NEW.status := 'assigned';
  END IF;
  
  -- Set started_date when status changes to in_progress
  IF OLD.status != 'in_progress' AND NEW.status = 'in_progress' THEN
    NEW.started_date := NOW();
  END IF;
  
  -- Set completed_date when status changes to completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    NEW.completed_date := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create service request update log
CREATE OR REPLACE FUNCTION public.log_service_request_update()
RETURNS TRIGGER AS $$
DECLARE
  update_title TEXT;
  update_description TEXT;
  update_type TEXT := 'status_change';
BEGIN
  -- Determine the type of update and create appropriate log entry
  IF TG_OP = 'INSERT' THEN
    update_title := 'Service request created';
    update_description := 'New service request has been created';
    update_type := 'status_change';
    
    INSERT INTO public.service_request_updates (
      service_request_id,
      updated_by,
      status_from,
      status_to,
      update_type,
      title,
      description,
      is_customer_visible
    ) VALUES (
      NEW.id,
      NEW.created_by,
      NULL,
      NEW.status,
      update_type,
      update_title,
      update_description,
      TRUE
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status != NEW.status THEN
      update_title := 'Status updated';
      update_description := 'Service request status changed from ' || OLD.status || ' to ' || NEW.status;
      
      INSERT INTO public.service_request_updates (
        service_request_id,
        updated_by,
        status_from,
        status_to,
        update_type,
        title,
        description,
        is_customer_visible
      ) VALUES (
        NEW.id,
        auth.uid(),
        OLD.status,
        NEW.status,
        'status_change',
        update_title,
        update_description,
        TRUE
      );
    END IF;
    
    -- Log technician assignment
    IF OLD.assigned_technician_id IS DISTINCT FROM NEW.assigned_technician_id THEN
      IF NEW.assigned_technician_id IS NOT NULL THEN
        update_title := 'Technician assigned';
        update_description := 'Service request has been assigned to a technician';
      ELSE
        update_title := 'Technician unassigned';
        update_description := 'Technician has been removed from this service request';
      END IF;
      
      INSERT INTO public.service_request_updates (
        service_request_id,
        updated_by,
        status_from,
        status_to,
        update_type,
        title,
        description,
        is_customer_visible
      ) VALUES (
        NEW.id,
        auth.uid(),
        OLD.status,
        NEW.status,
        'assignment',
        update_title,
        update_description,
        TRUE
      );
    END IF;
    
    -- Log cost updates
    IF OLD.final_cost IS DISTINCT FROM NEW.final_cost AND NEW.final_cost IS NOT NULL THEN
      update_title := 'Cost updated';
      update_description := 'Service cost has been updated to $' || NEW.final_cost;
      
      INSERT INTO public.service_request_updates (
        service_request_id,
        updated_by,
        status_from,
        status_to,
        update_type,
        title,
        description,
        is_customer_visible
      ) VALUES (
        NEW.id,
        auth.uid(),
        OLD.status,
        NEW.status,
        'cost_update',
        update_title,
        update_description,
        TRUE
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update inventory when parts are used
CREATE OR REPLACE FUNCTION public.update_inventory_after_service_part_use()
RETURNS TRIGGER AS $$
BEGIN
  -- Reduce inventory quantity for used parts
  UPDATE public.inventory
  SET quantity = quantity - NEW.quantity,
      updated_at = NOW()
  WHERE product_id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
-- Trigger to auto-generate request number
CREATE TRIGGER set_service_request_number_trigger
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_service_request_number();

-- Trigger to update timestamps
CREATE TRIGGER update_service_request_timestamps_trigger
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_service_request_timestamps();

-- Trigger to log service request updates
CREATE TRIGGER log_service_request_update_trigger
  AFTER INSERT OR UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_service_request_update();

-- Trigger to update inventory when parts are used
CREATE TRIGGER update_inventory_on_service_part_use
  AFTER INSERT ON public.service_parts_used
  FOR EACH ROW EXECUTE FUNCTION public.update_inventory_after_service_part_use();

-- Insert default service categories
INSERT INTO public.service_categories (name, description, estimated_duration, base_price) VALUES
('Computer Repair', 'General computer hardware and software repair', 120, 75.00),
('Laptop Repair', 'Laptop-specific repair services including screen, keyboard, battery', 90, 85.00),
('Data Recovery', 'Data recovery from damaged or corrupted storage devices', 240, 150.00),
('Virus Removal', 'Malware and virus removal, system cleanup', 60, 50.00),
('Hardware Installation', 'Installation of new hardware components', 45, 40.00),
('Software Installation', 'Operating system and software installation and setup', 60, 45.00),
('Network Setup', 'Network configuration and troubleshooting', 90, 80.00),
('Mobile Device Repair', 'Smartphone and tablet repair services', 60, 70.00),
('System Optimization', 'Performance tuning and system optimization', 75, 60.00),
('Consultation', 'Technical consultation and advice', 30, 25.00)
ON CONFLICT (name) DO NOTHING;

-- Create storage bucket policy for service attachments
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('service-attachments', 'service-attachments', false, false)
ON CONFLICT (id) DO NOTHING;

-- Set RLS policies for service attachments bucket
CREATE POLICY "Authenticated users can upload service attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-attachments' AND
  (storage.foldername(name))[1] = 'service-requests'
);

CREATE POLICY "Users can view service attachments they have access to"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'service-attachments' AND
  (storage.foldername(name))[1] = 'service-requests'
);

CREATE POLICY "Users can update their own service attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-attachments' AND
  (storage.foldername(name))[1] = 'service-requests'
);

CREATE POLICY "Users can delete their own service attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-attachments' AND
  (storage.foldername(name))[1] = 'service-requests'
); 