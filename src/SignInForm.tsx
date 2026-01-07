"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import "./sign.css";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <div className="sign section--bg">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="sign__content">
              <form 
                className="sign__form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  const formData = new FormData(e.target as HTMLFormElement);
                  formData.set("flow", flow);
                  void signIn("password", formData).catch((error) => {
                    let toastTitle = "";
                    if (error.message.includes("Invalid password")) {
                      toastTitle = "Invalid password. Please try again.";
                    } else {
                      toastTitle =
                        flow === "signIn"
                          ? "Could not sign in, did you mean to sign up?"
                          : "Could not sign up, did you mean to sign in?";
                    }
                    toast.error(toastTitle);
                    setSubmitting(false);
                  });
                }}
              >
                <a href="#" className="sign__logo">
                  <span style={{ color: '#ff1493', fontWeight: 'bold', fontSize: '28px' }}>ZEN</span>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '28px' }}>MA</span>
                </a>

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
                    placeholder="Password"
                    name="password"
                    required
                  />
                </div>

                <div className="sign__group sign__group--checkbox">
                  <input 
                    id="remember" 
                    name="remember" 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember Me</label>
                </div>

                <button className="sign__btn" type="submit" disabled={submitting}>
                  {flow === "signIn" ? "Sign in" : "Sign up"}
                </button>

                <span className="sign__text">
                  {flow === "signIn" ? "Don't have an account? " : "Already have an account? "}
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setFlow(flow === "signIn" ? "signUp" : "signIn");
                    }}
                  >
                    {flow === "signIn" ? "Sign up!" : "Sign in!"}
                  </a>
                </span>

                {flow === "signIn" && (
                  <span className="sign__text">
                    <a href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
                  </span>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
