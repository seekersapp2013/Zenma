import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

export function Users() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const allUsers = useQuery(api.auth.getAllUsers);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (allUsers === undefined) {
    return (
      <AdminLayout currentPage="users" pageTitle="Users">
        <div className="d-flex align-items-center justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      currentPage="users" 
      pageTitle="Users" 
      totalCount={allUsers.length}
    >
      {/* Users Table */}
      <div className="catalog catalog--1">
        <table className="catalog__table">
          <thead>
            <tr>
              <th>USERNAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>JOINED DATE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="catalog__text">
                    {user.profile?.username || 'No username'}
                  </div>
                </td>
                <td>
                  <div className="catalog__text">
                    {user.email || 'No email'}
                  </div>
                </td>
                <td>
                  <div className="catalog__text">
                    <span className={`badge ${user.profile?.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {user.profile?.role || 'user'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="catalog__text">
                    {formatDate(user._creationTime)}
                  </div>
                </td>
                <td>
                  <div className="catalog__text">
                    <span className="badge bg-success">Active</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}