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
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
