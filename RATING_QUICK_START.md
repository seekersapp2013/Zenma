# Dynamic Rating System - Quick Start Guide

## 🚀 Getting Started

### Step 1: Deploy the Changes

```bash
# Make sure Convex is running
npx convex dev
```

The schema changes will be automatically deployed.

### Step 2: Recalculate Existing Ratings

1. Open your app and login as admin
2. Navigate to **Admin Dashboard** → **Ratings** (or go to `/admin/ratings`)
3. Click the **"Recalculate All Ratings"** button
4. Wait for the process to complete (you'll see a success message)

### Step 3: Verify Everything Works

1. **Check Homepage**: Visit `/` and verify movie ratings are displayed
2. **Check Movies Page**: Visit `/movies` and verify ratings
3. **Check Detail Page**: Click on a movie and verify:
   - Rating is displayed on the cover
   - Rating breakdown shows in the metadata section
4. **Check Admin Dashboard**: Visit `/admin/ratings` to see analytics

## 📊 How It Works

### For Admins

**Setting Baseline Ratings:**
1. Go to **Admin** → **Categories** → Select a category
2. Click **"Add New Item"** or edit an existing item
3. Set the **"Rating (1-10)"** field
4. This becomes the admin baseline rating

**Monitoring Ratings:**
1. Visit `/admin/ratings` to see:
   - Total items with ratings
   - Items with user reviews
   - Most reviewed items
   - Biggest differences between admin and user ratings

### For Users

**Submitting Reviews:**
1. Go to any movie detail page
2. Scroll to the **Reviews** section
3. Fill in:
   - Review title
   - Rating (1-10 stars)
   - Review content
4. Click **"Send"**
5. The movie's dynamic rating will update automatically!

**Understanding Ratings:**
- Ratings are displayed on all movie cards
- On detail pages, you can see:
  - **Dynamic Rating**: The final calculated rating
  - **Admin Baseline**: The admin's expert rating
  - **User Reviews**: Number of user reviews and their average

## 🎯 Rating Algorithm Explained Simply

The system uses a smart algorithm that:

1. **Starts with admin rating** (100% influence when there are no reviews)
2. **Gradually incorporates user feedback** as reviews come in
3. **Maintains admin expertise** (always keeps at least 30% admin influence)

### Examples:

| Reviews | Admin Rating | User Avg | Dynamic Rating | Explanation |
|---------|-------------|----------|----------------|-------------|
| 0 | 8.5 | - | **8.5** | 100% admin rating |
| 5 | 8.5 | 7.0 | **8.0** | ~67% admin, 33% user |
| 10 | 8.5 | 7.0 | **7.8** | ~50% admin, 50% user |
| 50+ | 8.5 | 7.0 | **7.5** | ~30% admin, 70% user |

## 🎨 Rating Display

Ratings are color-coded for easy recognition:

- 🟢 **Green**: 8.0 - 10.0 (Excellent)
- 🟡 **Yellow**: 6.0 - 7.9 (Good)
- 🔴 **Red**: 0.0 - 5.9 (Poor)

## 🔧 Admin Dashboard Features

### Recalculate Ratings
- Manually trigger rating recalculation for all items
- Useful after algorithm changes or data fixes

### Analytics
- **Total Items**: Number of items with ratings
- **Items with Reviews**: How many have user feedback
- **Average Reviews**: Reviews per item

### Most Reviewed Items
- See which movies have the most user engagement
- Compare admin baseline vs user average
- View final dynamic ratings

### Biggest Differences
- Identify items where admin and users disagree most
- Useful for quality control and content review

## 📱 Where Ratings Appear

Dynamic ratings are displayed on:

✅ Homepage (all sections)
✅ Movies catalog page
✅ Search results
✅ Movie detail pages
✅ Related movies section
✅ Actor filmography
✅ Director filmography

## 🐛 Troubleshooting

### Ratings not showing?

1. **Check if item has a rating set**:
   - Edit the item in admin panel
   - Ensure "Rating" field has a value

2. **Recalculate ratings**:
   - Go to `/admin/ratings`
   - Click "Recalculate All Ratings"

3. **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Rating not updating after review?

1. **Check Convex dashboard** for errors
2. **Manually recalculate** from admin dashboard
3. **Verify review was saved** in Admin → Reviews

### Wrong rating displayed?

1. **Check rating breakdown** on detail page
2. **Verify calculations** in admin analytics
3. **Recalculate** if needed

## 💡 Tips & Best Practices

### For Admins:

1. **Set realistic baseline ratings** based on your expertise
2. **Monitor the analytics dashboard** regularly
3. **Check items with big differences** - they might need attention
4. **Encourage users to review** to get more accurate ratings

### For Content Strategy:

1. **Items with many reviews** = high user engagement
2. **Big admin/user differences** = potential quality issues or mismatched expectations
3. **Items with no reviews** = need promotion or are new

## 🎓 Understanding the Breakdown

On movie detail pages, you'll see something like:

```
Rating: 7.8/10
Based on admin baseline (8.5) + 12 user reviews (avg: 7.2)
```

This means:
- **Final rating**: 7.8 (what users see)
- **Admin set**: 8.5 (expert opinion)
- **Users rated**: 7.2 average from 12 reviews
- **Algorithm balanced** both to get 7.8

## 📈 Monitoring Success

Good signs your rating system is working:

✅ Users are submitting reviews
✅ Dynamic ratings reflect both admin and user input
✅ Ratings are displayed consistently across the site
✅ Analytics show engagement trends
✅ No major discrepancies between admin and user ratings

## 🔄 Regular Maintenance

**Weekly:**
- Check rating analytics
- Review items with biggest differences
- Monitor user review activity

**Monthly:**
- Recalculate all ratings (optional, but recommended)
- Review rating trends
- Adjust admin baselines if needed

**As Needed:**
- Recalculate after bulk data changes
- Update algorithm parameters if desired
- Review and moderate user reviews

## 🎉 You're All Set!

The dynamic rating system is now active and working. Users can submit reviews, and ratings will automatically update to reflect both your expert opinion and community feedback.

For detailed technical information, see `DYNAMIC_RATING_SYSTEM.md`.

---

**Need Help?** Check the troubleshooting section above or review the full documentation.
