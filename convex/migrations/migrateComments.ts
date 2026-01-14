import { internalMutation } from "../_generated/server";

// Migration to add targetId and targetType to existing comments
export const migrateCommentsToNewSchema = internalMutation({
  args: {},
  handler: async (ctx) => {
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
      message: `Migrated ${migratedCount} comments to new schema`,
    };
  },
});
