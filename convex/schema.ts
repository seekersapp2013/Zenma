import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  pages: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    authorId: v.id("users"),
    isPublished: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"])
    .index("by_published", ["isPublished"]),

  contentBlocks: defineTable({
    pageId: v.id("pages"),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    content: v.string(),
    order: v.number(),
  })
    .index("by_page", ["pageId"])
    .index("by_page_and_order", ["pageId", "order"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    interests: v.array(v.string()),
    profileCompleted: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"])
    .index("by_role", ["role"]),

  categories: defineTable({
    type: v.union(v.literal("featured"), v.literal("full"), v.literal("short")),
    title: v.string(),
    order: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_order", ["order"])
    .index("by_type", ["type"]),

  items: defineTable({
    categoryId: v.id("categories"),
    title: v.string(),
    slug: v.string(),
    imageId: v.id("_storage"),
    genres: v.array(v.string()),
    description: v.optional(v.string()),
    director: v.optional(v.array(v.string())),
    cast: v.optional(v.array(v.object({
      castName: v.string(), // Character/role name in the movie
      actorName: v.string(), // Real actor name
    }))),
    premiereYear: v.optional(v.number()),
    runningTime: v.optional(v.number()), // in minutes
    country: v.optional(v.string()),
    rating: v.optional(v.number()), // e.g., 8.4
    // Video player fields - hybrid approach (either storage ID or direct URL)
    posterImageId: v.optional(v.id("_storage")), // For uploaded files
    posterImageUrl: v.optional(v.string()), // For direct URLs
    videoSources: v.optional(v.array(v.object({
      videoId: v.optional(v.union(v.id("_storage"), v.null())), // Allow null for URL-only videos
      url: v.optional(v.string()), // For direct URLs
      quality: v.string(), // e.g., "576p", "720p", "1080p"
      type: v.string(), // e.g., "video/mp4"
    }))),
    captions: v.optional(v.array(v.object({
      label: v.string(), // e.g., "English", "Français"
      srcLang: v.string(), // e.g., "en", "fr"
      src: v.string(), // URL to .vtt file
      default: v.optional(v.boolean()),
    }))),
    createdBy: v.id("users"),
  })
    .index("by_category", ["categoryId"])
    .index("by_slug", ["slug"]),

  comments: defineTable({
    itemId: v.id("items"),
    userId: v.id("users"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")), // For replies
    quotedCommentId: v.optional(v.id("comments")), // For quotes
    quotedText: v.optional(v.string()), // Quoted text content
    upvotes: v.number(),
    downvotes: v.number(),
    createdAt: v.number(), // timestamp
  })
    .index("by_item", ["itemId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentCommentId"])
    .index("by_item_and_created", ["itemId", "createdAt"]),

  commentVotes: defineTable({
    commentId: v.id("comments"),
    userId: v.id("users"),
    voteType: v.union(v.literal("up"), v.literal("down")),
  })
    .index("by_comment", ["commentId"])
    .index("by_user_and_comment", ["userId", "commentId"]),

  // App settings for admin configuration
  appSettings: defineTable({
    key: v.string(), // e.g., "title", "favicon", "colorScheme"
    value: v.string(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"]),

  // Banned words list
  bannedWords: defineTable({
    word: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_word", ["word"]),

  // Actors table
  actors: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly version of name
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
    imageId: v.optional(v.id("_storage")), // Profile image
    biography: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  // Directors table
  directors: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly version of name
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
    imageId: v.optional(v.id("_storage")), // Profile image
    biography: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
