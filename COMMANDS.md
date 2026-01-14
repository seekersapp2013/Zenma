# Command Reference - Blog & Migration

## 🚨 Fix Admin Pages (Run These Now)

```bash
# 1. Deploy updated schema
npx convex deploy

# 2. Run migration
npx convex run runMigration:migrateExistingComments

# 3. Check status (optional)
npx convex run checkMigrationStatus:checkMigrationStatus
```

## 📝 Blog Management Commands

### Development
```bash
# Start dev server
npm run dev

# Deploy to Convex
npx convex deploy

# Generate TypeScript types
npx convex codegen
```

### Check Migration Status
```bash
# See if migration is needed
npx convex run checkMigrationStatus:checkMigrationStatus
```

### Run Migration (if needed)
```bash
# Migrate existing comments
npx convex run runMigration:migrateExistingComments
```

## 🔍 Debugging Commands

### Check Convex Functions
```bash
# List all functions
npx convex functions

# View function details
npx convex function runMigration:migrateExistingComments
```

### View Logs
```bash
# Stream logs
npx convex logs

# Or view in dashboard
# https://dashboard.convex.dev → Logs
```

### Check Data
```bash
# Query comments
npx convex run checkMigrationStatus:checkMigrationStatus

# Or use dashboard
# https://dashboard.convex.dev → Data → comments
```

## 🎯 Common Tasks

### Create a Blog Post (Admin)
1. Go to `/blog-admin`
2. Click "New Post"
3. Fill in details
4. Click "Publish" or "Save as Draft"

### View Blog
- Public feed: `/blog`
- Individual post: `/blog/post-slug`
- Filter by tag: `/blog?tag=javascript`

### Manage Posts (Admin)
- Dashboard: `/dashboard` (see Blog card)
- Admin panel: `/blog-admin`
- Edit post: `/blog-admin/edit/:id`

## 🛠️ Troubleshooting Commands

### Schema Issues
```bash
# Redeploy schema
npx convex deploy --force

# Check schema validation
npx convex dev
# (Look for schema errors in output)
```

### Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Reset Convex (⚠️ Careful!)
```bash
# Clear all data (DESTRUCTIVE!)
npx convex data clear

# Reinitialize
npx convex dev
```

## 📊 Useful Queries

### Check Blog Stats
```bash
npx convex run pages:getBlogStats
```

### List All Posts
```bash
npx convex run pages:getAllPosts '{"status": "all"}'
```

### Check Comments
```bash
npx convex run checkMigrationStatus:checkMigrationStatus
```

## 🔗 Quick Links

- **Convex Dashboard**: https://dashboard.convex.dev
- **Blog Feed**: http://localhost:5173/blog (dev)
- **Blog Admin**: http://localhost:5173/blog-admin (dev)
- **Dashboard**: http://localhost:5173/dashboard (dev)

## 💡 Tips

1. **Always deploy before running functions:**
   ```bash
   npx convex deploy && npx convex run functionName
   ```

2. **Check status before migrating:**
   ```bash
   npx convex run checkMigrationStatus:checkMigrationStatus
   ```

3. **View real-time logs:**
   ```bash
   npx convex logs --tail
   ```

4. **Test in dev before deploying:**
   ```bash
   npm run dev
   # Test features
   npx convex deploy  # Deploy when ready
   ```

---

**For the current issue, just run the first 2 commands under "Fix Admin Pages"!**
