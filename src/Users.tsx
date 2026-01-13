import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { useState } from "react";

export function Users() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const allUsers = useQuery(api.auth.getAllUsers);
  const banUser = useMutation(api.auth.banUser);
  const unbanUser = useMutation(api.auth.unbanUser);
  const deleteUser = useMutation(api.auth.deleteUser);
  
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [banReason, setBanReason] = useState("");
  const [showBanModal, setShowBanModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleBanUser = async (userId: string) => {
    setLoadingActions(prev => ({ ...prev, [userId]: true }));
    try {
      await banUser({ userId: userId as any, reason: banReason });
      setShowBanModal(null);
      setBanReason("");
    } catch (error) {
      console.error("Failed to ban user:", error);
      alert("Failed to ban user. Please try again.");
    } finally {
      setLoadingActions(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setLoadingActions(prev => ({ ...prev, [userId]: true }));
    try {
      await unbanUser({ userId: userId as any });
    } catch (error) {
      console.error("Failed to unban user:", error);
      alert("Failed to unban user. Please try again.");
    } finally {
      setLoadingActions(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoadingActions(prev => ({ ...prev, [userId]: true }));
    try {
      await deleteUser({ userId: userId as any });
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setLoadingActions(prev => ({ ...prev, [userId]: false }));
    }
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
              <th>ACTIONS</th>
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
                    <span className={`badge ${user.profile?.isBanned === true ? 'bg-warning' : 'bg-success'}`}>
                      {user.profile?.isBanned === true ? 'Banned' : 'Active'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="catalog__btns">
                    {user.profile?.role !== 'admin' && user._id !== loggedInUser?._id && (
                      <>
                        {user.profile?.isBanned === true ? (
                          <button
                            type="button"
                            className="catalog__btn catalog__btn--view"
                            onClick={() => handleUnbanUser(user._id.toString())}
                            disabled={loadingActions[user._id.toString()]}
                            title="Unban User"
                          >
                            {loadingActions[user._id.toString()] ? (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM10.5 5.5L6.5 9.5C6.22386 9.77614 5.77614 9.77614 5.5 9.5L3.5 7.5C3.22386 7.22386 3.22386 6.77614 3.5 6.5C3.77614 6.22386 4.22386 6.22386 4.5 6.5L6 8L9.5 4.5C9.77614 4.22386 10.2239 4.22386 10.5 4.5C10.7761 4.77614 10.7761 5.22386 10.5 5.5Z" fill="currentColor"/>
                              </svg>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="catalog__btn catalog__btn--banned"
                            onClick={() => setShowBanModal(user._id.toString())}
                            disabled={loadingActions[user._id.toString()]}
                            title="Ban User"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM10.5 9.5C10.7761 9.77614 10.7761 10.2239 10.5 10.5C10.2239 10.7761 9.77614 10.7761 9.5 10.5L7 8L4.5 10.5C4.22386 10.7761 3.77614 10.7761 3.5 10.5C3.22386 10.2239 3.22386 9.77614 3.5 9.5L6 7L3.5 4.5C3.22386 4.22386 3.22386 3.77614 3.5 3.5C3.77614 3.22386 4.22386 3.22386 4.5 3.5L7 6L9.5 3.5C9.77614 3.22386 10.2239 3.22386 10.5 3.5C10.7761 3.77614 10.7761 4.22386 10.5 4.5L8 7L10.5 9.5Z" fill="currentColor"/>
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          className="catalog__btn catalog__btn--delete"
                          onClick={() => setShowDeleteModal(user._id.toString())}
                          disabled={loadingActions[user._id.toString()]}
                          title="Delete User"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.5 2.5H10.5V1.5C10.5 0.671573 9.82843 0 9 0H5C4.17157 0 3.5 0.671573 3.5 1.5V2.5H1.5C1.22386 2.5 1 2.72386 1 3C1 3.27614 1.22386 3.5 1.5 3.5H2V11.5C2 12.3284 2.67157 13 3.5 13H10.5C11.3284 13 12 12.3284 12 11.5V3.5H12.5C12.7761 3.5 13 3.27614 13 3C13 2.72386 12.7761 2.5 12.5 2.5ZM4.5 1.5C4.5 1.22386 4.72386 1 5 1H9C9.27614 1 9.5 1.22386 9.5 1.5V2.5H4.5V1.5ZM11 11.5C11 11.7761 10.7761 12 10.5 12H3.5C3.22386 12 3 11.7761 3 11.5V3.5H11V11.5Z" fill="currentColor"/>
                            <path d="M5.5 5C5.77614 5 6 5.22386 6 5.5V9.5C6 9.77614 5.77614 10 5.5 10C5.22386 10 5 9.77614 5 9.5V5.5C5 5.22386 5.22386 5 5.5 5Z" fill="currentColor"/>
                            <path d="M8.5 5C8.77614 5 9 5.22386 9 5.5V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V5.5C8 5.22386 8.22386 5 8.5 5Z" fill="currentColor"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ban User Modal */}
      {showBanModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Ban User</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowBanModal(null);
                    setBanReason("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to ban this user? They will be unable to post comments and reviews.</p>
                <div className="mb-3">
                  <label htmlFor="banReason" className="form-label">Reason (optional):</label>
                  <textarea
                    id="banReason"
                    className="form-control bg-dark text-white border-secondary"
                    rows={3}
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Enter reason for ban..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowBanModal(null);
                    setBanReason("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => handleBanUser(showBanModal)}
                  disabled={loadingActions[showBanModal]}
                >
                  {loadingActions[showBanModal] ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Banning...
                    </>
                  ) : (
                    'Ban User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Delete User</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Warning:</strong> This action cannot be undone!</p>
                <p>Deleting this user will permanently remove:</p>
                <ul>
                  <li>User account and profile</li>
                  <li>All comments and reviews</li>
                  <li>All votes and interactions</li>
                </ul>
                <p>Are you sure you want to proceed?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeleteUser(showDeleteModal)}
                  disabled={loadingActions[showDeleteModal]}
                >
                  {loadingActions[showDeleteModal] ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}