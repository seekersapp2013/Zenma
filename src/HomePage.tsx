import { useEffect } from 'react';
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import './sign.css';

interface HomePageProps {
  background?: boolean;
}

export function HomePage({ background = true }: HomePageProps) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
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

  return (
    <div>
      {/* header */}
      <header className="header">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="header__content">
                {/* header logo */}
                <a href="index.html" className="header__logo">
                 <h1><span className="logo-zen">ZEN</span><span className="logo-ma">MA</span></h1>
                </a>
                {/* end header logo */}

                {/* header nav */}
                <ul className="header__nav">
                  {/* dropdown */}
                  <li className="header__nav-item">
                    <a className="header__nav-link" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Home <i className="ti ti-chevron-down"></i>
                    </a>

                    <ul className="dropdown-menu header__dropdown-menu">
                      <li><a href="index.html">Home style 1</a></li>
                      <li><a href="index2.html">Home style 2</a></li>
                      <li><a href="index3.html">Home style 3</a></li>
                    </ul>
                  </li>
                  {/* end dropdown */}

                  {/* dropdown */}
                  <li className="header__nav-item">
                    <a className="header__nav-link" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Catalog <i className="ti ti-chevron-down"></i>
                    </a>

                    <ul className="dropdown-menu header__dropdown-menu">
                      <li><a href="catalog.html">Catalog style 1</a></li>
                      <li><a href="catalog2.html">Catalog style 2</a></li>
                      <li><a href="details.html">Details Movie</a></li>
                      <li><a href="details2.html">Details TV Series</a></li>
                    </ul>
                  </li>
                  {/* end dropdown */}

                  <li className="header__nav-item">
                    <a href="pricing.html" className="header__nav-link">Pricing plan</a>
                  </li>

                  {/* dropdown */}
                  <li className="header__nav-item">
                    <a className="header__nav-link" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Pages <i className="ti ti-chevron-down"></i>
                    </a>

                    <ul className="dropdown-menu header__dropdown-menu">
                      <li><a href="about.html">About Us</a></li>
                      <li><a href="profile.html">Profile</a></li>
                      <li><a href="actor.html">Actor</a></li>
                      <li><a href="contacts.html">Contacts</a></li>
                      <li><a href="faq.html">Help center</a></li>
                      <li><a href="privacy.html">Privacy policy</a></li>
                      <li><a href="../admin/index.html" target="_blank">Admin pages</a></li>
                    </ul>
                  </li>
                  {/* end dropdown */}

                  {/* dropdown */}
                  <li className="header__nav-item">
                    <a className="header__nav-link header__nav-link--more" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="ti ti-dots"></i>
                    </a>

                    <ul className="dropdown-menu header__dropdown-menu">
                      <li><a href="signin.html">Sign in</a></li>
                      <li><a href="signup.html">Sign up</a></li>
                      <li><a href="forgot.html">Forgot password</a></li>
                      <li><a href="404.html">404 Page</a></li>
                    </ul>
                  </li>
                  {/* end dropdown */}
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

                  {/* dropdown */}
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
                  {/* end dropdown */}

                  {/* dropdown */}
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
                        <li><a href="profile.html"><i className="ti ti-ghost"></i>Profile</a></li>
                        <li><a href="profile.html"><i className="ti ti-stereo-glasses"></i>Subscription</a></li>
                        <li><a href="profile.html"><i className="ti ti-bookmark"></i>Favorites</a></li>
                        <li><a href="profile.html"><i className="ti ti-settings"></i>Settings</a></li>
                        <li><SignOutButton variant="dropdown" /></li>
                      </ul>
                    </Authenticated>
                    <Unauthenticated>
                      <a className="header__sign-in header__sign-in--user" href="/" role="button">
                        <i className="ti ti-user"></i>
                        <span>Login</span>
                      </a>
                    </Unauthenticated>
                  </div>
                  {/* end dropdown */}
                </div>
                {/* end header auth */}

                {/* header menu btn */}
                <button className="header__btn" type="button">
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
                {/* end header menu btn */}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* end header */}

      {/* home */}
      <div className={background ? 'sign' : ''}>
        <section className="home home--bg" style={{ position: 'relative', zIndex: 2 }}>
          <div className="container">
            <div className="row">
              {/* home title */}
              <div className="col-12">
                <h1 className="home__title"><b>NEW</b> OF THIS SEASON</h1>
              </div>
              {/* end home title */}

              {/* home carousel */}
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
                    <li className="splide__slide">
                      <div className="item item--hero">
                        <div className="item__cover">
                          <img src="/img/covers/cover12.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                       
                          </a>
                          <span className="item__rate item__rate--green">8.4</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">The Edge of Tomorrow</a></h3>
                          <span className="item__category">
                            <a href="#">Action</a>
                            <a href="#">Triler</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--hero">
                        <div className="item__cover">
                          <img src="/img/covers/cover2.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">7.1</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Benched</a></h3>
                          <span className="item__category">
                            <a href="#">Comedy</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--hero">
                        <div className="item__cover">
                          <img src="/img/covers/cover8.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">7.9</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Green Hell</a></h3>
                          <span className="item__category">
                            <a href="#">Romance</a>
                            <a href="#">Drama</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--hero">
                        <div className="item__cover">
                          <img src="/img/covers/cover9.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--yellow">6.8</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Survival Spliton</a></h3>
                          <span className="item__category">
                            <a href="#">Comedy</a>
                            <a href="#">Drama</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--hero">
                        <div className="item__cover">
                          <img src="/img/covers/cover13.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">9.1</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">The Chebod</a></h3>
                          <span className="item__category">
                            <a href="#">Drama</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--hero">
                        <div className="item__cover">
                          <img src="/img/covers/cover5.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--yellow">6.7</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Shadow</a></h3>
                          <span className="item__category">
                            <a href="#">Drama</a>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* end home carousel */}
          </div>
        </div>
      </section>
      </div>
      {/* end home */}

      {/* filter */}
      <div className="filter">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="filter__content">
                {/* menu btn */}
                <button className="filter__menu" type="button"><i className="ti ti-filter"></i>Filter</button>
                {/* end menu btn */}

        
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* end filter */}
      
      {/* catalog */}
      <div className="section section--catalog">
        <div className="container">
          <div className="row">
            {/* section title */}
            <div className="col-12">
              <div className="section__title-wrap">
                 <h1 className="home__title">MOVIES FOR <b>YOU</b> </h1>
              </div>
            </div>
            {/* end section title */}
          </div>
          <div className="row">
            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">8.4</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                  <span className="item__category">
                    <a href="#">Action</a>
                    <a href="#">Triler</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover2.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">7.1</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Benched</a></h3>
                  <span className="item__category">
                    <a href="#">Comedy</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover3.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--red">6.3</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Whitney</a></h3>
                  <span className="item__category">
                    <a href="#">Romance</a>
                    <a href="#">Drama</a>
                    <a href="#">Music</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover4.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--yellow">6.9</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Blindspotting</a></h3>
                  <span className="item__category">
                    <a href="#">Comedy</a>
                    <a href="#">Drama</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover5.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">8.4</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                  <span className="item__category">
                    <a href="#">Action</a>
                    <a href="#">Triler</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover6.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">7.1</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Benched</a></h3>
                  <span className="item__category">
                    <a href="#">Comedy</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover7.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">7.1</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Benched</a></h3>
                  <span className="item__category">
                    <a href="#">Comedy</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover8.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--red">5.5</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                  <span className="item__category">
                    <a href="#">Action</a>
                    <a href="#">Triler</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover9.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--yellow">6.7</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Blindspotting</a></h3>
                  <span className="item__category">
                    <a href="#">Comedy</a>
                    <a href="#">Drama</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover10.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--red">5.6</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Whitney</a></h3>
                  <span className="item__category">
                    <a href="#">Romance</a>
                    <a href="#">Drama</a>
                    <a href="#">Music</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover11.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">9.2</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Benched</a></h3>
                  <span className="item__category">
                    <a href="#">Comedy</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover12.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">8.4</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                  <span className="item__category">
                    <a href="#">Action</a>
                    <a href="#">Triler</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover13.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">8.0</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                  <span className="item__category">
                    <a href="#">Action</a>
                    <a href="#">Triler</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover14.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">7.2</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Benched</a></h3>
                  <span className="item__category">
                    <a href="#">Comedy</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover15.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--yellow">5.9</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Whitney</a></h3>
                  <span className="item__category">
                    <a href="#">Romance</a>
                    <a href="#">Drama</a>
                    <a href="#">Music</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover16.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">8.3</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Blindspotting</a></h3>
                  <span className="item__category">
                    <a href="#">Comedy</a>
                    <a href="#">Drama</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover17.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">8.0</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                  <span className="item__category">
                    <a href="#">Action</a>
                    <a href="#">Triler</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}

            {/* item */}
            <div className="col-6 col-sm-4 col-lg-3 col-xl-2">
              <div className="item">
                <div className="item__cover">
                  <img src="/img/covers/cover18.jpg" alt="" />
                  <a href="details.html" className="item__play">
                    <i className="ti ti-player-play-filled"></i>
                  </a>
                  <span className="item__rate item__rate--green">7.1</span>
                  <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                </div>
                <div className="item__content">
                  <h3 className="item__title"><a href="details.html">Benched</a></h3>
                  <span className="item__category">
                    <a href="#">Comedy</a>
                  </span>
                </div>
              </div>
            </div>
            {/* end item */}
          </div>
          <div className="row">
            {/* paginator */}
            <div className="col-12">
              {/* paginator mobile */}
              <div className="paginator-mob">
                <span className="paginator-mob__pages">18 of 1713</span>

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
              <ul className="paginator">
                <li className="paginator__item paginator__item--prev">
                  <a href="#"><i className="ti ti-chevron-left"></i></a>
                </li>
                <li className="paginator__item"><a href="#">1</a></li>
                <li className="paginator__item paginator__item--active"><a href="#">2</a></li>
                <li className="paginator__item"><a href="#">3</a></li>
                <li className="paginator__item"><a href="#">4</a></li>
                <li className="paginator__item"><span>...</span></li>
                <li className="paginator__item"><a href="#">87</a></li>
                <li className="paginator__item paginator__item--next">
                  <a href="#"><i className="ti ti-chevron-right"></i></a>
                </li>
              </ul>
              {/* end paginator desktop */}
            </div>
            {/* end paginator */}
          </div>
        </div>
      </div>
      {/* end catalog */}
      {/* section */}
      <section className="section section--border">
        <div className="container">
          <div className="row">
            {/* section title */}
            <div className="col-12">
              <div className="section__title-wrap">
                <h2 className="section__title">Expected premiere</h2>
                <a href="catalog.html" className="section__view section__view--carousel">View All</a>
              </div>
            </div>
            {/* end section title */}

            {/* carousel */}
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
                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">8.4</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                          <span className="item__category">
                            <a href="#">Action</a>
                            <a href="#">Triler</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover2.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">7.1</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Benched</a></h3>
                          <span className="item__category">
                            <a href="#">Comedy</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover3.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--red">6.3</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Whitney</a></h3>
                          <span className="item__category">
                            <a href="#">Romance</a>
                            <a href="#">Drama</a>
                            <a href="#">Music</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover4.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--yellow">6.9</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Blindspotting</a></h3>
                          <span className="item__category">
                            <a href="#">Comedy</a>
                            <a href="#">Drama</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover5.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">8.4</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                          <span className="item__category">
                            <a href="#">Action</a>
                            <a href="#">Triler</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover6.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">7.1</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Benched</a></h3>
                          <span className="item__category">
                            <a href="#">Comedy</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover7.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">7.1</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Benched</a></h3>
                          <span className="item__category">
                            <a href="#">Comedy</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover8.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--red">5.5</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                          <span className="item__category">
                            <a href="#">Action</a>
                            <a href="#">Triler</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover9.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--yellow">6.7</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Blindspotting</a></h3>
                          <span className="item__category">
                            <a href="#">Comedy</a>
                            <a href="#">Drama</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover10.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--red">5.6</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Whitney</a></h3>
                          <span className="item__category">
                            <a href="#">Romance</a>
                            <a href="#">Drama</a>
                            <a href="#">Music</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover11.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">9.2</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">Benched</a></h3>
                          <span className="item__category">
                            <a href="#">Comedy</a>
                          </span>
                        </div>
                      </div>
                    </li>

                    <li className="splide__slide">
                      <div className="item item--carousel">
                        <div className="item__cover">
                          <img src="/img/covers/cover12.jpg" alt="" />
                          <a href="details.html" className="item__play">
                            <i className="ti ti-player-play-filled"></i>
                          </a>
                          <span className="item__rate item__rate--green">8.4</span>
                          <button className="item__favorite" type="button"><i className="ti ti-bookmark"></i></button>
                        </div>
                        <div className="item__content">
                          <h3 className="item__title"><a href="details.html">I Dream in Another Language</a></h3>
                          <span className="item__category">
                            <a href="#">Action</a>
                            <a href="#">Triler</a>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* end carousel */}
          </div>
        </div>
      </section>
      {/* end section */}

      

      {/* footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="footer__content">
                <a href="index.html" className="footer__logo">
                 <h1><span className="logo-zen">ZEN</span><span className="logo-ma">MA</span></h1>
                </a>

                <span className="footer__copyright">© ZENMA, 2019—2024 <br /> Create by <a href="https://themeforest.net/user/dmitryvolkov/portfolio" target="_blank">Dmitry Volkov</a></span>

                <nav className="footer__nav">
                  <a href="about.html">About Us</a>
                  <a href="contacts.html">Contacts</a>
                  <a href="privacy.html">Privacy policy</a>
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