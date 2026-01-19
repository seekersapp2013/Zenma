import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const seedData = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if data already exists
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return "Data already seeded";
    }

    // Create default app settings
    const defaultSettings = [
      { key: "title", value: "Zenma - Movie Platform" },
      { key: "favicon", value: "/logo.svg" },
      { key: "colorScheme", value: "default" },
    ];

    for (const setting of defaultSettings) {
      await ctx.db.insert("appSettings", {
        key: setting.key,
        value: setting.value,
        updatedBy: userId,
        updatedAt: Date.now(),
      });
    }

    // Create sample categories
    const featuredCategory = await ctx.db.insert("categories", {
      type: "featured",
      title: "<b>NEW</b> OF THIS SEASON",
      order: 1,
      createdBy: userId,
    });

    const fullCategory = await ctx.db.insert("categories", {
      type: "full", 
      title: "MOVIES FOR <b>YOU</b>",
      order: 2,
      createdBy: userId,
    });

    const shortCategory = await ctx.db.insert("categories", {
      type: "short",
      title: "Expected premiere",
      order: 3,
      createdBy: userId,
    });

    return "Sample categories and app settings created! You can now add items with images through the admin interface.";
  },
});

// Helper mutation to update existing items with new fields
export const updateItemsWithNewFields = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const items = await ctx.db.query("items").collect();
    
    for (const item of items) {
      // Convert old director string to array if needed
      let directorArray = [];
      if (item.director) {
        if (Array.isArray(item.director)) {
          directorArray = item.director;
        } else {
          directorArray = [item.director];
        }
      } else {
        directorArray = ["Christopher Nolan"];
      }

      // Add sample data for the new fields if they don't exist
      await ctx.db.patch(item._id, {
        description: item.description || "An exciting story that will keep you on the edge of your seat. Follow the journey of our protagonists as they navigate through challenges and discover the true meaning of courage and friendship.",
        director: directorArray,
        cast: item.cast || [
          { castName: "Dom Cobb", actorName: "Leonardo DiCaprio" },
          { castName: "Mal", actorName: "Marion Cotillard" },
          { castName: "Eames", actorName: "Tom Hardy" },
          { castName: "Ariadne", actorName: "Ellen Page" },
          { castName: "Professor Miles", actorName: "Michael Caine" }
        ],
        premiereYear: item.premiereYear || 2023,
        runningTime: item.runningTime || 148,
        country: item.country || "USA",
        rating: item.rating || 8.4,
      });
    }

    return `Updated ${items.length} items with new fields`;
  },
});

// Seed sample actors and directors
export const seedActorsAndDirectors = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if actors already exist
    const existingActors = await ctx.db.query("actors").collect();
    if (existingActors.length === 0) {
      // Create sample actors
      const sampleActors = [
        {
          name: "Leonardo DiCaprio",
          career: "Actor",
          height: "6'0\"",
          dateOfBirth: "November 11, 1974",
          placeOfBirth: "Los Angeles, California, USA",
          age: 49,
          zodiac: "Scorpio",
          genres: ["Drama", "Thriller", "Action"],
          totalMovies: 35,
          firstMovie: "Critters 3",
          lastMovie: "Killers of the Flower Moon",
          bestMovie: "The Revenant",
          biography: "Leonardo Wilhelm DiCaprio is an American actor and film producer. Known for his work in biographical and period films, he has received numerous accolades, including an Academy Award, a British Academy Film Award, and three Golden Globe Awards."
        },
        {
          name: "Marion Cotillard",
          career: "Actress",
          height: "5'6\"",
          dateOfBirth: "September 30, 1975",
          placeOfBirth: "Paris, France",
          age: 48,
          zodiac: "Libra",
          genres: ["Drama", "Romance", "Thriller"],
          totalMovies: 40,
          firstMovie: "The Story of a Boy Who Wanted to Be Kissed",
          lastMovie: "Annette",
          bestMovie: "La Vie en Rose",
          biography: "Marion Cotillard is a French actress, singer, and environmentalist. She is known for her wide range of roles across blockbusters and independent films."
        },
        {
          name: "Tom Hardy",
          career: "Actor",
          height: "5'9\"",
          dateOfBirth: "September 15, 1977",
          placeOfBirth: "London, England",
          age: 46,
          zodiac: "Virgo",
          genres: ["Action", "Drama", "Thriller"],
          totalMovies: 30,
          firstMovie: "Black Hawk Down",
          lastMovie: "Venom: Let There Be Carnage",
          bestMovie: "Mad Max: Fury Road",
          biography: "Edward Thomas Hardy is an English actor and producer. After studying acting at the Drama Centre London, he made his film debut in Ridley Scott's Black Hawk Down."
        }
      ];

      for (const actor of sampleActors) {
        const slug = actor.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        await ctx.db.insert("actors", {
          ...actor,
          slug,
          createdBy: userId,
          createdAt: Date.now(),
        });
      }
    }

    // Check if directors already exist
    const existingDirectors = await ctx.db.query("directors").collect();
    if (existingDirectors.length === 0) {
      // Create sample directors
      const sampleDirectors = [
        {
          name: "Christopher Nolan",
          career: "Director, Producer, Screenwriter",
          height: "6'0\"",
          dateOfBirth: "July 30, 1970",
          placeOfBirth: "London, England",
          age: 53,
          zodiac: "Leo",
          genres: ["Sci-Fi", "Thriller", "Drama"],
          totalMovies: 12,
          firstMovie: "Following",
          lastMovie: "Oppenheimer",
          bestMovie: "Inception",
          biography: "Christopher Edward Nolan is a British-American filmmaker known for his Hollywood blockbusters with complex storytelling. His films have grossed more than US$5 billion worldwide."
        },
        {
          name: "Denis Villeneuve",
          career: "Director, Producer, Screenwriter",
          height: "6'2\"",
          dateOfBirth: "October 3, 1967",
          placeOfBirth: "Trois-Rivières, Quebec, Canada",
          age: 56,
          zodiac: "Libra",
          genres: ["Sci-Fi", "Drama", "Thriller"],
          totalMovies: 15,
          firstMovie: "Un 32 août sur terre",
          lastMovie: "Dune: Part Two",
          bestMovie: "Blade Runner 2049",
          biography: "Denis Villeneuve is a Canadian filmmaker. He is a four-time recipient of the Canadian Screen Award for Best Direction."
        },
        {
          name: "Greta Gerwig",
          career: "Director, Screenwriter, Actress",
          height: "5'9\"",
          dateOfBirth: "August 4, 1983",
          placeOfBirth: "Sacramento, California, USA",
          age: 40,
          zodiac: "Leo",
          genres: ["Comedy", "Drama", "Romance"],
          totalMovies: 8,
          firstMovie: "Nights and Weekends",
          lastMovie: "Barbie",
          bestMovie: "Lady Bird",
          biography: "Greta Celeste Gerwig is an American actress, screenwriter, and director. She has received various accolades, including a Golden Globe Award."
        }
      ];

      for (const director of sampleDirectors) {
        const slug = director.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        await ctx.db.insert("directors", {
          ...director,
          slug,
          createdBy: userId,
          createdAt: Date.now(),
        });
      }
    }

    return `Seeded ${existingActors.length === 0 ? 3 : 0} actors and ${existingDirectors.length === 0 ? 3 : 0} directors`;
  },
});

// Duplicate existing items to reach 100 items for testing lazy loading
export const duplicateItemsTo100 = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all existing items
    const existingItems = await ctx.db.query("items").collect();
    
    if (existingItems.length === 0) {
      return "No items to duplicate. Please add some items first.";
    }

    const currentCount = existingItems.length;
    const targetCount = 100;

    if (currentCount >= targetCount) {
      return `Already have ${currentCount} items. No need to duplicate.`;
    }

    const itemsNeeded = targetCount - currentCount;
    let duplicatedCount = 0;

    // Duplicate items in a round-robin fashion
    for (let i = 0; i < itemsNeeded; i++) {
      const sourceItem = existingItems[i % existingItems.length];
      
      // Create a unique slug by appending a number
      const baseSlug = sourceItem.slug;
      const newSlug = `${baseSlug}-copy-${currentCount + i + 1}`;
      
      // Create a new title with a number
      const newTitle = `${sourceItem.title} (Copy ${currentCount + i + 1})`;

      // Insert the duplicated item
      await ctx.db.insert("items", {
        categoryId: sourceItem.categoryId,
        title: newTitle,
        slug: newSlug,
        imageId: sourceItem.imageId,
        genres: sourceItem.genres,
        description: sourceItem.description,
        director: sourceItem.director,
        cast: sourceItem.cast,
        premiereYear: sourceItem.premiereYear,
        runningTime: sourceItem.runningTime,
        country: sourceItem.country,
        rating: sourceItem.rating,
        posterImageId: sourceItem.posterImageId,
        posterImageUrl: sourceItem.posterImageUrl,
        videoSources: sourceItem.videoSources,
        captions: sourceItem.captions,
        createdBy: userId,
      });

      duplicatedCount++;
    }

    return `Successfully duplicated ${duplicatedCount} items. Total items now: ${currentCount + duplicatedCount}`;
  },
});

// Delete all duplicated items (items with "Copy" in title)
export const deleteDuplicatedItems = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all items with "Copy" in the title
    const allItems = await ctx.db.query("items").collect();
    const duplicatedItems = allItems.filter(item => item.title.includes("(Copy"));

    if (duplicatedItems.length === 0) {
      return "No duplicated items found to delete.";
    }

    // Delete all duplicated items
    for (const item of duplicatedItems) {
      await ctx.db.delete(item._id);
    }

    return `Successfully deleted ${duplicatedItems.length} duplicated items. Remaining items: ${allItems.length - duplicatedItems.length}`;
  },
});