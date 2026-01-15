import { useEffect, useRef } from 'react';
import { useQuery } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import { Comments } from './components/Comments';
import { Reviews } from './components/Reviews';
import { SignOutButton } from './SignOutButton';
import './sign.css';

export function ItemDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLVideoElement>(null);
  const plyrInstanceRef = useRef<any>(null);
  const loggedInUser = useQuery(api.auth.loggedInUser);
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
      
      /* Custom video player styling to match poster height */
      .video-player-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 386px;
      }
      
      .video-player-container video,
      .video-player-container .plyr {
        width: 100% !important;
        height: 100% !important;
        min-height: 386px !important;
        object-fit: cover;
        border-radius: 6px;
      }
      
      /* Ensure consistent height at different breakpoints - override existing CSS */
      @media (min-width: 1200px) {
        .video-player-container {
          min-height: 386px;
        }
        .video-player-container video,
        .video-player-container .plyr,
        .video-player-container .plyr video {
          height: 386px !important;
          min-height: 386px !important;
          max-height: 386px !important;
        }
      }
      
      @media (min-width: 1400px) {
        .video-player-container {
          min-height: 366px;
        }
        .video-player-container video,
        .video-player-container .plyr,
        .video-player-container .plyr video {
          height: 366px !important;
          min-height: 366px !important;
          max-height: 366px !important;
        }
      }
      
      /* Ensure video wrapper maintains height */
      .video-player-container .plyr__video-wrapper {
        height: 100% !important;
        min-height: inherit !important;
      }
      
      /* Maintain aspect ratio while filling container */
      .video-player-container .plyr__video-wrapper video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
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
      
      .plyr--video .plyr__control--overlaid:before {
        background-color: #ff1493 !important;
        color: #fff !important;
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
      
      /* Ensure video maintains aspect ratio and fills container */
      .plyr__video-wrapper {
        background: #222028 !important;
        height: 100% !important;
      }
      
      .plyr__poster {
        background-color: #222028 !important;
        background-size: cover !important;
        background-position: center !important;
      }
      
      .plyr--video {
        background: #222028 !important;
        height: 100% !important;
      }
      
      /* Professional People List Styling */
      .item__meta-directors,
      .item__meta-cast {
        display: flex !important;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .item__meta-directors > span,
      .item__meta-cast > span {
        flex-shrink: 0;
        min-width: fit-content;
      }
      
      /* Cast section below description */
      .item__cast-section {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #2a2937;
      }
      
      .item__cast-title {
        color: #fff;
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .item__people-scroll-container {
        max-height: 200px;
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: 0;
        padding-right: 5px;
        flex: 1;
        /* Custom scrollbar styling */
        scrollbar-width: thin;
        scrollbar-color: #ff1493 #222028;
      }
      
      .item__people-scroll-container::-webkit-scrollbar {
        width: 6px;
      }
      
      .item__people-scroll-container::-webkit-scrollbar-track {
        background: #222028;
        border-radius: 3px;
      }
      
      .item__people-scroll-container::-webkit-scrollbar-thumb {
        background: #ff1493;
        border-radius: 3px;
      }
      
      .item__people-scroll-container::-webkit-scrollbar-thumb:hover {
        background: #d91a72;
      }
      
      .item__people-list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        align-items: start;
        justify-items: center;
      }
      
      .item__person {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: transform 0.2s ease;
        width: 100%;
        max-width: 70px;
      }
      
      .item__person:hover {
        transform: translateY(-2px);
      }
      
      .item__person-avatar-link {
        display: block;
        text-decoration: none;
        margin-bottom: 0.5rem;
      }
      
      .item__person-avatar {
        width: 50px;
        height: 50px;
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        background: #222028;
        border: 2px solid #1a191f;
        transition: border-color 0.2s ease;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .item__person:hover .item__person-avatar {
        border-color: #ff1493;
      }
      
      .item__person-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      
      .item__person-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1a191f 0%, #222028 100%);
        color: #8b8b8b;
        font-size: 1.2rem;
      }
      
      .item__person-name {
        font-size: 0.7rem;
        color: #fff;
        text-decoration: none;
        line-height: 1.2;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        transition: color 0.2s ease;
      }
      
      .item__person-name:hover {
        color: #ff1493;
        text-decoration: none;
      }
      
      /* Responsive adjustments */
      @media (max-width: 767px) {
        .item__people-list {
          gap: 0.5rem;
        }
        
        .item__person {
          max-width: 65px;
        }
        
        .item__person-avatar {
          width: 45px;
          height: 45px;
        }
        
        .item__person-name {
          font-size: 0.65rem;
        }
        
        .item__people-scroll-container {
          max-height: 180px;
        }
      }
      
      @media (max-width: 575px) {
        .item__people-list {
          grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;
        }
        
        .item__person {
          max-width: 60px;
        }
        
        .item__person-avatar {
          width: 40px;
          height: 40px;
        }
        
        .item__person-placeholder {
          font-size: 1rem;
        }
        
        .item__person-name {
          font-size: 0.6rem;
        }
        
        .item__people-scroll-container {
          max-height: 160px;
        }
      }
      
      @media (max-width: 480px) {
        .item__people-list {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .item__person {
          max-width: 80px;
        }
        
        .item__person-avatar {
          width: 45px;
          height: 45px;
        }
        
        .item__person-name {
          font-size: 0.65rem;
        }
      }
    `;
    document.head.appendChild(style);

    // Check if CSS files are already loaded to avoid duplicates
    const isStylesheetLoaded = (href: string) => {
      return document.querySelector(`link[href="${href}"]`) !== null;
    };

    // Essential CSS files that should load immediately
    const essentialCssFiles = [
      '/css/bootstrap.min.css',
      '/css/main.css',
      '/webfont/tabler-icons.min.css'
    ];

    // Non-essential CSS files that can load after
    const nonEssentialCssFiles = [
      '/css/splide.min.css',
      '/css/slimselect.css',
      '/css/plyr.css',
      '/css/photoswipe.css',
      '/css/default-skin.css'
    ];

    // Load essential CSS files first
    essentialCssFiles.forEach(href => {
      if (!isStylesheetLoaded(href)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'all';
        document.head.appendChild(link);
      }
    });

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
      const styles = document.querySelectorAll('style');
      styles.forEach(style => {
        if (style.textContent?.includes('.video-placeholder') || style.textContent?.includes('.video-player-container')) {
          style.remove();
        }
      });
    };
  }, []);

  // Initialize Plyr video player
  useEffect(() => {
    if (playerRef.current && item?.videoSources && item.videoSources.length > 0) {
      // Wait for Plyr to be available
      const initializePlayer = () => {
        if ((window as any).Plyr && !plyrInstanceRef.current) {
          try {
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
              },
              ratio: null, // Let CSS handle the sizing
              fullscreen: {
                enabled: true,
                fallback: true,
                iosNative: false
              }
            });

            // Force height consistency after Plyr initialization
            setTimeout(() => {
              if (plyrInstanceRef.current && playerRef.current) {
                const plyrElement = playerRef.current.closest('.plyr');
                if (plyrElement) {
                  const container = plyrElement.closest('.video-player-container');
                  if (container) {
                    const containerHeight = window.getComputedStyle(container).height;
                    (plyrElement as HTMLElement).style.height = containerHeight;
                    (plyrElement as HTMLElement).style.minHeight = containerHeight;
                    (plyrElement as HTMLElement).style.maxHeight = containerHeight;
                  }
                }
              }
            }, 100);

            // Add resize observer to maintain height consistency
            if (playerRef.current) {
              const container = playerRef.current.closest('.video-player-container');
              if (container && window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => {
                  if (plyrInstanceRef.current && playerRef.current) {
                    const plyrElement = playerRef.current.closest('.plyr');
                    if (plyrElement && container) {
                      const containerHeight = window.getComputedStyle(container).height;
                      (plyrElement as HTMLElement).style.height = containerHeight;
                      (plyrElement as HTMLElement).style.minHeight = containerHeight;
                      (plyrElement as HTMLElement).style.maxHeight = containerHeight;
                    }
                  }
                });
                resizeObserver.observe(container);
                
                // Store observer for cleanup
                (plyrInstanceRef.current as any)._resizeObserver = resizeObserver;
              }
            }
          } catch (error) {
            console.warn('Failed to initialize Plyr:', error);
          }
        }
      };

      // Check if Plyr is already loaded
      if ((window as any).Plyr) {
        initializePlayer();
      } else {
        // Wait for Plyr to load
        const checkPlyr = setInterval(() => {
          if ((window as any).Plyr) {
            clearInterval(checkPlyr);
            initializePlayer();
          }
        }, 100);

        // Cleanup interval after 10 seconds
        setTimeout(() => clearInterval(checkPlyr), 10000);
      }
    }

    // Cleanup function
    return () => {
      if (plyrInstanceRef.current) {
        try {
          // Cleanup resize observer
          if ((plyrInstanceRef.current as any)._resizeObserver) {
            (plyrInstanceRef.current as any)._resizeObserver.disconnect();
          }
          
          plyrInstanceRef.current.destroy();
          plyrInstanceRef.current = null;
        } catch (error) {
          console.warn('Failed to destroy Plyr instance:', error);
        }
      }
    };
  }, [item?.videoSources]);

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
      {/* header */}
      <header className="header">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="header__content">
                {/* header logo */}
                <a href="/" className="header__logo">
                 <h1><span className="logo-zen">ZEN</span><span className="logo-ma">MA</span></h1>
                </a>
                {/* end header logo */}

                {/* header nav */}
                <ul className="header__nav">
                  <li className="header__nav-item">
                    <a href="/" className="header__nav-link">Home</a>
                  </li>
                  <li className="header__nav-item">
                    <a href="/catalog" className="header__nav-link">Catalog</a>
                  </li>
                  <li className="header__nav-item">
                    <a href="/pricing" className="header__nav-link">Pricing plan</a>
                  </li>
                </ul>
                {/* end header nav */}

                {/* header auth */}
                <div className="header__auth">
                  <form action="#" className="header__search">
                    <input className="header__search-input" type="text" placeholder="Search..." />
                    <button className="header__search-button" type="button">
                      <i className="ti ti-search"></i>
                    </button>
                    <button className="header__search-close" type="button">
                      <i className="ti ti-x"></i>
                    </button>
                  </form>

                  <button className="header__search-btn" type="button">
                    <i className="ti ti-search"></i>
                  </button>

                  <div className="header__lang">
                    <a className="header__nav-link" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      EN <i className="ti ti-chevron-down"></i>
                    </a>
                    <ul className="dropdown-menu header__dropdown-menu">
                      <li><a href="#">English</a></li>
                      <li><a href="#">Spanish</a></li>
                      <li><a href="#">French</a></li>
                    </ul>
                  </div>

                  <div className="header__profile">
                    <Authenticated>
                      <div 
                        className="header__sign-in header__sign-in--user" 
                        role="button"
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                      >
                        <i className="ti ti-user"></i>
                        <span>
                          {loggedInUser?.profile?.username || loggedInUser?.name || 'User'}
                        </span>
                      </div>
                      <ul className="dropdown-menu dropdown-menu-end header__dropdown-menu header__dropdown-menu--user">
                        <li><a href="/profile"><i className="ti ti-ghost"></i>Profile</a></li>
                        <li><a href="/profile"><i className="ti ti-stereo-glasses"></i>Subscription</a></li>
                        <li><a href="/profile"><i className="ti ti-bookmark"></i>Favorites</a></li>
                        <li><a href="/profile"><i className="ti ti-settings"></i>Settings</a></li>
                        {loggedInUser?.profile?.role === "admin" && (
                          <li><a href="/admin-dashboard"><i className="ti ti-settings-cog"></i>Admin Dashboard</a></li>
                        )}
                        <li><SignOutButton variant="dropdown" /></li>
                      </ul>
                    </Authenticated>
                    <Unauthenticated>
                      <a className="header__sign-in header__sign-in--user" href="/login" role="button">
                        <i className="ti ti-user"></i>
                        <span>Login</span>
                      </a>
                    </Unauthenticated>
                  </div>
                </div>
                {/* end header auth */}

                <button className="header__btn" type="button">
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* end header */}

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
                  <div className="col-12 col-sm-5 col-md-5 col-lg-4 col-xl-6 col-xxl-5">
                    <div className="item__cover">
                      <img src={item.imageUrl || ''} alt={item.title} />
                      <span className="item__rate item__rate--green">{item.rating || '8.4'}</span>
                      <button className="item__favorite item__favorite--static" type="button"><i className="ti ti-bookmark"></i></button>
                    </div>
                  </div>
                  {/* end card cover */}

                  {/* card content */}
                  <div className="col-12 col-md-7 col-lg-8 col-xl-6 col-xxl-7">
                    <div className="item__content">
                      <ul className="item__meta">
                        {item.directorsWithDetails && item.directorsWithDetails.length > 0 && (
                          <li className="item__meta-directors">
                            <span>Directors:</span>
                            <div className="item__people-scroll-container">
                              <div className="item__people-list">
                                {item.directorsWithDetails.map((director, index) => (
                                  <div key={director.name} className="item__person">
                                   
                                    <a 
                                      href={`/director/${director.slug}`} 
                                      className="item__person-name"
                                      title={director.name}
                                    >
                                      {director.name}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </li>
                        )}
                        <li><span>Genre:</span> 
                          {item.genres.map((genre, index) => (
                            <span key={genre}>
                              <a href="catalog.html">{genre}</a>
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

                      <div className="item__description">
                        {item.description ? (
                          <p>{item.description}</p>
                        ) : (
                          <p>No description available.</p>
                        )}
                      </div>

                      {/* Cast section moved below description */}
                      {item.castWithDetails && item.castWithDetails.length > 0 && (
                        <div className="item__cast-section">
                          <h4 className="item__cast-title">Cast</h4>
                          <div className="item__people-scroll-container">
                            <div className="item__people-list">
                              {item.castWithDetails.map((actor, index) => (
                                <div key={`${actor.name}-${actor.castName || index}`} className="item__person">
                                  <a 
                                    href={`/actor/${actor.slug}`} 
                                    className="item__person-avatar-link"
                                    title={`${actor.name}${actor.castName ? ` as ${actor.castName}` : ''}`}
                                  >
                                    <div className="item__person-avatar">
                                      {actor.imageUrl ? (
                                        <img 
                                          src={actor.imageUrl} 
                                          alt={actor.name}
                                          className="item__person-image"
                                        />
                                      ) : (
                                        <div className="item__person-placeholder">
                                          <i className="ti ti-user"></i>
                                        </div>
                                      )}
                                    </div>
                                  </a>
                                  <div className="item__person-info">
                                    {actor.castName && (
                                      <div className="item__person-character" title={`Character: ${actor.castName}`}>
                                        {actor.castName}
                                      </div>
                                    )}
                                    <a 
                                      href={`/actor/${actor.slug}`} 
                                      className="item__person-name"
                                      title={actor.name}
                                    >
                                      {actor.name}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
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
                                <a href="#">{genre}</a>
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

      {/* footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="footer__content">
                <a href="/" className="footer__logo">
                 <h1><span className="logo-zen">ZEN</span><span className="logo-ma">MA</span></h1>
                </a>

                <span className="footer__copyright">© ZENMA, 2019—2024 <br /> Create by <a href="https://themeforest.net/user/dmitryvolkov/portfolio" target="_blank">Dmitry Volkov</a></span>

                <nav className="footer__nav">
                  <a href="/about">About Us</a>
                  <a href="/contacts">Contacts</a>
                  <a href="/privacy">Privacy policy</a>
                </nav>

                <button className="footer__back" type="button">
                  <i className="ti ti-arrow-narrow-up"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* end footer */}

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