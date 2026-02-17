# Wizard Images & Videos Display Fix

## Issue
When editing a movie in the wizard, existing images and videos were not displayed, making it unclear what media was already uploaded.

## Solution
Added visual display of existing media in the edit wizard with clear indicators and the ability to replace them.

## Changes Made

### 1. Updated ItemFormData Interface (`src/ItemWizard.tsx`)

Added `imageUrl` field to store the URL of the existing cover image:

```typescript
interface ItemFormData {
  title: string;
  imageId: Id<"_storage"> | null;
  imageUrl?: string; // NEW: For displaying existing image
  genres: string[];
  // ... rest of fields
}
```

### 2. Updated MovieWizard (`src/MovieWizard.tsx`)

Now passes the `imageUrl` along with other initial data:

```typescript
setInitialData({
  title: existingMovie.title,
  imageId: existingMovie.imageId,
  imageUrl: existingMovie.imageUrl, // NEW: Include URL for display
  genres: existingMovie.genres,
  // ... rest of fields
});
```

### 3. Enhanced Step 1: Cover Image Display

Added visual display of the current cover image when editing:

**Features:**
- Shows current cover image in a styled container
- Displays image with max dimensions (200x300px)
- Clear label "Current cover image:"
- Orange warning text: "Upload a new image below to replace it"
- Upload button below for replacement

**Visual Structure:**
```
┌─────────────────────────────────────┐
│ Current cover image:                │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │     [Cover Image Preview]       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ ⚠️ Upload a new image below to      │
│    replace it                       │
└─────────────────────────────────────┘
[Upload New Image Button]
```

### 4. Enhanced Step 3: Poster Image Display

Added visual display of the current poster image when editing:

**Features:**
- Shows current poster image in a styled container
- Displays image with max dimensions (300x200px)
- Handles both URL-based and storage-based posters
- Shows storage ID if URL not available
- Clear replacement instructions

**Visual Structure:**
```
┌─────────────────────────────────────┐
│ Current poster image:               │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │    [Poster Image Preview]       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ ⚠️ Upload a new image below to      │
│    replace it                       │
└─────────────────────────────────────┘
[Upload New Poster Image]
```

### 5. Enhanced Step 3: Video Sources Display

Reorganized video sources section to show existing videos clearly:

**Features:**
- Lists all existing video sources at the top
- Shows quality, type, and source (uploaded vs URL)
- Each video has a remove button
- Clear separator with "Add new video source:" label
- Upload section below for adding more videos

**Visual Structure:**
```
Current video sources:
┌─────────────────────────────────────┐
│ 1080p - URL: https://... (video/mp4) [×] │
│ 720p - Uploaded Video (video/mp4)    [×] │
│ 480p - URL: https://... (video/mp4)  [×] │
└─────────────────────────────────────┘

⚠️ Add new video source:
[Upload/URL Input] [Quality] [Type] [+]
```

## User Experience Improvements

### Before
- ❌ No indication of existing media
- ❌ Unclear if media was already uploaded
- ❌ Risk of accidentally re-uploading same media
- ❌ No way to verify current media

### After
- ✅ Clear display of all existing media
- ✅ Visual preview of images
- ✅ List of all video sources with details
- ✅ Clear instructions for replacement
- ✅ Ability to remove individual videos
- ✅ Organized layout separating existing vs new media

## Visual Design

### Color Scheme
- **Background containers**: `#222028` (dark gray)
- **Borders**: `#404040` (medium gray)
- **Text labels**: `#b3b3b3` (light gray)
- **Warning text**: `#ff9800` (orange)
- **Borders**: `1px solid #404040`
- **Border radius**: `8px` for modern look

### Layout
- Consistent padding: `10px`
- Proper spacing between elements
- Responsive image sizing
- Clear visual hierarchy

## Testing Checklist

### Step 1: Cover Image
- [x] Edit existing movie
- [x] Navigate to Step 1
- [x] Verify cover image is displayed
- [x] Verify image has proper dimensions
- [x] Verify warning text is visible
- [x] Upload new image
- [x] Verify new image replaces old one

### Step 3: Poster Image
- [x] Edit movie with poster image
- [x] Navigate to Step 3
- [x] Verify poster image is displayed
- [x] Verify proper dimensions
- [x] Upload new poster
- [x] Verify replacement works

### Step 3: Video Sources
- [x] Edit movie with video sources
- [x] Navigate to Step 3
- [x] Verify all video sources are listed
- [x] Verify quality and type are shown
- [x] Verify URL/Upload indicator is correct
- [x] Click remove on a video
- [x] Verify video is removed from list
- [x] Add new video source
- [x] Verify it's added to the list

## Files Modified

1. `src/ItemWizard.tsx`
   - Added `imageUrl` to interface
   - Added cover image display in Step 1
   - Added poster image display in Step 3
   - Reorganized video sources display in Step 3

2. `src/MovieWizard.tsx`
   - Added `imageUrl` to initialData

## Benefits

✅ **Better UX**: Users can see what's already uploaded  
✅ **Prevents Confusion**: Clear indication of existing media  
✅ **Saves Time**: No need to re-upload if media is correct  
✅ **Professional Look**: Polished, organized interface  
✅ **Easy Management**: Can remove individual videos  
✅ **Clear Instructions**: Orange warnings guide users  

## Result

The edit wizard now provides complete visibility into existing media, making it easy to:
- Verify what's already uploaded
- Replace specific media items
- Remove unwanted videos
- Add additional video sources
- Understand the current state of the movie

Users can now confidently edit movies knowing exactly what media is already associated with them! 🎉
