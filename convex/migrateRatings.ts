/**
 * Migration script to update existing items with new rating fields
 * 
 * This script:
 * 1. Migrates existing 'rating' field to 'adminRating'
 * 2. Calculates userRatingAverage and userRatingCount from existing reviews
 * 3. Calculates dynamicRating using the hybrid decay algorithm
 * 
 * Run this once after deploying the new schema
 */

import { internalMutation } from "./_generated/server";
import { calculateDynamicRating } from "./ratings";

export const migrateRatingsData = internalMutation({
  handler: async (ctx) => {
    console.log("Starting ratings migration...");
    
    // Get all items
    const items = await ctx.db.query("items").collect();
    console.log(`Found ${items.length} items to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        // Skip if already migrated (has adminRating set)
        if (item.adminRating !== undefined && item.dynamicRating !== undefined) {
          skippedCount++;
          continue;
        }

        // Get all reviews for this item
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_item", (q) => q.eq("itemId", item._id))
          .collect();

        // Calculate user rating statistics
        const userRatingCount = reviews.length;
        let userRatingAverage: number | undefined = undefined;

        if (userRatingCount > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          userRatingAverage = totalRating / userRatingCount;
          userRatingAverage = Math.round(userRatingAverage * 10) / 10;
        }

        // Get admin rating from legacy 'rating' field
        const adminRating = item.rating;

        // Calculate dynamic rating
        const dynamicRating = calculateDynamicRating(
          adminRating,
          userRatingAverage,
          userRatingCount
        );

        // Update the item
        await ctx.db.patch(item._id, {
          adminRating: adminRating,
          userRatingAverage,
          userRatingCount,
          dynamicRating,
          lastRatingUpdate: Date.now(),
        });

        migratedCount++;
        
        if (migratedCount % 10 === 0) {
          console.log(`Migrated ${migratedCount} items...`);
        }
      } catch (error) {
        const errorMsg = `Error migrating item ${item._id} (${item.title}): ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    const result = {
      success: true,
      totalItems: items.length,
      migratedCount,
      skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("Migration complete:", result);
    return result;
  },
});
