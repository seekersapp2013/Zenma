import { Routes, Route, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { DynamicHomePage } from "./DynamicHomePage";
import { Admin } from "./Admin";
import { AdminDashboard } from "./AdminDashboard";
import { UserOnboarding } from "./UserOnboarding";
import { PageView } from "./PageView";
import { ItemDetails } from "./ItemDetails";
import { Actor } from "./Actor";
import { Director } from "./Director";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { useAppSettings } from "./hooks/useAppSettings";

export default function App() {
  // Initialize app settings (title, favicon, theme)
  useAppSettings();
  
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/site" element={<DynamicHomePage />} />
        <Route path="/login" element={<SignInForm />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-dashboard" element={<AdminDashboardRoute />} />
        <Route path="/actor/:slug" element={<Actor />} />
        <Route path="/actor" element={<Actor />} />
        <Route path="/director/:slug" element={<Director />} />
        <Route path="/director" element={<Director />} />
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

  // If user is authenticated but hasn't completed profile setup
  if (loggedInUser && !loggedInUser.profile) {
    return <UserOnboarding />;
  }

  // If user is authenticated and is an admin (first user), redirect to AdminDashboard
  if (loggedInUser?.profile?.role === "admin") {
    return <AdminDashboard />;
  }

  // Regular users and unauthenticated users see DynamicHomePage
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
