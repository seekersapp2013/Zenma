import { Routes, Route, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { DynamicHomePage } from "./DynamicHomePage";
import { Movies } from "./movies";
import { Admin } from "./Admin";
import { AdminDashboard } from "./AdminDashboard";
import { CategoryManagement } from "./CategoryManagement";
import { MoviesManagement } from "./MoviesManagement";
import { MovieWizard } from "./MovieWizard";
import { MigrationRunner } from "./MigrationRunner";
import { Users } from "./Users";
import { Settings } from "./Settings";
import { Catalog } from "./Catalog";
import { Actors } from "./Actors";
import { PublicActors } from "./PublicActors";
import { Directors } from "./Directors";
import { Comments } from "./Comments";
import { Reviews } from "./Reviews";
import { UserOnboarding } from "./UserOnboarding";
import { PageView } from "./PageView";
import { ItemDetails } from "./ItemDetails";
import { Actor } from "./Actor";
import { Director } from "./Director";
import { ActorFormPage } from "./components/ActorFormPage";
import { DirectorFormPage } from "./components/DirectorFormPage";
import { ItemWizardPage } from "./ItemWizardPage";
import { AboutUs } from "./AboutUs";
import { AboutUsEditor } from "./AboutUsEditor";
import { ContactUs } from "./ContactUs";
import { ContactUsEditor } from "./ContactUsEditor";
import { BlogAdmin } from "./BlogAdmin";
import { BlogPostEditor } from "./BlogPostEditor";
import { Blog } from "./Blog";
import { BlogPost } from "./BlogPost";
import { SearchResults } from "./SearchResults";
import { GenresManagement } from "./components/GenresManagement";
import { Genre } from "./Genre";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { useAppSettings } from "./hooks/useAppSettings";

import { RatingManagement } from "./RatingManagement";

export default function App() {
  // Initialize app settings (title, favicon, theme)
  useAppSettings();
  
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/site" element={<DynamicHomePage />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/login" element={<SignInForm />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<AdminDashboardRoute />} />
        <Route path="/admin-dashboard" element={<AdminDashboardRoute />} />
        <Route path="/admin/movies" element={<AdminRoute><MoviesManagement /></AdminRoute>} />
        <Route path="/admin/movies/new" element={<AdminRoute><MovieWizard /></AdminRoute>} />
        <Route path="/admin/movies/edit/:movieId" element={<AdminRoute><MovieWizard /></AdminRoute>} />
        <Route path="/admin/migration" element={<AdminRoute><MigrationRunner /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
        <Route path="/admin/categories/:categoryId/items/new" element={<AdminRoute><ItemWizardPage /></AdminRoute>} />
        <Route path="/admin/categories/:categoryId/items/edit" element={<AdminRoute><ItemWizardPage /></AdminRoute>} />
        <Route path="/admin/genres" element={<AdminRoute><GenresManagement /></AdminRoute>} />
        <Route path="/admin/catalog" element={<AdminRoute><Catalog /></AdminRoute>} />
        <Route path="/admin/actors" element={<AdminRoute><Actors /></AdminRoute>} />
        <Route path="/actors" element={<PublicActors />} />
        <Route path="/actors/new" element={<AdminRoute><ActorFormPage /></AdminRoute>} />
        <Route path="/actors/edit/:id" element={<AdminRoute><ActorFormPage /></AdminRoute>} />
        <Route path="/admin/directors" element={<AdminRoute><Directors /></AdminRoute>} />
        <Route path="/directors/new" element={<AdminRoute><DirectorFormPage /></AdminRoute>} />
        <Route path="/directors/edit/:id" element={<AdminRoute><DirectorFormPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin/comments" element={<AdminRoute><Comments /></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><Reviews /></AdminRoute>} />
        <Route path="/admin/ratings" element={<AdminRoute><RatingManagement /></AdminRoute>} />
        <Route path="/admin/aboutus-editor" element={<AdminRoute><AboutUsEditor /></AdminRoute>} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/admin/contactus-editor" element={<AdminRoute><ContactUsEditor /></AdminRoute>} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin/blog" element={<AdminRoute><BlogAdmin /></AdminRoute>} />
        <Route path="/admin/blog/new" element={<AdminRoute><BlogPostEditor /></AdminRoute>} />
        <Route path="/admin/blog/edit/:id" element={<AdminRoute><BlogPostEditor /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
        <Route path="/actor/:slug" element={<Actor />} />
        <Route path="/actor" element={<Actor />} />
        <Route path="/director/:slug" element={<Director />} />
        <Route path="/director" element={<Director />} />
        <Route path="/genre/:slug" element={<Genre />} />
        <Route path="/genre" element={<Genre />} />
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
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

function AdminRoute({ children }: { children: React.ReactNode }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!loggedInUser) {
    return <SignInForm />;
  }

  // Authenticated but not admin - show access denied
  if (loggedInUser.profile?.role !== "admin") {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#fff'
      }}>
        <div className="text-center">
          <h2 className="mb-4">Access Denied</h2>
          <p className="mb-4">You don't have permission to access this page.</p>
          <a href="/" className="btn btn-primary">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Admin user - render children
  return <>{children}</>;
}

function DynamicPageRoute() {
  const { slug } = useParams();
  return <PageView slug={slug || ''} />;
}
