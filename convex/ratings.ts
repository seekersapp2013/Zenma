import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

/**
 * Calculate dynamic rating using Hybrid with Decay algorithm (Option C)
 * 
 * Formula:
 * adminInfluence = max(0.3, 1 / (1 + userRatingCount / 10))
 * dynamicRating = (adminInfluence × adminRating) + ((1 - adminInfluence) × userAverage)
 * 
 * This ensures:
 * - Admin rating starts at 100% influence with 0 user reviews
 * - Gradually decays as user reviews increase
 * - Maintains minimum 30% admin influence even with many reviews
 * - Smooth transition based on review count
 */
export function calculateDynamicRating(
  adminRating: number | undefined,
  userRatingAverage: number | undefined,
  userRatingCount: number
): number | undefined {
  // If no admin rating and no user ratings, return undefined
  if (!adminRating && !userRatingAverage) {
    return undefined;
  }

  // If only admin rating exists (no user reviews yet)
  if (adminRating && (!userRatingAverage || userRatingCount === 0)) {
    return adminRating;
  }

  // If only user ratings exist (no admin rating)
  if (!adminRating && userRatingAverage) {
    return userRatingAverage;
  }

  // Both exist - calculate weighted average with decay
  if (adminRating && userRatingAverage) {
    // Calculate admin influence (decays from 1.0 to 0.3 as reviews increase)
    const adminInfluence = Math.max(0.3, 1 / (1 + userRatingCount / 10));
    
    // Calculate dynamic rating
    const dynamicRating = 
      (adminInfluence * adminRating) + 
      ((1 - adminInfluence) * userRatingAverage);
    
    // Round to 1 decimal place
    return Math.round(dynamicRating * 10) / 10;
  }

  return undefined;
}

/**
 * Update the dynamic rating for a specific item
 */
export const updateItemRating = internalMutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    // Get the item
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Get all reviews for this item
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .collect();

    // Calculate user rating statistics
    const userRatingCount = reviews.length;
    let userRatingAverage: number | undefined = undefined;

    if (userRatingCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      userRatingAverage = totalRating / userRatingCount;
      // Round to 1 decimal place
      userRatingAverage = Math.round(userRatingAverage * 10) / 10;
    }

    // Get admin rating (check both new and legacy fields)
    const adminRating = item.adminRating || item.rating;

    // Calculate dynamic rating
    const dynamicRating = calculateDynamicRating(
      adminRating,
      userRatingAverage,
      userRatingCount
    );

    // Update the item
    await ctx.db.patch(args.itemId, {
      adminRating: adminRating, // Ensure adminRating is set
      userRatingAverage,
      userRatingCount,
      dynamicRating,
      lastRatingUpdate: Date.now(),
    });

    return {
      adminRating,
      userRatingAverage,
      userRatingCount,
      dynamicRating,
    };
  },
});

/**
 * Recalculate ratings for all items (admin only)
 */
export const recalculateAllRatings = mutation({
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

    // Get all items
    const items = await ctx.db.query("items").collect();

    let updatedCount = 0;
    const results = [];

    for (const item of items) {
      try {
        // Get all reviews for this item
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_item", (q) => q.eq("itemId", item._id))
          .collect();

        // Calculate user rating statistics
        const userRatingCount = reviews.length;
        let userRatingAverage: number | undefined = undefined;

        if (userRatingCount > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          userRatingAverage = totalRating / userRatingCount;
          userRatingAverage = Math.round(userRatingAverage * 10) / 10;
        }

        // Get admin rating (check both new and legacy fields)
        const adminRating = item.adminRating || item.rating;

        // Calculate dynamic rating
        const dynamicRating = calculateDynamicRating(
          adminRating,
          userRatingAverage,
          userRatingCount
        );

        // Update the item
        await ctx.db.patch(item._id, {
          adminRating: adminRating,
          userRatingAverage,
          userRatingCount,
          dynamicRating,
          lastRatingUpdate: Date.now(),
        });

        updatedCount++;
        results.push({
          itemId: item._id,
          title: item.title,
          adminRating,
          userRatingAverage,
          userRatingCount,
          dynamicRating,
        });
      } catch (error) {
        console.error(`Error updating rating for item ${item._id}:`, error);
      }
    }

    return {
      success: true,
      updatedCount,
      totalItems: items.length,
      results,
    };
  },
});

/**
 * Update the dynamic rating for a specific actor
 */
export const updateActorRating = internalMutation({
  args: { actorId: v.id("actors") },
  handler: async (ctx, args) => {
    // Get the actor
    const actor = await ctx.db.get(args.actorId);
    if (!actor) {
      throw new Error("Actor not found");
    }

    // Get all reviews for this actor
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_actor", (q) => q.eq("actorId", args.actorId))
      .collect();

    // Calculate user rating statistics
    const userRatingCount = reviews.length;
    let userRatingAverage: number | undefined = undefined;

    if (userRatingCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      userRatingAverage = totalRating / userRatingCount;
      // Round to 1 decimal place
      userRatingAverage = Math.round(userRatingAverage * 10) / 10;
    }

    // Get admin rating (check both new and legacy fields)
    const adminRating = actor.adminRating || actor.rating;

    // Calculate dynamic rating
    const dynamicRating = calculateDynamicRating(
      adminRating,
      userRatingAverage,
      userRatingCount
    );

    // Update the actor
    await ctx.db.patch(args.actorId, {
      adminRating: adminRating, // Ensure adminRating is set
      userRatingAverage,
      userRatingCount,
      dynamicRating,
      lastRatingUpdate: Date.now(),
    });

    return {
      adminRating,
      userRatingAverage,
      userRatingCount,
      dynamicRating,
    };
  },
});

/**
 * Get rating breakdown for an actor (for display purposes)
 */
export const getActorRatingBreakdown = query({
  args: { actorId: v.id("actors") },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId);
    if (!actor) {
      return null;
    }

    const adminRating = actor.adminRating || actor.rating;

    return {
      adminRating,
      userRatingAverage: actor.userRatingAverage,
      userRatingCount: actor.userRatingCount || 0,
      dynamicRating: actor.dynamicRating,
      lastRatingUpdate: actor.lastRatingUpdate,
    };
  },
});

/**
 * Recalculate ratings for all actors (admin only)
 */
export const recalculateAllActorRatings = mutation({
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

    // Get all actors
    const actors = await ctx.db.query("actors").collect();

    let updatedCount = 0;
    const results = [];

    for (const actor of actors) {
      try {
        // Get all reviews for this actor
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_actor", (q) => q.eq("actorId", actor._id))
          .collect();

        // Calculate user rating statistics
        const userRatingCount = reviews.length;
        let userRatingAverage: number | undefined = undefined;

        if (userRatingCount > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          userRatingAverage = totalRating / userRatingCount;
          userRatingAverage = Math.round(userRatingAverage * 10) / 10;
        }

        // Get admin rating (check both new and legacy fields)
        const adminRating = actor.adminRating || actor.rating;

        // Calculate dynamic rating
        const dynamicRating = calculateDynamicRating(
          adminRating,
          userRatingAverage,
          userRatingCount
        );

        // Update the actor
        await ctx.db.patch(actor._id, {
          adminRating: adminRating,
          userRatingAverage,
          userRatingCount,
          dynamicRating,
          lastRatingUpdate: Date.now(),
        });

        updatedCount++;
        results.push({
          actorId: actor._id,
          name: actor.name,
          adminRating,
          userRatingAverage,
          userRatingCount,
          dynamicRating,
        });
      } catch (error) {
        console.error(`Error updating rating for actor ${actor._id}:`, error);
      }
    }

    return {
      success: true,
      updatedCount,
      totalActors: actors.length,
      results,
    };
  },
});

export const getItemRatingBreakdown = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      return null;
    }

    const adminRating = item.adminRating || item.rating;

    return {
      adminRating,
      userRatingAverage: item.userRatingAverage,
      userRatingCount: item.userRatingCount || 0,
      dynamicRating: item.dynamicRating,
      lastRatingUpdate: item.lastRatingUpdate,
    };
  },
});

/**
 * Get items with rating analytics (admin only)
 */
export const getRatingAnalytics = query({
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

    const items = await ctx.db.query("items").collect();

    const analytics = items
      .map((item) => {
        const adminRating = item.adminRating || item.rating;
        const userRatingAverage = item.userRatingAverage;
        const userRatingCount = item.userRatingCount || 0;
        const dynamicRating = item.dynamicRating;

        // Calculate difference between admin and user ratings
        const ratingDifference =
          adminRating && userRatingAverage
            ? Math.abs(adminRating - userRatingAverage)
            : 0;

        return {
          itemId: item._id,
          title: item.title,
          slug: item.slug,
          adminRating,
          userRatingAverage,
          userRatingCount,
          dynamicRating,
          ratingDifference,
        };
      })
      .filter((item) => item.dynamicRating !== undefined);

    return {
      totalItems: analytics.length,
      itemsWithUserReviews: analytics.filter((item) => item.userRatingCount > 0).length,
      averageUserRatingCount:
        analytics.reduce((sum, item) => sum + item.userRatingCount, 0) / analytics.length,
      biggestDifferences: analytics
        .sort((a, b) => b.ratingDifference - a.ratingDifference)
        .slice(0, 10),
      mostReviewed: analytics
        .sort((a, b) => b.userRatingCount - a.userRatingCount)
        .slice(0, 10),
    };
  },
});
