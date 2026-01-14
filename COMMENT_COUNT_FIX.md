# Comment Count Fix

## Changes Made

### 1. Updated BlogInteractionBar Component
- **File**: `src/components/BlogInteractionBar.tsx`
- **Changes**:
  - Replaced `ti ti-hand-click` icon with custom SVG hand icon (more reliable)
  - Added comment count display next to comment icon: `(X)` format
  - Comment count only shows when > 0
  - Both clap and comment icons have proper hover effects

### 2. Updated addPageComment Mutation
- **File**: `convex/comments.ts`
- **Changes**:
  - Added logic to increment `commentCount` on the page when a top-level comment is added
  - Only increments for top-level comments (not replies)
  - Uses `Math.max(0, ...)` to prevent negative counts

### 3. Updated deleteComment Mutation
- **File**: `convex/comments.ts`
- **Changes**:
  - Added logic to decrement `commentCount` on the page when a top-level comment is deleted
  - Only decrements for top-level comments on pages (checks `targetType === "page"`)
  - Uses `Math.max(0, ...)` to prevent negative counts
  - Properly handles the case where the page might not exist

## How It Works

### Comment Count Logic
1. **Adding a comment**:
   - When a user adds a top-level comment (not a reply), the `commentCount` field on the page is incremented by 1
   - Replies do NOT increment the count (only top-level comments count)

2. **Deleting a comment**:
   - When a user deletes their top-level comment, the `commentCount` is decremented by 1
   - Replies do NOT affect the count when deleted

3. **Display**:
   - BlogPost shows: "Responses (X)" where X is the commentCount
   - BlogInteractionBar shows: comment icon with "(X)" next to it
   - Both update automatically via Convex reactivity

### Reply Functionality
- Users can click "Reply" on any comment
- Reply form appears below the comment with pink border
- Replies are nested under parent comments
- Replies can be expanded/collapsed
- Replies do NOT count toward the main comment count (only top-level comments)

## Testing Checklist

- [ ] Add a top-level comment → count increases by 1
- [ ] Add a reply to a comment → count stays the same
- [ ] Delete a top-level comment → count decreases by 1
- [ ] Delete a reply → count stays the same
- [ ] Comment count shows in "Responses (X)" heading
- [ ] Comment count shows next to comment icon in interaction bar
- [ ] Clap icon displays correctly (hand SVG)
- [ ] Clap counter shows "X/100" format
- [ ] Comment icon scrolls to comments section when clicked

## Schema
The `commentCount` field already exists in the pages schema as optional:
```typescript
commentCount: v.optional(v.number())
```

## Deployment
Run:
```bash
npx convex deploy
```

The changes will take effect immediately. Existing pages will have `commentCount: undefined` which displays as 0.
