import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

export function Catalog() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const allItems = useQuery(api.items.getAllItemsWithCategories);

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

  if (allItems === undefined) {
    return (
      <AdminLayout currentPage="catalog" pageTitle="Catalog">
        <div className="d-flex align-items-center justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalItems = allItems.reduce((total, category) => total + category.items.length, 0);

  return (
    <AdminLayout 
      currentPage="catalog" 
      pageTitle="Catalog" 
      totalCount={totalItems}
    >
      {/* Categories with Items */}
      <div className="catalog catalog--1">
        {allItems.map((category) => (
          <div key={category._id} className="mb-4">
            <h4 className="text-white mb-3">{category.title}</h4>
            {category.items.length === 0 ? (
              <p className="text-muted">No items in this category</p>
            ) : (
              <div className="row g-3">
                {category.items.map((item) => (
                  <div key={item._id} className="col-md-3 col-lg-2">
                    <div 
                      className="card h-100"
                      style={{
                        backgroundColor: '#2b2b2b',
                        border: '1px solid #404040',
                        borderRadius: '8px'
                      }}
                    >
                      <img
                        src={item.imageUrl || '/admin/img/placeholder.jpg'}
                        alt={item.title}
                        className="card-img-top"
                        style={{ 
                          height: '200px', 
                          objectFit: 'cover',
                          borderTopLeftRadius: '8px',
                          borderTopRightRadius: '8px'
                        }}
                      />
                      <div className="card-body p-2">
                        <h6 
                          className="card-title mb-1 text-white" 
                          style={{ fontSize: '0.875rem' }}
                        >
                          {item.title}
                        </h6>
                        <div className="mb-2">
                          {item.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="badge me-1"
                              style={{ 
                                fontSize: '0.7rem',
                                backgroundColor: '#404040',
                                color: '#fff'
                              }}
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                        <small className="text-muted">
                          {item.premiereYear && `${item.premiereYear} • `}
                          {item.runningTime && `${item.runningTime}min`}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}