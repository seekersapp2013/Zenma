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

    // Also get the category information and resolve all storage URLs
    const category = await ctx.db.get(item.categoryId);
    const imageUrl = await ctx.storage.getUrl(item.imageId);
    
    // Resolve poster image URL - use storage ID if available, else use direct URL
    const posterImageUrl = item.posterImageId 
      ? await ctx.storage.getUrl(item.posterImageId)
      : item.posterImageUrl || null;

    // Resolve video source URLs - use storage ID if available, else use direct URL
    const videoSources = item.videoSources 
      ? await Promise.all(
          item.videoSources.map(async (source) => ({
            url: source.videoId 
              ? await ctx.storage.getUrl(source.videoId)
              : source.url || "",
            quality: source.quality,
            type: source.type,
          }))
        )
      : null;
    
    return {
      ...item,
      imageUrl,
      posterImageUrl,
      videoSources,
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
    description: v.optional(v.string()),
    director: v.optional(v.string()),
    cast: v.optional(v.array(v.string())),
    premiereYear: v.optional(v.number()),
    runningTime: v.optional(v.number()),
    country: v.optional(v.string()),
    rating: v.optional(v.number()),
    posterImageId: v.optional(v.id("_storage")),
    posterImageUrl: v.optional(v.string()),
    videoSources: v.optional(v.array(v.object({
      videoId: v.optional(v.id("_storage")),
      url: v.optional(v.string()),
      quality: v.string(),
      type: v.string(),
    }))),
    captions: v.optional(v.array(v.object({
      label: v.string(),
      srcLang: v.string(),
      src: v.string(),
      default: v.optional(v.boolean()),
    }))),
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
      description: args.description,
      director: args.director,
      cast: args.cast,
      premiereYear: args.premiereYear,
      runningTime: args.runningTime,
      country: args.country,
      rating: args.rating,
      posterImageId: args.posterImageId,
      posterImageUrl: args.posterImageUrl,
      videoSources: args.videoSources,
      captions: args.captions,
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
    description: v.optional(v.string()),
    director: v.optional(v.string()),
    cast: v.optional(v.array(v.string())),
    premiereYear: v.optional(v.number()),
    runningTime: v.optional(v.number()),
    country: v.optional(v.string()),
    rating: v.optional(v.number()),
    posterImageId: v.optional(v.id("_storage")),
    posterImageUrl: v.optional(v.string()),
    videoSources: v.optional(v.array(v.object({
      videoId: v.optional(v.id("_storage")),
      url: v.optional(v.string()),
      quality: v.string(),
      type: v.string(),
    }))),
    captions: v.optional(v.array(v.object({
      label: v.string(),
      srcLang: v.string(),
      src: v.string(),
      default: v.optional(v.boolean()),
    }))),
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
      description: args.description,
      director: args.director,
      cast: args.cast,
      premiereYear: args.premiereYear,
      runningTime: args.runningTime,
      country: args.country,
      rating: args.rating,
      posterImageId: args.posterImageId,
      posterImageUrl: args.posterImageUrl,
      videoSources: args.videoSources,
      captions: args.captions,
    });
  },
});

// Query to get related items by genre (excluding current item)
export const getRelatedItemsByGenre = query({
  args: { 
    genres: v.array(v.string()),
    excludeItemId: v.id("items"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;
    
    // Get all items that share at least one genre with the current item
    const allItems = await ctx.db.query("items").collect();
    
    const relatedItems = allItems
      .filter(item => {
        // Exclude the current item
        if (item._id === args.excludeItemId) return false;
        
        // Check if item has at least one matching genre
        return item.genres.some(genre => args.genres.includes(genre));
      })
      .slice(0, limit);

    // Get image URLs for all related items
    const itemsWithImages = await Promise.all(
      relatedItems.map(async (item) => ({
        ...item,
        imageUrl: await ctx.storage.getUrl(item.imageId),
        posterImageUrl: item.posterImageId 
          ? await ctx.storage.getUrl(item.posterImageId)
          : item.posterImageUrl || null,
        videoSources: item.videoSources 
          ? await Promise.all(
              item.videoSources.map(async (source) => ({
                url: source.videoId 
                  ? await ctx.storage.getUrl(source.videoId)
                  : source.url || "",
                quality: source.quality,
                type: source.type,
              }))
            )
          : null,
      }))
    );

    return itemsWithImages;
  },
});

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