# How to Create Your First Blog Post

## Step 1: Navigate to Blog Admin

Go to one of these URLs:
- `/blog-admin` (direct)
- `/dashboard` → Click "Blog" card

## Step 2: Click "New Post" Button

You'll see a **bright pink button** labeled "New Post" with a plus icon:
- **Location 1**: Top right of the page (in the header)
- **Location 2**: Next to the "All Posts" dropdown filter

The button looks like this:
```
[+] New Post
```
Color: Bright pink (#ff1493)

## Step 3: Fill in the Post Form

You'll see a form with two columns:

### Left Column (Main Content):
1. **Title** * (required)
   - Example: "Getting Started with React"
   - The slug will auto-generate as you type

2. **Slug** * (required)
   - Auto-generated from title
   - Example: `getting-started-with-react`
   - You can edit it if needed
   - This becomes the URL: `/blog/your-slug`

3. **Excerpt**
   - Short summary (150-200 characters)
   - Shows in the blog feed
   - Example: "Learn the basics of React in this beginner-friendly tutorial"

4. **Content** * (required)
   - Your main post content
   - Supports basic Markdown:
     ```markdown
     # Main Heading
     ## Subheading
     ### Smaller Heading
     
     Regular paragraph text.
     
     **Bold text** and *italic text*
     
     - Bullet point 1
     - Bullet point 2
     ```

### Right Column (Settings):
1. **Cover Image URL**
   - Paste an image URL
   - Example: `https://images.unsplash.com/photo-...`
   - Preview shows below the input

2. **Tags**
   - Comma-separated
   - Example: `react, javascript, tutorial, beginners`
   - Used for filtering in the blog feed

## Step 4: Save or Publish

Three buttons at the bottom:

1. **Publish** (Green)
   - Makes the post live immediately
   - Visible at `/blog` and `/blog/your-slug`

2. **Save as Draft** (Gray)
   - Saves without publishing
   - Only visible to admins
   - You can publish later

3. **Cancel** (Red)
   - Discards changes
   - Returns to blog admin

## Example First Post

Here's a simple example to get started:

**Title:**
```
Welcome to Our Blog
```

**Slug:** (auto-generated)
```
welcome-to-our-blog
```

**Excerpt:**
```
We're excited to launch our new blog! Stay tuned for updates, tutorials, and insights.
```

**Content:**
```markdown
# Welcome to Our Blog!

We're thrilled to announce the launch of our new blog platform.

## What to Expect

Here's what you can look forward to:

- **Tutorials**: Step-by-step guides
- **Updates**: Latest news and features
- **Insights**: Tips and best practices

## Get Started

Start exploring our content and don't forget to clap if you enjoy a post!

**Thank you for reading!**
```

**Cover Image URL:**
```
https://images.unsplash.com/photo-1499750310107-5fef28a66643
```

**Tags:**
```
announcement, welcome, blog
```

## Step 5: View Your Post

After publishing:

1. **View in Admin**
   - Go back to `/blog-admin`
   - You'll see your post in the table

2. **View Public Page**
   - Click the eye icon in the actions column
   - Or go to `/blog/welcome-to-our-blog`

3. **View in Blog Feed**
   - Go to `/blog`
   - Your post appears in the grid

## Tips

1. **Use Good Images**
   - Free images: unsplash.com, pexels.com
   - Recommended size: 1200x630px

2. **Write Engaging Excerpts**
   - This is what users see first
   - Make it compelling!

3. **Use Tags Wisely**
   - 3-5 tags per post
   - Use consistent tags across posts
   - Lowercase, no special characters

4. **Save Drafts Often**
   - Use "Save as Draft" while writing
   - Publish when ready

5. **Preview Before Publishing**
   - Save as draft first
   - View the draft (eye icon)
   - Make adjustments
   - Then publish

## Troubleshooting

### "New Post" button not visible?
- Refresh the page
- Clear browser cache (Ctrl+Shift+R)
- Check you're logged in as admin

### Can't save post?
- Check all required fields (marked with *)
- Ensure slug is unique
- Check browser console for errors (F12)

### Post not showing in feed?
- Make sure you clicked "Publish" (not just "Save as Draft")
- Check the status in the admin table
- Refresh the `/blog` page

---

**Ready to create your first post? Click that pink "New Post" button!** 🚀
