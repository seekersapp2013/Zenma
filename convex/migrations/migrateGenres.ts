import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Migration to populate genres table from existing items, actors, and directors
export const migrateGenres = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to run migration");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Only admins can run migrations");
    }

    console.log("Starting genre migration...");

    // Get all items, actors, and directors
    const items = await ctx.db.query("items").collect();
    const actors = await ctx.db.query("actors").collect();
    const directors = await ctx.db.query("directors").collect();

    // Extract unique genres
    const genreSet = new Set<string>();

    // From items
    items.forEach(item => {
      if (item.genres) {
        item.genres.forEach(genre => genreSet.add(genre.trim()));
      }
    });

    // From actors
    actors.forEach(actor => {
      if (actor.genres) {
        actor.genres.forEach(genre => genreSet.add(genre.trim()));
      }
    });

    // From directors
    directors.forEach(director => {
      if (director.genres) {
        director.genres.forEach(genre => genreSet.add(genre.trim()));
      }
    });

    console.log(`Found ${genreSet.size} unique genres`);

    // Check existing genres to avoid duplicates
    const existingGenres = await ctx.db.query("genres").collect();
    const existingGenreNames = new Set(existingGenres.map(g => g.name));

    let createdCount = 0;
    let skippedCount = 0;

    // Create genre records
    for (const genreName of Array.from(genreSet)) {
      if (!genreName) continue; // Skip empty strings

      // Skip if already exists
      if (existingGenreNames.has(genreName)) {
        skippedCount++;
        continue;
      }

      const slug = genreName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await ctx.db.insert("genres", {
        name: genreName,
        slug,
        description: undefined,
        createdBy: userId,
        createdAt: Date.now(),
      });

      createdCount++;
    }

    console.log(`Migration complete: ${createdCount} genres created, ${skippedCount} skipped (already exist)`);
    
    return {
      success: true,
      created: createdCount,
      skipped: skippedCount,
      total: genreSet.size,
      message: `Successfully created ${createdCount} genres. ${skippedCount} already existed.`,
    };
  },
});
