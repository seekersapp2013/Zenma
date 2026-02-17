import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  pages: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    excerpt: v.optional(v.string()), // For blog feed preview
    coverImageId: v.optional(v.id("_storage")), // Featured image
    coverImageUrl: v.optional(v.string()), // Or external URL
    content: v.optional(v.string()), // Rich text JSON (TipTap format)
    authorId: v.id("users"),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()), // Publish timestamp
    tags: v.optional(v.array(v.string())), // Tags for categorization
    readingTimeMinutes: v.optional(v.number()), // Calculated reading time
    totalClaps: v.optional(v.number()), // Denormalized clap count
    commentCount: v.optional(v.number()), // Denormalized comment count
    viewCount: v.optional(v.number()), // Simple view counter
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"])
    .index("by_published", ["isPublished"])
    .index("by_published_date", ["isPublished", "publishedAt"])
    .index("by_tags", ["tags"]),

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
    isBanned: v.optional(v.boolean()),
    bannedAt: v.optional(v.number()),
    bannedBy: v.optional(v.id("users")),
    banReason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"])
    .index("by_role", ["role"])
    .index("by_banned", ["isBanned"]),

  categories: defineTable({
    type: v.union(
      v.literal("featured"), 
      v.literal("full"), 
      v.literal("short"),
      v.literal("trending"),
      v.literal("topRated"),
      v.literal("newReleases")
    ),
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
    rating: v.optional(v.number()), // Legacy field - kept for backward compatibility
    adminRating: v.optional(v.number()), // Admin baseline rating (1-10)
    userRatingAverage: v.optional(v.number()), // Average of all user ratings
    userRatingCount: v.optional(v.number()), // Total number of user ratings
    dynamicRating: v.optional(v.number()), // Calculated weighted rating
    lastRatingUpdate: v.optional(v.number()), // Timestamp of last calculation
    // New fields for high-priority features
    ratingCount: v.optional(v.number()), // Total number of ratings (for display)
    reviewCount: v.optional(v.number()), // Total number of reviews (for display)
    viewCount: v.optional(v.number()), // View/watch count for trending
    popularityScore: v.optional(v.number()), // Calculated popularity metric
    releaseDate: v.optional(v.number()), // Timestamp for release date
    addedDate: v.optional(v.number()), // Timestamp when added to platform
    isNew: v.optional(v.boolean()), // Flag for new releases (added in last 30 days)
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
    .index("by_slug", ["slug"])
    .index("by_rating", ["dynamicRating"])
    .index("by_popularity", ["popularityScore"])
    .index("by_added_date", ["addedDate"]),

  comments: defineTable({
    itemId: v.optional(v.id("items")), // Legacy field, kept for backward compatibility
    targetId: v.optional(v.union(v.id("items"), v.id("pages"))), // Support both items and pages (optional for backward compatibility)
    targetType: v.optional(v.union(v.literal("item"), v.literal("page"))), // Type discriminator (optional for backward compatibility)
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
    .index("by_target", ["targetId", "targetType"]) // New composite index
    .index("by_user", ["userId"])
    .index("by_parent", ["parentCommentId"])
    .index("by_item_and_created", ["itemId", "createdAt"])
    .index("by_target_and_created", ["targetId", "createdAt"]),

  commentVotes: defineTable({
    commentId: v.id("comments"),
    userId: v.id("users"),
    voteType: v.union(v.literal("up"), v.literal("down")),
  })
    .index("by_comment", ["commentId"])
    .index("by_user_and_comment", ["userId", "commentId"]),

  reviews: defineTable({
    itemId: v.optional(v.id("items")), // Made optional for backward compatibility
    actorId: v.optional(v.id("actors")), // New field for actor reviews
    targetType: v.optional(v.union(v.literal("item"), v.literal("actor"))), // Made optional for backward compatibility
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    rating: v.number(), // 1-10 stars
    upvotes: v.number(),
    downvotes: v.number(),
    createdAt: v.number(), // timestamp
  })
    .index("by_item", ["itemId"])
    .index("by_actor", ["actorId"])
    .index("by_target_type", ["targetType"])
    .index("by_user", ["userId"])
    .index("by_item_and_created", ["itemId", "createdAt"])
    .index("by_actor_and_created", ["actorId", "createdAt"])
    .index("by_rating", ["rating"]),

  reviewVotes: defineTable({
    reviewId: v.id("reviews"),
    userId: v.id("users"),
    voteType: v.union(v.literal("up"), v.literal("down")),
  })
    .index("by_review", ["reviewId"])
    .index("by_user_and_review", ["userId", "reviewId"]),

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
    // Rating system fields (same as items)
    rating: v.optional(v.number()), // Legacy field - kept for backward compatibility
    adminRating: v.optional(v.number()), // Admin baseline rating (1-10)
    userRatingAverage: v.optional(v.number()), // Average of all user ratings
    userRatingCount: v.optional(v.number()), // Total number of user ratings
    dynamicRating: v.optional(v.number()), // Calculated weighted rating
    lastRatingUpdate: v.optional(v.number()), // Timestamp of last calculation
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"])
    .index("by_rating", ["dynamicRating"]),

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

  // Genres table
  genres: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly version
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_slug", ["slug"]),

  // Contact form submissions
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("archived")),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    readBy: v.optional(v.id("users")),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Page claps (Medium-style appreciation)
  pageClaps: defineTable({
    pageId: v.id("pages"),
    userId: v.id("users"),
    clapCount: v.number(), // 1-50 claps from this user
    lastClappedAt: v.number(), // Timestamp of last clap
    createdAt: v.number(), // First clap timestamp
  })
    .index("by_page", ["pageId"])
    .index("by_user_and_page", ["userId", "pageId"]), // Unique constraint
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
