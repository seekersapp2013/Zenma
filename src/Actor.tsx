import { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useParams } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import './sign.css';

export function Actor() {
  const { slug } = useParams<{ slug: string }>();
  const actor = useQuery(api.actors.getActorBySlug, { slug: slug || "" });
  const filmography = useQuery(
    api.actors.getActorFilmography, 
    actor ? { actorName: actor.name } : "skip"
  );
  const [activeTab, setActiveTab] = useState('filmography');

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
    // Add video placeholder styles to match ItemDetails
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
    `;
    document.head.appendChild(style);
    style.setAttribute('data-actor-styles', 'true');

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
      // Check if script is already loaded
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true; // Better for performance
        script.onerror = () => console.warn(`Failed to load script: ${src}`);
        
        // Add small delay between script loads to prevent blocking
        setTimeout(() => {
          document.body.appendChild(script);
        }, index * 50);
      }
    };

    jsFiles.forEach((src, index) => {
      loadScript(src, index);
    });

    // Cleanup function
    return () => {
      // Only remove links/scripts that were added by this component
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

      // Remove added styles
      const styles = document.querySelectorAll('style[data-actor-styles]');
      styles.forEach(style => style.remove());
    };
  }, []);

  // Show loading state
  if (actor === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
      </div>
    );
  }

  // Show not found state - either no slug provided or actor not found
  if (!slug || actor === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {!slug ? "No Actor Selected" : "Actor Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {!slug 
              ? "Please select an actor to view their profile." 
              : "The actor you're looking for doesn't exist."
            }
          </p>
          <a href="/" className="bg-[#ff1493] text-white px-4 py-2 rounded-md hover:bg-[#d91a72] transition-colors">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Calculate the display rating using the same algorithm as movies
  const getDisplayRating = () => {
    return actor.dynamicRating ?? actor.adminRating ?? actor.rating ?? 8.4;
  };

  const displayRating = getDisplayRating();

  return (
    <div>
      {/* Header */}
      <Header />

      {/* Actor Details Section */}
      <section className="section section--details">
        {/* Details background */}
        <div className="section__details-bg" data-bg="/img/bg/actor__bg.jpg"></div>

        {/* Details content */}
        <div className="container">
          <div className="row">
            {/* Title */}
            <div className="col-12">
              <h1 className="section__title section__title--head">{actor.name}</h1>
            </div>

            {/* Content - Match ItemDetails layout exactly */}
            <div className="col-12 col-xl-6">
              <div className="item item--details">
                <div className="row">
                  {/* Actor cover - Match ItemDetails column sizes */}
                  <div className="col-4 col-sm-4 col-md-4 col-lg-3 col-xl-4 col-xxl-4">
                    <div className="item__cover">
                      <img src={actor.imageUrl || "/img/covers/actor.jpg"} alt={actor.name} />
                      <span className={`item__rate ${
                        displayRating >= 8 ? 'item__rate--green' :
                        displayRating >= 6 ? 'item__rate--yellow' :
                        'item__rate--red'
                      }`}>
                        {displayRating.toFixed(1)}
                      </span>
                      <button className="item__favorite item__favorite--static" type="button">
                        <i className="ti ti-bookmark"></i>
                      </button>
                    </div>
                  </div>

                  {/* Actor content - Match ItemDetails column sizes */}
                  <div className="col-8 col-sm-8 col-md-8 col-lg-9 col-xl-8 col-xxl-8">
                    <div className="item__content">
                      <ul className="item__meta" style={{ marginBottom: '8px' }}>
                        <li><span>Career:</span> {actor.career}</li>
                        {actor.height && <li><span>Height:</span> {actor.height}</li>}
                        {actor.dateOfBirth && <li><span>Date of birth:</span> {actor.dateOfBirth}</li>}
                        {actor.placeOfBirth && <li><span>Place of birth:</span> {actor.placeOfBirth}</li>}
                        {actor.age && <li><span>Age:</span> {actor.age}</li>}
                        {actor.zodiac && <li><span>Zodiac:</span> {actor.zodiac}</li>}
                        {actor.genres && actor.genres.length > 0 && (
                          <li>
                            <span>Genres:</span> 
                            {actor.genres.map((genre, index) => (
                              <span key={genre}>
                                <a href="#" className="mr-2">{genre}</a>
                                {index < actor.genres.length - 1 && ' '}
                              </span>
                            ))}
                          </li>
                        )}
                        {actor.totalMovies && <li><span>Total number of movies:</span> {actor.totalMovies}</li>}
                        {actor.firstMovie && <li><span>First movie:</span> <a href="/details">{actor.firstMovie}</a></li>}
                        {actor.lastMovie && <li><span>Last movie:</span> <a href="/details">{actor.lastMovie}</a></li>}
                        {actor.bestMovie && <li><span>Best movie:</span> <a href="/details">{actor.bestMovie}</a></li>}
                      </ul>

                      {actor.biography && (
                        <div className="item__description" style={{ marginTop: '5px', marginBottom: '10px' }}>
                          <p style={{ marginBottom: '0' }}>{actor.biography}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content">
        <div className="content__head content__head--mt">
          <div className="container">
            <div className="row">
              <div className="col-12">
                {/* Content title */}
                <h2 className="content__title">Discover</h2>

                {/* Content tabs nav */}
                <ul className="nav nav-tabs content__tabs" id="content__tabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button 
                      id="1-tab" 
                      className={activeTab === 'filmography' ? 'active' : ''} 
                      data-bs-toggle="tab" 
                      data-bs-target="#tab-1" 
                      type="button" 
                      role="tab" 
                      aria-controls="tab-1" 
                      aria-selected={activeTab === 'filmography'}
                      onClick={() => setActiveTab('filmography')}
                    >
                      Filmography
                    </button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button 
                      id="2-tab" 
                      className={activeTab === 'photos' ? 'active' : ''} 
                      data-bs-toggle="tab" 
                      data-bs-target="#tab-2" 
                      type="button" 
                      role="tab" 
                      aria-controls="tab-2" 
                      aria-selected={activeTab === 'photos'}
                      onClick={() => setActiveTab('photos')}
                    >
                      Photos
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              {/* Content tabs */}
              <div className="tab-content">
                <div 
                  className={`tab-pane fade ${activeTab === 'filmography' ? 'show active' : ''}`} 
                  id="tab-1" 
                  role="tabpanel" 
                  aria-labelledby="1-tab" 
                  tabIndex={0}
                >
                  <FilmographyTab filmography={filmography} />
                </div>

                <div 
                  className={`tab-pane fade ${activeTab === 'photos' ? 'show active' : ''}`} 
                  id="tab-2" 
                  role="tabpanel" 
                  aria-labelledby="2-tab" 
                  tabIndex={0}
                >
                  <PhotosTab />
                </div>
              </div>
            </div>

            {/* Sidebar - Match ItemDetails structure */}
            <div className="col-12 col-lg-4">
              <div className="row">
                {/* Section title */}
                <div className="col-12">
                  <h2 className="section__title section__title--sidebar">You may also like...</h2>
                </div>

                {/* Placeholder for related actors or content */}
                <div className="col-12">
                  <p className="text-center text-gray-500">Related actors coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* PhotoSwipe Root element */}
      <div className="pswp" tabIndex={-1} role="dialog" aria-hidden="true">
        <div className="pswp__bg"></div>
        <div className="pswp__scroll-wrap">
          <div className="pswp__container">
            <div className="pswp__item"></div>
            <div className="pswp__item"></div>
            <div className="pswp__item"></div>
          </div>

          <div className="pswp__ui pswp__ui--hidden">
            <div className="pswp__top-bar">
              <div className="pswp__counter"></div>
              <button className="pswp__button pswp__button--close" title="Close (Esc)"></button>
              <button className="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
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

// Filmography Tab Component
function FilmographyTab({ filmography }: { 
  filmography: Array<{
    _id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    rating?: number;
    dynamicRating?: number;
    adminRating?: number;
    genres: string[];
  }> | undefined 
}) {
  if (!filmography || filmography.length === 0) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="text-center py-5">
            <p className="text-gray-500">No filmography available for this actor.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        {filmography.map((movie) => (
          <div key={movie._id} className="col-6 col-sm-4 col-lg-3 col-xl-2">
            <div className="item">
              <div className="item__cover">
                <img src={movie.imageUrl || "/img/covers/cover.jpg"} alt={movie.title} />
                <a href={`/item/${movie.slug}`} className="item__play">
                  <i className="ti ti-player-play-filled"></i>
                </a>
                <span className={`item__rate ${
                  ((movie.dynamicRating ?? movie.adminRating ?? movie.rating) ?? 0) >= 8 ? 'item__rate--green' :
                  ((movie.dynamicRating ?? movie.adminRating ?? movie.rating) ?? 0) >= 6 ? 'item__rate--yellow' :
                  'item__rate--red'
                }`}>
                  {(movie.dynamicRating ?? movie.adminRating ?? movie.rating)?.toFixed(1) ?? 'N/A'}
                </span>
                <button className="item__favorite" type="button">
                  <i className="ti ti-bookmark"></i>
                </button>
              </div>
              <div className="item__content">
                <h3 className="item__title">
                  <a href={`/item/${movie.slug}`}>{movie.title}</a>
                </h3>
                <span className="item__category">
                  {movie.genres.slice(0, 2).map((genre, index) => (
                    <span key={genre}>
                      <a href="#">{genre}</a>
                      {index < Math.min(movie.genres.length, 2) - 1 && ' '}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination - only show if there are movies */}
      {filmography.length > 0 && (
        <div className="row">
          <div className="col-12">
            {/* Mobile paginator */}
            <div className="paginator-mob">
              <span className="paginator-mob__pages">{filmography.length} movies</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Photos Tab Component
function PhotosTab() {
  const photos = [
    { id: 1, src: "/img/gallery/project-1.jpg", caption: "Some image caption 1" },
    { id: 2, src: "/img/gallery/project-2.jpg", caption: "Some image caption 2" },
    { id: 3, src: "/img/gallery/project-3.jpg", caption: "Some image caption 3" },
    { id: 4, src: "/img/gallery/project-4.jpg", caption: "Some image caption 4" },
    { id: 5, src: "/img/gallery/project-5.jpg", caption: "Some image caption 5" },
    { id: 6, src: "/img/gallery/project-6.jpg", caption: "Some image caption 6" }
  ];

  return (
    <div className="gallery gallery--full" itemScope>
      <div className="row">
        {photos.map((photo) => (
          <figure key={photo.id} className="col-12 col-sm-6 col-xl-4" itemProp="associatedMedia" itemScope>
            <a href={photo.src} itemProp="contentUrl" data-size="1920x1280">
              <img src={photo.src} itemProp="thumbnail" alt="Image description" />
            </a>
            <figcaption itemProp="caption description">{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}