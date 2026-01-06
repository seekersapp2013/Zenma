import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Dashboard } from "./Dashboard";
import { useNavigate } from "react-router-dom";

export function Admin() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700"
              >
                Zenma
              </button>
              <span className="text-sm text-gray-600">Admin Panel</span>
            </div>
            <SignOutButton />
          </header>
          <main className="flex-1">
            <Dashboard navigate={handleNavigate} />
          </main>
        </div>
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}