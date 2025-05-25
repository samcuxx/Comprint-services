# Testing Commission Fix

## Quick Test Steps

### 1. Apply Database Fix First

Execute the SQL in `lib/database-fixes.sql` in your Supabase SQL editor.

### 2. Test Commission Creation

1. **Go to Sales → Create New Sale**
2. **Add products with commission rates** (e.g., products with 5%, 10% commission)
3. **Complete the sale**
4. **Check Commissions page** - you should see a new commission record with the correct amount

### 3. Test Commission Calculation

For a sale with:

- Product A: Price $100, Quantity 2, Commission 5% = $10 commission
- Product B: Price $50, Quantity 1, Commission 10% = $5 commission
- **Total Expected Commission: $15**

### 4. Verify Existing Zero Commissions Are Fixed

1. **Go to Commissions page**
2. **Check that previously zero-amount commissions now show correct amounts**
3. **Verify no "Fix Commission" buttons are visible**

### 5. Test Commission Updates (Advanced)

If you need to test commission updates:

1. **Create a sale through API** (or database)
2. **Manually add/remove sale items** in database
3. **Verify commission amount updates automatically**

## Expected Results

✅ New sales automatically create commission records  
✅ Commission amounts are calculated correctly  
✅ Zero-amount commissions are fixed  
✅ No fix buttons in UI  
✅ Commission updates when items change

## If Issues Persist

1. **Check Supabase logs** for any trigger errors
2. **Verify the trigger was created** by running:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'handle_commission_on_sale_item_change';
   ```
3. **Test the calculation manually**:
   ```sql
   SELECT
     sale_id,
     SUM(quantity * unit_price * commission_rate / 100) as calculated_commission
   FROM sale_items
   WHERE sale_id = 'your-sale-id'
   GROUP BY sale_id;
   ```
