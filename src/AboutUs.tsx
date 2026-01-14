import { useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Header } from "./Header";
import { Footer } from "./Footer";
import './sign.css';

export function AboutUs() {
  // Fetch about us content from app settings
  const aboutContent = useQuery(api.settings.getAboutUsContent);

  useEffect(() => {
    // Load essential CSS files for consistent styling
    const essentialCssFiles = [
      '/css/bootstrap.min.css',
      '/css/main.css',
      '/webfont/tabler-icons.min.css'
    ];

    essentialCssFiles.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'all';
        document.head.appendChild(link);
      }
    });
  }, []);

  if (aboutContent === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Critical CSS for consistent styling */}
      <style>{`
        .feature {
          text-align: center;
          padding: 40px 30px;
          background: rgba(22, 21, 27, 0.6);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 30px;
          transition: all 0.4s ease;
          backdrop-filter: blur(10px);
        }
        .feature:hover {
          background: rgba(22, 21, 27, 0.9);
          border-color: rgba(255, 20, 147, 0.4);
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(255, 20, 147, 0.2);
        }
        .feature__title {
          font-size: 22px;
          font-weight: 600;
          margin: 20px 0 15px;
          letter-spacing: 0.5px;
        }
        .feature__text {
          color: #c0c0c0;
          line-height: 1.7;
          font-size: 15px;
        }
        .how:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(255, 20, 147, 0.15);
        }
        .how__title {
          font-size: 24px;
          font-weight: 600;
          margin: 25px 0 20px;
          letter-spacing: 0.5px;
        }
        .how__text {
          color: #c0c0c0;
          line-height: 1.7;
          font-size: 16px;
        }
        .content__title {
          font-size: 36px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 30px;
          text-align: center;
          letter-spacing: 1px;
        }
        .content__text {
          color: #c0c0c0;
          line-height: 1.8;
          font-size: 16px;
          margin-bottom: 40px;
        }
        .content__text p {
          margin-bottom: 25px;
        }
        .section__title--head {
          font-size: 48px;
          font-weight: 300;
          color: #fff;
          text-transform: uppercase;
          margin: 0;
          letter-spacing: 2px;
        }
        .breadcrumbs {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 30px 0 0;
          justify-content: center;
        }
        .breadcrumbs__item {
          color: #c0c0c0;
          font-size: 14px;
          font-weight: 500;
        }
        .breadcrumbs__item:not(:last-child)::after {
          content: '/';
          margin: 0 12px;
          color: #666;
        }
        .breadcrumbs__item a {
          color: #c0c0c0;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .breadcrumbs__item a:hover {
          color: #ff1493;
        }
        .breadcrumbs__item--active {
          color: #ff1493;
          font-weight: 600;
        }
        .section__wrap {
          text-align: center;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .content__title {
            font-size: 28px;
          }
          .section__title--head {
            font-size: 36px;
          }
          .feature {
            padding: 30px 20px;
          }
          .how {
            padding: 30px 20px !important;
          }
          .content__quote {
            padding: 40px 30px !important;
          }
        }
        
        @media (max-width: 576px) {
          .content__title {
            font-size: 24px;
          }
          .section__title--head {
            font-size: 28px;
          }
          .feature__title {
            font-size: 20px;
          }
          .how__title {
            font-size: 20px;
          }
        }
      `}</style>
      {/* header */}
      <Header />
      {/* end header */}

      {/* Page Title */}
      <section className="section section--first section--bg" style={{ 
        background: 'linear-gradient(135deg, rgba(191, 26, 101, 0.8) 0%, rgba(45, 27, 61, 0.9) 100%)',
        paddingTop: '120px',
        paddingBottom: '60px'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section__wrap">
                <h1 className="section__title section__title--head">About Us</h1>
                <ul className="breadcrumbs">
                  <li className="breadcrumbs__item">
                    <a href="/">Home</a>
                  </li>
                  <li className="breadcrumbs__item breadcrumbs__item--active">About Us</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '60px' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              <div className="content__head" style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 className="content__title" style={{ marginBottom: '40px' }}>
                  <span style={{ color: '#ff1493' }}>Zenma</span> – Best Place for Movies
                </h2>
                <div className="content__text" style={{ fontSize: '18px', lineHeight: '1.8' }}>
                  <p style={{ marginBottom: '30px' }}>
                    {aboutContent?.mainDescription || 
                      "Welcome to Zenma movie site, the ultimate destination for all film enthusiasts. Immerse yourself in a world of captivating stories, stunning visuals, and unforgettable performances. Explore our extensive library of movies, spanning across genres, eras, and cultures."
                    }
                  </p>
                  <p style={{ marginBottom: '0' }}>
                    {aboutContent?.secondaryDescription || 
                      "Indulge in the joy of cinema with our curated collections, featuring handpicked movies grouped by themes, directors, or actors. Dive into the world of cinematic magic and let yourself be transported to new realms of imagination and emotion."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ paddingTop: '60px', paddingBottom: '80px', background: 'rgba(22, 21, 27, 0.3)' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 className="content__title">Why Choose Zenma?</h2>
              </div>
            </div>
          </div>
          <div className="row" style={{ gap: '30px 0' }}>
            {[
              {
                icon: "🎬",
                title: "Ultra HD Quality",
                description: "Experience movies like never before with our Ultra HD feature. Immerse yourself in stunning visuals, vibrant colors, and crystal-clear detail that brings every scene to life."
              },
              {
                icon: "🎭",
                title: "Vast Movie Database",
                description: "Discover an extensive collection of movies in our comprehensive database. With thousands of titles across all genres, you'll never run out of entertainment options."
              },
              {
                icon: "📺",
                title: "Online TV Streaming",
                description: "Expand your entertainment horizons with our Online TV feature. Stream live channels, catch up on shows, and enjoy diverse television content anytime, anywhere."
              },
              {
                icon: "🎟️",
                title: "Early Access",
                description: "Be the first to experience the latest releases with our Early Access feature. Get exclusive previews, special screenings, and stay ahead of the entertainment curve."
              },
              {
                icon: "📱",
                title: "Multi-Device Support",
                description: "Seamlessly stream content across all your devices. From smartphones to smart TVs, enjoy the cinematic experience wherever you are, with perfect synchronization."
              },
              {
                icon: "🌍",
                title: "Global Content",
                description: "Break language barriers with our multi-language subtitles and diverse international content. Explore cinema from around the world and expand your cultural horizons."
              }
            ].map((feature, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4">
                <div className="feature" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="feature__icon" style={{ 
                    fontSize: '56px', 
                    marginBottom: '25px',
                    filter: 'drop-shadow(0 0 10px rgba(255, 20, 147, 0.3))'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 className="feature__title" style={{ 
                    color: '#ff1493', 
                    marginBottom: '20px',
                    fontSize: '22px'
                  }}>
                    {feature.title}
                  </h3>
                  <p className="feature__text" style={{ 
                    flex: '1',
                    fontSize: '15px',
                    lineHeight: '1.7'
                  }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div style={{ textAlign: 'center', marginBottom: '70px' }}>
                <h2 className="content__title">How It Works</h2>
                <p style={{ 
                  color: '#c0c0c0', 
                  fontSize: '18px', 
                  marginTop: '20px',
                  maxWidth: '600px',
                  margin: '20px auto 0'
                }}>
                  Getting started with Zenma is simple and straightforward. Follow these three easy steps to begin your cinematic journey.
                </p>
              </div>
            </div>
          </div>
          <div className="row" style={{ alignItems: 'stretch' }}>
            {[
              {
                number: "01",
                title: "Create Your Account",
                description: "Start your movie-watching journey by creating a personalized account on our platform. Sign up easily with your email and gain instant access to our world of entertainment."
              },
              {
                number: "02",
                title: "Choose Your Plan",
                description: "Select the perfect subscription plan that suits your preferences and viewing habits. We offer flexible options from basic access to premium unlimited streaming."
              },
              {
                number: "03",
                title: "Enjoy Unlimited Streaming",
                description: "Immerse yourself in the world of Zenma with unlimited movie streaming. Browse our vast collection, create watchlists, and discover your next favorite film."
              }
            ].map((step, index) => (
              <div key={index} className="col-12 col-md-4">
                <div className="how" style={{ 
                  height: '100%',
                  padding: '40px 30px',
                  background: 'rgba(22, 21, 27, 0.4)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}>
                  <div className="how__number" style={{ 
                    background: 'linear-gradient(135deg, #ff1493, #d91a72)',
                    color: '#fff',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    margin: '0 auto 30px',
                    boxShadow: '0 8px 25px rgba(255, 20, 147, 0.3)'
                  }}>
                    {step.number}
                  </div>
                  <h3 className="how__title" style={{ 
                    color: '#ff1493', 
                    marginBottom: '20px',
                    fontSize: '24px'
                  }}>
                    {step.title}
                  </h3>
                  <p className="how__text" style={{ 
                    fontSize: '16px',
                    lineHeight: '1.7',
                    margin: '0'
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      {aboutContent?.missionStatement && (
        <section className="section" style={{ 
          paddingTop: '80px', 
          paddingBottom: '80px',
          background: 'rgba(22, 21, 27, 0.3)'
        }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-lg-10 col-xl-8">
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                  <h2 className="content__title">Our Mission</h2>
                </div>
                <div className="content__quote" style={{ 
                  background: 'rgba(22, 21, 27, 0.8)',
                  padding: '60px 50px',
                  borderRadius: '20px',
                  border: '2px solid rgba(255, 20, 147, 0.3)',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ff1493',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%'
                  }}></div>
                  <p style={{ 
                    fontSize: '20px', 
                    lineHeight: '1.8', 
                    margin: 0,
                    fontStyle: 'italic',
                    color: '#fff'
                  }}>
                    "{aboutContent.missionStatement}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* footer */}
      <Footer />
      {/* end footer */}
    </div>
  );
}