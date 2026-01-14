import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface ClapButtonProps {
  pageId: Id<"pages">;
  totalClaps: number;
  isAuthenticated: boolean;
}

export function ClapButton({ pageId, totalClaps, isAuthenticated }: ClapButtonProps) {
  const userClaps = useQuery(api.claps.getUserClaps, { pageId });
  const addClap = useMutation(api.claps.addClap);
  
  const [localClaps, setLocalClaps] = useState(0);
  const [isClapping, setIsClapping] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupCount, setPopupCount] = useState(0);
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
    setPopupCount(count);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 800);

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

  const displayTotal = totalClaps + localClaps;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-lg"
        style={{
          backgroundColor: isClapping ? '#ff1493' : '#2b2b2b',
          border: '2px solid #ff1493',
          color: '#fff',
          borderRadius: '50px',
          padding: '15px 30px',
          fontSize: '1.2rem',
          transition: 'all 0.2s',
          transform: isClapping ? 'scale(1.1)' : 'scale(1)',
          boxShadow: isClapping ? '0 0 20px rgba(255, 20, 147, 0.5)' : 'none'
        }}
        onClick={() => handleClap(1)}
        onMouseDown={startRapidClap}
        onMouseUp={stopRapidClap}
        onMouseLeave={stopRapidClap}
        onTouchStart={startRapidClap}
        onTouchEnd={stopRapidClap}
        disabled={!isAuthenticated || (userClaps?.remaining === 0)}
      >
        <i className="ti ti-heart" style={{ marginRight: '10px' }}></i>
        <span style={{ fontWeight: 'bold' }}>{displayTotal}</span>
      </button>

      {showPopup && (
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ff1493',
            color: '#fff',
            padding: '5px 15px',
            borderRadius: '20px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            animation: 'popup 0.8s ease-out',
            pointerEvents: 'none'
          }}
        >
          +{popupCount}
        </div>
      )}

      {isAuthenticated && userClaps && (
        <div className="text-center mt-2" style={{ fontSize: '0.9rem', color: '#999' }}>
          <div>You clapped {userClaps.clapCount} times</div>
          <div>{userClaps.remaining} claps remaining</div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="text-center mt-2" style={{ fontSize: '0.9rem', color: '#999' }}>
          Log in to clap
        </div>
      )}

      <style>{`
        @keyframes popup {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
