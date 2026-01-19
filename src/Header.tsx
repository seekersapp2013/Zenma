import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function Header() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchActive(false);
      setSearchQuery("");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
  };

  const closeSearch = () => {
    setIsSearchActive(false);
    setSearchQuery("");
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
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
              <div className={`header__nav-wrapper ${isMobileMenuOpen ? 'header__nav-wrapper--active' : ''}`}>
                <button 
                  className="header__nav-close"
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="ti ti-x"></i>
                </button>
                <ul className="header__nav">
                  <li className="header__nav-item">
                    <a 
                      className={`header__nav-link ${isActive('/') ? 'header__nav-link--active' : ''}`}
                      href="/" 
                      role="button" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </a>
                  </li>
                  <li className="header__nav-item">
                    <a 
                      className={`header__nav-link ${isActive('/movies') ? 'header__nav-link--active' : ''}`}
                      href="#" 
                      role="button" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Movies
                    </a>
                  </li>
                  <li className="header__nav-item">
                    <a 
                      className={`header__nav-link ${isActive('/actors') ? 'header__nav-link--active' : ''}`}
                      href="#" 
                      role="button" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Actors
                    </a>
                  </li>
                  <li className="header__nav-item">
                    <a 
                      className={`header__nav-link ${isActive('/blog') ? 'header__nav-link--active' : ''}`}
                      href="/blog" 
                      role="button" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              {/* end header nav */}

              {/* header auth */}
              <div className="header__auth">
                <form onSubmit={handleSearch} className={`header__search ${isSearchActive ? 'header__search--active' : ''}`}>
                  <input 
                    className="header__search-input" 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="header__search-button" type="submit">
                    <i className="ti ti-search"></i>
                  </button>
                  <button 
                    className="header__search-close" 
                    type="button"
                    onClick={closeSearch}
                  >
                    <i className="ti ti-x"></i>
                  </button>
                </form>

                <button 
                  className="header__search-btn" 
                  type="button"
                  onClick={toggleSearch}
                >
                  <i className="ti ti-search"></i>
                </button>


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
              {/* end header auth */}

              <button 
                className={`header__btn ${isMobileMenuOpen ? 'header__btn--active' : ''}`}
                type="button"
                onClick={toggleMobileMenu}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}