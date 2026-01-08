import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const seedData = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if data already exists
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return "Data already seeded";
    }

    // Create sample categories
    const featuredCategory = await ctx.db.insert("categories", {
      type: "featured",
      title: "<b>NEW</b> OF THIS SEASON",
      order: 1,
      createdBy: userId,
    });

    const fullCategory = await ctx.db.insert("categories", {
      type: "full", 
      title: "MOVIES FOR <b>YOU</b>",
      order: 2,
      createdBy: userId,
    });

    const shortCategory = await ctx.db.insert("categories", {
      type: "short",
      title: "Expected premiere",
      order: 3,
      createdBy: userId,
    });

    return "Sample categories created! You can now add items with images through the admin interface.";
  },
});