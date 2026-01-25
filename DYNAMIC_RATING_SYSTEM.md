# Dynamic Rating System Implementation

## Overview

This document describes the implementation of a dynamic rating system that combines admin baseline ratings with user-submitted ratings to create a weighted, dynamic rating for each movie item.

## Algorithm: Hybrid with Decay (Option C)

The system uses a hybrid approach that balances admin expertise with user feedback:

```
adminInfluence = max(0.3, 1 / (1 + userRatingCount / 10))
dynamicRating = (adminInfluence × adminRating) + ((1 - adminInfluence) × userAverage)
```

### Key Features:

1. **Admin Baseline**: Admin-provided rating serves as the initial rating
2. **Gradual Transition**: As user reviews accumulate, the rating gradually shifts toward user consensus
3. **Minimum Admin Influence**: Admin rating maintains at least 30% influence even with many reviews
4. **Smooth Decay**: Admin influence decays smoothly based on review count

### Examples:

- **0 reviews**: 100% admin rating (e.g., admin: 8.5 → dynamic: 8.5)
- **5 reviews**: ~67% admin, 33% user (e.g., admin: 8.5, user avg: 7.0 → dynamic: 8.0)
- **10 reviews**: ~50% admin, 50% user (e.g., admin: 8.5, user avg: 7.0 → dynamic: 7.8)
- **50+ reviews**: ~30% admin, 70% user (e.g., admin: 8.5, user avg: 7.0 → dynamic: 7.5)

## Database Schema Changes

### Items Table

Added new fields to the `items` table:

```typescript
{
  rating: v.optional(v.number()),           // Legacy field (kept for backward compatibility)
  adminRating: v.optional(v.number()),      // Admin baseline rating (1-10)
  userRatingAverage: v.optional(v.number()), // Average of all user ratings
  userRatingCount: v.optional(v.number()),   // Total number of user ratings
  dynamicRating: v.optional(v.number()),     // Calculated weighted rating
  lastRatingUpdate: v.optional(v.number()),  // Timestamp of last calculation
}
```

## Backend Implementation

### New Files:

1. **`convex/ratings.ts`**: Core rating calculation logic
   - `calculateDynamicRating()`: Implements the hybrid decay algorithm
   - `updateItemRating()`: Recalculates rating for a specific item
   - `recalculateAllRatings()`: Admin function to recalculate all ratings
   - `getItemRatingBreakdown()`: Returns rating details for display
   - `getRatingAnalytics()`: Provides analytics for admin dashboard

2. **`convex/migrateRatings.ts`**: One-time migration script
   - Migrates existing `rating` field to `adminRating`
   - Calculates initial dynamic ratings from existing reviews

### Modified Files:

1. **`convex/schema.ts`**: Updated items table schema
2. **`convex/reviews.ts`**: Added rating recalculation triggers
   - `addReview`: Triggers rating update after new review
   - `editReview`: Triggers rating update after review edit
   - `deleteReview`: Triggers rating update after review deletion
   - `adminDeleteReview`: Triggers rating update after admin deletion

3. **`convex/items.ts`**: Updated to handle new rating fields
   - `createItem`: Sets `adminRating` when creating items
   - `updateItem`: Updates `adminRating` when editing items

## Frontend Implementation

### Display Updates:

All movie card displays now show the dynamic rating with color coding:

- **Green**: Rating ≥ 8.0
- **Yellow**: Rating ≥ 6.0
- **Red**: Rating < 6.0

Updated files:
- `src/DynamicHomePage.tsx`: Homepage movie cards
- `src/movies.tsx`: Movies page catalog
- `src/ItemDetails.tsx`: Movie detail page + related items
- `src/SearchResults.tsx`: Search results
- `src/Director.tsx`: Director's filmography
- `src/Actor.tsx`: Actor's filmography

### Rating Breakdown Display:

On the movie detail page (`ItemDetails.tsx`), users can see:
- Final dynamic rating
- Admin baseline rating
- Number of user reviews
- User average rating
- Explanation of how the rating is calculated

### New Admin Interface:

**`src/RatingManagement.tsx`**: Admin dashboard for rating management

Features:
- **Recalculate All Ratings**: Button to manually trigger rating recalculation
- **Rating Analytics**:
  - Total items with ratings
  - Items with user reviews
  - Average reviews per item
- **Most Reviewed Items**: Table showing items with most user reviews
- **Biggest Rating Differences**: Shows items where admin and user ratings differ most

Access via: `/admin/ratings`

## Migration Process

### Step 1: Deploy Schema Changes

The new schema fields are optional and backward compatible, so deployment is safe.

### Step 2: Run Migration (Optional)

If you have existing items with ratings, you can run the migration to populate the new fields:

```typescript
// This is handled automatically when reviews are added/edited/deleted
// But you can manually trigger it via the admin interface
```

### Step 3: Recalculate Ratings

Use the admin interface at `/admin/ratings` to recalculate all ratings:

1. Navigate to `/admin/ratings`
2. Click "Recalculate All Ratings"
3. Wait for completion
4. Review analytics

## Usage

### For Admins:

1. **Creating/Editing Movies**: 
   - Set the "Rating" field in the Item Wizard
   - This becomes the admin baseline rating
   - The dynamic rating will be calculated automatically

2. **Monitoring Ratings**:
   - Visit `/admin/ratings` to see analytics
   - Check items with biggest differences between admin and user ratings
   - See which items have the most user engagement

### For Users:

1. **Viewing Ratings**:
   - All movie cards show the dynamic rating
   - On detail pages, see the full breakdown
   - Understand how admin baseline and user reviews combine

2. **Submitting Reviews**:
   - Submit reviews with ratings (1-10)
   - Your rating contributes to the dynamic rating
   - See the impact on the movie's overall rating

## Technical Details

### Rating Calculation Triggers:

Dynamic ratings are automatically recalculated when:
- A new review is added
- A review is edited
- A review is deleted (by user or admin)
- Admin manually triggers recalculation

### Performance Considerations:

- Rating calculations use Convex's scheduler for async processing
- No blocking operations during review submission
- Efficient queries using database indexes

### Data Integrity:

- All rating fields are optional for backward compatibility
- Legacy `rating` field is preserved
- Fallback logic ensures ratings display even if calculation fails

## Future Enhancements

Possible improvements:
1. **Time-based decay**: Give more weight to recent reviews
2. **User reputation**: Weight reviews from verified/trusted users more heavily
3. **Outlier detection**: Identify and handle suspicious rating patterns
4. **Rating trends**: Show how ratings change over time
5. **Personalized ratings**: Adjust ratings based on user preferences

## Troubleshooting

### Ratings not updating:

1. Check that reviews are being saved correctly
2. Verify the scheduler is running (check Convex dashboard)
3. Manually trigger recalculation from `/admin/ratings`

### Incorrect ratings displayed:

1. Clear browser cache
2. Check that `dynamicRating` field is populated in database
3. Run recalculation from admin interface

### Migration issues:

1. Check Convex logs for errors
2. Verify all items have `adminRating` set
3. Manually set missing admin ratings via Item Wizard

## Support

For issues or questions:
1. Check Convex dashboard logs
2. Review this documentation
3. Check the rating analytics dashboard for insights
