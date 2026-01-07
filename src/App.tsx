import { Routes, Route, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { HomePage } from "./HomePage";
import { Admin } from "./Admin";
import { AdminDashboard } from "./AdminDashboard";
import { UserOnboarding } from "./UserOnboarding";
import { PageView } from "./PageView";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-dashboard" element={<AdminDashboardRoute />} />
        <Route path="/:slug" element={<DynamicPageRoute />} />
      </Routes>
      <Toaster />
    </>
  );
}

function HomeRoute() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Debug logging
  console.log("HomeRoute - loggedInUser:", loggedInUser);
  console.log("HomeRoute - profile:", loggedInUser?.profile);
  console.log("HomeRoute - role:", loggedInUser?.profile?.role);

  return (
    <>
      <Authenticated>
        {/* Check if user has completed profile setup */}
        {!loggedInUser?.profile ? (
          <UserOnboarding />
        ) : loggedInUser.profile.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <HomePage />
        )}
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}

function AdminDashboardRoute() {
  return (
    <>
      <Authenticated>
        <AdminDashboard />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}

function DynamicPageRoute() {
  const { slug } = useParams();
  return <PageView slug={slug || ''} />;
}
