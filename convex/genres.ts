import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all genres
export const getGenres = query({
  args: {},
  handler: async (ctx) => {
    const genres = await ctx.db.query("genres").collect();
    return genres.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Get genre by slug
export const getGenreBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const genre = await ctx.db
      .query("genres")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    return genre;
  },
});

// Create new genre
export const createGenre = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
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
    const existingGenre = await ctx.db
      .query("genres")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingGenre) {
      throw new Error("Genre with this name already exists");
    }

    const genreId = await ctx.db.insert("genres", {
      name: args.name,
      slug,
      description: args.description,
      createdBy: userId,
      createdAt: Date.now(),
    });

    return genreId;
  },
});

// Update genre
export const updateGenre = mutation({
  args: {
    id: v.id("genres"),
    name: v.string(),
    description: v.optional(v.string()),
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
    const existingGenre = await ctx.db.get(id);
    if (!existingGenre) {
      throw new Error("Genre not found");
    }

    let slug = existingGenre.slug;
    if (args.name !== existingGenre.name) {
      slug = args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug already exists
      const existingSlug = await ctx.db
        .query("genres")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      if (existingSlug && existingSlug._id !== id) {
        throw new Error("Genre with this name already exists");
      }
    }

    await ctx.db.patch(id, {
      name: updateData.name,
      description: updateData.description,
      slug,
    });

    return id;
  },
});

// Delete genre
export const deleteGenre = mutation({
  args: { id: v.id("genres") },
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

    const genre = await ctx.db.get(args.id);
    if (!genre) {
      throw new Error("Genre not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Admin: Get all genres
export const getAllGenres = query({
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

    return await ctx.db.query("genres").collect();
  },
});
