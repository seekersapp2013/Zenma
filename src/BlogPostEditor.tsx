import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";

export function BlogPostEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const existingPost = useQuery(
    api.pages.getPostForEdit,
    id ? { pageId: id as Id<"pages"> } : "skip"
  );

  const createPage = useMutation(api.pages.createPage);
  const updatePage = useMutation(api.pages.updatePage);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getImageUrl = useMutation(api.files.getImageUrl);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    tags: "",
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coverImageId, setCoverImageId] = useState<Id<"_storage"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing post data
  useEffect(() => {
    if (existingPost) {
      setFormData({
        title: existingPost.title || "",
        slug: existingPost.slug || "",
        excerpt: existingPost.excerpt || "",
        content: existingPost.content || "",
        coverImageUrl: existingPost.coverImageUrl || "",
        tags: existingPost.tags?.join(", ") || "",
      });
    }
  }, [existingPost]);

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }));
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      
      // Get the URL for the uploaded image
      const imageUrl = await getImageUrl({ storageId });

      if (imageUrl) {
        setCoverImageId(storageId);
        setFormData(prev => ({ ...prev, coverImageUrl: imageUrl }));
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Please enter a slug");
      return;
    }

    setIsPublishing(true);

    try {
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (isEditing && id) {
        await updatePage({
          pageId: id as Id<"pages">,
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || undefined,
          content: formData.content || undefined,
          coverImageUrl: formData.coverImageUrl || undefined,
          tags,
          isPublished: publish,
        });
        toast.success(publish ? "Post published successfully!" : "Post saved as draft!");
      } else {
        const pageId = await createPage({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || undefined,
          content: formData.content || undefined,
          coverImageUrl: formData.coverImageUrl || undefined,
          tags,
        });

        if (publish) {
          await updatePage({
            pageId,
            isPublished: true,
          });
        }

        toast.success(publish ? "Post published successfully!" : "Post created as draft!");
      }

      navigate("/admin/blog");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save post");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AdminLayout 
      currentPage="blog" 
      pageTitle={isEditing ? "Edit Post" : "New Post"}
      titleActions={
        <div className="d-flex gap-2">
          <button 
            onClick={() => navigate('/admin/blog')}
            className="header__action"
          >
            <i className="ti ti-arrow-left"></i>
            <span>Back</span>
          </button>
        </div>
      }
    >
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-lg-8">
            <form className="sign__form sign__form--profile">
              <div className="row">
                <div className="col-12">
                  <h4 className="sign__title">Post Content</h4>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label" htmlFor="title">
                      Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      className="sign__input"
                      placeholder="Enter post title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label" htmlFor="slug">
                      Slug * <small className="text-muted">(URL: /blog/{formData.slug || 'your-post-slug'})</small>
                    </label>
                    <input
                      id="slug"
                      type="text"
                      className="sign__input"
                      placeholder="your-post-slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label" htmlFor="excerpt">
                      Excerpt <small className="text-muted">(Short summary for blog feed)</small>
                    </label>
                    <textarea
                      id="excerpt"
                      className="sign__textarea"
                      placeholder="A brief summary of your post..."
                      rows={3}
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label" htmlFor="content">
                      Content *
                    </label>
                    <textarea
                      id="content"
                      className="sign__textarea"
                      placeholder="Write your post content here... (Markdown supported)"
                      rows={15}
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      required
                    />
                    <small className="text-muted">
                      Tip: Use Markdown formatting (# for headings, ** for bold, * for italic, etc.)
                    </small>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="col-12 col-lg-4">
            <form className="sign__form sign__form--profile">
              <div className="row">
                <div className="col-12">
                  <h4 className="sign__title">Post Settings</h4>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label" htmlFor="coverImage">
                      Cover Image
                    </label>
                    
                    {/* Upload Button */}
                    <div className="mb-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="sign__btn"
                        style={{ 
                          width: '100%',
                          backgroundColor: '#ff1493',
                          marginBottom: '10px'
                        }}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="ti ti-upload me-2"></i>
                            Upload Image
                          </>
                        )}
                      </button>
                      <small className="text-muted d-block mb-2">
                        Or paste an image URL below (Max 5MB)
                      </small>
                    </div>

                    {/* URL Input */}
                    <input
                      id="coverImage"
                      type="url"
                      className="sign__input"
                      placeholder="https://example.com/image.jpg"
                      value={formData.coverImageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                    />
                    
                    {/* Image Preview */}
                    {formData.coverImageUrl && (
                      <div className="mt-3">
                        <img 
                          src={formData.coverImageUrl} 
                          alt="Cover preview" 
                          style={{ 
                            width: '100%',
                            borderRadius: '8px',
                            maxHeight: '300px',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label" htmlFor="tags">
                      Tags <small className="text-muted">(comma-separated)</small>
                    </label>
                    <input
                      id="tags"
                      type="text"
                      className="sign__input"
                      placeholder="javascript, react, tutorial"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex flex-column gap-2">
                    <button
                      type="button"
                      className="sign__btn"
                      onClick={() => handleSave(true)}
                      disabled={isPublishing}
                    >
                      <i className="ti ti-check"></i>
                      <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
                    </button>

                    <button
                      type="button"
                      className="sign__btn"
                      style={{ backgroundColor: '#6c757d' }}
                      onClick={() => handleSave(false)}
                      disabled={isPublishing}
                    >
                      <i className="ti ti-device-floppy"></i>
                      <span>{isPublishing ? 'Saving...' : 'Save as Draft'}</span>
                    </button>

                    <button
                      type="button"
                      className="sign__btn"
                      style={{ backgroundColor: '#dc3545' }}
                      onClick={() => navigate('/admin/blog')}
                      disabled={isPublishing}
                    >
                      <i className="ti ti-x"></i>
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
