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
    director: v.optional(v.string()),
    cast: v.optional(v.array(v.string())),
    premiereYear: v.optional(v.number()),
    runningTime: v.optional(v.number()), // in minutes
    country: v.optional(v.string()),
    rating: v.optional(v.number()), // e.g., 8.4
    // Video player fields - hybrid approach (either storage ID or direct URL)
    posterImageId: v.optional(v.id("_storage")), // For uploaded files
    posterImageUrl: v.optional(v.string()), // For direct URLs
    videoSources: v.optional(v.array(v.object({
      videoId: v.optional(v.id("_storage")), // For uploaded files
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
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
