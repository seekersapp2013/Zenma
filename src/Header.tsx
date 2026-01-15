import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
              <ul className="header__nav">
                <li className="header__nav-item">
                  <a className="header__nav-link" href="/" role="button">
                    Home
                  </a>
                 
                </li>
                <li className="header__nav-item">
                  <a className="header__nav-link" href="/aboutus" role="button">
                    About Us</a>
                </li>
                               <li className="header__nav-item">
                  <a className="header__nav-link" href="/blog" role="button">
                    Blog</a>
                </li>

                <li className="header__nav-item">
                  <a className="header__nav-link" href="/contactus" role="button">
                    Contact Us</a>
                </li>
              </ul>
              {/* end header nav */}

              {/* header auth */}
              <div className="header__auth">
                <form onSubmit={handleSearch} className="header__search">
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
                    onClick={() => setSearchQuery("")}
                  >
                    <i className="ti ti-x"></i>
                  </button>
                </form>

                <button 
                  className="header__search-btn" 
                  type="button"
                  onClick={() => {
                    const searchForm = document.querySelector('.header__search') as HTMLElement;
                    if (searchForm) {
                      searchForm.classList.toggle('header__search--active');
                    }
                  }}
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
  );
}