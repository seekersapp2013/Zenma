import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all actors
export const getActors = query({
  args: {},
  handler: async (ctx) => {
    const actors = await ctx.db.query("actors").collect();
    
    // Get image URLs for actors
    const actorsWithImages = await Promise.all(
      actors.map(async (actor) => {
        let imageUrl = null;
        if (actor.imageId) {
          imageUrl = await ctx.storage.getUrl(actor.imageId);
        }
        return {
          ...actor,
          imageUrl,
        };
      })
    );
    
    return actorsWithImages;
  },
});

// Get actor by slug
export const getActorBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const actor = await ctx.db
      .query("actors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!actor) {
      return null;
    }
    
    let imageUrl = null;
    if (actor.imageId) {
      imageUrl = await ctx.storage.getUrl(actor.imageId);
    }
    
    return {
      ...actor,
      imageUrl,
    };
  },
});

// Create new actor
export const createActor = mutation({
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
    const existingActor = await ctx.db
      .query("actors")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingActor) {
      throw new Error("Actor with this name already exists");
    }

    const actorId = await ctx.db.insert("actors", {
      ...args,
      slug,
      createdBy: userId,
      createdAt: Date.now(),
    });

    return actorId;
  },
});

// Update actor
export const updateActor = mutation({
  args: {
    id: v.id("actors"),
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
    const existingActor = await ctx.db.get(id);
    if (!existingActor) {
      throw new Error("Actor not found");
    }

    let slug = existingActor.slug;
    if (args.name !== existingActor.name) {
      slug = args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug already exists
      const existingSlug = await ctx.db
        .query("actors")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      if (existingSlug && existingSlug._id !== id) {
        throw new Error("Actor with this name already exists");
      }
    }

    await ctx.db.patch(id, {
      ...updateData,
      slug,
    });

    return id;
  },
});

// Get actor's filmography
export const getActorFilmography = query({
  args: { actorName: v.string() },
  handler: async (ctx, args) => {
    // Get all items where the actor appears in the cast
    const items = await ctx.db.query("items").collect();
    
    const actorMovies = items.filter(item => 
      item.cast && item.cast.some(castMember => castMember.actorName === args.actorName)
    );
    
    // Get image URLs for movies
    const moviesWithImages = await Promise.all(
      actorMovies.map(async (item) => {
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

// Delete actor
export const deleteActor = mutation({
  args: { id: v.id("actors") },
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

    const actor = await ctx.db.get(args.id);
    if (!actor) {
      throw new Error("Actor not found");
    }

    // Delete the image from storage if it exists
    if (actor.imageId) {
      await ctx.storage.delete(actor.imageId);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Admin: Get all actors
export const getAllActors = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    return await ctx.db.query("actors").collect();
  },
});