import { useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import './sign.css';

export function ItemDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const item = useQuery(api.items.getItemBySlug, { slug: slug || "" });

  useEffect(() => {
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
      if (ogImage) {
        ogImage.setAttribute('content', item.imageUrl);
      } else {
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
      <section className="section section--details section--bg" data-bg="/img/section/details.jpg">
        <div className="container">
          <div className="row">
            {/* title */}
            <div className="col-12">
              <h1 className="section__title section__title--mb">{item.title}</h1>
            </div>
            {/* end title */}

            {/* content */}
            <div className="col-12 col-xl-6">
              <div className="card card--details">
                <div className="row">
                  {/* card cover */}
                  <div className="col-12 col-sm-5 col-md-4 col-lg-3 col-xl-5">
                    <div className="card__cover">
                      <img src={item.imageUrl} alt={item.title} />
                      <span className="card__rate card__rate--green">8.4</span>
                    </div>
                  </div>
                  {/* end card cover */}

                  {/* card content */}
                  <div className="col-12 col-sm-7 col-md-8 col-lg-9 col-xl-7">
                    <div className="card__content">
                      <div className="card__wrap">
                        <span className="card__rate">
                          <i className="ti ti-star-filled"></i>8.4
                        </span>

                        <ul className="card__list">
                          <li>HD</li>
                          <li>16+</li>
                        </ul>
                      </div>

                      <ul className="card__meta">
                        <li><span>Genre:</span> 
                          {item.genres.map((genre, index) => (
                            <span key={genre}>
                              <a href="#">{genre}</a>
                              {index < item.genres.length - 1 && ', '}
                            </span>
                          ))}
                        </li>
                        <li><span>Release year:</span> 2024</li>
                        <li><span>Running time:</span> 120 min</li>
                        <li><span>Country:</span> <a href="#">USA</a></li>
                      </ul>

                      <div className="card__description card__description--details">
                        <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>
                        
                        <p>Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
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
              <video controls crossOrigin="anonymous" playsInline poster={item.imageUrl} id="player">
                {/* Video sources would go here */}
                <source src="/video/trailer.mp4" type="video/mp4" size="576" />
                <source src="/video/trailer.mp4" type="video/mp4" size="720" />
                <source src="/video/trailer.mp4" type="video/mp4" size="1080" />

                {/* Caption files */}
                <track kind="captions" label="English" srcLang="en" src="/video/caption-en.vtt" />
                <track kind="captions" label="French" srcLang="fr" src="/video/caption-fr.vtt" />

                {/* Fallback for browsers that don't support the <video> element */}
                <a href="/video/trailer.mp4" download>Download</a>
              </video>
            </div>
            {/* end player */}

            {/* accordion */}
            <div className="col-12">
              <div className="accordion" id="accordion">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                      Comments
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordion">
                    <div className="accordion-body">
                      <div className="comments">
                        <div className="comments__title">
                          <b>Comments</b>
                          <span>2</span>
                        </div>

                        <ul className="comments__list">
                          <li className="comments__item">
                            <div className="comments__autor">
                              <img className="comments__avatar" src="/img/user.svg" alt="" />
                              <span className="comments__name">John Doe</span>
                              <span className="comments__time">30.08.2021, 17:53</span>
                            </div>
                            <p className="comments__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</p>
                            <div className="comments__actions">
                              <div className="comments__rate">
                                <button type="button"><i className="ti ti-thumb-up-filled"></i>12</button>
                                <button type="button"><i className="ti ti-thumb-down-filled"></i>7</button>
                              </div>
                              <button type="button"><i className="ti ti-share-3"></i>Reply</button>
                              <button type="button"><i className="ti ti-bookmark"></i>Save</button>
                            </div>
                          </li>

                          <li className="comments__item">
                            <div className="comments__autor">
                              <img className="comments__avatar" src="/img/user.svg" alt="" />
                              <span className="comments__name">Jane Smith</span>
                              <span className="comments__time">24.08.2021, 16:41</span>
                            </div>
                            <p className="comments__text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                            <div className="comments__actions">
                              <div className="comments__rate">
                                <button type="button"><i className="ti ti-thumb-up-filled"></i>8</button>
                                <button type="button"><i className="ti ti-thumb-down-filled"></i>3</button>
                              </div>
                              <button type="button"><i className="ti ti-share-3"></i>Reply</button>
                              <button type="button"><i className="ti ti-bookmark"></i>Save</button>
                            </div>
                          </li>
                        </ul>

                        <form action="#" className="form">
                          <input type="text" className="form__input" placeholder="Add comment" />
                          <button type="button" className="form__btn">Send</button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingTwo">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                      Reviews
                    </button>
                  </h2>
                  <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordion">
                    <div className="accordion-body">
                      <div className="reviews">
                        <div className="reviews__title">
                          <b>Reviews</b>
                          <span>1</span>
                        </div>

                        <ul className="reviews__list">
                          <li className="reviews__item">
                            <div className="reviews__autor">
                              <img className="reviews__avatar" src="/img/user.svg" alt="" />
                              <span className="reviews__name">Best Marvel movie!</span>
                              <span className="reviews__time">24.08.2021, 17:53 by John Doe</span>

                              <span className="reviews__rating">
                                <i className="ti ti-star-filled"></i>
                                <i className="ti ti-star-filled"></i>
                                <i className="ti ti-star-filled"></i>
                                <i className="ti ti-star-filled"></i>
                                <i className="ti ti-star-filled"></i>
                                8.4
                              </span>
                            </div>
                            <p className="reviews__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
                            <div className="reviews__helpful">
                              <span>Reviews helpful?</span>
                              <button type="button"><i className="ti ti-thumb-up-filled"></i>Yes</button>
                              <button type="button"><i className="ti ti-thumb-down-filled"></i>No</button>
                            </div>
                          </li>
                        </ul>

                        <form action="#" className="form">
                          <div className="sign__group">
                            <label className="sign__label" htmlFor="reviewname">Name</label>
                            <input id="reviewname" type="text" name="reviewname" className="sign__input" placeholder="Type name" />
                          </div>

                          <div className="sign__group">
                            <label className="sign__label" htmlFor="reviewemail">Email</label>
                            <input id="reviewemail" type="text" name="reviewemail" className="sign__input" placeholder="Type email" />
                          </div>

                          <div className="sign__group">
                            <label className="sign__label" htmlFor="reviewmessage">Review</label>
                            <textarea id="reviewmessage" name="reviewmessage" className="sign__textarea" placeholder="Type review"></textarea>
                          </div>

                          <div className="sign__group">
                            <div className="sign__rating">
                              <label className="sign__label">Rating</label>
                              <div className="sign__star">
                                <input type="radio" name="rating" value="1" id="star1" />
                                <label htmlFor="star1"></label>
                                <input type="radio" name="rating" value="2" id="star2" />
                                <label htmlFor="star2"></label>
                                <input type="radio" name="rating" value="3" id="star3" />
                                <label htmlFor="star3"></label>
                                <input type="radio" name="rating" value="4" id="star4" />
                                <label htmlFor="star4"></label>
                                <input type="radio" name="rating" value="5" id="star5" />
                                <label htmlFor="star5"></label>
                              </div>
                            </div>
                          </div>

                          <button type="button" className="sign__btn">Send</button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end accordion */}
          </div>
        </div>
      </section>
      {/* end details */}

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
    </div>
  );
}