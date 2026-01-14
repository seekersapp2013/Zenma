import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get app settings
export const getAppSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("appSettings").collect();
    
    // Convert to key-value object
    const settingsObj: Record<string, string> = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    // Set defaults if not found
    return {
      title: settingsObj.title || "Movie App",
      favicon: settingsObj.favicon || "/logo.svg",
      colorScheme: settingsObj.colorScheme || "default",
      ...settingsObj,
    };
  },
});

// Update app setting (admin only)
export const updateAppSetting = mutation({
  args: {
    key: v.string(),
    value: v.string(),
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

    // Check if setting exists
    const existingSetting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existingSetting) {
      // Update existing setting
      await ctx.db.patch(existingSetting._id, {
        value: args.value,
        updatedBy: userId,
        updatedAt: Date.now(),
      });
    } else {
      // Create new setting
      await ctx.db.insert("appSettings", {
        key: args.key,
        value: args.value,
        updatedBy: userId,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get banned words
export const getBannedWords = query({
  args: {},
  handler: async (ctx) => {
    const words = await ctx.db.query("bannedWords").collect();
    return words.map(w => w.word);
  },
});

// Add banned word (admin only)
export const addBannedWord = mutation({
  args: {
    word: v.string(),
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

    const word = args.word.toLowerCase().trim();
    if (!word) {
      throw new Error("Word cannot be empty");
    }

    // Check if word already exists
    const existingWord = await ctx.db
      .query("bannedWords")
      .withIndex("by_word", (q) => q.eq("word", word))
      .first();

    if (existingWord) {
      throw new Error("Word already in banned list");
    }

    await ctx.db.insert("bannedWords", {
      word,
      createdBy: userId,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Remove banned word (admin only)
export const removeBannedWord = mutation({
  args: {
    word: v.string(),
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

    const word = args.word.toLowerCase().trim();
    const existingWord = await ctx.db
      .query("bannedWords")
      .withIndex("by_word", (q) => q.eq("word", word))
      .first();

    if (!existingWord) {
      throw new Error("Word not found in banned list");
    }

    await ctx.db.delete(existingWord._id);
    return { success: true };
  },
});

// Get all banned words with details (admin only)
export const getBannedWordsWithDetails = query({
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

    const words = await ctx.db.query("bannedWords").order("desc").collect();
    
    const wordsWithDetails = await Promise.all(
      words.map(async (word) => {
        const creator = await ctx.db.get(word.createdBy);
        const creatorProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", word.createdBy))
          .first();

        return {
          ...word,
          creatorUsername: creatorProfile?.username || "Unknown",
        };
      })
    );

    return wordsWithDetails;
  },
});

// Get About Us content
export const getAboutUsContent = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("appSettings").collect();
    
    // Convert to key-value object
    const settingsObj: Record<string, string> = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    return {
      mainDescription: settingsObj.aboutMainDescription || "Welcome to Zenma movie site, the ultimate destination for all film enthusiasts. Immerse yourself in a world of captivating stories, stunning visuals, and unforgettable performances. Explore our extensive library of movies, spanning across genres, eras, and cultures.",
      secondaryDescription: settingsObj.aboutSecondaryDescription || "Indulge in the joy of cinema with our curated collections, featuring handpicked movies grouped by themes, directors, or actors. Dive into the world of cinematic magic and let yourself be transported to new realms of imagination and emotion.",
      missionStatement: settingsObj.aboutMissionStatement || "",
    };
  },
});

// Update About Us content (admin only)
export const updateAboutUsContent = mutation({
  args: {
    mainDescription: v.string(),
    secondaryDescription: v.string(),
    missionStatement: v.optional(v.string()),
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

    // Update main description
    await updateOrCreateSetting(ctx, "aboutMainDescription", args.mainDescription, userId);
    
    // Update secondary description
    await updateOrCreateSetting(ctx, "aboutSecondaryDescription", args.secondaryDescription, userId);
    
    // Update mission statement if provided
    if (args.missionStatement !== undefined) {
      await updateOrCreateSetting(ctx, "aboutMissionStatement", args.missionStatement, userId);
    }

    return { success: true };
  },
});

// Helper function to update or create setting
async function updateOrCreateSetting(ctx: any, key: string, value: string, userId: any) {
  const existingSetting = await ctx.db
    .query("appSettings")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .first();

  if (existingSetting) {
    await ctx.db.patch(existingSetting._id, {
      value,
      updatedBy: userId,
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("appSettings", {
      key,
      value,
      updatedBy: userId,
      updatedAt: Date.now(),
    });
  }
}