# Upload Troubleshooting Guide

## Issues Fixed

### 1. Schema Validation Errors
- **Problem**: Director field expected array but got string
- **Solution**: Updated schema and created migration function
- **Action**: Run `migrateExistingData` function as admin

### 2. Video Source Validation Errors  
- **Problem**: videoId field was null but validator expected storage ID
- **Solution**: Updated schema to allow null values for URL-only videos
- **Action**: Schema automatically handles this now

### 3. Upload Timeouts
- **Problem**: Large files timing out during upload
- **Solutions Applied**:
  - Reduced default file size limits (10MB images, 50MB videos)
  - Added retry mechanism with exponential backoff
  - Improved timeout handling (30s images, 1min videos, max 3min)
  - Added upload cancellation
  - Better error messages and progress tracking

## Current File Size Limits
- **Images**: 10MB (was 20MB)
- **Videos**: 50MB (was 200MB)
- **Timeout**: 30s for images, 1min for videos (max 3min)

## Recommended Actions

### 1. Run Migration (Admin Only)
```javascript
// In Convex dashboard, run these functions:
migrateExistingData()      // Fix existing director fields
seedActorsAndDirectors()   // Create sample actors/directors
updateItemsWithNewFields() // Ensure proper structure
```

### 2. Upload Best Practices
- **Keep files small**: Compress images/videos before upload
- **Use stable internet**: Avoid uploads on slow/unstable connections
- **Try URL method**: For large files, use direct URL instead of upload
- **Use cancel button**: If upload stalls, cancel and retry

### 3. If Upload Still Fails
1. **Check file size**: Ensure under limits (10MB images, 50MB videos)
2. **Check file format**: Use supported formats (JPG, PNG, GIF for images; MP4, WebM, MOV for videos)
3. **Try URL method**: Use "Use URL" option instead of file upload
4. **Check network**: Ensure stable internet connection
5. **Clear browser cache**: Sometimes helps with upload issues

## New Features Working
✅ Multiple directors selection from database
✅ Multiple cast selection from database  
✅ Improved upload with retry and cancellation
✅ Better error handling and user feedback
✅ Dynamic actor/director pages
✅ Proper schema migration

## Error Messages Explained
- **"File size exceeds maximum"**: File too large, compress or use URL
- **"Upload URL generation timeout"**: Server issue, try again
- **"Upload failed: Request timeout"**: Network/file too large, try smaller file
- **"Upload cancelled"**: User cancelled, can retry
- **"Network error"**: Internet connection issue