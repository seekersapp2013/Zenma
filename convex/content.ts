import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addContentBlock = mutation({
  args: {
    pageId: v.id("pages"),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to add content");
    }

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    if (page.authorId !== userId) {
      throw new Error("You can only add content to your own pages");
    }

    // Get the highest order number for this page
    const existingBlocks = await ctx.db
      .query("contentBlocks")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .collect();

    const maxOrder = existingBlocks.length > 0 
      ? Math.max(...existingBlocks.map(block => block.order))
      : -1;

    const blockId = await ctx.db.insert("contentBlocks", {
      pageId: args.pageId,
      type: args.type,
      content: args.content,
      order: maxOrder + 1,
    });

    return blockId;
  },
});

export const updateContentBlock = mutation({
  args: {
    blockId: v.id("contentBlocks"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update content");
    }

    const block = await ctx.db.get(args.blockId);
    if (!block) {
      throw new Error("Content block not found");
    }

    const page = await ctx.db.get(block.pageId);
    if (!page || page.authorId !== userId) {
      throw new Error("You can only update content on your own pages");
    }

    await ctx.db.patch(args.blockId, {
      content: args.content,
    });
  },
});

export const deleteContentBlock = mutation({
  args: {
    blockId: v.id("contentBlocks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to delete content");
    }

    const block = await ctx.db.get(args.blockId);
    if (!block) {
      throw new Error("Content block not found");
    }

    const page = await ctx.db.get(block.pageId);
    if (!page || page.authorId !== userId) {
      throw new Error("You can only delete content from your own pages");
    }

    await ctx.db.delete(args.blockId);
  },
});

export const reorderContentBlocks = mutation({
  args: {
    pageId: v.id("pages"),
    blockIds: v.array(v.id("contentBlocks")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to reorder content");
    }

    const page = await ctx.db.get(args.pageId);
    if (!page || page.authorId !== userId) {
      throw new Error("You can only reorder content on your own pages");
    }

    // Update the order of each block
    for (let i = 0; i < args.blockIds.length; i++) {
      await ctx.db.patch(args.blockIds[i], {
        order: i,
      });
    }
  },
});
