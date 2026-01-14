import { mutation } from "./_generated/server";

// One-time migration to add targetId and targetType to existing comments
// Run this once after deploying the new schema
export const migrateExistingComments = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Must be logged in to run migration");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId.subject as any))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Only admins can run migrations");
    }

    const comments = await ctx.db.query("comments").collect();
    
    let migratedCount = 0;
    
    for (const comment of comments) {
      // Only migrate if targetId is missing
      if (!comment.targetId && comment.itemId) {
        await ctx.db.patch(comment._id, {
          targetId: comment.itemId,
          targetType: "item" as const,
        });
        migratedCount++;
      }
    }
    
    return {
      success: true,
      migratedCount,
      totalComments: comments.length,
      message: `Successfully migrated ${migratedCount} out of ${comments.length} comments`,
    };
  },
});
