# Migration Guide - Comments Schema Update

## Issue
The admin pages are showing blank because existing comments in the database don't have the new `targetId` and `targetType` fields that were added for blog post comments support.

## Solution
We've made these fields optional in the schema for backward compatibility, but you need to run a one-time migration to populate these fields for existing comments.

## Steps to Fix

### Option 1: Run Migration via Convex Dashboard (Recommended)

1. **Deploy the updated schema**
   ```bash
   npx convex deploy
   ```

2. **Open Convex Dashboard**
   - Go to https://dashboard.convex.dev
   - Select your project

3. **Run the migration function**
   - Go to "Functions" tab
   - Find `runMigration:migrateExistingComments`
   - Click "Run" with empty arguments `{}`
   - You should see a success message with the count of migrated comments

### Option 2: Run Migration via CLI

1. **Deploy the updated schema**
   ```bash
   npx convex deploy
   ```

2. **Run the migration**
   ```bash
   npx convex run runMigration:migrateExistingComments
   ```

### Option 3: Manual Database Update (If needed)

If the above options don't work, you can manually update the comments:

1. Go to Convex Dashboard → Data → comments table
2. For each comment that's missing `targetId` and `targetType`:
   - Click "Edit"
   - Add `targetId`: Copy the value from `itemId`
   - Add `targetType`: Set to `"item"`
   - Save

## What the Migration Does

The migration script:
1. Finds all comments that have `itemId` but no `targetId`
2. Copies `itemId` to `targetId`
3. Sets `targetType` to `"item"`
4. Returns a count of migrated comments

## Verification

After running the migration:

1. **Check the migration result**
   - You should see a message like: "Successfully migrated X out of Y comments"

2. **Verify admin pages load**
   - Navigate to `/dashboard`
   - Check that the page loads without errors
   - Verify all stats are showing correctly

3. **Check comments still work**
   - Go to any item with comments
   - Verify comments display correctly
   - Try adding a new comment

## Why This Happened

We updated the comments schema to support comments on both:
- **Items** (movies/videos) - existing functionality
- **Pages** (blog posts) - new functionality

The new schema uses:
- `targetId`: Can be either an item ID or page ID
- `targetType`: Either "item" or "page"

Old comments only had `itemId`, so we need to migrate them to the new structure.

## Schema Changes Made

**Before:**
```typescript
comments: defineTable({
  itemId: v.id("items"),
  // ... other fields
})
```

**After:**
```typescript
comments: defineTable({
  itemId: v.optional(v.id("items")), // Kept for backward compatibility
  targetId: v.optional(v.union(v.id("items"), v.id("pages"))), // New field
  targetType: v.optional(v.union(v.literal("item"), v.literal("page"))), // New field
  // ... other fields
})
```

## Troubleshooting

### "Schema validation failed" error persists
- Make sure you've deployed the updated schema: `npx convex deploy`
- Wait a few seconds for the schema to update
- Refresh your browser

### Migration function not found
- Ensure `convex/runMigration.ts` exists
- Run `npx convex deploy` to deploy the function
- Check the Convex dashboard Functions tab

### Admin pages still blank after migration
- Check browser console for errors (F12)
- Clear browser cache and reload
- Check Convex dashboard logs for errors

### "Only admins can run migrations" error
- Make sure you're logged in as an admin user
- Check your user's role in the `userProfiles` table
- Your `role` field should be `"admin"`

## Prevention

For future schema changes that affect existing data:
1. Always make new required fields optional initially
2. Create a migration script
3. Run the migration
4. Optionally make fields required after migration

## Support

If you continue to have issues:
1. Check the Convex dashboard logs
2. Verify your schema deployed successfully
3. Check that the migration completed successfully
4. Look for any error messages in the browser console

---

**After completing the migration, your admin pages should load normally and all features should work as expected!**
