import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    
    // Get user profile with role and username
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    return {
      ...user,
      profile,
    };
  },
});

export const createUserProfile = mutation({
  args: {
    username: v.string(),
    interests: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create profile");
    }

    // Check if username is unique
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingProfile) {
      throw new Error("Username already taken");
    }

    // Check if user already has a profile
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile) {
      throw new Error("Profile already exists");
    }

    // Determine role - first user becomes admin
    const existingProfiles = await ctx.db.query("userProfiles").collect();
    const role = existingProfiles.length === 0 ? "admin" : "user";

    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      username: args.username,
      role,
      interests: args.interests,
      profileCompleted: true,
    });

    return profileId;
  },
});

export const checkUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    return !existingProfile;
  },
});

// Admin: Get all users
export const getAllUsers = query({
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

    const users = await ctx.db.query("users").collect();
    
    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        
        return {
          ...user,
          profile,
        };
      })
    );

    return usersWithProfiles;
  },
});

// Admin: Ban a user
export const banUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Must be logged in");
    }

    // Check if current user is admin
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .first();

    if (adminProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get the user profile to ban
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Don't allow banning other admins
    if (userProfile.role === "admin") {
      throw new Error("Cannot ban admin users");
    }

    // Update the user profile to banned status
    await ctx.db.patch(userProfile._id, {
      isBanned: true,
      bannedAt: Date.now(),
      bannedBy: adminUserId,
      banReason: args.reason || "No reason provided",
    });

    return { success: true };
  },
});

// Admin: Unban a user
export const unbanUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Must be logged in");
    }

    // Check if current user is admin
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .first();

    if (adminProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get the user profile to unban
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Update the user profile to remove banned status
    await ctx.db.patch(userProfile._id, {
      isBanned: false,
      bannedAt: undefined,
      bannedBy: undefined,
      banReason: undefined,
    });

    return { success: true };
  },
});

// Admin: Delete a user permanently
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Must be logged in");
    }

    // Check if current user is admin
    const adminProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .first();

    if (adminProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get the user profile to delete
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Don't allow deleting other admins
    if (userProfile.role === "admin") {
      throw new Error("Cannot delete admin users");
    }

    // Don't allow deleting yourself
    if (args.userId === adminUserId) {
      throw new Error("Cannot delete your own account");
    }

    // Delete all user-related data
    // 1. Delete user comments
    const userComments = await ctx.db
      .query("comments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const comment of userComments) {
      await ctx.db.delete(comment._id);
    }

    // 2. Delete user reviews
    const userReviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const review of userReviews) {
      await ctx.db.delete(review._id);
    }

    // 3. Delete comment votes by this user
    const commentVotes = await ctx.db.query("commentVotes").collect();
    for (const vote of commentVotes) {
      if (vote.userId === args.userId) {
        await ctx.db.delete(vote._id);
      }
    }

    // 4. Delete review votes by this user
    const reviewVotes = await ctx.db.query("reviewVotes").collect();
    for (const vote of reviewVotes) {
      if (vote.userId === args.userId) {
        await ctx.db.delete(vote._id);
      }
    }

    // 5. Delete user profile
    await ctx.db.delete(userProfile._id);

    // 6. Delete user account
    await ctx.db.delete(args.userId);

    return { success: true };
  },
});

// Check if current user is banned (for use in comments/reviews)
export const checkUserBanned = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { isBanned: false };
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return {
      isBanned: userProfile?.isBanned || false,
      banReason: userProfile?.banReason,
    };
  },
});
