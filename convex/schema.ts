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
    createdBy: v.id("users"),
  })
    .index("by_category", ["categoryId"])
    .index("by_slug", ["slug"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
