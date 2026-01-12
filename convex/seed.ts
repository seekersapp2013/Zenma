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

// Helper mutation to update existing items with new fields
export const updateItemsWithNewFields = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const items = await ctx.db.query("items").collect();
    
    for (const item of items) {
      // Add sample data for the new fields if they don't exist
      await ctx.db.patch(item._id, {
        description: item.description || "An exciting story that will keep you on the edge of your seat. Follow the journey of our protagonists as they navigate through challenges and discover the true meaning of courage and friendship.",
        director: item.director || "Christopher Nolan",
        cast: item.cast || ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Ellen Page", "Michael Caine"],
        premiereYear: item.premiereYear || 2023,
        runningTime: item.runningTime || 148,
        country: item.country || "USA",
        rating: item.rating || 8.4,
      });
    }

    return `Updated ${items.length} items with new fields`;
  },
});