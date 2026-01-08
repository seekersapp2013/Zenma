import { Routes, Route, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { DynamicHomePage } from "./DynamicHomePage";
import { Admin } from "./Admin";
import { AdminDashboard } from "./AdminDashboard";
import { UserOnboarding } from "./UserOnboarding";
import { PageView } from "./PageView";
import { ItemDetails } from "./ItemDetails";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<SignInForm />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-dashboard" element={<AdminDashboardRoute />} />
        <Route path="/details/:slug" element={<ItemDetails />} />
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

  // If user is authenticated but hasn't completed profile setup
  if (loggedInUser && !loggedInUser.profile) {
    return <UserOnboarding />;
  }

  // If user is authenticated and is an admin
  if (loggedInUser?.profile?.role === "admin") {
    return <AdminDashboard />;
  }

  // Always show DynamicHomePage (whether authenticated or not)
  return <DynamicHomePage />;
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
