import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Get reviews for an item with page-based pagination
export const getReviews = query({
  args: { 
    itemId: v.id("items"),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const page = args.page || 1;
      const limit = args.limit || 10;
      const offset = (page - 1) * limit;

      // Verify item exists
      const item = await ctx.db.get(args.itemId);
      if (!item) {
        return {
          reviews: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
          hasMore: false,
        };
      }

      // Get all reviews for counting
      const allReviews = await ctx.db
        .query("reviews")
        .withIndex("by_item_and_created", (q) => 
          q.eq("itemId", args.itemId)
        )
        .order("desc")
        .collect();

      const totalCount = allReviews.length;
      const totalPages = Math.ceil(totalCount / limit);
      
      // Get reviews for current page
      const reviews = allReviews.slice(offset, offset + limit);

      // Get user profiles for each review
      const reviewsWithDetails = await Promise.all(
        reviews.map(async (review) => {
          try {
            const user = await ctx.db.get(review.userId);
            const userProfile = await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", review.userId))
              .first();

            return {
              ...review,
              username: userProfile?.username || "Unknown User",
            };
          } catch (error) {
            console.error("Error processing review:", error);
            return {
              ...review,
              username: "Unknown User",
            };
          }
        })
      );

      return {
        reviews: reviewsWithDetails,
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages,
      };
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return {
        reviews: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasMore: false,
      };
    }
  },
});

// Add a new review
export const addReview = mutation({
  args: {
    itemId: v.id("items"),
    title: v.string(),
    content: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to review");
    }

    // Check if user is banned
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile && userProfile.isBanned === true) {
      throw new Error("You have been banned from the platform. Please contact admin for details.");
    }

    // Validate content
    if (!args.title.trim()) {
      throw new Error("Review title cannot be empty");
    }

    if (!args.content.trim()) {
      throw new Error("Review content cannot be empty");
    }

    if (args.title.length > 200) {
      throw new Error("Review title is too long (max 200 characters)");
    }

    if (args.content.length > 2000) {
      throw new Error("Review is too long (max 2000 characters)");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 10) {
      throw new Error("Rating must be between 1 and 10");
    }

    // Verify item exists
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Check if user already reviewed this item
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this item");
    }

    const reviewId = await ctx.db.insert("reviews", {
      itemId: args.itemId,
      userId,
      title: args.title.trim(),
      content: args.content.trim(),
      rating: args.rating,
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
    });

    // Update item's dynamic rating
    await ctx.scheduler.runAfter(0, internal.ratings.updateItemRating, {
      itemId: args.itemId,
    });

    return reviewId;
  },
});

// Vote on a review
export const voteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    voteType: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to vote");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Check if user already voted
    const existingVote = await ctx.db
      .query("reviewVotes")
      .withIndex("by_user_and_review", (q) => 
        q.eq("userId", userId).eq("reviewId", args.reviewId)
      )
      .first();

    if (existingVote) {
      if (existingVote.voteType === args.voteType) {
        // Remove vote if same type
        await ctx.db.delete(existingVote._id);
        
        // Update review vote count
        if (args.voteType === "up") {
          await ctx.db.patch(args.reviewId, {
            upvotes: Math.max(0, review.upvotes - 1),
          });
        } else {
          await ctx.db.patch(args.reviewId, {
            downvotes: Math.max(0, review.downvotes - 1),
          });
        }
      } else {
        // Change vote type
        await ctx.db.patch(existingVote._id, {
          voteType: args.voteType,
        });
        
        // Update review vote counts
        if (args.voteType === "up") {
          await ctx.db.patch(args.reviewId, {
            upvotes: review.upvotes + 1,
            downvotes: Math.max(0, review.downvotes - 1),
          });
        } else {
          await ctx.db.patch(args.reviewId, {
            upvotes: Math.max(0, review.upvotes - 1),
            downvotes: review.downvotes + 1,
          });
        }
      }
    } else {
      // Add new vote
      await ctx.db.insert("reviewVotes", {
        reviewId: args.reviewId,
        userId,
        voteType: args.voteType,
      });
      
      // Update review vote count
      if (args.voteType === "up") {
        await ctx.db.patch(args.reviewId, {
          upvotes: review.upvotes + 1,
        });
      } else {
        await ctx.db.patch(args.reviewId, {
          downvotes: review.downvotes + 1,
        });
      }
    }

    return { success: true };
  },
});

// Edit a review (only by the author)
export const editReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    title: v.string(),
    content: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to edit review");
    }

    // Validate content
    if (!args.title.trim()) {
      throw new Error("Review title cannot be empty");
    }

    if (!args.content.trim()) {
      throw new Error("Review content cannot be empty");
    }

    if (args.title.length > 200) {
      throw new Error("Review title is too long (max 200 characters)");
    }

    if (args.content.length > 2000) {
      throw new Error("Review is too long (max 2000 characters)");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 10) {
      throw new Error("Rating must be between 1 and 10");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Only the author can edit their own review
    if (review.userId !== userId) {
      throw new Error("You can only edit your own reviews");
    }

    await ctx.db.patch(args.reviewId, {
      title: args.title.trim(),
      content: args.content.trim(),
      rating: args.rating,
    });

    // Update item's dynamic rating
    await ctx.scheduler.runAfter(0, internal.ratings.updateItemRating, {
      itemId: review.itemId,
    });

    return { success: true };
  },
});

// Delete a review (by author only)
export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to delete review");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Only the author can delete their own review
    if (review.userId !== userId) {
      throw new Error("You can only delete your own reviews");
    }

    // Delete the review
    await ctx.db.delete(args.reviewId);

    // Delete all votes for this review
    const votes = await ctx.db
      .query("reviewVotes")
      .withIndex("by_review", (q) => q.eq("reviewId", args.reviewId))
      .collect();

    await Promise.all(votes.map(vote => ctx.db.delete(vote._id)));

    return { success: true };
  },
});

// Get user's vote on a review
export const getUserVote = query({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const vote = await ctx.db
      .query("reviewVotes")
      .withIndex("by_user_and_review", (q) => 
        q.eq("userId", userId).eq("reviewId", args.reviewId)
      )
      .first();

    return vote?.voteType || null;
  },
});

// Admin: Get items with review counts
export const getItemsWithReviewCounts = query({
  args: {},
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
    
    const itemsWithCounts = await Promise.all(
      items.map(async (item) => {
        const reviewCount = await ctx.db
          .query("reviews")
          .withIndex("by_item", (q) => q.eq("itemId", item._id))
          .collect()
          .then(reviews => reviews.length);

        return {
          ...item,
          reviewCount,
        };
      })
    );

    // Sort by review count (highest first)
    return itemsWithCounts.sort((a, b) => b.reviewCount - a.reviewCount);
  },
});

// Admin: Get all reviews for a specific item
export const getItemReviews = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
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

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_item_and_created", (q) => q.eq("itemId", args.itemId))
      .order("desc")
      .collect();

    const reviewsWithDetails = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", review.userId))
          .first();

        return {
          ...review,
          username: userProfile?.username || "Unknown User",
        };
      })
    );

    return reviewsWithDetails;
  },
});

// Admin: Delete any review
export const adminDeleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
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

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Store itemId before deleting
    const itemId = review.itemId;

    // Delete the review
    await ctx.db.delete(args.reviewId);

    // Delete all votes for this review
    const votes = await ctx.db
      .query("reviewVotes")
      .withIndex("by_review", (q) => q.eq("reviewId", args.reviewId))
      .collect();

    await Promise.all(votes.map(vote => ctx.db.delete(vote._id)));

    // Update item's dynamic rating
    await ctx.scheduler.runAfter(0, internal.ratings.updateItemRating, {
      itemId,
    });

    return { success: true };
  },
});

// Admin: Get all reviews
export const getAllReviews = query({
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

    return await ctx.db.query("reviews").collect();
  },
});