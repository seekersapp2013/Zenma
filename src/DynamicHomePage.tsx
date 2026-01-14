import { useEffect } from 'react';
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

  useEffect(() => {
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

    // Load essential CSS files first with high priority
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

    // Load scripts with better performance
    jsFiles.forEach((src, index) => {
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

  const formatTitle = (title: string) => {
    return title.replace(/<b>(.*?)<\/b>/g, '<b>$1</b>');
  };

  const renderFeaturedSection = (category: any) => (
    <div className={background ? 'sign' : ''} key={category._id}>
      <section className="home home--bg" style={{ position: 'relative', zIndex: 2 }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 
                className="home__title" 
                dangerouslySetInnerHTML={{ __html: formatTitle(category.title) }}
              />
            </div>
            <div className="col-12">
              <div className="home__carousel splide splide--home">
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
                        <div className="item item--hero">
                          <div className="item__cover">
                            <img src={item.imageUrl} alt={item.title} />
                            <a href={`/details/${item.slug}`} className="item__play">
                              <i className="ti ti-player-play-filled"></i>
                            </a>
                            <span className="item__rate item__rate--green">8.4</span>
                            <button className="item__favorite" type="button">
                              <i className="ti ti-bookmark"></i>
                            </button>
                          </div>
                          <div className="item__content">
                            <h3 className="item__title">
                              <a href={`/details/${item.slug}`}>{item.title}</a>
                            </h3>
                            <span className="item__category">
                              {item.genres.map((genre: string, index: number) => (
                                <a key={genre} href="#">{genre}</a>
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

  const renderFullSection = (category: any) => (
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
        <div className="row">
          {category.items.map((item: any) => (
            <div key={item._id} className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src={item.imageUrl} alt={item.title} />
                  <a href={`/details/${item.slug}`} className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">8.4</span>
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
                      <a key={genre} href="#">{genre}</a>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
                          <span className="item__rate item__rate--green">8.4</span>
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
                              <a key={genre} href="#">{genre}</a>
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
  );

  if (categoriesWithItems === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        .splide__list {
          display: flex !important;
          gap: 15px;
        }
        .splide__slide {
          flex: 0 0 auto;
          min-width: 200px;
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