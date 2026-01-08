import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query to get all categories ordered by their position
export const getCategories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_order")
      .collect();
  },
});

// Query to get categories by type
export const getCategoriesByType = query({
  args: { type: v.union(v.literal("featured"), v.literal("full"), v.literal("short")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

// Create a new category
export const createCategory = mutation({
  args: {
    type: v.union(v.literal("featured"), v.literal("full"), v.literal("short")),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the highest order number and increment it
    const categories = await ctx.db.query("categories").collect();
    const maxOrder = Math.max(...categories.map(c => c.order), 0);

    return await ctx.db.insert("categories", {
      type: args.type,
      title: args.title,
      order: maxOrder + 1,
      createdBy: userId,
    });
  },
});

// Update category order (for drag and drop)
export const updateCategoryOrder = mutation({
  args: {
    categoryId: v.id("categories"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.patch(args.categoryId, {
      order: args.newOrder,
    });
  },
});

// Delete a category
export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // First delete all items in this category
    const items = await ctx.db
      .query("items")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Then delete the category
    return await ctx.db.delete(args.categoryId);
  },
});

// Update category title
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.patch(args.categoryId, {
      title: args.title,
    });
  },
});