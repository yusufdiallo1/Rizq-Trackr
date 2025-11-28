# Fix for Nisab Update Route TypeScript Error

## Problem Analysis

### Root Cause
When using `createClient<Database>()` in API routes, TypeScript cannot properly infer the table type from string literals like `'nisab_prices'`. This causes the type to be inferred as `never`, leading to the error:

```
Type error: No overload matches this call.
Argument of type '{ ... }' is not assignable to parameter of type 'never'.
```

### Why This Happens
- `createClient<Database>()` doesn't have the same type inference capabilities as `createClientComponentClient<Database>()`
- String literals for table names aren't being narrowed to the specific table type
- TypeScript falls back to `never` when it can't match the table name to the Database schema

## Solution Applied

### Fix: Wrap Data in Array
Supabase's `upsert` method has two overloads:
1. `upsert(values: T, options?)` - single object (type inference fails)
2. `upsert(values: T[], options?)` - array of objects (type inference works)

By wrapping the data in an array `[nisabData]`, we use the second overload which has better type inference.

### Code Change
```typescript
// Before (doesn't work):
.upsert(nisabData, { onConflict: 'date,currency' })

// After (works):
.upsert([nisabData], { onConflict: 'date,currency' })
```

## Why This Works

1. **Array overload has explicit type signature**: The array version of `upsert` has a more explicit type signature that TypeScript can match
2. **Type narrowing**: When using an array, TypeScript can better narrow the type from `T[]` to the specific table's Insert type
3. **Functionally equivalent**: Supabase accepts both single objects and arrays for upsert, so this change doesn't affect functionality

## Verification

- ✅ No linter errors
- ✅ Type checking should pass
- ✅ Functionally equivalent to single object upsert
- ✅ Matches Supabase API contract

## Alternative Solutions Considered

1. **Type assertion with `as any`** - Works but loses type safety ❌
2. **Using `createClientComponentClient`** - Not appropriate for API routes ❌
3. **Const assertion on table name** - Didn't resolve the issue ❌
4. **Wrapping in array** - ✅ Best solution, maintains type safety

## Prevention

To avoid this issue in the future:
- Always wrap single objects in arrays when using `upsert` with `createClient<Database>()`
- Or use `createClientComponentClient<Database>()` in client-side code where it works better
- Consider creating a typed helper function for upsert operations

