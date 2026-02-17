# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Run the Migration (2 minutes)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5173/admin/migration
   ```

3. Click the **"Run Migration"** button

4. Wait for the success message

✅ **Done!** Your database is now upgraded to support many-to-many relationships.

---

### Step 2: Explore the Movies Page (5 minutes)

1. Navigate to:
   ```
   http://localhost:5173/admin/movies
   ```

2. You'll see all your existing movies in a table

3. Try these actions:
   - Click **"Add Movie"** to create a new movie
   - Click the **category icon** (📁) to add a movie to categories
   - Click the **× on a category badge** to remove from that category
   - Click **edit icon** to modify a movie
   - Click **trash icon** to delete a movie permanently

---

### Step 3: Import Movies to Categories (3 minutes)

1. Navigate to:
   ```
   http://localhost:5173/admin/categories
   ```

2. Find any category and click the **"Import Movies"** button (download icon)

3. Select multiple movies from the list

4. Click **"Import Movies"**

5. The movies now appear in that category!

6. Try removing a movie:
   - Expand the category to see its movies
   - Click the **× button** on a movie card
   - The movie is removed from the category but NOT deleted

---

## 🎯 Key Concepts

### Movies are Independent
- Movies exist separately from categories
- A movie can be in 0, 1, or many categories
- Deleting from a category ≠ deleting the movie

### Two Ways to Create Movies

**Method 1: Movies Page (Recommended)**
```
/admin/movies → Add Movie → Create → Add to Categories
```
- Movie is created first
- Then assigned to categories
- More flexible

**Method 2: Categories Page (Quick)**
```
/admin/categories → Category → + Button → Create
```
- Movie is created AND added to that category
- Faster for single-category movies

### Two Ways to Delete

**Remove from Category:**
- Click × on category badge (Movies page)
- Click × on movie card (Categories page)
- Movie stays in database

**Delete Permanently:**
- Click trash icon (Movies page)
- Movie is deleted from database AND all categories

---

## 📊 Visual Guide

### Movies Page Layout
```
┌─────────────────────────────────────────────────┐
│ Movies                              [Add Movie] │
├─────────────────────────────────────────────────┤
│ TEST TOOLS: [Populate] [Delete] [Duplicate]    │
├─────────────────────────────────────────────────┤
│ Poster │ Title │ Genres │ Categories │ Actions │
├────────┼───────┼────────┼────────────┼─────────┤
│  [img] │ Movie │ Action │ [Cat1 ×]   │ 📁 ✏️ 🗑️ │
│        │   1   │ Drama  │ [Cat2 ×]   │         │
└────────┴───────┴────────┴────────────┴─────────┘
```

### Categories Page Layout
```
┌─────────────────────────────────────────────────┐
│ Categories                      [Add Category]  │
├─────────────────────────────────────────────────┤
│ Order │ Title │ Items │ Actions                │
├───────┼───────┼───────┼────────────────────────┤
│  [≡]  │ Cat 1 │   5   │ 👁️ 📥 ➕ 🗑️           │
│   1   │       │       │                        │
│       │       │       │ [Expanded View]        │
│       │       │       │ ┌──────┬──────┬──────┐│
│       │       │       │ │Movie1│Movie2│Movie3││
│       │       │       │ │[× ✏️🗑️]│[× ✏️🗑️]│[× ✏️🗑️]││
│       │       │       │ └──────┴──────┴──────┘│
└───────┴───────┴───────┴────────────────────────┘

Icons:
👁️ = View items
📥 = Import movies
➕ = Add new movie
🗑️ = Delete
× = Remove from category
✏️ = Edit
```

---

## 🎮 Try These Scenarios

### Scenario 1: Movie in Multiple Categories
```
1. Go to /admin/movies
2. Find a movie
3. Click the category icon (📁)
4. Select "Trending" and "Top Rated"
5. Click "Add to Categories"
6. Go to homepage
7. See the movie in both sections!
```

### Scenario 2: Reorganize Categories
```
1. Go to /admin/categories
2. Click "Import Movies" on "New Releases"
3. Select 5 recent movies
4. Import them
5. Go to homepage
6. See the new "New Releases" section!
```

### Scenario 3: Clean Up a Category
```
1. Go to /admin/categories
2. Expand a category
3. Remove movies that don't fit
4. Go to /admin/movies
5. See those movies still exist
6. Add them to better categories
```

---

## 🔥 Pro Tips

1. **Use Test Tools**: Populate sample data to test features quickly

2. **Bulk Import**: Select multiple movies at once when importing to categories

3. **Check Homepage**: After changes, always check the homepage to see the result

4. **Orphaned Movies**: Movies without categories won't show on homepage (intentional)

5. **Category Order**: Drag & drop categories to change homepage order

6. **Movie Badges**: Category badges on Movies page show where each movie appears

---

## ❓ Common Questions

**Q: Can a movie be in multiple categories?**  
A: Yes! That's the whole point of this update.

**Q: What happens if I delete a movie from Categories page?**  
A: It's removed from that category only. Use Movies page to delete permanently.

**Q: Can I create a movie without adding it to any category?**  
A: Yes! Create it on Movies page, then add to categories later.

**Q: Will this break my existing movies?**  
A: No! The migration preserves all existing data and relationships.

**Q: Can I undo the migration?**  
A: The migration is backward compatible. Old code still works.

---

## 🎉 You're Ready!

Start managing your movies with the new system. Enjoy the flexibility of many-to-many relationships!

**Need help?** Check `MOVIES_CATEGORIES_IMPLEMENTATION.md` for detailed documentation.
