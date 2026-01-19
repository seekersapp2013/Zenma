import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { useState } from "react";
import { toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";

export function BlogAdmin() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const posts = useQuery(api.pages.getAllPosts, { status: statusFilter });
  const blogStats = useQuery(api.pages.getBlogStats);
  const deletePage = useMutation(api.pages.deletePage);
  const updatePage = useMutation(api.pages.updatePage);

  const handleDelete = async (pageId: Id<"pages">, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePage({ pageId });
      toast.success("Post deleted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete post");
    }
  };

  const handleTogglePublish = async (pageId: Id<"pages">, currentStatus: boolean, title: string) => {
    try {
      await updatePage({ pageId, isPublished: !currentStatus });
      toast.success(`Post ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update post");
    }
  };

  // Filter posts by search query
  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout 
      currentPage="blog" 
      pageTitle="Blog Management"
      titleActions={
        <a 
          href="/admin/blog/new"
          className="header__action header__action--add"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#ff1493',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e6127f';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ff1493';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <i className="ti ti-plus"></i>
          <span>New Post</span>
        </a>
      }
    >
      <div className="container-fluid">
        <div className="row">
          {/* Stats Cards */}
          <div className="col-12">
            <div className="row">
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="stats">
                  <span>Total Posts</span>
                  <p>{blogStats?.total || 0}</p>
                  <i className="ti ti-file-text"></i>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <div className="stats">
                  <span>Published</span>
                  <p>{blogStats?.published || 0}</p>
                  <i className="ti ti-check"></i>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <div className="stats">
                  <span>Drafts</span>
                  <p>{blogStats?.drafts || 0}</p>
                  <i className="ti ti-edit"></i>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <div className="stats">
                  <span>Total Claps</span>
                  <p>{blogStats?.totalClaps || 0}</p>
                  <i className="ti ti-heart"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="col-12">
            <div className="main__filter">
              <form className="main__filter-search">
                <input 
                  type="text" 
                  placeholder="Search posts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button">
                  <i className="ti ti-search"></i>
                </button>
              </form>

              <div className="main__filter-wrap">
                <select 
                  className="main__select" 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All Posts</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>

                <a 
                  href="/admin/blog/new"
                  className="main__filter-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#ff1493',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginLeft: '10px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <i className="ti ti-plus"></i>
                  <span>New Post</span>
                </a>
              </div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="col-12">
            <div className="main__table-wrap">
              <table className="main__table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Author</th>
                    <th>Claps</th>
                    <th>Comments</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts === undefined ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        <p className="text-muted">No posts found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post._id}>
                        <td>
                          <div className="main__table-text">
                            <div>{post.title}</div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                              /{post.slug}
                            </div>
                          </div>
                        </td>
                        <td>
                          {post.isPublished ? (
                            <span className="main__table-badge main__table-badge--green">
                              Published
                            </span>
                          ) : (
                            <span className="main__table-badge main__table-badge--yellow">
                              Draft
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="main__table-text">{post.author.username}</div>
                        </td>
                        <td>
                          <div className="main__table-text">{post.totalClaps || 0}</div>
                        </td>
                        <td>
                          <div className="main__table-text">{post.commentCount || 0}</div>
                        </td>
                        <td>
                          <div className="main__table-text">{post.viewCount || 0}</div>
                        </td>
                        <td>
                          <div className="main__table-text">
                            {new Date(post._creationTime).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="main__table-btns">
                            <button
                              onClick={() => navigate(`/admin/blog/edit/${post._id}`)}
                              className="main__table-btn main__table-btn--edit"
                              title="Edit"
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                            {post.isPublished && (
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="main__table-btn main__table-btn--view"
                                title="View"
                              >
                                <i className="ti ti-eye"></i>
                              </a>
                            )}
                            <button
                              onClick={() => handleTogglePublish(post._id, post.isPublished, post.title)}
                              className={`main__table-btn ${post.isPublished ? 'main__table-btn--banned' : 'main__table-btn--active'}`}
                              title={post.isPublished ? 'Unpublish' : 'Publish'}
                            >
                              <i className={`ti ${post.isPublished ? 'ti-eye-off' : 'ti-check'}`}></i>
                            </button>
                            <button
                              onClick={() => handleDelete(post._id, post.title)}
                              className="main__table-btn main__table-btn--delete"
                              title="Delete"
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
