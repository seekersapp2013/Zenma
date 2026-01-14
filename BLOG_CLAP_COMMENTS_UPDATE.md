# Blog Clap & Comments Update

## Changes Made

### 1. Increased Clap Limit to 100
- **Backend (convex/claps.ts)**:
  - Changed max claps from 50 to 100 per user per post
  - Updated validation and error messages
  - Updated getUserClaps to return remaining out of 100

### 2. New BlogInteractionBar Component
- **File**: `src/components/BlogInteractionBar.tsx`
- **Features**:
  - Horizontal layout matching the design image
  - Clap button with hand icon showing "X/100" format
  - Comment icon (scrolls to comments section)
  - Email share button
  - Twitter/X share button
  - Bookmark button (placeholder for future feature)
  - Shows total claps below the bar
  - ZENMA theme colors (#ff1493 pink, dark backgrounds)
  - Hover effects on all icons

### 3. Generic Comments Component
- **File**: `src/components/GenericComments.tsx`
- **Features**:
  - Works with both items AND pages (blog posts)
  - Uses targetId/targetType system
  - Reuses existing comment functionality (replies, quotes, edit, delete, voting)
  - No code duplication - adapted from existing Comments component
  - Supports pagination
  - Full comment thread functionality

### 4. Backend Support for Page Comments
- **File**: `convex/comments.ts`
- **Added Functions**:
  - `getPageComments` - Query to get comments for a blog post
  - `addPageComment` - Mutation to add comments to blog posts
  - Uses `by_target_and_created` index for efficient queries
  - Maintains all existing comment features (banned words, user profiles, replies, quotes)

### 5. Updated BlogPost.tsx
- Replaced old ClapButton with new BlogInteractionBar
- Removed placeholder share section
- Added GenericComments component for full comment functionality
- Comments section now fully functional with all features

## Design Improvements

### Interaction Bar Design
- Clean horizontal layout
- Icons: hand (clap), message (comment), mail (email), X (twitter), bookmark
- "X/100" format shows user's claps vs max
- Total claps displayed below
- All icons have hover effects (turn pink #ff1493)
- Minimal, professional appearance

### Theme Consistency
- Uses ZENMA colors throughout (#ff1493 pink, #0a0a0a dark)
- Matches existing site design
- Smooth transitions and hover effects

## How to Deploy

1. Deploy the backend changes:
   ```bash
   npx convex deploy
   ```

2. The frontend will automatically use the new components

## Testing Checklist

- [ ] Clap limit is 100 (not 50)
- [ ] Interaction bar displays correctly with all icons
- [ ] Clap counter shows "X/100" format
- [ ] Comment icon scrolls to comments section
- [ ] Share buttons work (email, twitter)
- [ ] Comments can be added to blog posts
- [ ] Comments support replies, quotes, edit, delete
- [ ] Comment voting works
- [ ] Pagination works for comments
- [ ] Banned words filter works in comments

## Notes

- The bookmark feature is a placeholder (shows "coming soon" toast)
- Comments use the same styling as item comments for consistency
- All existing comment features work on blog posts (replies, quotes, voting, etc.)
- The targetId/targetType system allows comments to work on both items and pages
