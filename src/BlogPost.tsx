import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BlogInteractionBar } from "./components/BlogInteractionBar";
import { GenericComments } from "./components/GenericComments";

export function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const post = useQuery(api.pages.getPostBySlug, { slug: slug || "" });
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const relatedPosts = useQuery(api.pages.getPublishedPosts, { 
    limit: 3,
    sortBy: "newest"
  });
  const incrementViewCount = useMutation(api.pages.incrementViewCount);

  // Increment view count when post loads
  useEffect(() => {
    if (post && post._id) {
      incrementViewCount({ pageId: post._id }).catch(() => {
        // Silently fail if view count increment fails
      });
    }
  }, [post?._id]);

  if (post === undefined) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#1a1a1a',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
        <p style={{ fontSize: '1.2rem', color: '#999', marginBottom: '2rem' }}>
          Post not found
        </p>
        <button 
          className="btn btn-primary"
          style={{ backgroundColor: '#ff1493', borderColor: '#ff1493' }}
          onClick={() => navigate('/blog')}
        >
          Back to Blog
        </button>
      </div>
    );
  }

  // Enhanced markdown-like rendering with better styling
  const renderContent = (content: string) => {
    if (!content) return null;

    return content.split('\n').map((line, index) => {
      // Headings
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} style={{ 
            marginTop: '2.5rem',
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '-0.01em'
          }}>
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} style={{ 
            marginTop: '3rem',
            marginBottom: '1.2rem',
            fontSize: '1.8rem',
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '-0.01em'
          }}>
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} style={{ 
            marginTop: '3rem',
            marginBottom: '1.5rem',
            fontSize: '2.2rem',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.02em'
          }}>
            {line.substring(2)}
          </h1>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} style={{ height: '1.5rem' }} />;
      }

      // Code blocks (simple)
      if (line.startsWith('```')) {
        return null; // Skip code fence markers for now
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={index} style={{ 
            marginBottom: '0.8rem',
            lineHeight: '1.8',
            color: '#e0e0e0',
            marginLeft: '1.5rem'
          }}>
            {line.trim().substring(2)}
          </li>
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <li key={index} style={{ 
            marginBottom: '0.8rem',
            lineHeight: '1.8',
            color: '#e0e0e0',
            marginLeft: '1.5rem'
          }}>
            {line.trim().replace(/^\d+\.\s/, '')}
          </li>
        );
      }

      // Blockquotes
      if (line.trim().startsWith('> ')) {
        return (
          <blockquote key={index} style={{
            borderLeft: '3px solid #ff1493',
            paddingLeft: '1.5rem',
            marginLeft: 0,
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            fontStyle: 'italic',
            color: '#b0b0b0',
            fontSize: '1.1rem'
          }}>
            {line.trim().substring(2)}
          </blockquote>
        );
      }

      // Regular paragraphs with inline formatting
      let processedLine = line;
      
      // Bold text **text**
      processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #fff; font-weight: 600;">$1</strong>');
      
      // Italic text *text*
      processedLine = processedLine.replace(/\*(.+?)\*/g, '<em style="color: #f0f0f0;">$1</em>');
      
      // Inline code `code`
      processedLine = processedLine.replace(/`(.+?)`/g, '<code style="background-color: rgba(255, 20, 147, 0.1); color: #ff1493; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');

      return (
        <p key={index} style={{ 
          marginBottom: '1.5rem',
          lineHeight: '1.8',
          color: '#e0e0e0',
          fontSize: '1.125rem'
        }} dangerouslySetInnerHTML={{ __html: processedLine }} />
      );
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a',
      color: '#fff'
    }}>
      {/* Navigation Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '65px',
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 20, 147, 0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px'
      }}>
        <a href="/blog" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>
            <span style={{ color: '#ff1493' }}>ZEN</span>
            <span style={{ color: '#ffffff' }}>MA</span>
          </h1>
          <span style={{ color: '#666', fontSize: '1.2rem' }}>|</span>
          <span style={{ color: '#999', fontSize: '0.9rem', fontWeight: 500 }}>Blog</span>
        </a>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/blog" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
             onMouseEnter={(e) => e.currentTarget.style.color = '#ff1493'}
             onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>
            All Posts
          </a>
          {loggedInUser && (
            <a href="/dashboard" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
               onMouseEnter={(e) => e.currentTarget.style.color = '#ff1493'}
               onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>
              Dashboard
            </a>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '65px' }}>
        <article style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '60px 20px'
        }}>
          {/* Title */}
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: '20px',
            color: '#fff',
            letterSpacing: '-0.02em'
          }}>
            {post.title}
          </h1>

          {/* Meta Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
            paddingBottom: '30px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#ff1493',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#fff'
              }}>
                {(post.author.name || post.author.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#fff' }}>
                  {post.author.name || post.author.username}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '2px' }}>
                  {new Date(post.publishedAt || post._creationTime).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {' · '}
                  {post.readingTimeMinutes || 5} min read
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImageUrl && (
            <div style={{ 
              marginBottom: '50px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <img 
                src={post.coverImageUrl} 
                alt={post.title}
                style={{ 
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div style={{
            fontSize: '1.125rem',
            lineHeight: '1.8',
            color: '#e0e0e0',
            marginBottom: '60px'
          }}>
            {renderContent(post.content || '')}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ 
              marginBottom: '50px',
              paddingTop: '30px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Topics
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {post.tags.map(tag => (
                  <a
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: 'rgba(255, 20, 147, 0.1)',
                      color: '#ff1493',
                      borderRadius: '20px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      border: '1px solid rgba(255, 20, 147, 0.2)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 20, 147, 0.2)';
                      e.currentTarget.style.borderColor = '#ff1493';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 20, 147, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 20, 147, 0.2)';
                    }}
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Interaction Bar (Clap, Comment, Share, Bookmark) */}
          <BlogInteractionBar 
            pageId={post._id}
            totalClaps={post.totalClaps || 0}
            commentCount={post.commentCount || 0}
            isAuthenticated={!!loggedInUser}
          />

          {/* Comments Section */}
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#fff' }}>
              Responses ({post.commentCount || 0})
            </h3>
            <GenericComments 
              targetId={post._id}
              targetType="page"
            />
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 1 && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '80px 20px'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h3 style={{ 
                fontSize: '1.8rem',
                marginBottom: '40px',
                color: '#fff',
                textAlign: 'center'
              }}>
                More from <span style={{ color: '#ff1493' }}>ZENMA</span>
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px'
              }}>
                {relatedPosts.filter(p => p.slug !== slug).slice(0, 3).map((relatedPost) => (
                  <a
                    key={relatedPost._id}
                    href={`/blog/${relatedPost.slug}`}
                    style={{
                      textDecoration: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.borderColor = 'rgba(255, 20, 147, 0.3)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 20, 147, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {relatedPost.coverImageUrl && (
                      <img 
                        src={relatedPost.coverImageUrl} 
                        alt={relatedPost.title}
                        style={{ 
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div style={{ padding: '25px' }}>
                      <h4 style={{ 
                        color: '#fff',
                        fontSize: '1.2rem',
                        marginBottom: '10px',
                        lineHeight: 1.4
                      }}>
                        {relatedPost.title}
                      </h4>
                      {relatedPost.excerpt && (
                        <p style={{ 
                          color: '#999',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          marginBottom: '15px'
                        }}>
                          {relatedPost.excerpt.substring(0, 100)}...
                        </p>
                      )}
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        fontSize: '0.85rem',
                        color: '#666'
                      }}>
                        <span>
                          <i className="ti ti-heart" style={{ marginRight: '5px', color: '#ff1493' }}></i>
                          {relatedPost.totalClaps}
                        </span>
                        <span>
                          {relatedPost.readingTimeMinutes} min read
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
