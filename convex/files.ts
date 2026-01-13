import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    console.log("Generating upload URL for user:", userId);
    const uploadUrl = await ctx.storage.generateUploadUrl();
    console.log("Upload URL generated successfully");
    return uploadUrl;
  },
});

export const getImageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    console.log("Retrieved URL for storage ID:", args.storageId);
    return url;
  },
});