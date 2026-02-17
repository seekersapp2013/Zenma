import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../AdminLayout";
import { Id } from "../../convex/_generated/dataModel";

export function GenresManagement() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const genres = useQuery(api.genres.getGenres);
  const [showForm, setShowForm] = useState(false);
  const [editingGenre, setEditingGenre] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const runMigration = useMutation(api.migrations.migrateGenres.migrateGenres);

  if (loggedInUser === undefined) {
    return (
      <div className="d-flex align-items-center justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!loggedInUser?.profile || loggedInUser.profile.role !== "admin") {
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
          <p className="mb-4">You don't have permission to access the admin dashboard.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handleAddGenre = () => {
    setEditingGenre(null);
    setShowForm(true);
  };

  const handleEditGenre = (genre: any) => {
    setEditingGenre(genre);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGenre(null);
  };

  const handleRunMigration = async () => {
    if (!confirm("This will populate the genres table with all unique genres from existing items, actors, and directors. Continue?")) {
      return;
    }
    
    setIsMigrating(true);
    try {
      const result = await runMigration();
      alert(`${result.message}\n\nDetails:\nCreated: ${result.created} genres\nSkipped: ${result.skipped} (already exist)\nTotal unique: ${result.total}`);
    } catch (error) {
      console.error("Migration failed:", error);
      alert(`Migration failed: ${error}`);
    } finally {
      setIsMigrating(false);
    }
  };

  if (genres === undefined) {
    return (
      <AdminLayout currentPage="genres" pageTitle="Genres">
        <div className="d-flex align-items-center justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      currentPage="genres" 
      pageTitle="Genres" 
      totalCount={genres.length}
      titleActions={
        <>
          <button 
            onClick={handleRunMigration}
            disabled={isMigrating}
            className="main__title-link"
            style={{ marginRight: '10px', backgroundColor: '#9c27b0' }}
          >
            {isMigrating ? "Migrating..." : "🔄 Migrate Genres"}
          </button>
          <button 
            onClick={handleAddGenre}
            className="main__title-link main__title-link--wrap"
          >
            Add Genre
          </button>
        </>
      }
    >
      {/* Migration Info Banner */}
      {genres.length === 0 && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#2b2b31', 
          borderRadius: '8px',
          border: '2px solid #9c27b0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <span style={{ 
              color: '#9c27b0', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              ℹ️ First Time Setup:
            </span>
            <span style={{ color: '#b3b3b3', fontSize: '13px' }}>
              Click "Migrate Genres" to populate this table with all existing genres from your items, actors, and directors.
            </span>
          </div>
        </div>
      )}

      {/* Genres Table */}
      <div className="catalog catalog--1">
        <table className="catalog__table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>DESCRIPTION</th>
              <th>SLUG</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((genre) => (
              <GenreRow
                key={genre._id}
                genre={genre}
                onEdit={handleEditGenre}
              />
            ))}
          </tbody>
        </table>
        
        {genres.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted">No genres found. Add your first genre!</p>
          </div>
        )}
      </div>

      {/* Genre Form Modal */}
      {showForm && (
        <GenreForm
          genre={editingGenre}
          onClose={handleCloseForm}
        />
      )}
    </AdminLayout>
  );
}

function GenreRow({ genre, onEdit }: { genre: any; onEdit: (genre: any) => void }) {
  const deleteGenre = useMutation(api.genres.deleteGenre);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this genre?")) return;
    
    setIsDeleting(true);
    try {
      await deleteGenre({ id: genre._id });
    } catch (error) {
      console.error("Failed to delete genre:", error);
      alert("Failed to delete genre");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr 
      onClick={() => onEdit(genre)}
      style={{ cursor: 'pointer' }}
      className="catalog__row--clickable"
    >
      <td>
        <div className="catalog__text">
          <strong>{genre.name}</strong>
        </div>
      </td>
      <td>
        <div className="catalog__text">
          {genre.description || <span className="text-muted">No description</span>}
        </div>
      </td>
      <td>
        <div className="catalog__text text-muted">
          {genre.slug}
        </div>
      </td>
      <td>
        <div className="catalog__btns">
          <button 
            type="button" 
            className="catalog__btn catalog__btn--delete" 
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Genre"
          >
            <i className="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}

function GenreForm({ genre, onClose }: { genre?: any; onClose: () => void }) {
  const createGenre = useMutation(api.genres.createGenre);
  const updateGenre = useMutation(api.genres.updateGenre);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: genre?.name || "",
    description: genre?.description || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const genreData = {
        name: formData.name,
        description: formData.description || undefined,
      };

      if (genre) {
        await updateGenre({ id: genre._id as Id<"genres">, ...genreData });
      } else {
        await createGenre(genreData);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save genre:", error);
      alert("Failed to save genre");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal__content">
            <form onSubmit={handleSubmit} className="modal__form">
              <h4 className="modal__title">
                {genre ? "Edit Genre" : "Add New Genre"}
              </h4>
              
              <div className="row">
                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label">Genre Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="sign__input"
                      placeholder="e.g., Action, Drama, Comedy"
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="sign__textarea"
                      placeholder="Optional description for this genre"
                    />
                  </div>
                </div>
              </div>

              <div className="modal__btns">
                <button 
                  className="modal__btn modal__btn--apply" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Saving..." : (genre ? "Update" : "Create")}</span>
                </button>
                <button 
                  className="modal__btn modal__btn--dismiss" 
                  type="button" 
                  onClick={onClose}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
