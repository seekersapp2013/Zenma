import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import "./sign.css";

const MOVIE_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
  "Romance", "Science Fiction", "Thriller", "War", "Western"
];

export function UserOnboarding() {
  const createProfile = useMutation(api.auth.createUserProfile);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    interests: [] as string[]
  });

  const checkUsername = useQuery(api.auth.checkUsernameAvailable, 
    formData.username && formData.username.length >= 3 ? { username: formData.username } : "skip"
  );

  const handleInterestToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(genre)
        ? prev.interests.filter(i => i !== genre)
        : [...prev.interests, genre]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || formData.username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (checkUsername === false) {
      toast.error("Username is already taken");
      return;
    }

    if (checkUsername === undefined) {
      toast.error("Please wait while we check username availability");
      return;
    }

    if (formData.interests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    setSubmitting(true);
    try {
      await createProfile({
        username: formData.username,
        interests: formData.interests
      });
      
      toast.success("Profile completed successfully!");
      // The page will automatically refresh/redirect due to the auth state change
    } catch (error: any) {
      console.error("Profile creation error:", error);
      toast.error(error.message || "Failed to create profile");
      setSubmitting(false);
    }
  };

  return (
    <div className="sign section--bg">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="sign__content">
              <div className="sign__form">
                <a href="#" className="sign__logo">
                  <span style={{ color: '#ff1493', fontWeight: 'bold', fontSize: '28px' }}>ZEN</span>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '28px' }}>MA</span>
                </a>

                <h3 style={{ color: 'white', fontSize: '24px', marginBottom: '24px', textAlign: 'center' }}>
                  Complete Your Profile
                </h3>

                <form onSubmit={handleSubmit}>
                  {/* Username */}
                  <div className="sign__group">
                    <input 
                      type="text" 
                      className="sign__input" 
                      placeholder="Username (min 3 characters)"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      minLength={3}
                      required
                    />
                    {formData.username && formData.username.length >= 3 && (
                      <div style={{ 
                        fontSize: '14px', 
                        marginTop: '4px',
                        color: checkUsername === undefined ? '#fbbf24' : checkUsername ? '#4ade80' : '#f87171'
                      }}>
                        {checkUsername === undefined ? '⏳ Checking availability...' : 
                         checkUsername ? '✓ Username available' : '✗ Username taken'}
                      </div>
                    )}
                    {formData.username && formData.username.length > 0 && formData.username.length < 3 && (
                      <div style={{ 
                        fontSize: '14px', 
                        marginTop: '4px',
                        color: '#f87171'
                      }}>
                        Username must be at least 3 characters
                      </div>
                    )}
                  </div>

                  {/* Interests */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: 'white', fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>
                      What movie genres interest you?
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '8px', 
                      marginBottom: '16px', 
                      maxHeight: '240px', 
                      overflowY: 'auto' 
                    }}>
                      {MOVIE_GENRES.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleInterestToggle(genre)}
                          style={{
                            padding: '8px',
                            fontSize: '14px',
                            borderRadius: '4px',
                            border: `2px solid ${formData.interests.includes(genre) ? '#ff1493' : '#9ca3af'}`,
                            backgroundColor: formData.interests.includes(genre) ? '#ff1493' : 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!formData.interests.includes(genre)) {
                              e.currentTarget.style.borderColor = '#ff1493';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!formData.interests.includes(genre)) {
                              e.currentTarget.style.borderColor = '#9ca3af';
                            }
                          }}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: '14px', marginBottom: '16px' }}>
                      Selected: {formData.interests.length} genres
                    </div>
                  </div>

                  <button 
                    className="sign__btn"
                    type="submit"
                    disabled={submitting || formData.interests.length === 0 || !checkUsername}
                  >
                    {submitting ? "Creating Profile..." : "Complete Profile"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}