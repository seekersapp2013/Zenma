import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useParams } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import './sign.css';

export function Genre() {
  const { slug } = useParams<{ slug: string }>();
  const genre = useQuery(api.genres.getGenreBySlug, { slug: slug || "" });
  const allItems = useQuery(api.items.getAllItems);
  const actors = useQuery(api.actors.getActors);
  const directors = useQuery(api.directors.getDirectors);

  // Helper function to convert genre name to slug
  const genreToSlug = (genreName: string) => {
    return genreName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };
  
  // Filter items by genre name
  const genreMovies = allItems?.filter(item => 
    genre && item.genres && item.genres.includes(genre.name)
  );

  // Filter states
  const [filterActor, setFilterActor] = useState<string>("All");
  const [filterDirector, setFilterDirector] = useState<string>("All");
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  
  const ITEMS_PER_LOAD = 10;
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Non-essential CSS files that can load after
  const nonEssentialCssFiles = [
    '/css/splide.min.css',
    '/css/slimselect.css',
    '/css/plyr.css',
    '/css/photoswipe.css',
    '/css/default-skin.css'
  ];

  const jsFiles = [
    '/js/bootstrap.bundle.min.js',
    '/js/splide.min.js',
    '/js/slimselect.min.js',
    '/js/smooth-scrollbar.js',
    '/js/plyr.min.js',
    '/js/photoswipe.min.js',
    '/js/photoswipe-ui-default.min.js',
    '/js/main.js'
  ];

  // Check if CSS files are already loaded to avoid duplicates
  const isStylesheetLoaded = (href: string) => {
    return document.querySelector(`link[href="${href}"]`) !== null;
  };

  useEffect(() => {
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

    // Load JavaScript files with better error handling
    const loadScript = (src: string, index: number) => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onerror = () => console.warn(`Failed to load script: ${src}`);
        
        setTimeout(() => {
          document.body.appendChild(script);
        }, index * 50);
      }
    };

    jsFiles.forEach((src, index) => {
      loadScript(src, index);
    });

    return () => {
      const links = document.querySelectorAll('link[href^="/css/"], link[href^="/webfont/"]');
      links.forEach(link => {
        if (link.getAttribute('data-added-by') !== 'other') {
          link.remove();
        }
      });
      
      const scripts = document.querySelectorAll('script[src^="/js/"]');
      scripts.forEach(script => {
        if (script.getAttribute('data-added-by') !== 'other') {
          script.remove();
        }
      });
    };
  }, []);

  // Get filtered items
  const getFilteredItems = () => {
    if (!genreMovies) return [];

    let filtered = [...genreMovies];

    // Apply Actor filter
    if (filterActor !== "All") {
      filtered = filtered.filter((item: any) => 
        item.cast && item.cast.some((c: any) => c.actorName === filterActor)
      );
    }

    // Apply Director filter
    if (filterDirector !== "All") {
      filtered = filtered.filter((item: any) => 
        item.director && item.director.includes(filterDirector)
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();
  const displayedItems = filteredItems.slice(0, displayedItemsCount);
  const hasMoreItems = displayedItemsCount < filteredItems.length;

  // Load more items function
  const loadMoreItems = () => {
    if (hasMoreItems && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setDisplayedItemsCount(prev => prev + ITEMS_PER_LOAD);
        setIsLoadingMore(false);
      }, 300);
    }
  };

  // Reset displayed items when filters change
  useEffect(() => {
    setDisplayedItemsCount(10);
  }, [filterActor, filterDirector]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreItems && !isLoadingMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
      observer.disconnect();
    };
  }, [hasMoreItems, isLoadingMore, displayedItemsCount]);

  // Show loading state
  if (genre === undefined || allItems === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
      </div>
    );
  }

  // Show not found state
  if (!slug || genre === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {!slug ? "No Genre Selected" : "Genre Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {!slug 
              ? "Please select a genre to view movies." 
              : "The genre you're looking for doesn't exist."
            }
          </p>
          <a href="/" className="bg-[#ff1493] text-white px-4 py-2 rounded-md hover:bg-[#d91a72] transition-colors">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Critical CSS for immediate rendering */}
      <style>{`
        .home__title {
          color: #fff !important;
          text-transform: uppercase !important;
          font-weight: 300 !important;
          font-size: 32px !important;
          line-height: 42px !important;
          margin: 0 !important;
          padding-right: 100px !important;
        }
        .home__title b {
          font-weight: 600 !important;
        }
        
        @media (min-width: 768px) {
          .home__title {
            font-size: 36px !important;
            padding-right: 120px !important;
          }
        }
        @media (min-width: 1200px) {
          .home__title {
            font-size: 42px !important;
          }
        }
        
        .item {
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
        }
        .item__cover {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          aspect-ratio: 2/3;
          width: 100%;
        }
        .item__cover img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <Header />

      {/* Movies Section */}
      <div className="section section--catalog" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section__title-wrap" style={{ marginBottom: '20px' }}>
                <h1 className="home__title">
                  {genre.name} <b>Movies</b>
                </h1>
                {genre.description && (
                  <p style={{ color: '#b3b3b3', marginTop: '10px', fontSize: '16px' }}>
                    {genre.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="filter__dropdowns" style={{ 
                display: 'flex', 
                gap: '15px', 
                flexWrap: 'wrap',
                marginBottom: '40px'
              }}>
                {/* Actor Filter */}
                <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#fff', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Filter by Actor
                  </label>
                  <select 
                    value={filterActor}
                    onChange={(e) => setFilterActor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      backgroundColor: '#28282d',
                      color: '#fff',
                      border: '1px solid #3d3d42',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    disabled={!actors || actors.length === 0}
                  >
                    <option value="All">All Actors</option>
                    {actors && actors.map((actor) => (
                      <option key={actor._id} value={actor.name}>{actor.name}</option>
                    ))}
                  </select>
                </div>

                {/* Director Filter */}
                <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#fff', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Filter by Director
                  </label>
                  <select 
                    value={filterDirector}
                    onChange={(e) => setFilterDirector(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      backgroundColor: '#28282d',
                      color: '#fff',
                      border: '1px solid #3d3d42',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    disabled={!directors || directors.length === 0}
                  >
                    <option value="All">All Directors</option>
                    {directors && directors.map((director) => (
                      <option key={director._id} value={director.name}>{director.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div style={{ 
                color: '#b3b3b3', 
                fontSize: '14px', 
                marginBottom: '20px' 
              }}>
                Showing {displayedItems.length} of {filteredItems.length} results
              </div>
            </div>
          </div>

          <div className="row">
            {displayedItems.length > 0 ? (
              displayedItems.map((item: any) => (
                <div key={item._id} className="col-6 col-sm-4 col-lg-3 col-xl-2">
                  <div className="item">
                    <div className="item__cover">
                      <img src={item.imageUrl} alt={item.title} />
                      <a href={`/details/${item.slug}`} className="item__play">
                        <i className="ti ti-player-play-filled"></i>
                      </a>
                      <span className={`item__rate ${
                        (item.dynamicRating || item.adminRating || item.rating) >= 8 ? 'item__rate--green' :
                        (item.dynamicRating || item.adminRating || item.rating) >= 6 ? 'item__rate--yellow' :
                        'item__rate--red'
                      }`}>
                        {item.dynamicRating?.toFixed(1) || item.adminRating?.toFixed(1) || item.rating?.toFixed(1) || 'N/A'}
                      </span>
                      <button className="item__favorite" type="button">
                        <i className="ti ti-bookmark"></i>
                      </button>
                    </div>
                    <div className="item__content">
                      <h3 className="item__title">
                        <a href={`/details/${item.slug}`}>{item.title}</a>
                      </h3>
                      <span className="item__category">
                        {item.genres.map((genre: string) => (
                          <a key={genre} href={`/genre/${genreToSlug(genre)}`}>{genre}</a>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#b3b3b3'
                }}>
                  <i className="ti ti-search" style={{ fontSize: '48px', marginBottom: '20px', display: 'block' }}></i>
                  <h3 style={{ color: '#fff', marginBottom: '10px' }}>No results found</h3>
                  <p>Try adjusting your filters to find what you're looking for.</p>
                </div>
              </div>
            )}
          </div>

          {/* Lazy Loading Sentinel */}
          {hasMoreItems && (
            <div ref={sentinelRef} style={{ height: '20px', margin: '20px 0' }} />
          )}

          {/* Loading Indicator */}
          {isLoadingMore && (
            <div className="row">
              <div className="col-12">
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  color: '#b3b3b3'
                }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]" style={{
                    margin: '0 auto',
                    width: '32px',
                    height: '32px',
                    border: '2px solid transparent',
                    borderTopColor: '#ff1493',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ marginTop: '10px' }}>Loading more movies...</p>
                </div>
              </div>
            </div>
          )}

          {/* Load More Button (Fallback) */}
          {hasMoreItems && !isLoadingMore && (
            <div className="row">
              <div className="col-12">
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '40px',
                  marginBottom: '40px'
                }}>
                  <button
                    onClick={loadMoreItems}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: '#ff1493',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e01180'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff1493'}
                  >
                    Load More ({filteredItems.length - displayedItemsCount} remaining)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No More Results */}
          {!hasMoreItems && displayedItems.length > 0 && (
            <div className="row">
              <div className="col-12">
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#b3b3b3'
                }}>
                  <p>You've reached the end of the results</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
