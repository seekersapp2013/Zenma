import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

export function AdminDashboard() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Get counts for dashboard stats
  const categories = useQuery(api.categories.getCategories);
  const allItems = useQuery(api.items.getAllItemsWithCategories);
  const allComments = useQuery(api.comments.getAllComments);
  const allReviews = useQuery(api.reviews.getAllReviews);
  const allActors = useQuery(api.actors.getAllActors);
  const allDirectors = useQuery(api.directors.getAllDirectors);
  const allUsers = useQuery(api.auth.getAllUsers);
  const blogStats = useQuery(api.pages.getBlogStats);

  const totalItems = allItems?.reduce((total, category) => total + category.items.length, 0) || 0;
  const totalComments = allComments?.length || 0;
  const totalReviews = allReviews?.length || 0;
  const totalActors = allActors?.length || 0;
  const totalDirectors = allDirectors?.length || 0;
  const totalUsers = allUsers?.length || 0;

  if (loggedInUser === undefined) {
    return (
      <div className="d-flex align-items-center justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!loggedInUser?.profile || loggedInUser.profile.role !== "admin") {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#fff'
      }}>
        <div className="text-center">
          <h2 className="mb-4">Access Denied</h2>
          <p className="mb-4">You don't have permission to access the admin dashboard.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    categories: categories?.length || 0,
    items: totalItems,
    comments: totalComments,
    reviews: totalReviews,
    actors: totalActors,
    directors: totalDirectors,
    users: totalUsers,
    blogPublished: blogStats?.published || 0,
    blogDrafts: blogStats?.drafts || 0,
    blogTotal: blogStats?.total || 0,
  };

  return (
    <AdminLayout 
      currentPage="dashboard" 
      pageTitle="Dashboard" 
      titleActions={
        <span className="main__title-stat">Admin Overview</span>
      }
    >
      <DashboardContent 
        navigate={navigate} 
        stats={stats}
      />
    </AdminLayout>
  );
}

function DashboardContent({ 
  navigate, 
  stats 
}: { 
  navigate: (path: string) => void;
  stats: {
    categories: number;
    items: number;
    comments: number;
    reviews: number;
    actors: number;
    directors: number;
    users: number;
    blogPublished: number;
    blogDrafts: number;
    blogTotal: number;
  };
}) {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Stats Cards */}
        <div className="col-12">
          <div className="row">
            {/* Categories Card */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats">
                <span>Categories</span>
                <p>{stats.categories}</p>
                <i className="ti ti-category"></i>
              </div>
            </div>

            {/* Items Card */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats">
                <span>Total Items</span>
                <p>{stats.items}</p>
                <i className="ti ti-movie"></i>
              </div>
            </div>

            {/* Users Card */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats">
                <span>Users</span>
                <p>{stats.users}</p>
                <i className="ti ti-users"></i>
              </div>
            </div>

            {/* Comments Card */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats">
                <span>Comments</span>
                <p>{stats.comments}</p>
                <i className="ti ti-message"></i>
              </div>
            </div>

            {/* Reviews Card */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats">
                <span>Reviews</span>
                <p>{stats.reviews}</p>
                <i className="ti ti-star-half-filled"></i>
              </div>
            </div>

            {/* Actors Card */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats">
                <span>Actors</span>
                <p>{stats.actors}</p>
                <i className="ti ti-user"></i>
              </div>
            </div>

            {/* Directors Card */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats">
                <span>Directors</span>
                <p>{stats.directors}</p>
                <i className="ti ti-video"></i>
              </div>
            </div>

            {/* Blog Card */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats">
                <span>Blog Posts</span>
                <p>{stats.blogTotal}</p>
                <i className="ti ti-pencil"></i>
              </div>
            </div>

            {/* Settings Card */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats">
                <span>Settings</span>
                <p>Manage</p>
                <i className="ti ti-settings"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12">
          <div className="catalog catalog--1">
            <div className="row">
              <div className="col-12">
                <h3 className="catalog__title">Quick Actions</h3>
              </div>
            </div>
            
            <div className="row">
              <div className="col-12 col-md-6 col-lg-4">
                <div className="card" style={{ backgroundColor: '#2b2b2b', border: '1px solid #404040' }}>
                  <div className="card-body text-center">
                    <i className="ti ti-category" style={{ fontSize: '2rem', color: '#007bff', marginBottom: '1rem' }}></i>
                    <h5 className="card-title text-white">Manage Categories</h5>
                    <p className="card-text text-muted">Create and organize content categories</p>
                    <button 
                      onClick={() => navigate('/categories')}
                      className="btn btn-primary"
                    >
                      Go to Categories
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div className="card" style={{ backgroundColor: '#2b2b2b', border: '1px solid #404040' }}>
                  <div className="card-body text-center">
                    <i className="ti ti-user" style={{ fontSize: '2rem', color: '#28a745', marginBottom: '1rem' }}></i>
                    <h5 className="card-title text-white">Manage Actors</h5>
                    <p className="card-text text-muted">Add and edit actor profiles</p>
                    <button 
                      onClick={() => navigate('/actors')}
                      className="btn btn-success"
                    >
                      Go to Actors
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div className="card" style={{ backgroundColor: '#2b2b2b', border: '1px solid #404040' }}>
                  <div className="card-body text-center">
                    <i className="ti ti-video" style={{ fontSize: '2rem', color: '#ffc107', marginBottom: '1rem' }}></i>
                    <h5 className="card-title text-white">Manage Directors</h5>
                    <p className="card-text text-muted">Add and edit director profiles</p>
                    <button 
                      onClick={() => navigate('/directors')}
                      className="btn btn-warning"
                    >
                      Go to Directors
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div className="card" style={{ backgroundColor: '#2b2b2b', border: '1px solid #404040' }}>
                  <div className="card-body text-center">
                    <i className="ti ti-pencil" style={{ fontSize: '2rem', color: '#e83e8c', marginBottom: '1rem' }}></i>
                    <h5 className="card-title text-white">Manage Blog</h5>
                    <p className="card-text text-muted">{stats.blogPublished} Published • {stats.blogDrafts} Drafts</p>
                    <button 
                      onClick={() => navigate('/blog-admin')}
                      className="btn btn-primary"
                      style={{ backgroundColor: '#e83e8c', borderColor: '#e83e8c' }}
                    >
                      Go to Blog
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div className="card" style={{ backgroundColor: '#2b2b2b', border: '1px solid #404040' }}>
                  <div className="card-body text-center">
                    <i className="ti ti-message" style={{ fontSize: '2rem', color: '#17a2b8', marginBottom: '1rem' }}></i>
                    <h5 className="card-title text-white">Manage Comments</h5>
                    <p className="card-text text-muted">Moderate user comments</p>
                    <button 
                      onClick={() => navigate('/comments')}
                      className="btn btn-info"
                    >
                      Go to Comments
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div className="card" style={{ backgroundColor: '#2b2b2b', border: '1px solid #404040' }}>
                  <div className="card-body text-center">
                    <i className="ti ti-star-half-filled" style={{ fontSize: '2rem', color: '#fd7e14', marginBottom: '1rem' }}></i>
                    <h5 className="card-title text-white">Manage Reviews</h5>
                    <p className="card-text text-muted">Moderate user reviews</p>
                    <button 
                      onClick={() => navigate('/reviews')}
                      className="btn btn-warning"
                    >
                      Go to Reviews
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <div className="card" style={{ backgroundColor: '#2b2b2b', border: '1px solid #404040' }}>
                  <div className="card-body text-center">
                    <i className="ti ti-settings" style={{ fontSize: '2rem', color: '#6c757d', marginBottom: '1rem' }}></i>
                    <h5 className="card-title text-white">Settings</h5>
                    <p className="card-text text-muted">Configure app settings</p>
                    <button 
                      onClick={() => navigate('/settings')}
                      className="btn btn-secondary"
                    >
                      Go to Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

