import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Migration to convert old cast format (string[]) to new format (object[])
export const migrateCastData = mutation({
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

    const items = await ctx.db.query("items").collect();
    let migratedCount = 0;

    for (const item of items) {
      // Check if cast exists and is in old format (array of strings)
      if (item.cast && Array.isArray(item.cast) && item.cast.length > 0) {
        // Check if it's already in new format (array of objects)
        const firstCastItem = item.cast[0];
        
        // If it's a string, it's old format - convert it
        if (typeof firstCastItem === 'string') {
          const oldCastArray = item.cast as unknown as string[];
          const newCastFormat = oldCastArray.map((actorName: string) => ({
            castName: actorName, // Use actor name as character name for existing data
            actorName: actorName, // Keep the original actor name
          }));

          await ctx.db.patch(item._id, {
            cast: newCastFormat,
          });
          
          migratedCount++;
        }
      }
    }

    return `Successfully migrated ${migratedCount} items from old cast format to new cast format`;
  },
});

// Helper function to check migration status
export const checkCastMigrationStatus = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const items = await ctx.db.query("items").collect();
    let oldFormatCount = 0;
    let newFormatCount = 0;
    let noCastCount = 0;

    for (const item of items) {
      if (!item.cast || item.cast.length === 0) {
        noCastCount++;
      } else {
        const firstCastItem = item.cast[0];
        if (typeof firstCastItem === 'string') {
          oldFormatCount++;
        } else {
          newFormatCount++;
        }
      }
    }

    return {
      totalItems: items.length,
      oldFormatCount,
      newFormatCount,
      noCastCount,
      migrationNeeded: oldFormatCount > 0,
    };
  },
});