import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { GeneralSettings } from "./components/GeneralSettings";

export function Settings() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);

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

  return (
    <AdminLayout 
      currentPage="settings" 
      pageTitle="Settings"
      titleActions={
        <span className="main__title-stat">App Configuration</span>
      }
    >
      {/* Settings Content */}
      <div className="catalog catalog--1">
        <div className="p-4">
          <GeneralSettings />
        </div>
      </div>
    </AdminLayout>
  );
}