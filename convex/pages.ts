import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPage = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a page");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Only admins can create blog posts");
    }

    // Check if slug already exists
    const existingPage = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingPage) {
      throw new Error("A page with this slug already exists");
    }

    // Calculate reading time if content provided
    let readingTimeMinutes = 0;
    if (args.content) {
      const wordCount = args.content.split(/\s+/).length;
      readingTimeMinutes = Math.ceil(wordCount / 200); // 200 words per minute
    }

    const pageId = await ctx.db.insert("pages", {
      slug: args.slug,
      title: args.title,
      description: args.description,
      excerpt: args.excerpt,
      content: args.content,
      coverImageUrl: args.coverImageUrl,
      tags: args.tags || [],
      authorId: userId,
      isPublished: false,
      publishedAt: undefined,
      readingTimeMinutes,
      totalClaps: 0,
      commentCount: 0,
      viewCount: 0,
    });

    return pageId;
  },
});

export const updatePage = mutation({
  args: {
    pageId: v.id("pages"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update a page");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Only admins can update blog posts");
    }

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.content !== undefined) {
      updates.content = args.content;
      // Recalculate reading time
      const wordCount = args.content.split(/\s+/).length;
      updates.readingTimeMinutes = Math.ceil(wordCount / 200);
    }
    if (args.coverImageUrl !== undefined) updates.coverImageUrl = args.coverImageUrl;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.isPublished !== undefined) {
      updates.isPublished = args.isPublished;
      // Set publishedAt timestamp when publishing
      if (args.isPublished && !page.publishedAt) {
        updates.publishedAt = Date.now();
      }
    }

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

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Only admins can delete blog posts");
    }

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    // Delete all content blocks for this page (legacy)
    const contentBlocks = await ctx.db
      .query("contentBlocks")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .collect();

    for (const block of contentBlocks) {
      await ctx.db.delete(block._id);
    }

    // Delete all claps for this page
    const claps = await ctx.db
      .query("pageClaps")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .collect();

    for (const clap of claps) {
      await ctx.db.delete(clap._id);
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

// Get blog stats for admin dashboard
export const getBlogStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      return null;
    }

    const allPages = await ctx.db.query("pages").collect();
    const published = allPages.filter(p => p.isPublished).length;
    const drafts = allPages.filter(p => !p.isPublished).length;
    const totalClaps = allPages.reduce((sum, p) => sum + (p.totalClaps || 0), 0);

    return { 
      published, 
      drafts, 
      total: allPages.length,
      totalClaps,
    };
  },
});

// Get all posts for admin management
export const getAllPosts = query({
  args: {
    status: v.optional(v.union(v.literal("all"), v.literal("published"), v.literal("draft"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    let pages = await ctx.db.query("pages").collect();

    // Filter by status
    const status = args.status || "all";
    if (status === "published") {
      pages = pages.filter(p => p.isPublished);
    } else if (status === "draft") {
      pages = pages.filter(p => !p.isPublished);
    }

    // Sort by creation time (newest first)
    pages.sort((a, b) => b._creationTime - a._creationTime);

    // Get author details
    const postsWithAuthor = await Promise.all(
      pages.map(async (page) => {
        const author = await ctx.db.get(page.authorId);
        const authorProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", page.authorId))
          .first();

        return {
          ...page,
          author: {
            name: author?.name || "Unknown",
            username: authorProfile?.username || "unknown",
          },
        };
      })
    );

    return postsWithAuthor;
  },
});

// Get published posts for public blog feed
export const getPublishedPosts = query({
  args: {
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("newest"), v.literal("popular"))),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const sortBy = args.sortBy || "newest";

    let pages = await ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    // Filter by tag if provided
    if (args.tag) {
      const tagToFilter = args.tag;
      pages = pages.filter(p => p.tags?.includes(tagToFilter));
    }

    // Sort
    if (sortBy === "popular") {
      pages.sort((a, b) => (b.totalClaps || 0) - (a.totalClaps || 0));
    } else {
      pages.sort((a, b) => (b.publishedAt || b._creationTime) - (a.publishedAt || a._creationTime));
    }

    // Limit results
    pages = pages.slice(0, limit);

    // Get author details
    const postsWithAuthor = await Promise.all(
      pages.map(async (page) => {
        const author = await ctx.db.get(page.authorId);
        const authorProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", page.authorId))
          .first();

        return {
          _id: page._id,
          slug: page.slug,
          title: page.title,
          excerpt: page.excerpt || page.description,
          coverImageUrl: page.coverImageUrl,
          tags: page.tags || [],
          readingTimeMinutes: page.readingTimeMinutes || 5,
          totalClaps: page.totalClaps || 0,
          commentCount: page.commentCount || 0,
          viewCount: page.viewCount || 0,
          publishedAt: page.publishedAt || page._creationTime,
          author: {
            name: author?.name || "Unknown",
            username: authorProfile?.username || "unknown",
          },
        };
      })
    );

    return postsWithAuthor;
  },
});

// Get single post by slug for public view
export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!page || !page.isPublished) {
      return null;
    }

    const author = await ctx.db.get(page.authorId);
    const authorProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", page.authorId))
      .first();

    return {
      ...page,
      author: {
        name: author?.name || "Unknown",
        username: authorProfile?.username || "unknown",
        email: author?.email,
      },
    };
  },
});

// Increment view count for a post
export const incrementViewCount = mutation({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.pageId);
    if (!page) return;

    await ctx.db.patch(args.pageId, {
      viewCount: (page.viewCount || 0) + 1,
    });
  },
});

// Get post for editing (admin only)
export const getPostForEdit = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      return null;
    }

    return page;
  },
});

// Get all unique tags
export const getAllTags = query({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    const tagsSet = new Set<string>();
    pages.forEach(page => {
      page.tags?.forEach(tag => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  },
});
