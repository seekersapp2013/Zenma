import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatTimeAgo } from "../utils/timeUtils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../AdminLayout";

export function CommentsManagement() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [selectedItemId, setSelectedItemId] = useState<Id<"items"> | null>(null);
  const [showItemComments, setShowItemComments] = useState(false);
  
  const itemsWithComments = useQuery(api.comments?.getItemsWithCommentCounts);
  const itemComments = useQuery(
    api.comments?.getItemComments,
    selectedItemId ? { itemId: selectedItemId } : "skip"
  );
  
  const deleteComment = useMutation(api.comments?.adminDeleteComment);

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

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    if (!confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteComment({ commentId });
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleViewComments = (itemId: Id<"items">) => {
    setSelectedItemId(itemId);
    setShowItemComments(true);
  };

  const handleBackToItems = () => {
    setShowItemComments(false);
    setSelectedItemId(null);
  };

  if (itemsWithComments === undefined) {
    return (
      <AdminLayout currentPage="comments" pageTitle="Comments">
        <div className="d-flex align-items-center justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalComments = itemsWithComments.reduce((sum, item) => sum + item.commentCount, 0);
  const selectedItem = itemsWithComments?.find(item => item._id === selectedItemId);

  if (showItemComments && selectedItem) {
    return (
      <AdminLayout 
        currentPage="comments" 
        pageTitle={`Comments for "${selectedItem.title}"`}
        totalCount={itemComments?.length || 0}
        titleActions={
          <button 
            onClick={handleBackToItems}
            className="main__title-link main__title-link--wrap"
          >
            <i className="ti ti-arrow-left"></i> Back to Items
          </button>
        }
      >
        {/* Comments Table */}
        <div className="catalog catalog--1">
          {itemComments === undefined ? (
            <div className="d-flex align-items-center justify-content-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : itemComments && itemComments.length > 0 ? (
            <table className="catalog__table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>COMMENT</th>
                  <th>VOTES</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {itemComments.map((comment) => (
                  <tr key={comment._id}>
                    <td>
                      <div className="catalog__user">
                        <div className="catalog__avatar">
                          <div className="catalog__avatar-placeholder">
                            {comment.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="catalog__meta">
                          <h3>{comment.username}</h3>
                          {comment.isReply && (
                            <span className="badge bg-secondary">Reply</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="catalog__text">
                        <p style={{ marginBottom: '8px' }}>{comment.content}</p>
                        {comment.repliesCount > 0 && (
                          <small className="text-muted">
                            <i className="ti ti-message"></i> {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="catalog__text">
                        <div className="d-flex align-items-center gap-3">
                          <span className="text-success">
                            <i className="ti ti-thumb-up"></i> {comment.upvotes}
                          </span>
                          <span className="text-danger">
                            <i className="ti ti-thumb-down"></i> {comment.downvotes}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="catalog__text">
                        {formatTimeAgo(comment.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="catalog__btns">
                        <button 
                          type="button" 
                          className="catalog__btn catalog__btn--delete" 
                          onClick={() => handleDeleteComment(comment._id)}
                          title="Delete Comment"
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5">
              <i className="ti ti-message" style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}></i>
              <h4 className="text-white mb-2">No Comments</h4>
              <p className="text-muted">This item doesn't have any comments yet.</p>
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      currentPage="comments" 
      pageTitle="Comments Management" 
      totalCount={totalComments}
    >
      {/* Items with Comments Table */}
      <div className="catalog catalog--1">
        {itemsWithComments && itemsWithComments.length > 0 ? (
          <table className="catalog__table">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>GENRES</th>
                <th>COMMENTS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {itemsWithComments.map((item) => (
                <tr 
                  key={item._id}
                  onClick={() => handleViewComments(item._id)}
                  style={{ cursor: 'pointer' }}
                  className="catalog__row--clickable"
                >
                  <td>
                    <div className="catalog__user">
                      <div className="catalog__avatar">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} />
                        ) : (
                          <div className="catalog__avatar-placeholder">
                            <i className="ti ti-movie"></i>
                          </div>
                        )}
                      </div>
                      <div className="catalog__meta">
                        <h3>{item.title}</h3>
                        <span>{item.premiereYear || 'Unknown Year'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="catalog__text">
                      {item.genres?.slice(0, 3).map((genre, index) => (
                        <span key={genre}>
                          {genre}
                          {index < Math.min(item.genres.length, 3) - 1 && ', '}
                        </span>
                      )) || 'No genres'}
                      {item.genres && item.genres.length > 3 && (
                        <span className="text-muted"> +{item.genres.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="catalog__text">
                      <span className="badge bg-primary">
                        {item.commentCount} {item.commentCount === 1 ? 'comment' : 'comments'}
                      </span>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="catalog__btns">
                      <button 
                        type="button" 
                        className="catalog__btn catalog__btn--view"
                        onClick={() => handleViewComments(item._id)}
                        title="View Comments"
                      >
                        <i className="ti ti-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-5">
            <i className="ti ti-message" style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '2rem' }}></i>
            <h4 className="text-white mb-3">No Comments Yet</h4>
            <p className="text-muted">No items have received comments yet. Comments will appear here once users start engaging with your content.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}