import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

/**
 * Admin function to run the review migration
 */
export const runReviewMigration = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Run the migration
    const result = await ctx.scheduler.runAfter(0, internal.migrations.migrateReviews.migrateReviewsTargetType);
    
    return {
      success: true,
      message: "Review migration started successfully",
    };
  },
});