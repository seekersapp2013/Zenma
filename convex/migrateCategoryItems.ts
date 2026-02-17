import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Migration script to populate categoryItems junction table from existing items
 * This creates the many-to-many relationship while keeping backward compatibility
 */
export const migrateToCategoryItems = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Not authorized - admin access required");
    }

    // Get all items that have a categoryId
    const items = await ctx.db.query("items").collect();
    let migratedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      if (item.categoryId) {
        // Check if this relationship already exists in categoryItems
        const existing = await ctx.db
          .query("categoryItems")
          .withIndex("by_item", (q) => q.eq("itemId", item._id))
          .filter((q) => q.eq(q.field("categoryId"), item.categoryId!))
          .first();

        if (!existing) {
          // Create the junction table entry
          await ctx.db.insert("categoryItems", {
            categoryId: item.categoryId,
            itemId: item._id,
            order: migratedCount + 1, // Simple ordering
            addedAt: Date.now(),
            addedBy: userId,
          });
          migratedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    return {
      success: true,
      message: `Migration complete! Created ${migratedCount} category-item relationships. Skipped ${skippedCount} existing relationships.`,
      migratedCount,
      skippedCount,
    };
  },
});
