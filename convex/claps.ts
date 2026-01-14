import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Add claps to a page (1-100 total per user)
export const addClap = mutation({
  args: {
    pageId: v.id("pages"),
    clapCount: v.number(), // Number of claps to add (1-100)
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to clap");
    }

    // Validate clap count
    if (args.clapCount < 1 || args.clapCount > 100) {
      throw new Error("Clap count must be between 1 and 100");
    }

    // Verify page exists
    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    // Check existing claps
    const existingClap = await ctx.db
      .query("pageClaps")
      .withIndex("by_user_and_page", (q) => 
        q.eq("userId", userId).eq("pageId", args.pageId)
      )
      .first();

    if (existingClap) {
      const newTotal = existingClap.clapCount + args.clapCount;
      if (newTotal > 100) {
        throw new Error(
          `You can only clap 100 times total. You have ${100 - existingClap.clapCount} claps remaining.`
        );
      }

      // Update existing clap
      await ctx.db.patch(existingClap._id, {
        clapCount: newTotal,
        lastClappedAt: Date.now(),
      });
    } else {
      // Create new clap record
      await ctx.db.insert("pageClaps", {
        pageId: args.pageId,
        userId,
        clapCount: args.clapCount,
        lastClappedAt: Date.now(),
        createdAt: Date.now(),
      });
    }

    // Update denormalized total on page
    await ctx.db.patch(args.pageId, {
      totalClaps: (page.totalClaps || 0) + args.clapCount,
    });

    return { success: true };
  },
});

// Get user's claps for a specific page
export const getUserClaps = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { clapCount: 0, remaining: 100 };
    }

    const clap = await ctx.db
      .query("pageClaps")
      .withIndex("by_user_and_page", (q) => 
        q.eq("userId", userId).eq("pageId", args.pageId)
      )
      .first();

    const clapCount = clap?.clapCount || 0;
    return {
      clapCount,
      remaining: 100 - clapCount,
    };
  },
});

// Get top clappers for a page (optional, for leaderboard)
export const getTopClappers = query({
  args: { 
    pageId: v.id("pages"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const claps = await ctx.db
      .query("pageClaps")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .collect();

    // Sort by clap count descending
    const sortedClaps = claps.sort((a, b) => b.clapCount - a.clapCount).slice(0, limit);

    // Get user details
    const clappersWithDetails = await Promise.all(
      sortedClaps.map(async (clap) => {
        const user = await ctx.db.get(clap.userId);
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", clap.userId))
          .first();

        return {
          username: userProfile?.username || "Unknown User",
          clapCount: clap.clapCount,
          clappedAt: clap.lastClappedAt,
        };
      })
    );

    return clappersWithDetails;
  },
});
