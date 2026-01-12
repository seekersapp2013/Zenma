import { useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import './sign.css';

export function ItemDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
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
    // Add video placeholder styles
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

    // Load Bootstrap CSS
    const bootstrapCSS = document.createElement('link');
    bootstrapCSS.rel = 'stylesheet';
    bootstrapCSS.href = '/css/bootstrap.min.css';
    document.head.appendChild(bootstrapCSS);

    // Load other CSS files
    const cssFiles = [
      '/css/splide.min.css',
      '/css/slimselect.css',
      '/css/plyr.css',
      '/css/photoswipe.css',
      '/css/default-skin.css',
      '/css/main.css',
      '/webfont/tabler-icons.min.css'
    ];

    cssFiles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });

    // Load JavaScript files
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

    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    // Load scripts sequentially
    const loadScripts = async () => {
      for (const src of jsFiles) {
        try {
          await loadScript(src);
        } catch (error) {
          console.error(`Failed to load script: ${src}`, error);
        }
      }
    };

    loadScripts();

    // Cleanup function
    return () => {
      // Remove added CSS links
      const links = document.querySelectorAll('link[href^="/css/"], link[href^="/webfont/"]');
      links.forEach(link => link.remove());
      
      // Remove added scripts
      const scripts = document.querySelectorAll('script[src^="/js/"]');
      scripts.forEach(script => script.remove());
      
      // Remove added styles
      const styles = document.querySelectorAll('style');
      styles.forEach(style => {
        if (style.textContent?.includes('.video-placeholder')) {
          style.remove();
        }
      });
    };
  }, []);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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

                  <a className="header__sign-in" href="/login" role="button">
                    <i className="ti ti-user"></i>
                    <span>Sign in</span>
                  </a>
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
                        {item.director && (
                          <li><span>Director:</span> <a href="actor.html">{item.director}</a></li>
                        )}
                        {item.cast && item.cast.length > 0 && (
                          <li><span>Cast:</span> 
                            {item.cast.map((actor, index) => (
                              <span key={actor}>
                                <a href="actor.html">{actor}</a>
                                {index < item.cast!.length - 1 && ' '}
                              </span>
                            ))}
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
                <video 
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
                      data-size={source.quality.replace('p', '')} 
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
                  <div className="row">
                    {/* comments */}
                    <div className="col-12">
                      <div className="comments">
                        <ul className="comments__list">
                          <li className="comments__item">
                            <div className="comments__autor">
                              <img className="comments__avatar" src="img/user.svg" alt="" />
                              <span className="comments__name">John Doe</span>
                              <span className="comments__time">30.08.2018, 17:53</span>
                            </div>
                            <p className="comments__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
                            <div className="comments__actions">
                              <div className="comments__rate">
                                <button type="button"><i className="ti ti-thumb-up"></i>12</button>
                                <button type="button">7<i className="ti ti-thumb-down"></i></button>
                              </div>
                              <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                              <button type="button"><i className="ti ti-quote"></i>Quote</button>
                            </div>
                          </li>

                          <li className="comments__item comments__item--answer">
                            <div className="comments__autor">
                              <img className="comments__avatar" src="img/user.svg" alt="" />
                              <span className="comments__name">John Doe</span>
                              <span className="comments__time">24.08.2018, 16:41</span>
                            </div>
                            <p className="comments__text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                            <div className="comments__actions">
                              <div className="comments__rate">
                                <button type="button"><i className="ti ti-thumb-up"></i>8</button>
                                <button type="button">3<i className="ti ti-thumb-down"></i></button>
                              </div>
                              <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                              <button type="button"><i className="ti ti-quote"></i>Quote</button>
                            </div>
                          </li>

                          <li className="comments__item comments__item--quote">
                            <div className="comments__autor">
                              <img className="comments__avatar" src="img/user.svg" alt="" />
                              <span className="comments__name">John Doe</span>
                              <span className="comments__time">11.08.2018, 11:11</span>
                            </div>
                            <p className="comments__text"><span>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</span>It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                            <div className="comments__actions">
                              <div className="comments__rate">
                                <button type="button"><i className="ti ti-thumb-up"></i>11</button>
                                <button type="button">1<i className="ti ti-thumb-down"></i></button>
                              </div>
                              <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                              <button type="button"><i className="ti ti-quote"></i>Quote</button>
                            </div>
                          </li>

                          <li className="comments__item">
                            <div className="comments__autor">
                              <img className="comments__avatar" src="img/user.svg" alt="" />
                              <span className="comments__name">John Doe</span>
                              <span className="comments__time">07.08.2018, 14:33</span>
                            </div>
                            <p className="comments__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
                            <div className="comments__actions">
                              <div className="comments__rate">
                                <button type="button"><i className="ti ti-thumb-up"></i>99</button>
                                <button type="button">35<i className="ti ti-thumb-down"></i></button>
                              </div>
                              <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                              <button type="button"><i className="ti ti-quote"></i>Quote</button>
                            </div>
                          </li>

                          <li className="comments__item">
                            <div className="comments__autor">
                              <img className="comments__avatar" src="img/user.svg" alt="" />
                              <span className="comments__name">John Doe</span>
                              <span className="comments__time">02.08.2018, 15:24</span>
                            </div>
                            <p className="comments__text">Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
                            <div className="comments__actions">
                              <div className="comments__rate">
                                <button type="button"><i className="ti ti-thumb-up"></i>74</button>
                                <button type="button">13<i className="ti ti-thumb-down"></i></button>
                              </div>
                              <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                              <button type="button"><i className="ti ti-quote"></i>Quote</button>
                            </div>
                          </li>
                        </ul>

                        {/* paginator mobile */}
                        <div className="paginator-mob paginator-mob--comments">
                          <span className="paginator-mob__pages">5 of 628</span>

                          <ul className="paginator-mob__nav">
                            <li>
                              <a href="#">
                                <i className="ti ti-chevron-left"></i>
                                <span>Prev</span>
                              </a>
                            </li>
                            <li>
                              <a href="#">
                                <span>Next</span>
                                <i className="ti ti-chevron-right"></i>
                              </a>
                            </li>
                          </ul>
                        </div>
                        {/* end paginator mobile */}

                        {/* paginator desktop */}
                        <ul className="paginator paginator--comments">
                          <li className="paginator__item paginator__item--prev">
                            <a href="#"><i className="ti ti-chevron-left"></i></a>
                          </li>
                          <li className="paginator__item"><a href="#">1</a></li>
                          <li className="paginator__item paginator__item--active"><a href="#">2</a></li>
                          <li className="paginator__item"><a href="#">3</a></li>
                          <li className="paginator__item"><a href="#">4</a></li>
                          <li className="paginator__item"><span>...</span></li>
                          <li className="paginator__item"><a href="#">36</a></li>
                          <li className="paginator__item paginator__item--next">
                            <a href="#"><i className="ti ti-chevron-right"></i></a>
                          </li>
                        </ul>
                        {/* end paginator desktop */}

                        <form action="#" className="sign__form sign__form--comments">
                          <div className="sign__group">
                            <textarea id="text" name="text" className="sign__textarea" placeholder="Add comment"></textarea>
                          </div>

                          <button type="button" className="sign__btn sign__btn--small">Send</button>
                        </form>
                      </div>
                    </div>
                    {/* end comments */}
                  </div>
                </div>

                <div className="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="2-tab" tabIndex={0}>
                  <div className="row">
                    {/* reviews */}
                    <div className="col-12">
                      <div className="reviews">
                        <ul className="reviews__list">
                          <li className="reviews__item">
                            <div className="reviews__autor">
                              <img className="reviews__avatar" src="img/user.svg" alt="" />
                              <span className="reviews__name">Best Marvel movie in my opinion</span>
                              <span className="reviews__time">24.08.2018, 17:53 by John Doe</span>

                              <span className="reviews__rating reviews__rating--yellow">6</span>
                            </div>
                            <p className="reviews__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
                          </li>

                          <li className="reviews__item">
                            <div className="reviews__autor">
                              <img className="reviews__avatar" src="img/user.svg" alt="" />
                              <span className="reviews__name">Best Marvel movie in my opinion</span>
                              <span className="reviews__time">24.08.2018, 17:53 by John Doe</span>

                              <span className="reviews__rating reviews__rating--green">9</span>
                            </div>
                            <p className="reviews__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
                          </li>

                          <li className="reviews__item">
                            <div className="reviews__autor">
                              <img className="reviews__avatar" src="img/user.svg" alt="" />
                              <span className="reviews__name">Best Marvel movie in my opinion</span>
                              <span className="reviews__time">24.08.2018, 17:53 by John Doe</span>

                              <span className="reviews__rating reviews__rating--red">5</span>
                            </div>
                            <p className="reviews__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
                          </li>
                        </ul>

                        {/* paginator mobile */}
                        <div className="paginator-mob paginator-mob--comments">
                          <span className="paginator-mob__pages">5 of 628</span>

                          <ul className="paginator-mob__nav">
                            <li>
                              <a href="#">
                                <i className="ti ti-chevron-left"></i>
                                <span>Prev</span>
                              </a>
                            </li>
                            <li>
                              <a href="#">
                                <span>Next</span>
                                <i className="ti ti-chevron-right"></i>
                              </a>
                            </li>
                          </ul>
                        </div>
                        {/* end paginator mobile */}

                        {/* paginator desktop */}
                        <ul className="paginator paginator--comments">
                          <li className="paginator__item paginator__item--prev">
                            <a href="#"><i className="ti ti-chevron-left"></i></a>
                          </li>
                          <li className="paginator__item"><a href="#">1</a></li>
                          <li className="paginator__item paginator__item--active"><a href="#">2</a></li>
                          <li className="paginator__item"><a href="#">3</a></li>
                          <li className="paginator__item"><a href="#">4</a></li>
                          <li className="paginator__item"><span>...</span></li>
                          <li className="paginator__item"><a href="#">36</a></li>
                          <li className="paginator__item paginator__item--next">
                            <a href="#"><i className="ti ti-chevron-right"></i></a>
                          </li>
                        </ul>
                        {/* end paginator desktop */}

                        <form action="#" className="sign__form sign__form--comments">
                          <div className="sign__group">
                            <input type="text" className="sign__input" placeholder="Title" />
                          </div>

                          <div className="sign__group">
                            <select className="sign__select" name="rating" id="rating">
                              <option value="0">Rating</option>
                              <option value="1">1 star</option>
                              <option value="2">2 stars</option>
                              <option value="3">3 stars</option>
                              <option value="4">4 stars</option>
                              <option value="5">5 stars</option>
                              <option value="6">6 stars</option>
                              <option value="7">7 stars</option>
                              <option value="8">8 stars</option>
                              <option value="9">9 stars</option>
                              <option value="10">10 stars</option>
                            </select>
                          </div>

                          <div className="sign__group">
                            <textarea id="textreview" name="textreview" className="sign__textarea" placeholder="Add review"></textarea>
                          </div>

                          <button type="button" className="sign__btn sign__btn--small">Send</button>
                        </form>
                      </div>
                    </div>
                    {/* end reviews */}
                  </div>
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