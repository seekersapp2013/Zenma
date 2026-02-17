import { useEffect, useRef } from 'react';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import { Comments } from './components/Comments';
import { Reviews } from './components/Reviews';
import { Header } from './Header';
import { Footer } from './Footer';
import './sign.css';

export function ItemDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLVideoElement>(null);
  const plyrInstanceRef = useRef<any>(null);
  const item = useQuery(api.items.getItemBySlug, { slug: slug || "" });
  const relatedItems = useQuery(
    api.items.getRelatedItemsByGenre, 
    item ? { 
      genres: item.genres, 
      excludeItemId: item._id,
      limit: 6 
    } : "skip"
  );

  useEffect(() => {
    // Add video placeholder and player styles
    const style = document.createElement('style');
    style.textContent = `
      .video-placeholder {
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        text-align: center;
      }
      .video-placeholder__content {
        padding: 20px;
      }
      
      /* Video player container */
      .video-player-container {
        position: relative;
        width: 100%;
        border-radius: 6px;
        overflow: hidden;
        max-height: 300px;
      }
      
      .video-player-container video {
        max-height: 300px;
        object-fit: contain;
      }
      
      /* Override Plyr styles with magenta theme */
      .plyr--video .plyr__control.plyr__tab-focus,
      .plyr--video .plyr__control:hover,
      .plyr--video .plyr__control[aria-expanded="true"] {
        background: #ff1493 !important;
      }
      
      .plyr--video .plyr__control--overlaid {
        background-color: rgba(255, 20, 147, 0.8) !important;
        border-color: rgba(255, 20, 147, 0.3) !important;
        color: #fff !important;
      }
      
      .plyr--video .plyr__control--overlaid:hover,
      .plyr--video .plyr__control--overlaid.plyr__tab-focus {
        background-color: rgba(255, 20, 147, 0.9) !important;
        border-color: rgba(255, 20, 147, 0.5) !important;
      }
      
      .plyr--full-ui input[type="range"] {
        color: #ff1493 !important;
      }
      
      .plyr__progress__played {
        background-color: #ff1493 !important;
      }
      
      .plyr__volume--display {
        background: #ff1493 !important;
      }
      
      .plyr__menu__container .plyr__control[role="menuitemradio"][aria-checked="true"]::before {
        background-color: #ff1493 !important;
      }
      
      .plyr__video-wrapper {
        background: #222028 !important;
      }
      
      .plyr__poster {
        background-color: #222028 !important;
        background-size: cover !important;
        background-position: center !important;
      }
      
      .plyr--video {
        background: #222028 !important;
      }
    `;
    document.head.appendChild(style);
    style.setAttribute('data-itemdetails-styles', 'true');

    // Check if CSS files are already loaded to avoid duplicates
    const isStylesheetLoaded = (href: string) => {
      return document.querySelector(`link[href="${href}"]`) !== null;
    };

    // Non-essential CSS files that can load after
    const nonEssentialCssFiles = [
      '/css/splide.min.css',
      '/css/slimselect.css',
      '/css/plyr.css',
      '/css/photoswipe.css',
      '/css/default-skin.css'
    ];

    // Load non-essential CSS files after a short delay
    setTimeout(() => {
      nonEssentialCssFiles.forEach(href => {
        if (!isStylesheetLoaded(href)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          document.head.appendChild(link);
        }
      });
    }, 100);

    // Load JavaScript files with better error handling and ensure Plyr is loaded
    const jsFiles = [
      '/js/bootstrap.bundle.min.js',
      '/js/splide.min.js',
      '/js/slimselect.min.js',
      '/js/smooth-scrollbar.js',
      '/js/plyr.min.js', // Plyr must be loaded before main.js
      '/js/photoswipe.min.js',
      '/js/photoswipe-ui-default.min.js',
      '/js/main.js'
    ];

    // Load scripts sequentially to ensure proper order
    const loadScriptsSequentially = async () => {
      for (let i = 0; i < jsFiles.length; i++) {
        const src = jsFiles[i];
        if (!document.querySelector(`script[src="${src}"]`)) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Ensure sequential loading
            script.onload = () => resolve(void 0);
            script.onerror = () => {
              console.warn(`Failed to load script: ${src}`);
              resolve(void 0); // Continue even if one script fails
            };
            document.body.appendChild(script);
          });
        }
      }
    };

    loadScriptsSequentially();

    // Cleanup function
    return () => {
      // Remove added CSS links
      const links = document.querySelectorAll('link[href^="/css/"], link[href^="/webfont/"]');
      links.forEach(link => {
        if (link.getAttribute('data-added-by') !== 'other') {
          link.remove();
        }
      });
      
      // Remove added scripts
      const scripts = document.querySelectorAll('script[src^="/js/"]');
      scripts.forEach(script => {
        if (script.getAttribute('data-added-by') !== 'other') {
          script.remove();
        }
      });
      
      // Remove added styles
      const styles = document.querySelectorAll('style[data-itemdetails-styles]');
      styles.forEach(style => style.remove());
    };
  }, []);

  // Initialize Plyr video player
  useEffect(() => {
    if (!playerRef.current || !item?.videoSources || item.videoSources.length === 0) {
      return;
    }

    // Cleanup any existing player instance
    if (plyrInstanceRef.current) {
      try {
        plyrInstanceRef.current.destroy();
        plyrInstanceRef.current = null;
      } catch (error) {
        console.warn('Failed to destroy existing Plyr instance:', error);
      }
    }

    const initializePlayer = () => {
      if (!(window as any).Plyr || !playerRef.current) {
        return;
      }

      try {
        // Simple Plyr initialization matching the original template
        plyrInstanceRef.current = new (window as any).Plyr(playerRef.current, {
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'settings',
            'fullscreen'
          ],
          settings: ['quality', 'speed'],
          quality: {
            default: 720,
            options: item.videoSources?.map(source => parseInt(source.quality.replace('p', ''))) || []
          }
        });

        console.log('Plyr initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Plyr:', error);
      }
    };

    // Check if Plyr is already loaded
    if ((window as any).Plyr) {
      initializePlayer();
    } else {
      // Wait for Plyr to load with timeout
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      const checkPlyr = setInterval(() => {
        attempts++;
        if ((window as any).Plyr) {
          clearInterval(checkPlyr);
          initializePlayer();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkPlyr);
          console.warn('Plyr failed to load after 5 seconds');
        }
      }, 100);
    }

    // Cleanup function
    return () => {
      if (plyrInstanceRef.current) {
        try {
          plyrInstanceRef.current.destroy();
          plyrInstanceRef.current = null;
        } catch (error) {
          console.warn('Failed to destroy Plyr instance:', error);
        }
      }
    };
  }, [item?._id, item?.videoSources]);

  // Set page title and meta tags for SEO
  useEffect(() => {
    if (item) {
      document.title = `${item.title} - Zenma`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `Watch ${item.title} - ${item.genres.join(', ')} on Zenma`);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = `Watch ${item.title} - ${item.genres.join(', ')} on Zenma`;
        document.head.appendChild(meta);
      }

      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', item.title);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:title');
        meta.content = item.title;
        document.head.appendChild(meta);
      }

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && item.imageUrl) {
        ogImage.setAttribute('content', item.imageUrl);
      } else if (item.imageUrl) {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        meta.content = item.imageUrl;
        document.head.appendChild(meta);
      }
    }
  }, [item]);

  if (item === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
      </div>
    );
  }

  if (item === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#ff1493] text-white px-4 py-2 rounded-md hover:bg-[#d91a72] transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      {/* details */}
      <section className="section section--details">
        {/* details content */}
        <div className="container">
          <div className="row">
            {/* title */}
            <div className="col-12">
              <h1 className="section__title section__title--head">{item.title}</h1>
            </div>
            {/* end title */}

            {/* content */}
            <div className="col-12 col-xl-6">
              <div className="item item--details">
                <div className="row">
                  {/* card cover */}
                  <div className="col-4 col-sm-4 col-md-4 col-lg-3 col-xl-4 col-xxl-4">
                    <div className="item__cover">
                      <img src={item.imageUrl || ''} alt={item.title} />
                      <span className="item__rate item__rate--green">{item.rating || '8.4'}</span>
                      <button className="item__favorite item__favorite--static" type="button"><i className="ti ti-bookmark"></i></button>
                    </div>
                  </div>
                  {/* end card cover */}

                  {/* card content */}
                  <div className="col-8 col-sm-8 col-md-8 col-lg-9 col-xl-8 col-xxl-8">
                    <div className="item__content">
                      <ul className="item__meta" style={{ marginBottom: '8px' }}>
                        {item.directorsWithDetails && item.directorsWithDetails.length > 0 && (
                          <li>
                            <span>Director:</span> 
                            {item.directorsWithDetails.map((director, index) => (
                              <a key={director.slug} href={`/director/${director.slug}`}>
                                {director.name}
                              </a>
                            ))}
                          </li>
                        )}
                        <li><span>Genre:</span> 
                          {item.genres.map((genre, index) => (
                            <span key={genre}>
                              <a href={`/genre/${genre.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>{genre}</a>
                              {index < item.genres.length - 1 && ' '}
                            </span>
                          ))}
                        </li>
                        {item.premiereYear && (
                          <li><span>Premiere:</span> {item.premiereYear}</li>
                        )}
                        {item.runningTime && (
                          <li><span>Running time:</span> {item.runningTime} min</li>
                        )}
                        {item.country && (
                          <li><span>Country:</span> <a href="catalog.html">{item.country}</a></li>
                        )}
                      </ul>

                      <div className="item__description" style={{ marginTop: '5px', marginBottom: '10px' }}>
                        {item.description ? (
                          <p style={{ marginBottom: '0' }}>{item.description}</p>
                        ) : (
                          <p style={{ marginBottom: '0' }}>No description available.</p>
                        )}
                      </div>

                      {/* Cast section with images below description */}
                      {item.castWithDetails && item.castWithDetails.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Cast</h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start' }}>
                            {item.castWithDetails.map((actor) => (
                              <div key={actor.slug} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                                <a href={`/actor/${actor.slug}`} style={{ display: 'block', marginBottom: '4px' }}>
                                  {actor.imageUrl ? (
                                    <img 
                                      src={actor.imageUrl} 
                                      alt={actor.name}
                                      style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '4px',
                                        objectFit: 'cover',
                                        border: '2px solid #1a191f',
                                        transition: 'border-color 0.2s ease',
                                        display: 'block'
                                      }}
                                      onMouseOver={(e) => (e.currentTarget.style.borderColor = '#ff1493')}
                                      onMouseOut={(e) => (e.currentTarget.style.borderColor = '#1a191f')}
                                    />
                                  ) : (
                                    <div style={{
                                      width: '50px',
                                      height: '50px',
                                      borderRadius: '4px',
                                      background: 'linear-gradient(135deg, #1a191f 0%, #222028 100%)',
                                      border: '2px solid #1a191f',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#8b8b8b'
                                    }}>
                                      <i className="ti ti-user"></i>
                                    </div>
                                  )}
                                </a>
                                <a 
                                  href={`/actor/${actor.slug}`}
                                  style={{
                                    color: '#ff1493',
                                    textDecoration: 'none',
                                    fontSize: '11px',
                                    textAlign: 'center',
                                    lineHeight: '1.2',
                                    transition: 'color 0.2s ease',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    width: '100%',
                                    wordBreak: 'break-word'
                                  }}
                                  onMouseOver={(e) => (e.currentTarget.style.color = '#d91a72')}
                                  onMouseOut={(e) => (e.currentTarget.style.color = '#ff1493')}
                                >
                                  {actor.name}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* end card content */}
                </div>
              </div>
            </div>
            {/* end content */}

            {/* player */}
            <div className="col-12 col-xl-6">
              {item.videoSources && item.videoSources.length > 0 ? (
                <div className="video-player-container">
                  <video 
                    ref={playerRef}
                    controls 
                    crossOrigin="anonymous" 
                    playsInline 
                    poster={item.posterImageUrl ?? undefined} 
                    id="player"
                  >
                    {/* Video files */}
                    {item.videoSources.map((source, index) => (
                      <source 
                        key={index}
                        src={source.url ?? ""} 
                        type={source.type} 
                        {...({ 'data-size': source.quality.replace('p', '') } as any)}
                      />
                    ))}

                    {/* Caption files */}
                    {item.captions && item.captions.length > 0 && (
                      item.captions.map((caption, index) => (
                        <track 
                          key={index}
                          kind="captions" 
                          label={caption.label} 
                          srcLang={caption.srcLang} 
                          src={caption.src} 
                          {...(caption.default ? { default: true } : {})}
                        />
                      ))
                    )}

                    {/* Fallback for browsers that don't support the <video> element */}
                    <a href={item.videoSources[0]?.url ?? undefined} download>Download</a>
                  </video>
                </div>
              ) : (
                <div className="video-placeholder">
                  <div className="video-placeholder__content">
                    <i className="ti ti-video-off" style={{ fontSize: '48px', color: '#666' }}></i>
                    <p style={{ color: '#666', marginTop: '16px' }}>No video available</p>
                  </div>
                </div>
              )}
            </div>
            {/* end player */}
          </div>
        </div>
        {/* end details content */}
      </section>
      {/* end details */}

      {/* content */}
      <section className="content">
        <div className="content__head content__head--mt">
          <div className="container">
            <div className="row">
              <div className="col-12">
                {/* content title */}
                <h2 className="content__title">Discover</h2>
                {/* end content title */}

                {/* content tabs nav */}
                <ul className="nav nav-tabs content__tabs" id="content__tabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button id="1-tab" className="active" data-bs-toggle="tab" data-bs-target="#tab-1" type="button" role="tab" aria-controls="tab-1" aria-selected="true">Comments</button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button id="2-tab" data-bs-toggle="tab" data-bs-target="#tab-2" type="button" role="tab" aria-controls="tab-2" aria-selected="false">Reviews</button>
                  </li>
                </ul>
                {/* end content tabs nav */}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              {/* content tabs */}
              <div className="tab-content">
                <div className="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="1-tab" tabIndex={0}>
                  <Comments itemId={item._id} />
                </div>

                <div className="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="2-tab" tabIndex={0}>
                  <Reviews itemId={item._id} />
                </div>
              </div>
              {/* end content tabs */}
            </div>

            {/* sidebar */}
            <div className="col-12 col-lg-4">
              <div className="row">
                {/* section title */}
                <div className="col-12">
                  <h2 className="section__title section__title--sidebar">You may also like...</h2>
                </div>
                {/* end section title */}

                {/* dynamic related items */}
                {relatedItems && relatedItems.length > 0 ? (
                  relatedItems.map((relatedItem) => (
                    <div key={relatedItem._id} className="col-6 col-sm-4 col-lg-6">
                      <div className="item">
                        <div className="item__cover">
                          <img src={relatedItem.imageUrl || ''} alt={relatedItem.title} />
                          <a href={`/item/${relatedItem.slug}`} className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className={`item__rate ${
                            relatedItem.rating && relatedItem.rating >= 8 ? 'item__rate--green' :
                            relatedItem.rating && relatedItem.rating >= 6 ? 'item__rate--yellow' :
                            'item__rate--red'
                          }`}>
                            {relatedItem.rating || '8.4'}
                          </span>
                          <button className="item__favorite" type="button">
                            <i className="ti ti-bookmark"></i>
                          </button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title">
                            <a href={`/item/${relatedItem.slug}`}>{relatedItem.title}</a>
                          </h3>
                          <span className="item__category">
                            {relatedItem.genres.slice(0, 2).map((genre, index) => (
                              <span key={genre}>
                                <a href={`/genre/${genre.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}>{genre}</a>
                                {index < Math.min(relatedItem.genres.length, 2) - 1 && ' '}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <p className="text-center text-gray-500">No related items found.</p>
                  </div>
                )}
                {/* end dynamic related items */}
              </div>
            </div>
            {/* end sidebar */}
          </div>
        </div>
      </section>
      {/* end content */}

      <Footer />

      {/* Root element of PhotoSwipe. Must have class pswp. */}
      <div className="pswp" tabIndex={-1} role="dialog" aria-hidden="true">
        {/* Background of PhotoSwipe. 
        It's a separate element, as animating opacity is faster than rgba(). */}
        <div className="pswp__bg"></div>

        {/* Slides wrapper with overflow:hidden. */}
        <div className="pswp__scroll-wrap">
          {/* Container that holds slides. PhotoSwipe keeps only 3 slides in DOM to save memory. */}
          {/* don't modify these 3 pswp__item elements, data is added later on. */}
          <div className="pswp__container">
            <div className="pswp__item"></div>
            <div className="pswp__item"></div>
            <div className="pswp__item"></div>
          </div>

          {/* Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. */}
          <div className="pswp__ui pswp__ui--hidden">
            <div className="pswp__top-bar">
              {/*  Controls are self-explanatory. Order can be changed. */}
              <div className="pswp__counter"></div>

              <button className="pswp__button pswp__button--close" title="Close (Esc)"></button>

              <button className="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>

              {/* Preloader */}
              <div className="pswp__preloader">
                <div className="pswp__preloader__icn">
                  <div className="pswp__preloader__cut">
                    <div className="pswp__preloader__donut"></div>
                  </div>
                </div>
              </div>
            </div>

            <button className="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>

            <button className="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>

            <div className="pswp__caption">
              <div className="pswp__caption__center"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}