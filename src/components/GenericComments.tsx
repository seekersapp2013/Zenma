import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatTimeAgo } from "../utils/timeUtils";
import { filterBannedWords } from "../utils/bannedWords";
import { toast } from "sonner";

interface GenericCommentsProps {
  targetId: Id<"items"> | Id<"pages">;
  targetType: "item" | "page";
}

interface CommentData {
  _id: Id<"comments">;
  _creationTime: number;
  userId: Id<"users">;
  content: string;
  parentCommentId?: Id<"comments">;
  quotedCommentId?: Id<"comments">;
  quotedText?: string;
  upvotes: number;
  downvotes: number;
  createdAt: number;
  username: string;
  quotedComment?: {
    _id: Id<"comments">;
    content: string;
    username: string;
  } | null;
  repliesCount: number;
}

export function GenericComments({ targetId, targetType }: GenericCommentsProps) {
  const { isAuthenticated } = useConvexAuth();
  
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<Id<"comments"> | undefined>(undefined);
  const [quotingComment, setQuotingComment] = useState<{
    id: Id<"comments">;
    text: string;
    username: string;
  } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState<Set<Id<"comments">>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [editingComment, setEditingComment] = useState<Id<"comments"> | null>(null);
  const [editText, setEditText] = useState("");

  // Use the appropriate query based on targetType
  const comments = useQuery(
    targetType === "item" ? api.comments.getComments : api.comments.getPageComments,
    targetId ? {
      [targetType === "item" ? "itemId" : "pageId"]: targetId,
      page: currentPage,
      limit: 10,
    } as any : "skip"
  );

  const bannedWords = useQuery(api.settings.getBannedWords) || [];
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const addComment = useMutation(
    targetType === "item" ? api.comments.addComment : api.comments.addPageComment
  );
  const editComment = useMutation(api.comments.editComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  const voteComment = useMutation(api.comments.voteComment);

  // Don't render anything if targetId is not provided
  if (!targetId) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="comments">
            <div className="text-center py-4">
              <p className="text-muted">Unable to load comments.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!addComment) {
      toast.error("Comments system not available");
      return;
    }

    const content = replyingTo ? replyText : newComment;
    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      // Filter banned words before submitting
      const filteredContent = filterBannedWords(content.trim(), bannedWords);
      
      const args: any = {
        content: filteredContent,
        parentCommentId: replyingTo,
        quotedCommentId: quotingComment?.id,
        quotedText: quotingComment?.text,
      };

      // Add the appropriate ID field
      if (targetType === "item") {
        args.itemId = targetId;
      } else {
        args.pageId = targetId;
      }

      await addComment(args);

      // Reset form
      if (replyingTo) {
        setReplyText("");
        setReplyingTo(undefined);
      } else {
        setNewComment("");
        // Reset to page 1 to show new comment
        setCurrentPage(1);
      }
      setQuotingComment(null);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleEditComment = async (commentId: Id<"comments">) => {
    if (!isAuthenticated || !loggedInUser) {
      toast.error("You must be logged in to edit comments");
      return;
    }

    if (!editComment || !editText.trim()) {
      toast.error("Please enter comment text");
      return;
    }

    try {
      const filteredContent = filterBannedWords(editText.trim(), bannedWords);
      
      await editComment({
        commentId,
        content: filteredContent,
      });

      setEditingComment(null);
      setEditText("");
      toast.success("Comment updated successfully");
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Failed to update comment. You can only edit your own comments.");
    }
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    if (!isAuthenticated || !loggedInUser) {
      toast.error("You must be logged in to delete comments");
      return;
    }

    if (!deleteComment) {
      toast.error("Delete function not available");
      return;
    }

    if (!confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteComment({ commentId });
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment. You can only delete your own comments.");
    }
  };

  const startEdit = (commentId: Id<"comments">, currentContent: string) => {
    setEditingComment(commentId);
    setEditText(currentContent);
    setReplyingTo(undefined);
    setQuotingComment(null);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };

  const handleVote = async (commentId: Id<"comments">, voteType: "up" | "down") => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    if (!voteComment) {
      toast.error("Voting system not available");
      return;
    }

    try {
      await voteComment({ commentId, voteType });
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const handleQuote = (commentId: Id<"comments">, text: string, username: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to quote");
      return;
    }
    setQuotingComment({ id: commentId, text, username });
    setReplyingTo(undefined);
  };

  const handleReply = (commentId: Id<"comments"> | undefined) => {
    if (commentId && !isAuthenticated) {
      toast.error("Please sign in to reply");
      return;
    }
    setReplyingTo(commentId);
    setQuotingComment(null);
  };

  const toggleReplies = (commentId: Id<"comments">) => {
    const newShowReplies = new Set(showReplies);
    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId);
    } else {
      newShowReplies.add(commentId);
    }
    setShowReplies(newShowReplies);
  };

  // Show loading state
  if (comments === undefined) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="comments">
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading comments...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if comments is null
  if (comments === null) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="comments">
            <div className="text-center py-4">
              <p className="text-muted">Unable to load comments. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row" id="comments-section">
      {/* comments */}
      <div className="col-12">
        <div className="comments">
          {/* Show "No Comments Yet" if no comments */}
          {comments.comments && comments.comments.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-message-circle" style={{ fontSize: '48px', color: '#666', marginBottom: '16px' }}></i>
              <h4 style={{ color: '#666', marginBottom: '8px' }}>No Comments Yet</h4>
              <p style={{ color: '#888' }}>
                {isAuthenticated 
                  ? "Be the first to share your thoughts!" 
                  : "Sign in to be the first to comment!"
                }
              </p>
            </div>
          ) : (
            <ul className="comments__list">
              {comments.comments && comments.comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  isAuthenticated={isAuthenticated}
                  loggedInUser={loggedInUser}
                  onVote={handleVote}
                  onReply={handleReply}
                  onQuote={handleQuote}
                  onEdit={startEdit}
                  onDelete={handleDeleteComment}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onSubmitReply={handleSubmitComment}
                  showReplies={showReplies.has(comment._id)}
                  onToggleReplies={() => toggleReplies(comment._id)}
                  editingComment={editingComment}
                  editText={editText}
                  setEditText={setEditText}
                  onEditSubmit={handleEditComment}
                  onEditCancel={cancelEdit}
                  bannedWords={bannedWords}
                />
              ))}
            </ul>
          )}

          {/* Pagination - only show if there are multiple pages */}
          {comments.totalPages && comments.totalPages > 1 && (
            <div className="paginator-mob paginator-mob--comments">
              <span className="paginator-mob__pages">
                Page {comments.currentPage} of {comments.totalPages}
              </span>
              <ul className="paginator-mob__nav">
                <li>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={comments.currentPage === 1}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: comments.currentPage === 1 ? '#666' : '#ff1493',
                      cursor: comments.currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <i className="ti ti-chevron-left"></i>
                    <span>Prev</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!comments.hasMore}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: !comments.hasMore ? '#666' : '#ff1493',
                      cursor: !comments.hasMore ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>Next</span>
                    <i className="ti ti-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Comment count */}
          <div className="paginator-mob paginator-mob--comments">
            <span className="paginator-mob__pages">
              {comments.totalCount || 0} {(comments.totalCount || 0) === 1 ? 'comment' : 'comments'} total
            </span>
          </div>

          {/* Comment form */}
          <form onSubmit={handleSubmitComment} className="sign__form sign__form--comments">
            {quotingComment && (
              <div className="quote-preview mb-3 p-3" style={{ 
                background: '#1a1a1a', 
                border: '1px solid #333', 
                borderRadius: '4px' 
              }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted">Quoting @{quotingComment.username}:</small>
                    <p className="mb-0 mt-1" style={{ fontStyle: 'italic' }}>
                      "{quotingComment.text.length > 100 ? quotingComment.text.substring(0, 100) + '...' : quotingComment.text}"
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setQuotingComment(null)}
                    style={{ color: '#ff1493' }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="sign__group">
              <textarea
                id="text"
                name="text"
                className="sign__textarea"
                placeholder={
                  !isAuthenticated 
                    ? "Please sign in to add a comment" 
                    : quotingComment 
                      ? "Add your comment with quote..." 
                      : "Add comment"
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isAuthenticated}
                maxLength={2000}
              />
            </div>

            <button 
              type="submit" 
              className="sign__btn sign__btn--small"
              disabled={!isAuthenticated || !newComment.trim()}
            >
              {isAuthenticated ? "Send" : "Sign in to comment"}
            </button>
          </form>
        </div>
      </div>
      {/* end comments */}
    </div>
  );
}

interface CommentItemProps {
  comment: CommentData;
  isAuthenticated: boolean;
  loggedInUser: any;
  onVote: (commentId: Id<"comments">, voteType: "up" | "down") => void;
  onReply: (commentId: Id<"comments"> | undefined) => void;
  onQuote: (commentId: Id<"comments">, text: string, username: string) => void;
  onEdit: (commentId: Id<"comments">, currentContent: string) => void;
  onDelete: (commentId: Id<"comments">) => void;
  replyingTo: Id<"comments"> | undefined;
  replyText: string;
  setReplyText: (text: string) => void;
  onSubmitReply: (e: React.FormEvent) => void;
  showReplies: boolean;
  onToggleReplies: () => void;
  editingComment: Id<"comments"> | null;
  editText: string;
  setEditText: (text: string) => void;
  onEditSubmit: (commentId: Id<"comments">) => void;
  onEditCancel: () => void;
  bannedWords: string[];
}

function CommentItem({
  comment,
  isAuthenticated,
  loggedInUser,
  onVote,
  onReply,
  onQuote,
  onEdit,
  onDelete,
  replyingTo,
  replyText,
  setReplyText,
  onSubmitReply,
  showReplies,
  onToggleReplies,
  editingComment,
  editText,
  setEditText,
  onEditSubmit,
  onEditCancel,
  bannedWords,
}: CommentItemProps) {
  const replies = useQuery(
    api.comments.getReplies,
    showReplies ? { parentCommentId: comment._id } : "skip"
  );

  const isQuote = !!comment.quotedComment;
  const isReply = !!comment.parentCommentId;
  
  const isOwner = isAuthenticated && loggedInUser && loggedInUser._id === comment.userId;
  const canEdit = isOwner;
  const canDelete = isOwner;

  // Filter banned words from display content
  const displayContent = filterBannedWords(comment.content, bannedWords);
  const displayQuotedContent = comment.quotedComment 
    ? filterBannedWords(comment.quotedComment.content, bannedWords)
    : null;

  return (
    <li className={`comments__item ${isReply ? 'comments__item--answer' : ''} ${isQuote ? 'comments__item--quote' : ''} ${isOwner ? 'comments__item--own' : ''}`}>
      <div className="comments__autor">
        <img className="comments__avatar" src="/img/user.svg" alt="" />
        <span className="comments__name">
          {comment.username}
          {isOwner && <span style={{ color: '#ff1493', fontSize: '0.8em', marginLeft: '4px' }}>(You)</span>}
        </span>
        <span className="comments__time">{formatTimeAgo(comment.createdAt)}</span>
      </div>
      
      <p className="comments__text">
        {comment.quotedComment && (
          <span style={{ fontStyle: 'italic', color: '#888', display: 'block', marginBottom: '8px' }}>
            @{comment.quotedComment.username}: "{displayQuotedContent}"
          </span>
        )}
        {editingComment === comment._id ? (
          <div className="edit-form">
            <textarea
              className="sign__textarea"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              maxLength={2000}
              style={{ marginBottom: '8px' }}
            />
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="sign__btn sign__btn--small"
                onClick={() => onEditSubmit(comment._id)}
                disabled={!editText.trim()}
              >
                Save
              </button>
              <button 
                type="button" 
                className="sign__btn sign__btn--small"
                onClick={onEditCancel}
                style={{ background: '#666' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          displayContent
        )}
      </p>
      
      <div className="comments__actions">
        <div className="comments__rate">
          <button 
            type="button" 
            onClick={() => onVote(comment._id, "up")}
            disabled={!isAuthenticated}
          >
            <i className="ti ti-thumb-up"></i>{comment.upvotes}
          </button>
          <button 
            type="button" 
            onClick={() => onVote(comment._id, "down")}
            disabled={!isAuthenticated}
          >
            {comment.downvotes}<i className="ti ti-thumb-down"></i>
          </button>
        </div>
        
        {isAuthenticated && loggedInUser && (
          <>
            <button type="button" onClick={() => onReply(comment._id)}>
              <i className="ti ti-arrow-forward-up"></i>Reply
            </button>
            <button type="button" onClick={() => onQuote(comment._id, comment.content, comment.username)}>
              <i className="ti ti-quote"></i>Quote
            </button>
            {canEdit && editingComment !== comment._id && (
              <button 
                type="button" 
                onClick={() => onEdit(comment._id, comment.content)}
              >
                <i className="ti ti-edit"></i>Edit
              </button>
            )}
            {canDelete && (
              <button 
                type="button" 
                onClick={() => onDelete(comment._id)} 
                style={{ color: '#ff4444' }}
              >
                <i className="ti ti-trash"></i>Delete
              </button>
            )}
          </>
        )}
        
        {comment.repliesCount > 0 && (
          <button type="button" onClick={onToggleReplies}>
            <i className={`ti ti-chevron-${showReplies ? 'up' : 'down'}`}></i>
            {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      {/* Reply form */}
      {replyingTo === comment._id && (
        <div style={{ marginLeft: '40px', marginTop: '16px', borderLeft: '2px solid #ff1493', paddingLeft: '20px' }}>
          <form onSubmit={onSubmitReply} className="sign__form sign__form--comments">
            <div className="sign__group">
              <textarea
                className="sign__textarea"
                placeholder={`Reply to @${comment.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={2000}
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="sign__btn sign__btn--small" disabled={!replyText.trim()}>
                Reply
              </button>
              <button 
                type="button" 
                className="sign__btn sign__btn--small" 
                onClick={() => {
                  setReplyText("");
                  onReply(undefined);
                }}
                style={{ background: '#666' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Replies */}
      {showReplies && replies && replies.length > 0 && (
        <div style={{ marginLeft: '40px', marginTop: '16px', borderLeft: '2px solid #333', paddingLeft: '20px' }}>
          <ul className="comments__list">
            {replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                isAuthenticated={isAuthenticated}
                loggedInUser={loggedInUser}
                onVote={onVote}
                onReply={onReply}
                onQuote={onQuote}
                onEdit={onEdit}
                onDelete={onDelete}
                replyingTo={replyingTo}
                replyText={replyText}
                setReplyText={setReplyText}
                onSubmitReply={onSubmitReply}
                showReplies={false}
                onToggleReplies={() => {}}
                editingComment={editingComment}
                editText={editText}
                setEditText={setEditText}
                onEditSubmit={onEditSubmit}
                onEditCancel={onEditCancel}
                bannedWords={bannedWords}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
