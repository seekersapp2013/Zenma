import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query to get all items for a specific category
export const getItemsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    // Get image URLs for all items
    const itemsWithImages = await Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: await ctx.storage.getUrl(item.imageId),
      }))
    );

    return itemsWithImages;
  },
});

// Query to get a single item by slug
export const getItemBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("items")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!item) return null;

    // Also get the category information and image URL
    const category = await ctx.db.get(item.categoryId);
    const imageUrl = await ctx.storage.getUrl(item.imageId);
    
    return {
      ...item,
      imageUrl,
      category,
    };
  },
});

// Create a new item
export const createItem = mutation({
  args: {
    categoryId: v.id("categories"),
    title: v.string(),
    imageId: v.id("_storage"),
    genres: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Generate slug from title
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists and make it unique if needed
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await ctx.db
        .query("items")
        .withIndex("by_slug", (q) => q.eq("slug", finalSlug))
        .first();
      
      if (!existing) break;
      
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return await ctx.db.insert("items", {
      categoryId: args.categoryId,
      title: args.title,
      slug: finalSlug,
      imageId: args.imageId,
      genres: args.genres,
      createdBy: userId,
    });
  },
});

// Update an item
export const updateItem = mutation({
  args: {
    itemId: v.id("items"),
    title: v.string(),
    imageId: v.id("_storage"),
    genres: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Generate new slug from updated title
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists (excluding current item)
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await ctx.db
        .query("items")
        .withIndex("by_slug", (q) => q.eq("slug", finalSlug))
        .first();
      
      if (!existing || existing._id === args.itemId) break;
      
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return await ctx.db.patch(args.itemId, {
      title: args.title,
      slug: finalSlug,
      imageId: args.imageId,
      genres: args.genres,
    });
  },
});

// Delete an item
export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.delete(args.itemId);
  },
});

// Get all items with their categories (for homepage)
export const getAllItemsWithCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_order")
      .collect();

    const result = [];
    
    for (const category of categories) {
      const items = await ctx.db
        .query("items")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .collect();
      
      // Get image URLs for all items
      const itemsWithImages = await Promise.all(
        items.map(async (item) => ({
          ...item,
          imageUrl: await ctx.storage.getUrl(item.imageId),
        }))
      );
      
      result.push({
        ...category,
        items: itemsWithImages,
      });
    }

    return result;
  },
});