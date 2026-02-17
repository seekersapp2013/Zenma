import { useEffect, useState, useMemo } from 'react';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Header } from "./Header";
import { Footer } from "./Footer";
import './sign.css';

interface HomePageProps {
  background?: boolean;
}

export function DynamicHomePage({ background = true }: HomePageProps) {
  const categoriesWithItems = useQuery(api.items.getAllItemsWithCategories);
  const actors = useQuery(api.actors.getActors);
  const directors = useQuery(api.directors.getDirectors);

  // Helper function to convert genre name to slug
  const genreToSlug = (genreName: string) => {
    return genreName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Filter states
  const [filterType, setFilterType] = useState<string>("All");
  const [filterGenre, setFilterGenre] = useState<string>("All");
  const [filterActor, setFilterActor] = useState<string>("All");
  const [filterDirector, setFilterDirector] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("default");
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
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

    // Load JavaScript files in sequence to ensure proper initialization
    const loadScriptsSequentially = async () => {
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

      for (const src of jsFiles) {
        if (!document.querySelector(`script[src="${src}"]`)) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Load in order
            script.onload = () => {
              console.log(`Loaded: ${src}`);
              resolve();
            };
            script.onerror = () => {
              console.warn(`Failed to load script: ${src}`);
              resolve(); // Continue even if one fails
            };
            document.body.appendChild(script);
          });
          
          // Small delay between scripts
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // After all scripts loaded, reinitialize carousels
      setTimeout(() => {
        if (typeof (window as any).Splide !== 'undefined') {
          console.log('Reinitializing Splide carousels...');
          
          // Initialize home carousel
          const homeCarousel = document.querySelector('.splide--home');
          if (homeCarousel && !(homeCarousel as any).splide) {
            try {
              const splideInstance = new (window as any).Splide('.splide--home', {
                type: 'loop',
                perPage: 4,
                perMove: 1,
                gap: 20,
                pagination: false,
                arrows: false, // Disable default arrows since we're using custom ones
                breakpoints: {
                  1200: { perPage: 3 },
                  768: { perPage: 2 },
                  576: { perPage: 1 }
                }
              }).mount();
              
              // Connect custom arrows
              const prevBtn = document.querySelector('.home .splide__arrow--prev');
              const nextBtn = document.querySelector('.home .splide__arrow--next');
              
              if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', () => splideInstance.go('<'));
                nextBtn.addEventListener('click', () => splideInstance.go('>'));
              }
              
              console.log('Home carousel initialized with custom arrows');
            } catch (e) {
              console.error('Error initializing home carousel:', e);
            }
          }

          // Initialize content carousels
          document.querySelectorAll('.splide--content').forEach((carousel) => {
            if (!(carousel as any).splide) {
              try {
                new (window as any).Splide(carousel, {
                  type: 'loop',
                  perPage: 6,
                  perMove: 1,
                  gap: 20,
                  pagination: false,
                  breakpoints: {
                    1200: { perPage: 4 },
                    768: { perPage: 3 },
                    576: { perPage: 2 }
                  }
                }).mount();
                console.log('Content carousel initialized');
              } catch (e) {
                console.error('Error initializing content carousel:', e);
              }
            }
          });
        }
      }, 500);
    };

    loadScriptsSequentially();

    // Cleanup function
    return () => {
      // Destroy Splide instances
      document.querySelectorAll('.splide').forEach((carousel) => {
        if ((carousel as any).splide) {
          try {
            (carousel as any).splide.destroy();
          } catch (e) {
            console.warn('Error destroying carousel:', e);
          }
        }
      });
    };
  }, [categoriesWithItems]);

  const formatTitle = (title: string) => {
    return title.replace(/<b>(.*?)<\/b>/g, '<b>$1</b>');
  };

  // Format large numbers (e.g., 2300 -> 2.3K)
  const formatCount = (count: number | undefined): string => {
    if (!count) return '0';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const renderFeaturedSection = (category: any) => (
    <div className={background ? 'sign' : ''} key={category._id}>
      <section className="home home--bg" style={{ position: 'relative', zIndex: 2 }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <h1 
                  className="home__title" 
                  style={{ paddingRight: 0, margin: 0 }}
                  dangerouslySetInnerHTML={{ __html: formatTitle(category.title) }}
                />
                <div className="splide__arrows" style={{ 
                  position: 'static',
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button className="splide__arrow splide__arrow--prev" type="button" style={{
                    position: 'static',
                    transform: 'none'
                  }}>
                    <i className="ti ti-chevron-left"></i>
                  </button>
                  <button className="splide__arrow splide__arrow--next" type="button" style={{
                    position: 'static',
                    transform: 'none'
                  }}>
                    <i className="ti ti-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="home__carousel splide splide--home">
                <div className="splide__track">
                  <ul className="splide__list">
                    {category.items.map((item: any) => (
                      <li key={item._id} className="splide__slide">
                        <div className="item item--hero">
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
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // Extract unique genres from all items
  const allGenres = useMemo(() => {
    if (!categoriesWithItems) return [];
    const genres = new Set<string>();
    categoriesWithItems.forEach(category => {
      category.items.forEach((item: any) => {
        item.genres.forEach((genre: string) => genres.add(genre));
      });
    });
    return Array.from(genres).sort();
  }, [categoriesWithItems]);

  // Filter and paginate items for the second category (full section)
  const getFilteredAndPaginatedItems = (category: any) => {
    if (!category.items) return { items: [], totalPages: 0 };

    let filtered = [...category.items];

    // Apply Type filter
    if (filterType !== "All") {
      if (filterType === "Movies") {
        // Keep all items (assuming all items in this section are movies)
        filtered = filtered;
      } else if (filterType === "Actors") {
        // Filter items that have the selected actor
        filtered = filtered.filter((item: any) => 
          item.cast && item.cast.some((c: any) => c.actorName === filterActor)
        );
      } else if (filterType === "Directors") {
        // Filter items that have the selected director
        filtered = filtered.filter((item: any) => 
          item.director && item.director.includes(filterDirector)
        );
      }
    }

    // Apply Genre filter
    if (filterGenre !== "All") {
      filtered = filtered.filter((item: any) => 
        item.genres && item.genres.includes(filterGenre)
      );
    }

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

    // Apply sorting
    if (sortBy !== "default") {
      filtered.sort((a: any, b: any) => {
        switch (sortBy) {
          case "rating-high":
            const ratingA = a.dynamicRating || a.adminRating || a.rating || 0;
            const ratingB = b.dynamicRating || b.adminRating || b.rating || 0;
            return ratingB - ratingA;
          case "rating-low":
            const ratingA2 = a.dynamicRating || a.adminRating || a.rating || 0;
            const ratingB2 = b.dynamicRating || b.adminRating || b.rating || 0;
            return ratingA2 - ratingB2;
          case "release-new":
            const dateA = a.releaseDate || a.addedDate || 0;
            const dateB = b.releaseDate || b.addedDate || 0;
            return dateB - dateA;
          case "release-old":
            const dateA2 = a.releaseDate || a.addedDate || 0;
            const dateB2 = b.releaseDate || b.addedDate || 0;
            return dateA2 - dateB2;
          case "popularity":
            const popA = a.popularityScore || a.viewCount || 0;
            const popB = b.popularityScore || b.viewCount || 0;
            return popB - popA;
          case "title-az":
            return a.title.localeCompare(b.title);
          case "title-za":
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
    }

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { items: paginatedItems, totalPages, totalItems: filtered.length };
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterGenre, filterActor, filterDirector, sortBy]);

  const renderFullSection = (category: any) => {
    const { items: filteredItems, totalPages, totalItems } = getFilteredAndPaginatedItems(category);
    
    return (
    <div className="section section--catalog" key={category._id}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section__title-wrap">
              <h1 
                className="home__title" 
                dangerouslySetInnerHTML={{ __html: formatTitle(category.title) }}
              />
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
              marginBottom: '30px'
            }}>
              {/* Sort By */}
              <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#fff', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Sort By
                </label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
                >
                  <option value="default">Default</option>
                  <option value="rating-high">Rating (High to Low)</option>
                  <option value="rating-low">Rating (Low to High)</option>
                  <option value="release-new">Release Date (Newest)</option>
                  <option value="release-old">Release Date (Oldest)</option>
                  <option value="popularity">Popularity</option>
                  <option value="title-az">Title (A-Z)</option>
                  <option value="title-za">Title (Z-A)</option>
                </select>
              </div>

              {/* Type Filter */}
              <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#fff', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Filter by Type
                </label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
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
                >
                  <option value="All">All</option>
                  <option value="Movies">Movies</option>
                  <option value="Actors">Actors</option>
                  <option value="Directors">Directors</option>
                </select>
              </div>

              {/* Genre Filter */}
              <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#fff', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Filter by Genre
                </label>
                <select 
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
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
                >
                  <option value="All">All Genres</option>
                  {allGenres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

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
              Showing {filteredItems.length} of {totalItems} results
            </div>
          </div>
        </div>

        <div className="row">
          {filteredItems.length > 0 ? (
            filteredItems.map((item: any) => (
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
                    {/* Quick Stats */}
                    {(item.ratingCount || item.reviewCount) && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#b3b3b3', 
                        marginTop: '8px',
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap'
                      }}>
                        {item.ratingCount && (
                          <span>
                            <i className="ti ti-star" style={{ fontSize: '12px', marginRight: '3px' }}></i>
                            {formatCount(item.ratingCount)}
                          </span>
                        )}
                        {item.reviewCount && (
                          <span>
                            <i className="ti ti-message" style={{ fontSize: '12px', marginRight: '3px' }}></i>
                            {formatCount(item.reviewCount)}
                          </span>
                        )}
                      </div>
                    )}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="row">
            <div className="col-12">
              <div className="pagination" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '40px',
                flexWrap: 'wrap'
              }}>
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: currentPage === 1 ? '#28282d' : '#ff1493',
                    color: currentPage === 1 ? '#666' : '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="ti ti-chevron-left"></i> Previous
                </button>

                {/* Page Numbers */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    const showEllipsis = 
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return (
                        <span key={page} style={{ 
                          padding: '10px 15px', 
                          color: '#666' 
                        }}>
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          padding: '10px 15px',
                          backgroundColor: currentPage === page ? '#ff1493' : '#28282d',
                          color: '#fff',
                          border: currentPage === page ? '2px solid #ff1493' : '1px solid #3d3d42',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: currentPage === page ? '600' : '400',
                          minWidth: '45px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: currentPage === totalPages ? '#28282d' : '#ff1493',
                    color: currentPage === totalPages ? '#666' : '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next <i className="ti ti-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  };

  const renderShortSection = (category: any) => (
    <section className="section section--border" key={category._id}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section__title-wrap">
              <h2 
                className="section__title" 
                dangerouslySetInnerHTML={{ __html: formatTitle(category.title) }}
              />
              <a href="catalog.html" className="section__view section__view--carousel">View All</a>
            </div>
          </div>
          <div className="col-12">
            <div className="section__carousel splide splide--content">
              <div className="splide__arrows">
                <button className="splide__arrow splide__arrow--prev" type="button">
                  <i className="ti ti-chevron-left"></i>
                </button>
                <button className="splide__arrow splide__arrow--next" type="button">
                  <i className="ti ti-chevron-right"></i>
                </button>
              </div>
              <div className="splide__track">
                <ul className="splide__list">
                  {category.items.map((item: any) => (
                    <li key={item._id} className="splide__slide">
                      <div className="item item--carousel">
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
                          {/* Quick Stats */}
                          {(item.ratingCount || item.reviewCount) && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#b3b3b3', 
                              marginTop: '6px',
                              display: 'flex',
                              gap: '8px'
                            }}>
                              {item.ratingCount && (
                                <span>
                                  <i className="ti ti-star" style={{ fontSize: '11px', marginRight: '2px' }}></i>
                                  {formatCount(item.ratingCount)}
                                </span>
                              )}
                              {item.reviewCount && (
                                <span>
                                  <i className="ti ti-message" style={{ fontSize: '11px', marginRight: '2px' }}></i>
                                  {formatCount(item.reviewCount)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Render Trending Section
  const renderTrendingSection = (category: any) => (
    <section className="section section--border" key={category._id}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section__title-wrap">
              <h2 
                className="section__title" 
                dangerouslySetInnerHTML={{ __html: formatTitle(category.title) }}
              />
              <a href="catalog.html" className="section__view section__view--carousel">View All</a>
            </div>
          </div>
          <div className="col-12">
            <div className="section__carousel splide splide--content">
              <div className="splide__arrows">
                <button className="splide__arrow splide__arrow--prev" type="button">
                  <i className="ti ti-chevron-left"></i>
                </button>
                <button className="splide__arrow splide__arrow--next" type="button">
                  <i className="ti ti-chevron-right"></i>
                </button>
              </div>
              <div className="splide__track">
                <ul className="splide__list">
                  {category.items.map((item: any) => (
                    <li key={item._id} className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src={item.imageUrl} alt={item.title} />
                          <a href={`/details/${item.slug}`} className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          {/* Trending Badge */}
                          <span style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            backgroundColor: '#ff1493',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <i className="ti ti-trending-up"></i> TRENDING
                          </span>
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
                          {/* Quick Stats */}
                          {(item.ratingCount || item.reviewCount) && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#b3b3b3', 
                              marginTop: '6px',
                              display: 'flex',
                              gap: '8px'
                            }}>
                              {item.ratingCount && (
                                <span>
                                  <i className="ti ti-star" style={{ fontSize: '11px', marginRight: '2px' }}></i>
                                  {formatCount(item.ratingCount)}
                                </span>
                              )}
                              {item.reviewCount && (
                                <span>
                                  <i className="ti ti-message" style={{ fontSize: '11px', marginRight: '2px' }}></i>
                                  {formatCount(item.reviewCount)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Render Top Rated Section
  const renderTopRatedSection = (category: any) => (
    <section className="section section--border" key={category._id}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section__title-wrap">
              <h2 
                className="section__title" 
                dangerouslySetInnerHTML={{ __html: formatTitle(category.title) }}
              />
              <a href="catalog.html" className="section__view section__view--carousel">View All</a>
            </div>
          </div>
          <div className="col-12">
            <div className="section__carousel splide splide--content">
              <div className="splide__arrows">
                <button className="splide__arrow splide__arrow--prev" type="button">
                  <i className="ti ti-chevron-left"></i>
                </button>
                <button className="splide__arrow splide__arrow--next" type="button">
                  <i className="ti ti-chevron-right"></i>
                </button>
              </div>
              <div className="splide__track">
                <ul className="splide__list">
                  {category.items.map((item: any) => (
                    <li key={item._id} className="splide__slide">
                      <div className="item item--carousel">
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
                          {/* Quick Stats */}
                          {(item.ratingCount || item.reviewCount) && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#b3b3b3', 
                              marginTop: '6px',
                              display: 'flex',
                              gap: '8px'
                            }}>
                              {item.ratingCount && (
                                <span>
                                  <i className="ti ti-star" style={{ fontSize: '11px', marginRight: '2px' }}></i>
                                  {formatCount(item.ratingCount)}
                                </span>
                              )}
                              {item.reviewCount && (
                                <span>
                                  <i className="ti ti-message" style={{ fontSize: '11px', marginRight: '2px' }}></i>
                                  {formatCount(item.reviewCount)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Render New Releases Section
  const renderNewReleasesSection = (category: any) => (
    <section className="section section--border" key={category._id}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section__title-wrap">
              <h2 
                className="section__title" 
                dangerouslySetInnerHTML={{ __html: formatTitle(category.title) }}
              />
              <a href="catalog.html" className="section__view section__view--carousel">View All</a>
            </div>
          </div>
          <div className="col-12">
            <div className="section__carousel splide splide--content">
              <div className="splide__arrows">
                <button className="splide__arrow splide__arrow--prev" type="button">
                  <i className="ti ti-chevron-left"></i>
                </button>
                <button className="splide__arrow splide__arrow--next" type="button">
                  <i className="ti ti-chevron-right"></i>
                </button>
              </div>
              <div className="splide__track">
                <ul className="splide__list">
                  {category.items.map((item: any) => (
                    <li key={item._id} className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src={item.imageUrl} alt={item.title} />
                          <a href={`/details/${item.slug}`} className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          {/* NEW Badge */}
                          {item.isNew && (
                            <span style={{
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                              backgroundColor: '#00d25b',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              NEW
                            </span>
                          )}
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
                          {/* Quick Stats */}
                          {(item.ratingCount || item.reviewCount) && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#b3b3b3', 
                              marginTop: '6px',
                              display: 'flex',
                              gap: '8px'
                            }}>
                              {item.ratingCount && (
                                <span>
                                  <i className="ti ti-star" style={{ fontSize: '11px', marginRight: '2px' }}></i>
                                  {formatCount(item.ratingCount)}
                                </span>
                              )}
                              {item.reviewCount && (
                                <span>
                                  <i className="ti ti-message" style={{ fontSize: '11px', marginRight: '2px' }}></i>
                                  {formatCount(item.reviewCount)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  if (categoriesWithItems === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Critical CSS for immediate rendering */}
      <style>{`
        /* Prevent FOUC for title */
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
        
        /* Responsive title sizes */
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
        
        /* Card styles */
        .item {
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
        }
        .item__cover {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          /* Ensure consistent aspect ratio */
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
        
        /* Hero carousel specific styles */
        .item--hero {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .item--hero .item__cover {
          flex: 1;
          min-height: 400px;
        }
        .item--hero .item__content {
          padding-top: 15px;
        }
        
        /* Carousel styles */
        .splide__list {
          display: flex !important;
          gap: 15px;
          align-items: stretch !important;
        }
        .splide__slide {
          flex: 0 0 auto;
          min-width: 200px;
          height: auto !important;
          display: flex !important;
        }
        .splide--home .splide__slide {
          min-width: 280px;
        }
        
        /* Ensure arrows are visible */
        .splide__arrow {
          background: rgba(255, 20, 147, 0.8) !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          opacity: 1 !important;
          visibility: visible !important;
          border: none !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
        }
        .splide__arrow:hover {
          background: rgba(255, 20, 147, 1) !important;
          transform: scale(1.1) !important;
        }
        .splide__arrow i {
          color: #fff !important;
          font-size: 18px !important;
        }
        
        /* Responsive title and arrows */
        @media (max-width: 768px) {
          .home__title {
            font-size: 24px !important;
            padding-right: 0 !important;
          }
          .splide__arrow {
            width: 35px !important;
            height: 35px !important;
          }
        }
        
        /* Ensure cards are visible immediately */
        .home__carousel .splide__track,
        .home__carousel .splide__list,
        .section__carousel .splide__track,
        .section__carousel .splide__list {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>
      {/* header */}
      <Header />
      {/* end header */}

      {/* Dynamic Content Sections */}
      {categoriesWithItems.map((category) => {
        if (category.items.length === 0) return null;
        
        switch (category.type) {
          case "featured":
            return renderFeaturedSection(category);
          case "full":
            return renderFullSection(category);
          case "short":
            return renderShortSection(category);
          case "trending":
            return renderTrendingSection(category);
          case "topRated":
            return renderTopRatedSection(category);
          case "newReleases":
            return renderNewReleasesSection(category);
          default:
            return null;
        }
      })}

      {/* filter */}
      <div className="filter">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="filter__content">
                <button className="filter__menu" type="button">
                  <i className="ti ti-filter"></i>Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* end filter */}

      {/* footer */}
      <Footer />
      {/* end footer */}
    </div>
  );
}
