import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Blog() {
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get("tag") || undefined;
  
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  
  const posts = useQuery(api.pages.getPublishedPosts, { 
    sortBy,
    tag: tagFilter,
    limit: 20 
  });
  const allTags = useQuery(api.pages.getAllTags);

  useEffect(() => {
    // Load JS files
    const jsFiles = [
      '/js/bootstrap.bundle.min.js',
      '/js/main.js'
    ];

    jsFiles.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }, []);

  return (
    <>
      <Header />
      
      {/* Page Title */}
      <section className="section section--first" style={{ paddingTop: '30px', paddingBottom: '20px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section__title-wrap">
                <h1 className="section__title section__title--head" style={{ marginBottom: '10px' }}>
                  <span style={{ color: '#ff1493' }}>ZEN</span>
                  <span style={{ color: '#ffffff' }}>MA</span> Blog
                </h1>
                <p className="section__text" style={{ marginBottom: '0' }}>Insights, tutorials, and stories from our team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="section" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="main__filter" style={{ marginBottom: '0' }}>
                <div className="main__filter-wrap">
                  {/* Tag Filters */}
                  <div className="filter" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0' }}>
                    <a
                      href="/blog"
                      className={`filter__item ${!tagFilter ? 'filter__item--active' : ''}`}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        backgroundColor: !tagFilter ? '#ff1493' : 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        textDecoration: 'none',
                        fontSize: '13px',
                        border: !tagFilter ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s'
                      }}
                    >
                      All Posts
                    </a>
                    {allTags?.slice(0, 8).map(tag => (
                      <a
                        key={tag}
                        href={`/blog?tag=${tag}`}
                        className={`filter__item ${tagFilter === tag ? 'filter__item--active' : ''}`}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '20px',
                          backgroundColor: tagFilter === tag ? '#ff1493' : 'rgba(255, 255, 255, 0.05)',
                          color: '#fff',
                          textDecoration: 'none',
                          fontSize: '13px',
                          border: tagFilter === tag ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s'
                        }}
                      >
                        {tag}
                      </a>
                    ))}
                  </div>

                  {/* Sort Dropdown */}
                  <select 
                    className="main__select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Clapped</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section" style={{ paddingTop: '20px' }}>
        <div className="container">
          <div className="row row--grid">
            {posts === undefined ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p style={{ fontSize: '1.2rem', color: '#999' }}>
                  {tagFilter ? `No posts found with tag "${tagFilter}"` : 'No posts published yet'}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="col-6 col-sm-4 col-lg-3 col-xl-2">
                  <div className="item">
                    <div className="item__cover">
                      <img 
                        src={post.coverImageUrl || '/img/placeholder.jpg'} 
                        alt={post.title}
                        onError={(e) => {
                          e.currentTarget.src = '/img/placeholder.jpg';
                        }}
                      />
                      <a href={`/blog/${post.slug}`} className="item__play">
                        <i className="ti ti-book"></i>
                      </a>
                      <span className="item__rate item__rate--green">
                        <i className="ti ti-heart"></i> {post.totalClaps}
                      </span>
                    </div>
                    <div className="item__content">
                      <h3 className="item__title">
                        <a href={`/blog/${post.slug}`}>{post.title}</a>
                      </h3>
                      <ul className="item__list">
                        <li>
                          <i className="ti ti-user"></i> {post.author.username}
                        </li>
                        <li>
                          <i className="ti ti-clock"></i> {post.readingTimeMinutes} min
                        </li>
                      </ul>
                      {post.excerpt && (
                        <p className="item__description" style={{ 
                          fontSize: '13px',
                          color: '#c0c0c0',
                          marginTop: '8px',
                          marginBottom: '8px',
                          lineHeight: '1.4'
                        }}>
                          {post.excerpt.length > 80 ? post.excerpt.substring(0, 80) + '...' : post.excerpt}
                        </p>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div style={{ marginTop: '8px', marginBottom: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {post.tags.slice(0, 2).map(tag => (
                            <span 
                              key={tag}
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                backgroundColor: 'rgba(255, 20, 147, 0.2)',
                                color: '#ff1493',
                                borderRadius: '8px'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ 
                        marginTop: '8px',
                        fontSize: '11px',
                        color: '#666',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <span>
                          <i className="ti ti-message"></i> {post.commentCount || 0}
                        </span>
                        <span>
                          <i className="ti ti-eye"></i> {post.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
