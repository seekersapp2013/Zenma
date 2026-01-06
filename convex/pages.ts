import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPage = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a page");
    }

    // Check if slug already exists
    const existingPage = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingPage) {
      throw new Error("A page with this slug already exists");
    }

    const pageId = await ctx.db.insert("pages", {
      slug: args.slug,
      title: args.title,
      description: args.description,
      authorId: userId,
      isPublished: false,
    });

    return pageId;
  },
});

export const updatePage = mutation({
  args: {
    pageId: v.id("pages"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update a page");
    }

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    if (page.authorId !== userId) {
      throw new Error("You can only update your own pages");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;

    await ctx.db.patch(args.pageId, updates);
  },
});

export const deletePage = mutation({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to delete a page");
    }

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    if (page.authorId !== userId) {
      throw new Error("You can only delete your own pages");
    }

    // Delete all content blocks for this page
    const contentBlocks = await ctx.db
      .query("contentBlocks")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .collect();

    for (const block of contentBlocks) {
      await ctx.db.delete(block._id);
    }

    // Delete the page
    await ctx.db.delete(args.pageId);
  },
});

export const getPageBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!page || !page.isPublished) {
      return null;
    }

    const contentBlocks = await ctx.db
      .query("contentBlocks")
      .withIndex("by_page_and_order", (q) => q.eq("pageId", page._id))
      .collect();

    const author = await ctx.db.get(page.authorId);

    return {
      ...page,
      contentBlocks: contentBlocks.sort((a, b) => a.order - b.order),
      author: author ? { name: author.name, email: author.email } : null,
    };
  },
});

export const getUserPages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();

    return pages.map((page) => ({
      _id: page._id,
      slug: page.slug,
      title: page.title,
      description: page.description,
      isPublished: page.isPublished,
      _creationTime: page._creationTime,
    }));
  },
});

export const getPageWithContent = query({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      return null;
    }

    if (page.authorId !== userId) {
      throw new Error("You can only view your own pages");
    }

    const contentBlocks = await ctx.db
      .query("contentBlocks")
      .withIndex("by_page_and_order", (q) => q.eq("pageId", args.pageId))
      .collect();

    return {
      ...page,
      contentBlocks: contentBlocks.sort((a, b) => a.order - b.order),
    };
  },
});
