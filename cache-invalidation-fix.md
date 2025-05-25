# Commission Cache Invalidation Fix

## Problem

After implementing the database trigger for automatic commission creation, users had to manually refresh the commissions page to see new commissions because the React Query cache wasn't being invalidated when sales were created.

## Root Cause

When we moved commission creation from the API to the database trigger, the `useCreateSale` hook was only invalidating the sales cache, but not the commissions cache. This meant:

1. User creates a sale → Commission is created by database trigger
2. User navigates to commissions page → Shows cached (old) data
3. User has to manually refresh to see new commission

## Solution

### 1. Updated Sales Hooks Cache Invalidation

**`hooks/use-sales.ts`**:

- `useCreateSale`: Now invalidates commissions cache when sale is created
- `useDeleteSale`: Now invalidates commissions cache when sale is deleted

```typescript
onSuccess: () => {
  // Invalidate sales cache
  queryClient.invalidateQueries({ queryKey: ["sales"] });

  // Invalidate commissions cache since database trigger creates commission records
  queryClient.invalidateQueries({ queryKey: ["commissions"] });
  queryClient.invalidateQueries({ queryKey: ["commissions-summary"] });
  queryClient.invalidateQueries({ queryKey: ["commission-stats"] });
},
```

### 2. Improved Commission Query Behavior

**`hooks/use-commissions.ts`**:

- Added `staleTime: 0` to always refetch commissions data
- Added `refetchOnWindowFocus: true` for real-time updates
- Added `refetchOnMount: true` to ensure fresh data on page load

```typescript
return useQuery<CommissionWithDetails[], Error>({
  // ... query logic
  staleTime: 0, // Always consider data stale to refetch frequently
  refetchOnWindowFocus: true, // Refetch when user focuses window
  refetchOnMount: true, // Always refetch when component mounts
});
```

### 3. Enhanced Related Queries

Also improved cache behavior for:

- `useCommissionsSummary`: 30-second stale time + window focus refetch
- `useCommissionStats`: 1-minute stale time + window focus refetch

## Result

✅ **Real-time commission updates**: New commissions appear immediately when navigating to commissions page  
✅ **No manual refresh needed**: Cache automatically invalidates and refetches  
✅ **Better UX**: Users see up-to-date data without any manual intervention  
✅ **Performance balanced**: Reasonable stale times prevent excessive API calls

## Testing

1. Create a new sale with commission-eligible products
2. Navigate to commissions page immediately
3. Verify the new commission appears without manual refresh
4. Switch between pages and come back - data should stay fresh

## Files Modified

- `hooks/use-sales.ts` - Added commission cache invalidation to create/delete mutations
- `hooks/use-commissions.ts` - Improved query cache behavior for real-time updates
- `components/commissions/commission-list.tsx` - Removed redundant useEffect (handled by query options)
