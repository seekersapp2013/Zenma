"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SignUpWizard } from "./SignUpWizard";
import "./sign.css";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (flow === "signUp") {
    return <SignUpWizard onBack={() => setFlow("signIn")} />;
  }

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
                  formData.set("flow", "signIn");
                  void signIn("password", formData)
                    .then(() => {
                      // Redirect to home page after successful login
                      navigate("/");
                    })
                    .catch((error) => {
                      let toastTitle = "";
                      if (error.message.includes("Invalid password")) {
                        toastTitle = "Invalid password. Please try again.";
                      } else {
                        toastTitle = "Could not sign in, did you mean to sign up?";
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

                

                <button className="sign__btn" type="submit" disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                </button>

                <span className="sign__text">
                  Don't have an account?{" "}
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setFlow("signUp");
                    }}
                  >
                    Sign up!
                  </a>
                </span>

                <span className="sign__text">
                  <a href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
                </span>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
