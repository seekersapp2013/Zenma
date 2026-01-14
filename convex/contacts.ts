import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Submit contact form (public)
export const submitContactForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate inputs
    if (!args.name.trim() || !args.email.trim() || !args.subject.trim() || !args.message.trim()) {
      throw new Error("All fields are required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email address");
    }

    await ctx.db.insert("contactSubmissions", {
      name: args.name.trim(),
      email: args.email.trim(),
      subject: args.subject.trim(),
      message: args.message.trim(),
      status: "new",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Get all contact submissions (admin only)
export const getAllContactSubmissions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    const submissions = await ctx.db
      .query("contactSubmissions")
      .order("desc")
      .collect();

    return submissions;
  },
});

// Update contact submission status (admin only)
export const updateContactStatus = mutation({
  args: {
    submissionId: v.id("contactSubmissions"),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    const updateData: any = {
      status: args.status,
    };

    if (args.status === "read") {
      updateData.readAt = Date.now();
      updateData.readBy = userId;
    }

    await ctx.db.patch(args.submissionId, updateData);

    return { success: true };
  },
});

// Delete contact submission (admin only)
export const deleteContactSubmission = mutation({
  args: {
    submissionId: v.id("contactSubmissions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    await ctx.db.delete(args.submissionId);

    return { success: true };
  },
});

// Get contact page content
export const getContactContent = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("appSettings").collect();
    
    const settingsObj: Record<string, string> = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    return {
      heading: settingsObj.contactHeading || "Get In Touch",
      description: settingsObj.contactDescription || "We are always happy to help and provide more information about our services. You can contact us through email, phone, or by filling out the form on our website. Thank you for considering us!",
      phone: settingsObj.contactPhone || "+1 800 234 56 78",
      email: settingsObj.contactEmail || "support@hotflix.template",
      facebook: settingsObj.contactFacebook || "#",
      twitter: settingsObj.contactTwitter || "#",
      instagram: settingsObj.contactInstagram || "https://www.instagram.com/volkov_des1gn/",
      discord: settingsObj.contactDiscord || "#",
      telegram: settingsObj.contactTelegram || "#",
      tiktok: settingsObj.contactTiktok || "#",
    };
  },
});

// Update contact page content (admin only)
export const updateContactContent = mutation({
  args: {
    heading: v.string(),
    description: v.string(),
    phone: v.string(),
    email: v.string(),
    facebook: v.optional(v.string()),
    twitter: v.optional(v.string()),
    instagram: v.optional(v.string()),
    discord: v.optional(v.string()),
    telegram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Update all contact settings
    const settings = {
      contactHeading: args.heading,
      contactDescription: args.description,
      contactPhone: args.phone,
      contactEmail: args.email,
      contactFacebook: args.facebook || "#",
      contactTwitter: args.twitter || "#",
      contactInstagram: args.instagram || "#",
      contactDiscord: args.discord || "#",
      contactTelegram: args.telegram || "#",
      contactTiktok: args.tiktok || "#",
    };

    for (const [key, value] of Object.entries(settings)) {
      await updateOrCreateSetting(ctx, key, value, userId);
    }

    return { success: true };
  },
});

// Helper function
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
