/**
 * Sidebar component for admin pages
 * 
 * This component provides a consistent sidebar navigation for all admin pages.
 * It automatically fetches and displays counts for categories and items.
 * 
 * Usage:
 * ```tsx
 * import { Sidebar } from "./Sidebar";
 * 
 * <Sidebar currentPage="categories" />
 * ```
 * 
 * @param currentPage - The key of the currently active page (e.g., "categories", "users", etc.)
 */
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

interface SidebarProps {
  currentPage: string;
}

export function Sidebar({ currentPage }: SidebarProps) {
  const { signOut } = useAuthActions();
  
  // Get counts for sidebar
  const categories = useQuery(api.categories.getCategories);
  const allItems = useQuery(api.items.getAllItemsWithCategories);
  const allComments = useQuery(api.comments.getAllComments);
  const allReviews = useQuery(api.reviews.getAllReviews);
  const allActors = useQuery(api.actors.getAllActors);
  const allDirectors = useQuery(api.directors.getAllDirectors);
  const allUsers = useQuery(api.auth.getAllUsers);
  const blogStats = useQuery(api.pages.getBlogStats);

  const totalItems = allItems?.reduce((total, category) => total + category.items.length, 0) || 0;

  const navigationItems = [
    { 
      href: "/dashboard", 
      icon: "ti-layout-grid", 
      label: "Dashboard", 
      key: "dashboard" 
    },
    { 
      href: "/admin/categories", 
      icon: "ti-category", 
      label: "Categories", 
      key: "categories",
      count: categories?.length || 0
    },
    { 
      href: "/admin/actors", 
      icon: "ti-user", 
      label: "Actors", 
      key: "actors",
      count: allActors?.length || 0
    },
    { 
      href: "/admin/directors", 
      icon: "ti-video", 
      label: "Directors", 
      key: "directors",
      count: allDirectors?.length || 0
    },
    { 
      href: "/admin/blog-admin", 
      icon: "ti-pencil", 
      label: "Blog", 
      key: "blog",
      count: blogStats?.total || 0,
      badge: blogStats?.drafts || 0
    },
    { 
      href: "/admin/users", 
      icon: "ti-users", 
      label: "Users", 
      key: "users",
      count: allUsers?.length || 0
    },
    { 
      href: "/admin/comments", 
      icon: "ti-message", 
      label: "Comments", 
      key: "comments",
      count: allComments?.length || 0
    },
    { 
      href: "/admin/reviews", 
      icon: "ti-star-half-filled", 
      label: "Reviews", 
      key: "reviews",
      count: allReviews?.length || 0
    },
    { 
      href: "/admin/ratings", 
      icon: "ti-chart-bar", 
      label: "Ratings", 
      key: "ratings"
    },
    { 
      href: "/admin/aboutus-editor", 
      icon: "ti-info-circle", 
      label: "About Us", 
      key: "aboutus" 
    },
    { 
      href: "/admin/contactus-editor", 
      icon: "ti-mail", 
      label: "Contact Us", 
      key: "contactus" 
    },
    { 
      href: "/admin/settings", 
      icon: "ti-settings", 
      label: "Settings", 
      key: "settings" 
    }
  ];

  return (
    <div className="sidebar">
        {/* header logo */}
          <a href="/" className="header__logo">
            <h1>
              <span style={{ color: '#ff1493', fontWeight: 900 }}>ZEN</span>
              <span style={{ color: '#ffffff', fontWeight: 900 }}>MA</span>
            </h1>
          </a>
        {/* end header logo */}
      
      <div className="sidebar__user">
        <div className="sidebar__user-img">
          <img src="/admin/img/user.svg" alt="User" />
        </div>
        <div className="sidebar__user-title">
          <span>Admin</span>
          <p>Content Management</p>
        </div>
        <button 
          className="sidebar__user-btn" 
          type="button"
          onClick={() => void signOut()}
          title="Sign Out"
        >
          <i className="ti ti-logout"></i>
        </button>
      </div>

      <div className="sidebar__nav-wrap">
        <ul className="sidebar__nav">
          {navigationItems.map((item) => (
            <li key={item.key} className="sidebar__nav-item">
              <a 
                href={item.href} 
                className={`sidebar__nav-link ${currentPage === item.key ? 'sidebar__nav-link--active' : ''}`}
              >
                <i className={`ti ${item.icon}`}></i> 
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="sidebar__nav-count">{item.count}</span>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="sidebar__nav-badge" style={{
                    backgroundColor: '#e83e8c',
                    color: '#fff',
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginLeft: '8px'
                  }}>{item.badge}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="sidebar__copyright">
        © Zenma, {new Date().getFullYear()}
      </div>
    </div>
  );
}