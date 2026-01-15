import { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignOutButton } from "./SignOutButton";
import { useParams } from "react-router-dom";
import './sign.css';

export function Actor() {
  const { slug } = useParams<{ slug: string }>();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const actor = useQuery(api.actors.getActorBySlug, { slug: slug || "" });
  const filmography = useQuery(
    api.actors.getActorFilmography, 
    actor ? { actorName: actor.name } : "skip"
  );
  const [activeTab, setActiveTab] = useState('filmography');

  // Load essential CSS files that should load immediately
  const essentialCssFiles = [
    '/css/bootstrap.min.css',
    '/css/splide.min.css',
    '/css/slimselect.css',
    '/css/plyr.css',
    '/css/photoswipe.css',
    '/css/default-skin.css',
    '/css/main.css'
  ];

  // Non-essential CSS files that can load after
  const nonEssentialCssFiles = [
    '/webfont/tabler-icons.min.css'
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
    // Load essential CSS files with high priority
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

  // Only use dynamic actor data from database
  const actorData = actor;

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="header__content">
                {/* Header logo */}
                <a href="/" className="header__logo">
                  <h1><span className="logo-zen">ZEN</span><span className="logo-ma">MA</span></h1>
                </a>

                {/* Header nav */}
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

                {/* Header auth */}
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

                  {/* Language dropdown */}
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

                {/* Header menu btn */}
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

      {/* Actor Details Section */}
      <section className="section section--details">
        {/* Details background */}
        <div className="section__details-bg" data-bg="/img/bg/actor__bg.jpg"></div>

        {/* Details content */}
        <div className="container">
          <div className="row">
            {/* Title */}
            <div className="col-12">
              <h1 className="section__title section__title--head">{actorData.name}</h1>
            </div>

            {/* Content */}
            <div className="col-12 col-lg-9 col-xl-6">
              <div className="item item--details">
                <div className="row">
                  <div className="col-12 col-sm-5 col-md-5">
                    <div className="item__cover">
                      <img src={actorData.imageUrl || "/img/covers/actor.jpg"} alt={actorData.name} />
                    </div>
                  </div>

                  <div className="col-12 col-md-7">
                    <div className="item__content">
                      <ul className="item__meta">
                        <li><span>Career:</span> {actorData.career}</li>
                        {actorData.height && <li><span>Height:</span> {actorData.height}</li>}
                        {actorData.dateOfBirth && <li><span>Date of birth:</span> {actorData.dateOfBirth}</li>}
                        {actorData.placeOfBirth && <li><span>Place of birth:</span> {actorData.placeOfBirth}</li>}
                        {actorData.age && <li><span>Age:</span> {actorData.age}</li>}
                        {actorData.zodiac && <li><span>Zodiac:</span> {actorData.zodiac}</li>}
                        {actorData.genres && actorData.genres.length > 0 && (
                          <li>
                            <span>Genres:</span> 
                            {actorData.genres.map((genre, index) => (
                              <a key={index} href="#" className="mr-2">{genre}</a>
                            ))}
                          </li>
                        )}
                        {actorData.totalMovies && <li><span>Total number of movies:</span> {actorData.totalMovies}</li>}
                        {actorData.firstMovie && <li><span>First movie:</span> <a href="/details">{actorData.firstMovie}</a></li>}
                        {actorData.lastMovie && <li><span>Last movie:</span> <a href="/details">{actorData.lastMovie}</a></li>}
                        {actorData.bestMovie && <li><span>Best movie:</span> <a href="/details">{actorData.bestMovie}</a></li>}
                      </ul>
                      {actorData.biography && (
                        <div className="item__text">
                          <p>{actorData.biography}</p>
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
            <div className="col-12">
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="footer__content">
                <a href="/" className="footer__logo">
                  <h1><span className="logo-zen">ZEN</span><span className="logo-ma">MA</span></h1>
                </a>

                <span className="footer__copyright">
                  © ZENMA, 2019—2024 <br /> 
                  Create by <a href="https://themeforest.net/user/dmitryvolkov/portfolio" target="_blank">Dmitry Volkov</a>
                </span>

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
                  movie.rating && movie.rating >= 8 ? 'item__rate--green' :
                  movie.rating && movie.rating >= 6 ? 'item__rate--yellow' :
                  'item__rate--red'
                }`}>
                  {movie.rating || '8.4'}
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