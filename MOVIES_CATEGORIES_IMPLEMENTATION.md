# Movies & Categories Implementation Guide

## Overview

This implementation adds a comprehensive movies management system with many-to-many relationships between movies and categories. Movies can now appear in multiple categories, and removing a movie from a category doesn't delete the movie itself.

## Key Features

### 1. Movies Management Page (`/admin/movies`)
- View all movies in a centralized table
- Add new movies without category assignment
- Edit existing movies
- Delete movies (removes from all categories)
- See which categories each movie belongs to
- Add movies to multiple categories
- Remove movies from specific categories
- Test tools for data population

### 2. Enhanced Categories Page (`/admin/categories`)
- Create and manage categories (existing feature)
- Drag & drop category ordering (existing feature)
- **NEW**: Import existing movies into categories
- **NEW**: Remove movies from categories (without deleting)
- **NEW**: Create new movies directly in category
- View all movies in each category

### 3. Database Changes

#### New Junction Table: `categoryItems`
```typescript
{
  categoryId: Id<"categories">,
  itemId: Id<"items">,
  order: number,           // Order within the category
  addedAt: number,         // Timestamp
  addedBy: Id<"users">     // Who added it
}
```

#### Updated `items` Table
- `categoryId` field is now **optional** (backward compatible)
- Movies can exist without being in any category (orphaned)
- Movies are linked to categories via the `categoryItems` junction table

## Implementation Details

### Backend Changes

#### 1. Schema Updates (`convex/schema.ts`)
- Made `categoryId` optional in items table
- Added `categoryItems` junction table with indexes

#### 2. New Mutations (`convex/items.ts`)
- `addItemToCategory`: Link a movie to a category
- `removeItemFromCategory`: Unlink a movie from a category
- `getCategoriesForItem`: Get all categories for a specific movie

#### 3. Updated Queries (`convex/items.ts`)
- `getItemsByCategory`: Now uses junction table
- `getAllItems`: Returns movies with their categories
- `getAllItemsWithCategories`: Updated for homepage (uses junction table)
- `createItem`: No longer requires categoryId

#### 4. Migration Script (`convex/migrateCategoryItems.ts`)
- Populates junction table from existing data
- Safe to run multiple times
- Preserves all existing relationships

### Frontend Changes

#### 1. New Components

**MoviesManagement** (`src/MoviesManagement.tsx`)
- Main movies management interface
- Table view of all movies
- Category badges with remove buttons
- Add to categories modal
- Test tools section

**MovieWizard** (`src/MovieWizard.tsx`)
- Create/edit movie form
- No category selection (movies are orphaned by default)
- Full movie details editing

**MigrationRunner** (`src/MigrationRunner.tsx`)
- One-time migration interface
- Run at `/admin/migration`
- Migrates existing data to new system

#### 2. Updated Components

**CategoryManagement** (`src/CategoryManagement.tsx`)
- Added "Import Movies" button for each category
- Added "Remove from category" button for items
- Removed test tools (moved to Movies page)
- Import movies modal with multi-select

**Sidebar** (`src/Sidebar.tsx`)
- Added "Movies" navigation item
- Shows total movie count

**App** (`src/App.tsx`)
- Added routes for movies management
- Added route for migration runner

## Migration Steps

### Step 1: Run the Migration
1. Navigate to `/admin/migration`
2. Click "Run Migration"
3. Confirm the migration
4. Wait for completion message

### Step 2: Verify Data
1. Go to `/admin/movies` - all movies should be listed
2. Go to `/admin/categories` - all categories should show their movies
3. Check homepage - all sections should display correctly

### Step 3: Start Using New Features
- Add movies from Movies page
- Import movies into categories from Categories page
- Movies can now be in multiple categories

## Usage Guide

### Creating a New Movie

**Option 1: From Movies Page**
1. Go to `/admin/movies`
2. Click "Add Movie"
3. Fill in movie details
4. Click "Create Movie"
5. Movie is created (orphaned - not in any category)
6. Use "Add to Categories" button to assign categories

**Option 2: From Categories Page**
1. Go to `/admin/categories`
2. Find the category
3. Click the "+" button (Add New Item)
4. Fill in movie details
5. Movie is created AND added to that category

### Importing Movies to Categories

1. Go to `/admin/categories`
2. Find the category
3. Click the "Import Movies" button (download icon)
4. Select movies from the list
5. Click "Import Movies"
6. Movies are added to the category

### Managing Movie Categories

**From Movies Page:**
1. Find the movie in the table
2. See category badges in the "Categories" column
3. Click "×" on a badge to remove from that category
4. Click the category icon to add to more categories

**From Categories Page:**
1. Expand a category to see its movies
2. Click "×" button on a movie to remove from category
3. Movie is removed from category but NOT deleted

### Deleting Movies

**Permanent Deletion:**
- From Movies page: Click trash icon
- Movie is deleted from database AND all categories

**Remove from Category:**
- From Categories page: Click "×" on movie card
- From Movies page: Click "×" on category badge
- Movie stays in database, just removed from that category

## API Reference

### Queries

```typescript
// Get all movies with their categories
api.items.getAllItems()

// Get movies in a specific category
api.items.getItemsByCategory({ categoryId })

// Get categories for a specific movie
api.items.getCategoriesForItem({ itemId })

// Get all items with categories (for homepage)
api.items.getAllItemsWithCategories()
```

### Mutations

```typescript
// Create a movie (no category required)
api.items.createItem({
  title, imageId, genres, description, ...
})

// Add movie to category
api.items.addItemToCategory({
  itemId, categoryId
})

// Remove movie from category
api.items.removeItemFromCategory({
  itemId, categoryId
})

// Delete movie permanently
api.items.deleteItem({ itemId })
```

## Backward Compatibility

The implementation is fully backward compatible:

1. **Old items with `categoryId`**: Still work, migration creates junction table entries
2. **Old queries**: Updated to use junction table transparently
3. **Homepage**: Works exactly the same, just uses new data structure
4. **Existing workflows**: All existing admin workflows continue to work

## Test Tools

Located on the Movies page (`/admin/movies`):

- **Populate New Categories**: Creates sample data for Trending, Top Rated, New Releases
- **Delete Populated Items**: Removes sample data
- **Duplicate to 100 Items**: Creates test data for pagination
- **Delete Duplicates**: Removes duplicated test data

## Troubleshooting

### Movies not showing on homepage
- Check if movies are assigned to categories
- Run migration if upgrading from old system
- Verify category order is correct

### Can't add movie to category
- Check if movie already in that category
- Verify you have admin permissions
- Check browser console for errors

### Migration fails
- Ensure you're logged in as admin
- Check if migration already ran (safe to run multiple times)
- Check Convex dashboard for errors

## Future Enhancements

Potential improvements:
- Bulk category assignment
- Category templates
- Movie duplication across categories
- Advanced filtering on Movies page
- Category-specific movie ordering
- Movie scheduling (show in category from/to dates)

## Technical Notes

### Performance Considerations
- Junction table adds one join operation
- Indexes on `categoryId` and `itemId` ensure fast queries
- Homepage query optimized with proper ordering

### Data Integrity
- Deleting a category removes all its `categoryItems` entries
- Deleting a movie removes all its `categoryItems` entries
- Orphaned movies (no categories) are allowed and manageable

### Security
- All mutations require authentication
- Admin role required for all management operations
- User ID tracked for audit trail

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check Convex dashboard for backend errors
4. Check browser console for frontend errors
