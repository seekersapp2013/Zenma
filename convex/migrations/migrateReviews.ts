import { internalMutation } from "../_generated/server";

/**
 * Migration to add targetType field to existing reviews
 * This should be run once to update all existing reviews to have targetType: "item"
 */
export const migrateReviewsTargetType = internalMutation({
  handler: async (ctx) => {
    // Get all reviews that don't have targetType set
    const reviews = await ctx.db.query("reviews").collect();
    
    let updatedCount = 0;
    
    for (const review of reviews) {
      // If review doesn't have targetType but has itemId, set it to "item"
      if (!review.targetType && review.itemId) {
        await ctx.db.patch(review._id, {
          targetType: "item" as const,
        });
        updatedCount++;
      }
    }
    
    return {
      success: true,
      totalReviews: reviews.length,
      updatedCount,
      message: `Updated ${updatedCount} reviews with targetType: "item"`,
    };
  },
});