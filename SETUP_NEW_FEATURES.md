# Setup Guide: New Homepage Features

## What Was Done

The code has been successfully implemented with:
1. ✅ Schema updated with new fields and category types
2. ✅ Frontend updated with new render functions
3. ✅ Seed mutations created
4. ✅ CategoryManagement updated with new options

## Why You Don't See the New Categories Yet

The new categories (Trending, Top Rated, New Releases) **don't exist in your database yet**. You need to run the seed mutation to create them and populate them with data.

## Step-by-Step Setup Instructions

### Step 1: Go to Admin Categories Page
1. Navigate to `/admin/categories` in your browser
2. You should see a purple button that says **"🚀 Populate New Categories"**

### Step 2: Click the Button
1. Click the **"🚀 Populate New Categories"** button
2. Confirm the action when prompted
3. Wait for the success message

### Step 3: What This Does
The mutation will:
- ✅ Update all existing movies with new fields (ratingCount, reviewCount, viewCount, etc.)
- ✅ Create items for the **Trending** category (top 10 by popularity)
- ✅ Create items for the **Top Rated** category (movies with rating >= 8.5)
- ✅ Create items for the **New Releases** category (recently added movies)

### Step 4: Verify
1. Refresh the categories page - you should now see 6 categories instead of 3
2. Go to the homepage (`/`) - you should see the new sections with badges
3. Check the "full" section - you should see the new "Sort By" dropdown

## New Category Types Available

When creating a new category, you now have 6 options:

1. **Featured** - Hero carousel (large cards at top)
2. **Trending** - Carousel with pink "TRENDING" badges
3. **Top Rated** - Carousel for high-rated movies
4. **New Releases** - Carousel with green "NEW" badges
5. **Full** - Grid layout with filters and sorting
6. **Short** - Horizontal carousel

## New Features You'll See

### 1. Trending Section
- Pink "TRENDING" badge on movie cards
- Shows view count and rating count below title
- Displays most popular movies

### 2. Top Rated Section
- Shows movies with rating 8.5 or higher
- Displays rating count and review count
- Standard carousel layout

### 3. New Releases Section
- Green "NEW" badge on recently added movies
- Shows movies added in last 30 days
- Displays stats below title

### 4. Sort By Dropdown
- Available in "full" section
- 8 sorting options:
  - Default
  - Rating (High to Low)
  - Rating (Low to High)
  - Release Date (Newest)
  - Release Date (Oldest)
  - Popularity
  - Title (A-Z)
  - Title (Z-A)

### 5. Quick Stats on All Cards
- ⭐ Rating count (e.g., "2.3K")
- 💬 Review count (e.g., "142")
- Appears on all movie cards in all sections

## Troubleshooting

### "I clicked the button but nothing happened"
- Check the browser console for errors
- Make sure you have existing movies in your database
- Try refreshing the page

### "I don't see the new categories on homepage"
- Make sure the mutation completed successfully
- Check that the categories were created in `/admin/categories`
- Verify the categories have items assigned to them

### "The categories page shows 'Test for seeding 100 items'"
- This is the old test button - ignore it
- Use the new purple **"🚀 Populate New Categories"** button instead

### "Creating a category still shows only 3 options"
- Clear your browser cache
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Make sure `npx convex dev` is running

## Expected Category Order After Setup

1. **NEW OF THIS SEASON** (featured)
2. **TRENDING NOW** (trending) ⭐ NEW
3. **TOP RATED MOVIES** (topRated) ⭐ NEW
4. **NEW RELEASES** (newReleases) ⭐ NEW
5. **MOVIES FOR YOU** (full)
6. **Expected premiere** (short)

## Need Help?

If you're still not seeing the new features:
1. Check that `npx convex dev` is running
2. Check the browser console for errors
3. Verify the schema was updated (check convex dashboard)
4. Try running the mutation from Convex dashboard directly:
   - Go to Convex dashboard
   - Navigate to Functions
   - Find `seed:populateNewCategories`
   - Click "Run" button

## Summary

The implementation is complete! You just need to:
1. ✅ Click the **"🚀 Populate New Categories"** button in `/admin/categories`
2. ✅ Wait for success message
3. ✅ Refresh and enjoy your new homepage features!
