# Commission Calculation Fix

This document outlines the fix for the commission calculation issue where commission amounts were showing as 0 and commission records weren't being created.

## Problem

1. The original database trigger was calculating commissions when a sale record was created, but at that point, no sale items existed yet, resulting in all commissions being calculated as 0.
2. After removing the trigger, commission records weren't being created automatically when sales were made.

## Solution

1. **Removed problematic database trigger** that calculated commission on sale creation
2. **Created new comprehensive trigger** that automatically creates AND updates commission records when sale items are added/modified/deleted
3. **Simplified API logic** by removing manual commission creation (now handled by database trigger)
4. **Removed manual fix functionality** from the UI since it's no longer needed

## Database Changes Required

Execute the SQL script in `lib/database-fixes.sql` in your Supabase SQL editor:

```sql
-- Fix commission calculation in database
-- Remove the incorrect trigger that calculates commission when sale is created
DROP TRIGGER IF EXISTS calculate_sale_commission ON public.sales;

-- Drop the old function
DROP FUNCTION IF EXISTS public.calculate_commission();

-- Drop the existing update trigger to replace it with a better one
DROP TRIGGER IF EXISTS update_commission_on_sale_item_change ON public.sale_items;
DROP FUNCTION IF EXISTS public.update_commission_on_item_change();

-- Create a comprehensive function that handles commission creation and updates
CREATE OR REPLACE FUNCTION public.handle_commission_on_item_change()
RETURNS TRIGGER AS $$
DECLARE
  total_commission DECIMAL(10, 2) := 0.00;
  sale_id_to_update UUID;
  sale_sales_person_id UUID;
  existing_commission_id UUID;
BEGIN
  -- Determine which sale to update
  IF TG_OP = 'DELETE' THEN
    sale_id_to_update := OLD.sale_id;
  ELSE
    sale_id_to_update := NEW.sale_id;
  END IF;

  -- Get the sales person ID for this sale
  SELECT sales_person_id INTO sale_sales_person_id
  FROM public.sales
  WHERE id = sale_id_to_update;

  -- Calculate the total commission for all items in this sale
  SELECT COALESCE(SUM(quantity * unit_price * commission_rate / 100), 0)
  INTO total_commission
  FROM public.sale_items
  WHERE sale_id = sale_id_to_update;

  -- Check if a commission record already exists for this sale
  SELECT id INTO existing_commission_id
  FROM public.sales_commissions
  WHERE sale_id = sale_id_to_update;

  IF existing_commission_id IS NOT NULL THEN
    -- Update existing commission record
    UPDATE public.sales_commissions
    SET commission_amount = total_commission,
        updated_at = NOW()
    WHERE id = existing_commission_id;
  ELSE
    -- Create new commission record only if there's a positive commission amount
    IF total_commission > 0 THEN
      INSERT INTO public.sales_commissions (
        sale_id,
        sales_person_id,
        commission_amount,
        is_paid,
        created_at,
        updated_at
      ) VALUES (
        sale_id_to_update,
        sale_sales_person_id,
        total_commission,
        FALSE,
        NOW(),
        NOW()
      );
    END IF;
  END IF;

  -- Return the appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle commission when sale items are modified
-- This both CREATES and UPDATES commission records as needed
CREATE TRIGGER handle_commission_on_sale_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_commission_on_item_change();

-- Fix existing commission records with zero amounts
UPDATE public.sales_commissions
SET commission_amount = (
  SELECT COALESCE(SUM(si.quantity * si.unit_price * si.commission_rate / 100), 0)
  FROM public.sale_items si
  WHERE si.sale_id = public.sales_commissions.sale_id
),
updated_at = NOW()
WHERE commission_amount = 0 OR commission_amount IS NULL;
```

## How It Works Now

1. **Sale Creation**: When a new sale is made through the API, sale items are inserted
2. **Automatic Commission**: The database trigger automatically creates a commission record with the correct calculated amount
3. **Item Changes**: If sale items are modified later (added, updated, or deleted), the trigger automatically recalculates and updates the commission amount
4. **No Manual Intervention**: Everything is fully automated

## Benefits

- ✅ Fully automatic commission creation and calculation
- ✅ Real-time updates when items change
- ✅ No more zero commission amounts
- ✅ No more missing commission records
- ✅ Cleaner UI without fix buttons
- ✅ Consistent commission calculations across the system
- ✅ Database-level reliability (trigger always runs)

## Testing

After applying the fix:

1. Create a new sale with items that have commission rates
2. Verify a commission record is automatically created
3. Verify the commission amount is calculated correctly
4. Check that existing zero-amount commissions are now fixed
5. Test modifying sale items and verify commission updates automatically

## Files Changed

- `components/commissions/commission-list.tsx` - Removed fix commission functionality
- `hooks/use-commissions.ts` - Removed sync commission hooks
- `app/api/commissions/repair/route.ts` - Deleted (no longer needed)
- `app/api/sales/route.ts` - Removed manual commission creation logic
- `lib/database-fixes.sql` - New comprehensive database trigger
