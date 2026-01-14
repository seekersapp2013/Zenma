import { query } from "./_generated/server";

// Check if comments need migration
export const checkMigrationStatus = query({
  args: {},
  handler: async (ctx) => {
    const comments = await ctx.db.query("comments").collect();
    
    const needsMigration = comments.filter(c => !c.targetId && c.itemId);
    const alreadyMigrated = comments.filter(c => c.targetId);
    
    return {
      totalComments: comments.length,
      needsMigration: needsMigration.length,
      alreadyMigrated: alreadyMigrated.length,
      migrationNeeded: needsMigration.length > 0,
      status: needsMigration.length > 0 
        ? `⚠️ Migration needed for ${needsMigration.length} comments`
        : `✅ All comments migrated (${alreadyMigrated.length} total)`,
    };
  },
});
