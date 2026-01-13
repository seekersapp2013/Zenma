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

  const totalItems = allItems?.reduce((total, category) => total + category.items.length, 0) || 0;

  const navigationItems = [
    { 
      href: "/dashboard", 
      icon: "ti-layout-grid", 
      label: "Dashboard", 
      key: "dashboard" 
    },
    { 
      href: "/categories", 
      icon: "ti-category", 
      label: "Categories", 
      key: "categories",
      count: categories?.length || 0
    },
    { 
      href: "/actors", 
      icon: "ti-user", 
      label: "Actors", 
      key: "actors",
      count: allActors?.length || 0
    },
    { 
      href: "/directors", 
      icon: "ti-video", 
      label: "Directors", 
      key: "directors",
      count: allDirectors?.length || 0
    },
    { 
      href: "/users", 
      icon: "ti-users", 
      label: "Users", 
      key: "users",
      count: allUsers?.length || 0
    },
    { 
      href: "/comments", 
      icon: "ti-message", 
      label: "Comments", 
      key: "comments",
      count: allComments?.length || 0
    },
    { 
      href: "/reviews", 
      icon: "ti-star-half-filled", 
      label: "Reviews", 
      key: "reviews",
      count: allReviews?.length || 0
    },
    { 
      href: "/settings", 
      icon: "ti-settings", 
      label: "Settings", 
      key: "settings" 
    }
  ];

  return (
    <div className="sidebar">
      <a href="/dashboard" className="sidebar__logo">
        <img src="/admin/img/logo.svg" alt="Logo" />
      </a>
      
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