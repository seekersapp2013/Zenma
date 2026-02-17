import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ItemWizard } from "./ItemWizard";
import { AdminLayout } from "./AdminLayout";
import { Id } from "../convex/_generated/dataModel";

export function MovieWizard() {
  const navigate = useNavigate();
  const { movieId } = useParams();
  const isEditing = !!movieId;

  // For editing, we need to get all movies first to find the one with this ID
  const allMovies = useQuery(api.items.getAllItems);
  const existingMovie = allMovies?.find(m => m._id === movieId);
  const [initialData, setInitialData] = useState<any>(undefined);

  useEffect(() => {
    if (isEditing && existingMovie) {
      setInitialData({
        title: existingMovie.title,
        imageId: existingMovie.imageId,
        imageUrl: existingMovie.imageUrl, // Include the URL for display
        genres: existingMovie.genres,
        description: existingMovie.description || "",
        director: existingMovie.director || [],
        cast: existingMovie.cast || [],
        premiereYear: existingMovie.premiereYear || null,
        runningTime: existingMovie.runningTime || null,
        country: existingMovie.country || "",
        rating: existingMovie.rating || null,
        posterImageId: existingMovie.posterImageId || null,
        posterImageUrl: existingMovie.posterImageUrl || "",
        videoSources: existingMovie.videoSources || [],
        captions: existingMovie.captions || [],
      });
    }
  }, [isEditing, existingMovie]);

  const handleClose = () => {
    navigate("/admin/movies");
  };

  const handleSuccess = () => {
    navigate("/admin/movies");
  };

  if (isEditing && allMovies === undefined) {
    return (
      <AdminLayout currentPage="movies" pageTitle="Loading...">
        <div className="d-flex align-items-center justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isEditing && !existingMovie) {
    return (
      <AdminLayout currentPage="movies" pageTitle="Movie Not Found">
        <div className="main__content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
                  <h3>Movie not found</h3>
                  <button
                    onClick={() => navigate("/admin/movies")}
                    className="sign__btn"
                    style={{ marginTop: '20px' }}
                  >
                    Back to Movies
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      currentPage="movies" 
      pageTitle={isEditing ? "Edit Movie" : "Add New Movie"}
    >
      <ItemWizard
        categoryId={undefined} // No category for standalone movie creation
        editingItem={isEditing ? (movieId as Id<"items">) : null}
        initialData={initialData}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </AdminLayout>
  );
}
