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
