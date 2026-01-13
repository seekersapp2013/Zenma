import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all directors
export const getDirectors = query({
  args: {},
  handler: async (ctx) => {
    const directors = await ctx.db.query("directors").collect();
    
    // Get image URLs for directors
    const directorsWithImages = await Promise.all(
      directors.map(async (director) => {
        let imageUrl = null;
        if (director.imageId) {
          imageUrl = await ctx.storage.getUrl(director.imageId);
        }
        return {
          ...director,
          imageUrl,
        };
      })
    );
    
    return directorsWithImages;
  },
});

// Get director by slug
export const getDirectorBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const director = await ctx.db
      .query("directors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!director) {
      return null;
    }
    
    let imageUrl = null;
    if (director.imageId) {
      imageUrl = await ctx.storage.getUrl(director.imageId);
    }
    
    return {
      ...director,
      imageUrl,
    };
  },
});

// Create new director
export const createDirector = mutation({
  args: {
    name: v.string(),
    career: v.string(),
    height: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    placeOfBirth: v.optional(v.string()),
    age: v.optional(v.number()),
    zodiac: v.optional(v.string()),
    genres: v.array(v.string()),
    totalMovies: v.optional(v.number()),
    firstMovie: v.optional(v.string()),
    lastMovie: v.optional(v.string()),
    bestMovie: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    biography: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
      throw new Error("Not authorized");
    }

    // Generate slug from name
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingDirector = await ctx.db
      .query("directors")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingDirector) {
      throw new Error("Director with this name already exists");
    }

    const directorId = await ctx.db.insert("directors", {
      ...args,
      slug,
      createdBy: userId,
      createdAt: Date.now(),
    });

    return directorId;
  },
});

// Update director
export const updateDirector = mutation({
  args: {
    id: v.id("directors"),
    name: v.string(),
    career: v.string(),
    height: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    placeOfBirth: v.optional(v.string()),
    age: v.optional(v.number()),
    zodiac: v.optional(v.string()),
    genres: v.array(v.string()),
    totalMovies: v.optional(v.number()),
    firstMovie: v.optional(v.string()),
    lastMovie: v.optional(v.string()),
    bestMovie: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    biography: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
      throw new Error("Not authorized");
    }

    const { id, ...updateData } = args;

    // Generate new slug if name changed
    const existingDirector = await ctx.db.get(id);
    if (!existingDirector) {
      throw new Error("Director not found");
    }

    let slug = existingDirector.slug;
    if (args.name !== existingDirector.name) {
      slug = args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug already exists
      const existingSlug = await ctx.db
        .query("directors")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      if (existingSlug && existingSlug._id !== id) {
        throw new Error("Director with this name already exists");
      }
    }

    await ctx.db.patch(id, {
      ...updateData,
      slug,
    });

    return id;
  },
});

// Get director's filmography
export const getDirectorFilmography = query({
  args: { directorName: v.string() },
  handler: async (ctx, args) => {
    // Get all items where the director appears in the director array
    const items = await ctx.db.query("items").collect();
    
    const directorMovies = items.filter(item => 
      item.director && item.director.includes(args.directorName)
    );
    
    // Get image URLs for movies
    const moviesWithImages = await Promise.all(
      directorMovies.map(async (item) => {
        let imageUrl = null;
        if (item.imageId) {
          imageUrl = await ctx.storage.getUrl(item.imageId);
        }
        return {
          ...item,
          imageUrl,
        };
      })
    );
    
    return moviesWithImages;
  },
});

// Delete director
export const deleteDirector = mutation({
  args: { id: v.id("directors") },
  handler: async (ctx, args) => {
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
      throw new Error("Not authorized");
    }

    const director = await ctx.db.get(args.id);
    if (!director) {
      throw new Error("Director not found");
    }

    // Delete the image from storage if it exists
    if (director.imageId) {
      await ctx.storage.delete(director.imageId);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});