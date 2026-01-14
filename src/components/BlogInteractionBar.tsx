import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface BlogInteractionBarProps {
  pageId: Id<"pages">;
  totalClaps: number;
  commentCount: number;
  isAuthenticated: boolean;
}

export function BlogInteractionBar({ 
  pageId, 
  totalClaps, 
  commentCount,
  isAuthenticated 
}: BlogInteractionBarProps) {
  const userClaps = useQuery(api.claps.getUserClaps, { pageId });
  const addClap = useMutation(api.claps.addClap);
  
  const [localClaps, setLocalClaps] = useState(0);
  const [isClapping, setIsClapping] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clapCountRef = useRef(0);

  const handleClap = async (count: number = 1) => {
    if (!isAuthenticated) {
      toast.error("Please log in to clap");
      return;
    }

    if (!userClaps || userClaps.remaining < count) {
      toast.error(`Only ${userClaps?.remaining || 0} claps remaining!`);
      return;
    }

    setLocalClaps(prev => prev + count);

    try {
      await addClap({ pageId, clapCount: count });
    } catch (error) {
      setLocalClaps(prev => prev - count);
      toast.error(error instanceof Error ? error.message : "Failed to clap");
    }
  };

  const startRapidClap = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to clap");
      return;
    }

    setIsClapping(true);
    clapCountRef.current = 0;

    holdTimerRef.current = setInterval(() => {
      if (userClaps && userClaps.remaining > clapCountRef.current) {
        clapCountRef.current += 1;
        handleClap(1);
      } else {
        stopRapidClap();
      }
    }, 100);
  };

  const stopRapidClap = () => {
    setIsClapping(false);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    clapCountRef.current = 0;
  };

  const handleShare = (platform: 'twitter' | 'email' | 'copy') => {
    const url = window.location.href;
    const title = document.title;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        break;
    }
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to bookmark");
      return;
    }
    toast.info("Bookmark feature coming soon!");
  };

  const displayTotal = totalClaps + localClaps;
  const userClapCount = userClaps?.clapCount || 0;

  return (
    <div style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '20px 0',
      margin: '30px 0'
    }}>
      {/* Main interaction bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '10px'
      }}>
        {/* Clap button */}
        <button
          onClick={() => handleClap(1)}
          onMouseDown={startRapidClap}
          onMouseUp={stopRapidClap}
          onMouseLeave={stopRapidClap}
          onTouchStart={startRapidClap}
          onTouchEnd={stopRapidClap}
          disabled={!isAuthenticated || (userClaps?.remaining === 0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: isAuthenticated ? 'pointer' : 'not-allowed',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isClapping ? '#ff1493' : '#c0c0c0',
            fontSize: '1.1rem',
            transition: 'all 0.2s',
            transform: isClapping ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ fontSize: '24px' }}
          >
            <path d="M8 13V4.5a1.5 1.5 0 0 1 3 0V12"></path>
            <path d="M11 11.5v-2a1.5 1.5 0 1 1 3 0V12"></path>
            <path d="M14 10.5a1.5 1.5 0 0 1 3 0V12"></path>
            <path d="M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2 .208a6 6 0 0 1-5.012-2.7L7 19c-.312-.479-1.407-2.388-3.286-5.728a1.5 1.5 0 0 1 .536-2.022 1.867 1.867 0 0 1 2.28.28L8 13"></path>
          </svg>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>
            {userClapCount}/100
          </span>
        </button>

        {/* Comment icon with count */}
        <button
          onClick={() => {
            const commentsSection = document.getElementById('comments-section');
            commentsSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#c0c0c0',
            fontSize: '24px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ff1493'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#c0c0c0'}
        >
          <i className="ti ti-message-circle"></i>
          {commentCount > 0 && (
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              ({commentCount})
            </span>
          )}
        </button>

        {/* Email share */}
        <button
          onClick={() => handleShare('email')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#c0c0c0',
            fontSize: '24px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ff1493'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#c0c0c0'}
        >
          <i className="ti ti-mail"></i>
        </button>

        {/* Twitter/X share */}
        <button
          onClick={() => handleShare('twitter')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#c0c0c0',
            fontSize: '24px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ff1493'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#c0c0c0'}
        >
          <i className="ti ti-brand-x"></i>
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }}></div>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#c0c0c0',
            fontSize: '24px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ff1493'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#c0c0c0'}
        >
          <i className="ti ti-bookmark"></i>
        </button>
      </div>

      {/* Clap count text */}
      <div style={{
        fontSize: '14px',
        color: '#888',
        paddingLeft: '8px'
      }}>
        {displayTotal} {displayTotal === 1 ? 'clap' : 'claps'}
      </div>
    </div>
  );
}
