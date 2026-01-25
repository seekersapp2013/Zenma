import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState<"movies" | "actors" | "directors" | "blog">("movies");
  
  const searchResults = useQuery(api.search.searchAll, { searchTerm });

  useEffect(() => {
    // Load JS files
    const jsFiles = [
      '/js/bootstrap.bundle.min.js',
      '/js/main.js'
    ];

    jsFiles.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }, []);

  // Auto-switch to first tab with results
  useEffect(() => {
    if (searchResults) {
      if (searchResults.movies.length > 0) {
        setActiveTab('movies');
      } else if (searchResults.actors.length > 0) {
        setActiveTab('actors');
      } else if (searchResults.directors.length > 0) {
        setActiveTab('directors');
      } else if (searchResults.blog.length > 0) {
        setActiveTab('blog');
      }
    }
  }, [searchResults]);

  const getTotalResults = () => {
    if (!searchResults) return 0;
    return (
      searchResults.movies.length +
      searchResults.actors.length +
      searchResults.directors.length +
      searchResults.blog.length
    );
  };

  const renderMovies = () => {
    if (!searchResults || searchResults.movies.length === 0) {
      return (
        <div className="col-12 text-center py-5">
          <p style={{ fontSize: '1.2rem', color: '#999' }}>No movies found</p>
        </div>
      );
    }

    return searchResults.movies.map((movie) => (
      <div key={movie._id} className="col-6 col-sm-4 col-lg-3 col-xl-2">
        <div className="item">
          <div className="item__cover">
            <img 
              src={movie.imageUrl || '/img/placeholder.jpg'} 
              alt={movie.title || 'Movie'}
              onError={(e) => {
                e.currentTarget.src = '/img/placeholder.jpg';
              }}
            />
            <a href={`/details/${movie.slug}`} className="item__play">
              <i className="ti ti-player-play-filled"></i>
            </a>
            {movie.rating && (
              <span className={`item__rate ${
                (movie.dynamicRating || movie.adminRating || movie.rating) >= 8 ? 'item__rate--green' :
                (movie.dynamicRating || movie.adminRating || movie.rating) >= 6 ? 'item__rate--yellow' :
                'item__rate--red'
              }`}>
                {movie.dynamicRating?.toFixed(1) || movie.adminRating?.toFixed(1) || movie.rating?.toFixed(1)}
              </span>
            )}
          </div>
          <div className="item__content">
            <h3 className="item__title">
              <a href={`/details/${movie.slug}`}>{movie.title}</a>
            </h3>
            <ul className="item__list">
              {movie.premiereYear && <li>{movie.premiereYear}</li>}
              {movie.genres && movie.genres.length > 0 && (
                <li>{movie.genres.slice(0, 2).join(", ")}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    ));
  };

  const renderActors = () => {
    if (!searchResults || searchResults.actors.length === 0) {
      return (
        <div className="col-12 text-center py-5">
          <p style={{ fontSize: '1.2rem', color: '#999' }}>No actors found</p>
        </div>
      );
    }

    return searchResults.actors.map((actor) => (
      <div key={actor._id} className="col-6 col-sm-4 col-lg-3 col-xl-2">
        <div className="item">
          <div className="item__cover">
            <img 
              src={actor.imageUrl || '/img/placeholder.jpg'} 
              alt={actor.name}
              onError={(e) => {
                e.currentTarget.src = '/img/placeholder.jpg';
              }}
            />
            <a href={`/actor/${actor.slug}`} className="item__play">
              <i className="ti ti-user"></i>
            </a>
          </div>
          <div className="item__content">
            <h3 className="item__title">
              <a href={`/actor/${actor.slug}`}>{actor.name}</a>
            </h3>
            <ul className="item__list">
              <li>{actor.career}</li>
              {actor.totalMovies && <li>{actor.totalMovies} movies</li>}
            </ul>
          </div>
        </div>
      </div>
    ));
  };

  const renderDirectors = () => {
    if (!searchResults || searchResults.directors.length === 0) {
      return (
        <div className="col-12 text-center py-5">
          <p style={{ fontSize: '1.2rem', color: '#999' }}>No directors found</p>
        </div>
      );
    }

    return searchResults.directors.map((director) => (
      <div key={director._id} className="col-6 col-sm-4 col-lg-3 col-xl-2">
        <div className="item">
          <div className="item__cover">
            <img 
              src={director.imageUrl || '/img/placeholder.jpg'} 
              alt={director.name}
              onError={(e) => {
                e.currentTarget.src = '/img/placeholder.jpg';
              }}
            />
            <a href={`/director/${director.slug}`} className="item__play">
              <i className="ti ti-video"></i>
            </a>
          </div>
          <div className="item__content">
            <h3 className="item__title">
              <a href={`/director/${director.slug}`}>{director.name}</a>
            </h3>
            <ul className="item__list">
              <li>{director.career}</li>
              {director.totalMovies && <li>{director.totalMovies} movies</li>}
            </ul>
          </div>
        </div>
      </div>
    ));
  };

  const renderBlog = () => {
    if (!searchResults || searchResults.blog.length === 0) {
      return (
        <div className="col-12 text-center py-5">
          <p style={{ fontSize: '1.2rem', color: '#999' }}>No blog posts found</p>
        </div>
      );
    }

    return searchResults.blog.map((post) => (
      <div key={post._id} className="col-6 col-sm-4 col-lg-3 col-xl-2">
        <div className="item">
          <div className="item__cover">
            <img 
              src={post.coverImageUrl || '/img/placeholder.jpg'} 
              alt={post.title}
              onError={(e) => {
                e.currentTarget.src = '/img/placeholder.jpg';
              }}
            />
            <a href={`/blog/${post.slug}`} className="item__play">
              <i className="ti ti-book"></i>
            </a>
          </div>
          <div className="item__content">
            <h3 className="item__title">
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </h3>
            <ul className="item__list">
              <li>
                <i className="ti ti-user"></i> {post.author.username}
              </li>
              {post.readingTimeMinutes && (
                <li>
                  <i className="ti ti-clock"></i> {post.readingTimeMinutes} min
                </li>
              )}
            </ul>
            {post.excerpt && (
              <p className="item__description" style={{ 
                fontSize: '13px',
                color: '#c0c0c0',
                marginTop: '8px',
                lineHeight: '1.4'
              }}>
                {post.excerpt.length > 80 ? post.excerpt.substring(0, 80) + '...' : post.excerpt}
              </p>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <Header />
      
      {/* Page Title */}
      <section className="section section--first" style={{ paddingTop: '30px', paddingBottom: '20px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section__title-wrap">
                <h1 className="section__title section__title--head" style={{ marginBottom: '10px' }}>
                  Search Results
                </h1>
                <p className="section__text" style={{ marginBottom: '0' }}>
                  {searchTerm ? (
                    <>
                      Found <span style={{ color: '#ff1493' }}>{getTotalResults()}</span> results for "{searchTerm}"
                    </>
                  ) : (
                    'Enter a search term to find movies, actors, directors, and blog posts'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="section" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <ul className="nav nav-tabs section__tabs" role="tablist">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'movies' ? 'active' : ''}`}
                    onClick={() => setActiveTab('movies')}
                    type="button"
                  >
                    Movies {searchResults && `(${searchResults.movies.length})`}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'actors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('actors')}
                    type="button"
                  >
                    Actors {searchResults && `(${searchResults.actors.length})`}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'directors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('directors')}
                    type="button"
                  >
                    Directors {searchResults && `(${searchResults.directors.length})`}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'blog' ? 'active' : ''}`}
                    onClick={() => setActiveTab('blog')}
                    type="button"
                  >
                    Blog {searchResults && `(${searchResults.blog.length})`}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="section" style={{ paddingTop: '20px' }}>
        <div className="container">
          <div className="row row--grid">
            {searchResults === undefined ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'movies' && renderMovies()}
                {activeTab === 'actors' && renderActors()}
                {activeTab === 'directors' && renderDirectors()}
                {activeTab === 'blog' && renderBlog()}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
