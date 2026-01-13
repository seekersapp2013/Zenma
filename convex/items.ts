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
          item.videoSources.map(async (source) => {
            let resolvedUrl = "";
            
            // Try to get URL from storage ID first
            if (source.videoId) {
              try {
                const storageUrl = await ctx.storage.getUrl(source.videoId);
                if (storageUrl) {
                  resolvedUrl = storageUrl;
                }
              } catch (error) {
                console.error("Failed to resolve storage URL for videoId:", source.videoId, error);
              }
            }
            
            // Fallback to direct URL if storage URL failed or doesn't exist
            if (!resolvedUrl && source.url) {
              resolvedUrl = source.url;
            }
            
            // Log for debugging
            console.log("Video source resolution:", {
              videoId: source.videoId,
              directUrl: source.url,
              resolvedUrl,
              quality: source.quality,
              type: source.type
            });
            
            return {
              url: resolvedUrl,
              quality: source.quality,
              type: source.type,
            };
          })
        )
      : null;

    // Get detailed director information with images
    const directorsWithDetails = item.director 
      ? await Promise.all(
          item.director.map(async (directorName) => {
            const director = await ctx.db
              .query("directors")
              .withIndex("by_name", (q) => q.eq("name", directorName))
              .first();
            
            if (director && director.imageId) {
              const imageUrl = await ctx.storage.getUrl(director.imageId);
              return {
                ...director,
                imageUrl,
              };
            }
            
            // Return basic info if no detailed record found
            return {
              name: directorName,
              slug: directorName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
              imageUrl: null,
            };
          })
        )
      : [];

    // Get detailed cast information with images
    const castWithDetails = item.cast 
      ? await Promise.all(
          item.cast.map(async (castMember) => {
            const actor = await ctx.db
              .query("actors")
              .withIndex("by_name", (q) => q.eq("name", castMember.actorName))
              .first();
            
            if (actor && actor.imageId) {
              const imageUrl = await ctx.storage.getUrl(actor.imageId);
              return {
                ...actor,
                castName: castMember.castName, // Include the character name
                imageUrl,
              };
            }
            
            // Return basic info if no detailed record found
            return {
              name: castMember.actorName,
              castName: castMember.castName,
              slug: castMember.actorName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
              imageUrl: null,
            };
          })
        )
      : [];
    
    return {
      ...item,
      imageUrl,
      posterImageUrl,
      videoSources,
      category,
      directorsWithDetails,
      castWithDetails,
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
    director: v.optional(v.array(v.string())),
    cast: v.optional(v.array(v.object({
      castName: v.string(),
      actorName: v.string(),
    }))),
    premiereYear: v.optional(v.number()),
    runningTime: v.optional(v.number()),
    country: v.optional(v.string()),
    rating: v.optional(v.number()),
    posterImageId: v.optional(v.id("_storage")),
    posterImageUrl: v.optional(v.string()),
    videoSources: v.optional(v.array(v.object({
      videoId: v.optional(v.union(v.id("_storage"), v.null())),
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
    director: v.optional(v.array(v.string())),
    cast: v.optional(v.array(v.object({
      castName: v.string(),
      actorName: v.string(),
    }))),
    premiereYear: v.optional(v.number()),
    runningTime: v.optional(v.number()),
    country: v.optional(v.string()),
    rating: v.optional(v.number()),
    posterImageId: v.optional(v.id("_storage")),
    posterImageUrl: v.optional(v.string()),
    videoSources: v.optional(v.array(v.object({
      videoId: v.optional(v.union(v.id("_storage"), v.null())),
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
              item.videoSources.map(async (source) => {
                let resolvedUrl = "";
                
                // Try to get URL from storage ID first
                if (source.videoId) {
                  try {
                    const storageUrl = await ctx.storage.getUrl(source.videoId);
                    if (storageUrl) {
                      resolvedUrl = storageUrl;
                    }
                  } catch (error) {
                    console.error("Failed to resolve storage URL for videoId:", source.videoId, error);
                  }
                }
                
                // Fallback to direct URL if storage URL failed or doesn't exist
                if (!resolvedUrl && source.url) {
                  resolvedUrl = source.url;
                }
                
                return {
                  url: resolvedUrl,
                  quality: source.quality,
                  type: source.type,
                };
              })
            )
          : null,
      }))
    );

    return itemsWithImages;
  },
});

// Migration function to fix existing data
export const migrateExistingData = mutation({
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
      let needsUpdate = false;
      const updates: any = {};

      // Fix director field - convert string to array
      if (item.director) {
        if (typeof item.director === 'string') {
          updates.director = [item.director];
          needsUpdate = true;
        }
      }

      // Fix videoSources - ensure videoId can be null
      if (item.videoSources) {
        const fixedVideoSources = item.videoSources.map(source => ({
          ...source,
          videoId: source.videoId || null, // Ensure null instead of undefined
        }));
        updates.videoSources = fixedVideoSources;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await ctx.db.patch(item._id, updates);
        migratedCount++;
      }
    }

    return `Migrated ${migratedCount} items to new schema format`;
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

export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if item exists before trying to delete
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    return await ctx.db.delete(args.itemId);
  },
});