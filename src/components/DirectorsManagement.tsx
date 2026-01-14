import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../AdminLayout";

export function DirectorsManagement() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const directors = useQuery(api.directors.getDirectors);
  const [showForm, setShowForm] = useState(false);
  const [editingDirector, setEditingDirector] = useState<any>(null);

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

  const handleAddDirector = () => {
    navigate("/directors/new");
  };

  const handleEditDirector = (directorId: string) => {
    navigate(`/directors/edit/${directorId}`);
  };

  if (directors === undefined) {
    return (
      <AdminLayout currentPage="directors" pageTitle="Directors">
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
      currentPage="directors" 
      pageTitle="Directors" 
      totalCount={directors.length}
      titleActions={
        <button 
          onClick={handleAddDirector}
          className="main__title-link main__title-link--wrap"
        >
          Add Director
        </button>
      }
    >
      {/* Directors Table */}
      <div className="catalog catalog--1">
        <table className="catalog__table">
          <thead>
            <tr>
              <th>DIRECTOR</th>
              <th>CAREER</th>
              <th>AGE</th>
              <th>MOVIES</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {directors.map((director) => (
              <DirectorRow
                key={director._id}
                director={director}
                onEdit={handleEditDirector}
              />
            ))}
          </tbody>
        </table>
        
        {directors.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted">No directors found. Add your first director!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function DirectorRow({ director, onEdit }: { director: any; onEdit: (directorId: string) => void }) {
  const deleteDirector = useMutation(api.directors.deleteDirector);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this director?")) return;
    
    setIsDeleting(true);
    try {
      await deleteDirector({ id: director._id });
    } catch (error) {
      console.error("Failed to delete director:", error);
      alert("Failed to delete director");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr 
      onClick={() => onEdit(director._id)}
      style={{ cursor: 'pointer' }}
      className="catalog__row--clickable"
    >
      <td>
        <div className="catalog__user">
          <div className="catalog__avatar">
            {director.imageUrl ? (
              <img src={director.imageUrl} alt={director.name} />
            ) : (
              <div className="catalog__avatar-placeholder">
                {director.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="catalog__meta">
            <h3>{director.name}</h3>
            <span>{director.placeOfBirth}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="catalog__text">{director.career}</div>
      </td>
      <td>
        <div className="catalog__text">{director.age || 'N/A'}</div>
      </td>
      <td>
        <div className="catalog__text">{director.totalMovies || 'N/A'}</div>
      </td>
      <td>
        <div className="catalog__btns">
          <button 
            type="button" 
            className="catalog__btn catalog__btn--delete" 
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Director"
          >
            <i className="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}

function DirectorForm({ director, onClose }: { director?: any; onClose: () => void }) {
  const createDirector = useMutation(api.directors.createDirector);
  const updateDirector = useMutation(api.directors.updateDirector);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: director?.name || "",
    career: director?.career || "",
    height: director?.height || "",
    dateOfBirth: director?.dateOfBirth || "",
    placeOfBirth: director?.placeOfBirth || "",
    age: director?.age || "",
    zodiac: director?.zodiac || "",
    genres: director?.genres?.join(", ") || "",
    totalMovies: director?.totalMovies || "",
    firstMovie: director?.firstMovie || "",
    lastMovie: director?.lastMovie || "",
    bestMovie: director?.bestMovie || "",
    biography: director?.biography || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageId = director?.imageId;

      // Upload new image if selected
      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const { storageId } = await result.json();
        imageId = storageId;
      }

      const directorData = {
        name: formData.name,
        career: formData.career,
        height: formData.height || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        placeOfBirth: formData.placeOfBirth || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        zodiac: formData.zodiac || undefined,
        genres: formData.genres.split(",").map(g => g.trim()).filter(g => g),
        totalMovies: formData.totalMovies ? parseInt(formData.totalMovies) : undefined,
        firstMovie: formData.firstMovie || undefined,
        lastMovie: formData.lastMovie || undefined,
        bestMovie: formData.bestMovie || undefined,
        imageId: imageId || undefined,
        biography: formData.biography || undefined,
      };

      if (director) {
        await updateDirector({ id: director._id, ...directorData });
      } else {
        await createDirector(directorData);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save director:", error);
      alert("Failed to save director");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal__content">
            <form onSubmit={handleSubmit} className="modal__form">
              <h4 className="modal__title">
                {director ? "Edit Director" : "Add New Director"}
              </h4>
              
              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="sign__input"
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Career *</label>
                    <input
                      type="text"
                      name="career"
                      value={formData.career}
                      onChange={handleInputChange}
                      className="sign__input"
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Height</label>
                    <input
                      type="text"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      placeholder="e.g., 1.75 m"
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Date of Birth</label>
                    <input
                      type="text"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      placeholder="e.g., March 30, 1970"
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Place of Birth</label>
                    <input
                      type="text"
                      name="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={handleInputChange}
                      placeholder="e.g., London, England, United Kingdom"
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Zodiac</label>
                    <input
                      type="text"
                      name="zodiac"
                      value={formData.zodiac}
                      onChange={handleInputChange}
                      placeholder="e.g., Aries"
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Total Movies</label>
                    <input
                      type="number"
                      name="totalMovies"
                      value={formData.totalMovies}
                      onChange={handleInputChange}
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label">Genres (comma-separated)</label>
                    <input
                      type="text"
                      name="genres"
                      value={formData.genres}
                      onChange={handleInputChange}
                      placeholder="e.g., Action, Sci-Fi, Thriller"
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="sign__group">
                    <label className="sign__label">First Movie</label>
                    <input
                      type="text"
                      name="firstMovie"
                      value={formData.firstMovie}
                      onChange={handleInputChange}
                      placeholder="e.g., Duel (1971)"
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="sign__group">
                    <label className="sign__label">Last Movie</label>
                    <input
                      type="text"
                      name="lastMovie"
                      value={formData.lastMovie}
                      onChange={handleInputChange}
                      placeholder="e.g., Indiana Jones 5 (2023)"
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="sign__group">
                    <label className="sign__label">Best Movie</label>
                    <input
                      type="text"
                      name="bestMovie"
                      value={formData.bestMovie}
                      onChange={handleInputChange}
                      placeholder="e.g., Jurassic Park"
                      className="sign__input"
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sign__input"
                    />
                    {director?.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={director.imageUrl}
                          alt="Current"
                          style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label">Biography</label>
                    <textarea
                      name="biography"
                      value={formData.biography}
                      onChange={handleInputChange}
                      rows={4}
                      className="sign__textarea"
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
                  <span>{isSubmitting ? "Saving..." : (director ? "Update" : "Create")}</span>
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