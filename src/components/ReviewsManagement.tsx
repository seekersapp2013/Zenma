import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatTimeAgo } from "../utils/timeUtils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../AdminLayout";

export function ReviewsManagement() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [selectedItemId, setSelectedItemId] = useState<Id<"items"> | null>(null);
  const [showItemReviews, setShowItemReviews] = useState(false);
  
  const itemsWithReviews = useQuery(api.reviews?.getItemsWithReviewCounts);
  const itemReviews = useQuery(
    api.reviews?.getItemReviews,
    selectedItemId ? { itemId: selectedItemId } : "skip"
  );
  
  const deleteReview = useMutation(api.reviews?.adminDeleteReview);

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

  const handleDeleteReview = async (reviewId: Id<"reviews">) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteReview({ reviewId });
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-success";
    if (rating >= 6) return "text-warning";
    return "text-danger";
  };

  const getRatingBadgeClass = (rating: number) => {
    if (rating >= 8) return "bg-success";
    if (rating >= 6) return "bg-warning";
    return "bg-danger";
  };

  const handleViewReviews = (itemId: Id<"items">) => {
    setSelectedItemId(itemId);
    setShowItemReviews(true);
  };

  const handleBackToItems = () => {
    setShowItemReviews(false);
    setSelectedItemId(null);
  };

  if (itemsWithReviews === undefined) {
    return (
      <AdminLayout currentPage="reviews" pageTitle="Reviews">
        <div className="d-flex align-items-center justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalReviews = itemsWithReviews.reduce((sum, item) => sum + item.reviewCount, 0);
  const selectedItem = itemsWithReviews?.find(item => item._id === selectedItemId);

  if (showItemReviews && selectedItem) {
    return (
      <AdminLayout 
        currentPage="reviews" 
        pageTitle={`Reviews for "${selectedItem.title}"`}
        totalCount={itemReviews?.length || 0}
        titleActions={
          <button 
            onClick={handleBackToItems}
            className="main__title-link main__title-link--wrap"
          >
            <i className="ti ti-arrow-left"></i> Back to Items
          </button>
        }
      >
        {/* Reviews Table */}
        <div className="catalog catalog--1">
          {itemReviews === undefined ? (
            <div className="d-flex align-items-center justify-content-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : itemReviews && itemReviews.length > 0 ? (
            <table className="catalog__table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>REVIEW</th>
                  <th>RATING</th>
                  <th>VOTES</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {itemReviews.map((review) => (
                  <tr key={review._id}>
                    <td>
                      <div className="catalog__user">
                        <div className="catalog__avatar">
                          <div className="catalog__avatar-placeholder">
                            {review.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="catalog__meta">
                          <h3>{review.username}</h3>
                          <span>Reviewer</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="catalog__text">
                        <h4 style={{ marginBottom: '8px', fontSize: '1rem' }}>{review.title}</h4>
                        <p style={{ marginBottom: '0', opacity: 0.8, fontSize: '0.9rem' }}>
                          {review.content.length > 100 
                            ? `${review.content.substring(0, 100)}...` 
                            : review.content
                          }
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="catalog__text">
                        <span className={`badge ${getRatingBadgeClass(review.rating)}`}>
                          <i className="ti ti-star"></i> {review.rating}/10
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="catalog__text">
                        <div className="d-flex align-items-center gap-3">
                          <span className="text-success">
                            <i className="ti ti-thumb-up"></i> {review.upvotes}
                          </span>
                          <span className="text-danger">
                            <i className="ti ti-thumb-down"></i> {review.downvotes}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="catalog__text">
                        {formatTimeAgo(review.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="catalog__btns">
                        <button 
                          type="button" 
                          className="catalog__btn catalog__btn--delete" 
                          onClick={() => handleDeleteReview(review._id)}
                          title="Delete Review"
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
              <i className="ti ti-star" style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}></i>
              <h4 className="text-white mb-2">No Reviews</h4>
              <p className="text-muted">This item doesn't have any reviews yet.</p>
            </div>
          )}
        </div>


      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      currentPage="reviews" 
      pageTitle="Reviews Management" 
      totalCount={totalReviews}
    >
      {/* Items with Reviews Table */}
      <div className="catalog catalog--1">
        {itemsWithReviews && itemsWithReviews.length > 0 ? (
          <table className="catalog__table">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>GENRES</th>
                <th>REVIEWS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {itemsWithReviews.map((item) => {
                return (
                  <tr 
                    key={item._id}
                    onClick={() => handleViewReviews(item._id)}
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
                          {item.reviewCount} review{item.reviewCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="catalog__btns">
                        <button 
                          type="button" 
                          className="catalog__btn catalog__btn--view"
                          onClick={() => handleViewReviews(item._id)}
                          title="View Reviews"
                        >
                          <i className="ti ti-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-5">
            <i className="ti ti-star" style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '2rem' }}></i>
            <h4 className="text-white mb-3">No Reviews Yet</h4>
            <p className="text-muted">No items have received reviews yet. Reviews will appear here once users start rating your content.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}