import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get comments for an item with page-based pagination (only top-level comments)
export const getComments = query({
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
          comments: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
          hasMore: false,
        };
      }

      // Get all top-level comments for counting
      const allComments = await ctx.db
        .query("comments")
        .withIndex("by_item_and_created", (q) => 
          q.eq("itemId", args.itemId)
        )
        .filter((q) => q.eq(q.field("parentCommentId"), undefined))
        .order("desc")
        .collect();

      const totalCount = allComments.length;
      const totalPages = Math.ceil(totalCount / limit);
      
      // Get comments for current page
      const comments = allComments.slice(offset, offset + limit);

      // Get user profiles and vote counts for each comment
      const commentsWithDetails = await Promise.all(
        comments.map(async (comment) => {
          try {
            const user = await ctx.db.get(comment.userId);
            const userProfile = await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", comment.userId))
              .first();

            // Get quoted comment details if exists
            let quotedComment = null;
            if (comment.quotedCommentId) {
              const quoted = await ctx.db.get(comment.quotedCommentId);
              if (quoted) {
                const quotedUser = await ctx.db.get(quoted.userId);
                const quotedUserProfile = await ctx.db
                  .query("userProfiles")
                  .withIndex("by_user", (q) => q.eq("userId", quoted.userId))
                  .first();
                quotedComment = {
                  ...quoted,
                  username: quotedUserProfile?.username || "Unknown User",
                };
              }
            }

            // Get replies count
            const repliesCount = await ctx.db
              .query("comments")
              .withIndex("by_parent", (q) => q.eq("parentCommentId", comment._id))
              .collect()
              .then(replies => replies.length);

            return {
              ...comment,
              username: userProfile?.username || "Unknown User",
              quotedComment,
              repliesCount,
            };
          } catch (error) {
            console.error("Error processing comment:", error);
            return {
              ...comment,
              username: "Unknown User",
              quotedComment: null,
              repliesCount: 0,
            };
          }
        })
      );

      return {
        comments: commentsWithDetails,
        totalCount,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages,
      };
    } catch (error) {
      console.error("Error fetching comments:", error);
      return {
        comments: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasMore: false,
      };
    }
  },
});

// Get replies for a specific comment
export const getReplies = query({
  args: { parentCommentId: v.id("comments") },
  handler: async (ctx, args) => {
    try {
      // Verify parent comment exists
      const parentComment = await ctx.db.get(args.parentCommentId);
      if (!parentComment) {
        return [];
      }

      const replies = await ctx.db
        .query("comments")
        .withIndex("by_parent", (q) => q.eq("parentCommentId", args.parentCommentId))
        .order("asc")
        .collect();

      // Get user details for each reply
      const repliesWithDetails = await Promise.all(
        replies.map(async (reply) => {
          try {
            const user = await ctx.db.get(reply.userId);
            const userProfile = await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", reply.userId))
              .first();

            // Get quoted comment details if exists
            let quotedComment = null;
            if (reply.quotedCommentId) {
              const quoted = await ctx.db.get(reply.quotedCommentId);
              if (quoted) {
                const quotedUser = await ctx.db.get(quoted.userId);
                const quotedUserProfile = await ctx.db
                  .query("userProfiles")
                  .withIndex("by_user", (q) => q.eq("userId", quoted.userId))
                  .first();
                quotedComment = {
                  ...quoted,
                  username: quotedUserProfile?.username || "Unknown User",
                };
              }
            }

            return {
              ...reply,
              username: userProfile?.username || "Unknown User",
              quotedComment,
              repliesCount: 0, // Replies don't have nested replies in this implementation
            };
          } catch (error) {
            console.error("Error processing reply:", error);
            return {
              ...reply,
              username: "Unknown User",
              quotedComment: null,
              repliesCount: 0,
            };
          }
        })
      );

      return repliesWithDetails;
    } catch (error) {
      console.error("Error fetching replies:", error);
      return [];
    }
  },
});

// Add a new comment
export const addComment = mutation({
  args: {
    itemId: v.id("items"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
    quotedCommentId: v.optional(v.id("comments")),
    quotedText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to comment");
    }

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    if (args.content.length > 2000) {
      throw new Error("Comment is too long (max 2000 characters)");
    }

    // Verify item exists
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify parent comment exists if provided
    if (args.parentCommentId) {
      const parentComment = await ctx.db.get(args.parentCommentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
    }

    // Verify quoted comment exists if provided
    if (args.quotedCommentId) {
      const quotedComment = await ctx.db.get(args.quotedCommentId);
      if (!quotedComment) {
        throw new Error("Quoted comment not found");
      }
    }

    const commentId = await ctx.db.insert("comments", {
      itemId: args.itemId,
      userId,
      content: args.content.trim(),
      parentCommentId: args.parentCommentId,
      quotedCommentId: args.quotedCommentId,
      quotedText: args.quotedText,
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
    });

    return commentId;
  },
});

// Vote on a comment
export const voteComment = mutation({
  args: {
    commentId: v.id("comments"),
    voteType: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to vote");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user already voted
    const existingVote = await ctx.db
      .query("commentVotes")
      .withIndex("by_user_and_comment", (q) => 
        q.eq("userId", userId).eq("commentId", args.commentId)
      )
      .first();

    if (existingVote) {
      if (existingVote.voteType === args.voteType) {
        // Remove vote if same type
        await ctx.db.delete(existingVote._id);
        
        // Update comment vote count
        if (args.voteType === "up") {
          await ctx.db.patch(args.commentId, {
            upvotes: Math.max(0, comment.upvotes - 1),
          });
        } else {
          await ctx.db.patch(args.commentId, {
            downvotes: Math.max(0, comment.downvotes - 1),
          });
        }
      } else {
        // Change vote type
        await ctx.db.patch(existingVote._id, {
          voteType: args.voteType,
        });
        
        // Update comment vote counts
        if (args.voteType === "up") {
          await ctx.db.patch(args.commentId, {
            upvotes: comment.upvotes + 1,
            downvotes: Math.max(0, comment.downvotes - 1),
          });
        } else {
          await ctx.db.patch(args.commentId, {
            upvotes: Math.max(0, comment.upvotes - 1),
            downvotes: comment.downvotes + 1,
          });
        }
      }
    } else {
      // Add new vote
      await ctx.db.insert("commentVotes", {
        commentId: args.commentId,
        userId,
        voteType: args.voteType,
      });
      
      // Update comment vote count
      if (args.voteType === "up") {
        await ctx.db.patch(args.commentId, {
          upvotes: comment.upvotes + 1,
        });
      } else {
        await ctx.db.patch(args.commentId, {
          downvotes: comment.downvotes + 1,
        });
      }
    }

    return { success: true };
  },
});

// Edit a comment (only by the author with active session)
export const editComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to edit comment");
    }

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    if (args.content.length > 2000) {
      throw new Error("Comment is too long (max 2000 characters)");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // CRITICAL: Only the author can edit their own comment
    if (comment.userId !== userId) {
      throw new Error("You can only edit your own comments");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content.trim(),
    });

    return { success: true };
  },
});

// Delete a comment (by author only, admins cannot delete user content)
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to delete comment");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // CRITICAL: Only the author can delete their own comment
    if (comment.userId !== userId) {
      throw new Error("You can only delete your own comments");
    }

    // Delete the comment
    await ctx.db.delete(args.commentId);

    // Also delete any replies to this comment
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentCommentId", args.commentId))
      .collect();

    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    // Delete any votes on this comment
    const votes = await ctx.db
      .query("commentVotes")
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    return { success: true };
  },
});

// Admin-only function to delete any comment (for moderation purposes)
export const adminDeleteComment = mutation({
  args: {
    commentId: v.id("comments"),
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

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Delete the comment
    await ctx.db.delete(args.commentId);

    // Also delete any replies to this comment
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentCommentId", args.commentId))
      .collect();

    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    // Delete any votes on this comment
    const votes = await ctx.db
      .query("commentVotes")
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    return { success: true };
  },
});

// Get user's vote for a comment
export const getUserVote = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const vote = await ctx.db
      .query("commentVotes")
      .withIndex("by_user_and_comment", (q) => 
        q.eq("userId", userId).eq("commentId", args.commentId)
      )
      .first();

    return vote?.voteType || null;
  },
});

// Admin: Get all items with comment counts
export const getItemsWithCommentCounts = query({
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
        const commentCount = await ctx.db
          .query("comments")
          .withIndex("by_item", (q) => q.eq("itemId", item._id))
          .collect()
          .then(comments => comments.length);

        return {
          ...item,
          commentCount,
        };
      })
    );

    return itemsWithCounts.sort((a, b) => b.commentCount - a.commentCount);
  },
});

// Admin: Get all comments for a specific item
export const getItemComments = query({
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

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .order("desc")
      .collect();

    const commentsWithDetails = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", comment.userId))
          .first();

        // Get replies count
        const repliesCount = await ctx.db
          .query("comments")
          .withIndex("by_parent", (q) => q.eq("parentCommentId", comment._id))
          .collect()
          .then(replies => replies.length);

        return {
          ...comment,
          username: userProfile?.username || "Unknown User",
          repliesCount,
          isReply: !!comment.parentCommentId,
        };
      })
    );

    return commentsWithDetails;
  },
});