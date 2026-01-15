import { v } from "convex/values";
import { query } from "./_generated/server";

// Search across all content types
export const searchAll = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.toLowerCase().trim();
    
    if (!searchTerm) {
      return {
        movies: [],
        actors: [],
        directors: [],
        blog: [],
      };
    }

    // Search Movies/Items
    const allItems = await ctx.db.query("items").collect();
    const movies = allItems.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.genres.some(genre => genre.toLowerCase().includes(searchTerm))
    );

    const moviesWithImages = await Promise.all(
      movies.map(async (item) => {
        let imageUrl = null;
        try {
          if (item.imageId) {
            imageUrl = await ctx.storage.getUrl(item.imageId);
          }
        } catch (error) {
          console.error("Failed to get image URL for item:", item._id, error);
        }
        return {
          ...item,
          imageUrl,
        };
      })
    );

    // Search Actors
    const allActors = await ctx.db.query("actors").collect();
    const actors = allActors.filter(actor =>
      actor.name.toLowerCase().includes(searchTerm) ||
      actor.biography?.toLowerCase().includes(searchTerm) ||
      actor.genres.some(genre => genre.toLowerCase().includes(searchTerm))
    );

    const actorsWithImages = await Promise.all(
      actors.map(async (actor) => {
        let imageUrl = null;
        try {
          if (actor.imageId) {
            imageUrl = await ctx.storage.getUrl(actor.imageId);
          }
        } catch (error) {
          console.error("Failed to get image URL for actor:", actor._id, error);
        }
        return {
          ...actor,
          imageUrl,
        };
      })
    );

    // Search Directors
    const allDirectors = await ctx.db.query("directors").collect();
    const directors = allDirectors.filter(director =>
      director.name.toLowerCase().includes(searchTerm) ||
      director.biography?.toLowerCase().includes(searchTerm) ||
      director.genres.some(genre => genre.toLowerCase().includes(searchTerm))
    );

    const directorsWithImages = await Promise.all(
      directors.map(async (director) => {
        let imageUrl = null;
        try {
          if (director.imageId) {
            imageUrl = await ctx.storage.getUrl(director.imageId);
          }
        } catch (error) {
          console.error("Failed to get image URL for director:", director._id, error);
        }
        return {
          ...director,
          imageUrl,
        };
      })
    );

    // Search Blog Posts
    const allPosts = await ctx.db.query("pages").collect();
    const blogPosts = allPosts.filter(post =>
      post.isPublished &&
      (
        post.title.toLowerCase().includes(searchTerm) ||
        post.content?.toLowerCase().includes(searchTerm) ||
        post.excerpt?.toLowerCase().includes(searchTerm) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    );

    const blogWithImages = await Promise.all(
      blogPosts.map(async (post) => {
        let coverImageUrl = null;
        try {
          if (post.coverImageId) {
            coverImageUrl = await ctx.storage.getUrl(post.coverImageId);
          }
        } catch (error) {
          console.error("Failed to get cover image URL for post:", post._id, error);
        }
        
        // Get author info
        const author = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", post.authorId))
          .first();

        return {
          ...post,
          coverImageUrl,
          author: {
            username: author?.username || "Unknown",
          },
        };
      })
    );

    return {
      movies: moviesWithImages,
      actors: actorsWithImages,
      directors: directorsWithImages,
      blog: blogWithImages,
    };
  },
});
