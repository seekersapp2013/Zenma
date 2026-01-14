import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";

export function Header() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

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