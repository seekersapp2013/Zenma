import { query } from "./_generated/server";

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      _creationTime: user._creationTime
    }));
  },
});

export const getAllUserProfiles = query({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    return profiles;
  },
});