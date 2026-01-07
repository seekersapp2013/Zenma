import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import "./sign.css";

const MOVIE_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
  "Romance", "Science Fiction", "Thriller", "War", "Western"
];

interface SignUpData {
  email: string;
  password: string;
  username: string;
  interests: string[];
}

export function SignUpWizard({ onBack }: { onBack: () => void }) {
  const { signIn } = useAuthActions();
  const createProfile = useMutation(api.auth.createUserProfile);
  
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [signUpData, setSignUpData] = useState<SignUpData>({
    email: "",
    password: "",
    username: "",
    interests: []
  });

  const checkUsername = useQuery(api.auth.checkUsernameAvailable, 
    signUpData.username && signUpData.username.length >= 3 ? { username: signUpData.username } : "skip"
  );

  const handleStep1Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setSignUpData(prev => ({
      ...prev,
      email: formData.get("email") as string,
      password: formData.get("password") as string
    }));
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const username = signUpData.username;
    
    if (!username || username.length < 3) {
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

    setStep(3);
  };

  const handleInterestToggle = (genre: string) => {
    setSignUpData(prev => ({
      ...prev,
      interests: prev.interests.includes(genre)
        ? prev.interests.filter(i => i !== genre)
        : [...prev.interests, genre]
    }));
  };

  const handleFinalSubmit = async () => {
    if (signUpData.interests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    setSubmitting(true);
    try {
      // First create the user account
      const formData = new FormData();
      formData.set("email", signUpData.email);
      formData.set("password", signUpData.password);
      formData.set("flow", "signUp");
      
      console.log("Creating user account...");
      await signIn("password", formData);
      
      // Wait a moment for the user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then create the profile
      console.log("Creating user profile with username:", signUpData.username);
      await createProfile({
        username: signUpData.username,
        interests: signUpData.interests
      });
      
      console.log("Profile created successfully!");
      toast.success("Account created successfully!");
      
      // Don't redirect - let the routing system handle it based on user state
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
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

                {/* Step Indicator */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    {[1, 2, 3].map((stepNum) => (
                      <div key={stepNum} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: step >= stepNum ? '#ff1493' : '#ccc',
                          color: step >= stepNum ? 'white' : '#666'
                        }}>
                          {stepNum}
                        </div>
                        {stepNum < 3 && (
                          <div style={{
                            width: '48px',
                            height: '2px',
                            backgroundColor: step > stepNum ? '#ff1493' : '#ccc',
                            marginLeft: '8px',
                            marginRight: '8px'
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', color: 'white', fontSize: '14px' }}>
                    Step {step} of 3: {
                      step === 1 ? "Account Details" :
                      step === 2 ? "Choose Username" :
                      "Select Interests"
                    }
                  </div>
                </div>

                {/* Step 1: Email & Password */}
                {step === 1 && (
                  <form onSubmit={handleStep1Submit}>
                    <div className="sign__group">
                      <input 
                        type="email" 
                        className="sign__input" 
                        placeholder="Email"
                        name="email"
                        required
                      />
                    </div>
                    <div className="sign__group">
                      <input 
                        type="password" 
                        className="sign__input" 
                        placeholder="Password (min 6 characters)"
                        name="password"
                        minLength={6}
                        required
                      />
                    </div>
                    <button className="sign__btn" type="submit">
                      Next
                    </button>
                  </form>
                )}

                {/* Step 2: Username */}
                {step === 2 && (
                  <form onSubmit={handleStep2Submit}>
                    <div className="sign__group">
                      <input 
                        type="text" 
                        className="sign__input" 
                        placeholder="Username (min 3 characters)"
                        name="username"
                        value={signUpData.username}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, username: e.target.value }))}
                        minLength={3}
                        required
                      />
                      {signUpData.username && signUpData.username.length >= 3 && (
                        <div style={{ 
                          fontSize: '14px', 
                          marginTop: '4px',
                          color: checkUsername === undefined ? '#fbbf24' : checkUsername ? '#4ade80' : '#f87171'
                        }}>
                          {checkUsername === undefined ? '⏳ Checking availability...' : 
                           checkUsername ? '✓ Username available' : '✗ Username taken'}
                        </div>
                      )}
                      {signUpData.username && signUpData.username.length > 0 && signUpData.username.length < 3 && (
                        <div style={{ 
                          fontSize: '14px', 
                          marginTop: '4px',
                          color: '#f87171'
                        }}>
                          Username must be at least 3 characters
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="sign__btn sign__btn--secondary"
                        style={{ flex: 1 }}
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                      <button className="sign__btn" style={{ flex: 1 }} type="submit">
                        Next
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Interests */}
                {step === 3 && (
                  <div>
                    <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>
                      What movie genres interest you?
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '8px', 
                      marginBottom: '24px', 
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
                            border: `2px solid ${signUpData.interests.includes(genre) ? '#ff1493' : '#9ca3af'}`,
                            backgroundColor: signUpData.interests.includes(genre) ? '#ff1493' : 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!signUpData.interests.includes(genre)) {
                              e.currentTarget.style.borderColor = '#ff1493';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!signUpData.interests.includes(genre)) {
                              e.currentTarget.style.borderColor = '#9ca3af';
                            }
                          }}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: '14px', marginBottom: '16px' }}>
                      Selected: {signUpData.interests.length} genres
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="sign__btn sign__btn--secondary"
                        style={{ flex: 1 }}
                        onClick={() => setStep(2)}
                      >
                        Back
                      </button>
                      <button 
                        className="sign__btn"
                        style={{ flex: 1 }}
                        onClick={handleFinalSubmit}
                        disabled={submitting || signUpData.interests.length === 0}
                      >
                        {submitting ? "Creating Account..." : "Complete Signup"}
                      </button>
                    </div>
                  </div>
                )}

                <span className="sign__text">
                  Already have an account?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
                    Sign in!
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}