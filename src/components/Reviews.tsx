import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatTimeAgo } from "../utils/timeUtils";
import { filterBannedWords } from "../utils/bannedWords";
import { toast } from "sonner";

interface ReviewsProps {
  itemId: Id<"items">;
}

interface ReviewData {
  _id: Id<"reviews">;
  _creationTime: number;
  itemId: Id<"items">;
  userId: Id<"users">;
  title: string;
  content: string;
  rating: number;
  upvotes: number;
  downvotes: number;
  createdAt: number;
  username: string;
}

export function Reviews({ itemId }: ReviewsProps) {
  const { isAuthenticated } = useConvexAuth();
  
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReview, setEditingReview] = useState<Id<"reviews"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(0);

  const reviews = useQuery(api.reviews.getReviews, itemId ? {
    itemId,
    page: currentPage,
    limit: 5,
  } : "skip");

  const bannedWords = useQuery(api.settings.getBannedWords) || [];
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const addReview = useMutation(api.reviews.addReview);
  const editReview = useMutation(api.reviews.editReview);
  const deleteReview = useMutation(api.reviews.deleteReview);
  const adminDeleteReview = useMutation(api.reviews.adminDeleteReview);
  const voteReview = useMutation(api.reviews.voteReview);

  // Don't render anything if itemId is not provided
  if (!itemId) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="reviews">
            <div className="text-center py-4">
              <p className="text-muted">Unable to load reviews.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to review");
      return;
    }

    if (!addReview) {
      toast.error("Reviews system not available");
      return;
    }

    if (!newTitle.trim()) {
      toast.error("Please enter a review title");
      return;
    }

    if (!newContent.trim()) {
      toast.error("Please enter a review");
      return;
    }

    if (newRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      // Filter banned words before submitting
      const filteredTitle = filterBannedWords(newTitle.trim(), bannedWords);
      const filteredContent = filterBannedWords(newContent.trim(), bannedWords);
      
      await addReview({
        itemId,
        title: filteredTitle,
        content: filteredContent,
        rating: newRating,
      });

      // Reset form
      setNewTitle("");
      setNewContent("");
      setNewRating(0);
      setCurrentPage(1); // Reset to page 1 to show new review
      toast.success("Review added successfully");
    } catch (error) {
      console.error("Error adding review:", error);
      if (error instanceof Error && error.message.includes("already reviewed")) {
        toast.error("You have already reviewed this item");
      } else {
        toast.error("Failed to add review");
      }
    }
  };

  const handleEditReview = async (reviewId: Id<"reviews">) => {
    if (!isAuthenticated || !loggedInUser) {
      toast.error("You must be logged in to edit reviews");
      return;
    }

    if (!editReview || !editTitle.trim() || !editContent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const filteredTitle = filterBannedWords(editTitle.trim(), bannedWords);
      const filteredContent = filterBannedWords(editContent.trim(), bannedWords);
      
      await editReview({
        reviewId,
        title: filteredTitle,
        content: filteredContent,
        rating: editRating,
      });

      setEditingReview(null);
      setEditTitle("");
      setEditContent("");
      setEditRating(0);
      toast.success("Review updated successfully");
    } catch (error) {
      console.error("Error editing review:", error);
      toast.error("Failed to update review. You can only edit your own reviews.");
    }
  };

  const handleDeleteReview = async (reviewId: Id<"reviews">) => {
    if (!isAuthenticated || !loggedInUser) {
      toast.error("You must be logged in to delete reviews");
      return;
    }

    if (!deleteReview) {
      toast.error("Delete function not available");
      return;
    }

    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteReview({ reviewId });
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. You can only delete your own reviews.");
    }
  };

  const handleAdminDeleteReview = async (reviewId: Id<"reviews">) => {
    if (!isAuthenticated || !loggedInUser) {
      toast.error("You must be logged in to delete reviews");
      return;
    }

    if (!adminDeleteReview) {
      toast.error("Admin delete function not available");
      return;
    }

    if (!confirm("Are you sure you want to delete this review as admin? This action cannot be undone.")) {
      return;
    }

    try {
      await adminDeleteReview({ reviewId });
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. Admin access required.");
    }
  };

  const startEdit = (reviewId: Id<"reviews">, currentTitle: string, currentContent: string, currentRating: number) => {
    setEditingReview(reviewId);
    setEditTitle(currentTitle);
    setEditContent(currentContent);
    setEditRating(currentRating);
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditTitle("");
    setEditContent("");
    setEditRating(0);
  };

  const handleVote = async (reviewId: Id<"reviews">, voteType: "up" | "down") => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    if (!voteReview) {
      toast.error("Voting system not available");
      return;
    }

    try {
      await voteReview({ reviewId, voteType });
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "reviews__rating--green";
    if (rating >= 6) return "reviews__rating--yellow";
    return "reviews__rating--red";
  };

  // Show loading state
  if (reviews === undefined) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="reviews">
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading reviews...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if reviews is null
  if (reviews === null) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="reviews">
            <div className="text-center py-4">
              <p className="text-muted">Unable to load reviews. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* reviews */}
      <div className="col-12">
        <div className="reviews">
          {/* Show "No Reviews Yet" if no reviews */}
          {reviews.reviews && reviews.reviews.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-star" style={{ fontSize: '48px', color: '#666', marginBottom: '16px' }}></i>
              <h4 style={{ color: '#666', marginBottom: '8px' }}>No Reviews Yet</h4>
              <p style={{ color: '#888' }}>
                {isAuthenticated 
                  ? "Be the first to share your review!" 
                  : "Sign in to be the first to review!"
                }
              </p>
            </div>
          ) : (
            <ul className="reviews__list">
              {reviews.reviews && reviews.reviews.map((review) => (
                <li key={review._id} className="reviews__item">
                  {editingReview === review._id ? (
                    // Edit form
                    <div className="reviews__edit-form">
                      <div className="sign__group">
                        <input
                          type="text"
                          className="sign__input"
                          placeholder="Review title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={200}
                        />
                      </div>
                      <div className="sign__group">
                        <select
                          className="sign__select"
                          value={editRating}
                          onChange={(e) => setEditRating(Number(e.target.value))}
                        >
                          <option value={0}>Select Rating</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option key={num} value={num}>{num} star{num !== 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sign__group">
                        <textarea
                          className="sign__textarea"
                          placeholder="Edit your review"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          maxLength={2000}
                        />
                      </div>
                      <div className="reviews__edit-actions">
                        <button
                          type="button"
                          className="sign__btn sign__btn--small"
                          onClick={() => handleEditReview(review._id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="sign__btn sign__btn--small"
                          onClick={cancelEdit}
                          style={{ marginLeft: '10px', background: '#666' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display review
                    <>
                      <div className="reviews__autor">
                        <img className="reviews__avatar" src="/img/user.svg" alt="" />
                        <span className="reviews__name">{review.title}</span>
                        <span className="reviews__time">
                          {formatTimeAgo(review.createdAt)} by {review.username}
                        </span>
                        <span className={`reviews__rating ${getRatingColor(review.rating)}`}>
                          {review.rating}
                        </span>
                      </div>
                      <p className="reviews__text">{review.content}</p>
                      
                      {/* Vote and action buttons */}
                      <div className="reviews__actions" style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* Vote buttons */}
                        <div className="reviews__votes" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={() => handleVote(review._id, "up")}
                            className="reviews__vote-btn"
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#ff1493', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                            disabled={!isAuthenticated}
                          >
                            <i className="ti ti-thumb-up"></i>
                            <span>{review.upvotes}</span>
                          </button>
                          <button
                            onClick={() => handleVote(review._id, "down")}
                            className="reviews__vote-btn"
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#ff1493', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                            disabled={!isAuthenticated}
                          >
                            <i className="ti ti-thumb-down"></i>
                            <span>{review.downvotes}</span>
                          </button>
                        </div>

                        {/* Edit/Delete buttons for review author */}
                        {isAuthenticated && loggedInUser?.profile?.userId === review.userId && (
                          <div className="reviews__owner-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => startEdit(review._id, review.title, review.content, review.rating)}
                              className="reviews__action-btn"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#ff1493', 
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              <i className="ti ti-edit"></i> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="reviews__action-btn"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#ff1493', 
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              <i className="ti ti-trash"></i> Delete
                            </button>
                          </div>
                        )}

                        {/* Admin delete button for any review */}
                        {isAuthenticated && loggedInUser?.profile?.role === "admin" && loggedInUser?.profile?.userId !== review.userId && (
                          <div className="reviews__admin-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleAdminDeleteReview(review._id)}
                              className="reviews__action-btn"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#dc3545', 
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                              title="Delete as admin"
                            >
                              <i className="ti ti-trash"></i> Admin Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Pagination - only show if there are multiple pages */}
          {reviews.totalPages && reviews.totalPages > 1 && (
            <div className="paginator-mob paginator-mob--comments">
              <span className="paginator-mob__pages">
                Page {reviews.currentPage} of {reviews.totalPages}
              </span>
              <ul className="paginator-mob__nav">
                <li>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={reviews.currentPage === 1}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: reviews.currentPage === 1 ? '#666' : '#ff1493',
                      cursor: reviews.currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <i className="ti ti-chevron-left"></i>
                    <span>Prev</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!reviews.hasMore}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: !reviews.hasMore ? '#666' : '#ff1493',
                      cursor: !reviews.hasMore ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>Next</span>
                    <i className="ti ti-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Review count */}
          <div className="paginator-mob paginator-mob--comments">
            <span className="paginator-mob__pages">
              {reviews.totalCount || 0} {(reviews.totalCount || 0) === 1 ? 'review' : 'reviews'} total
            </span>
          </div>

          {/* Review form */}
          <form onSubmit={handleSubmitReview} className="sign__form sign__form--comments">
            <div className="sign__group">
              <input
                type="text"
                className="sign__input"
                placeholder={!isAuthenticated ? "Please sign in to add a review" : "Review title"}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={!isAuthenticated}
                maxLength={200}
              />
            </div>

            <div className="sign__group">
              <select
                className="sign__select"
                name="rating"
                id="rating"
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                disabled={!isAuthenticated}
              >
                <option value={0}>Rating</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} star{num !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="sign__group">
              <textarea
                id="textreview"
                name="textreview"
                className="sign__textarea"
                placeholder={!isAuthenticated ? "Please sign in to add a review" : "Add review"}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                disabled={!isAuthenticated}
                maxLength={2000}
              />
            </div>

            <button 
              type="submit" 
              className="sign__btn sign__btn--small"
              disabled={!isAuthenticated || !newTitle.trim() || !newContent.trim() || newRating === 0}
            >
              {isAuthenticated ? "Send" : "Sign in to review"}
            </button>
          </form>
        </div>
      </div>
      {/* end reviews */}
    </div>
  );
}