import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../AdminLayout";

export function ActorsManagement() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const actors = useQuery(api.actors.getActors);
  const [showForm, setShowForm] = useState(false);
  const [editingActor, setEditingActor] = useState<any>(null);

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

  const handleAddActor = () => {
    setEditingActor(null);
    setShowForm(true);
  };

  const handleEditActor = (actor: any) => {
    setEditingActor(actor);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingActor(null);
  };

  if (actors === undefined) {
    return (
      <AdminLayout currentPage="actors" pageTitle="Actors">
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
      currentPage="actors" 
      pageTitle="Actors" 
      totalCount={actors.length}
      titleActions={
        <button 
          onClick={handleAddActor}
          className="main__title-link main__title-link--wrap"
        >
          Add Actor
        </button>
      }
    >
      {showForm && (
        <ActorForm
          actor={editingActor}
          onClose={handleCloseForm}
        />
      )}

      {/* Actors Table */}
      <div className="catalog catalog--1">
        <table className="catalog__table">
          <thead>
            <tr>
              <th>ACTOR</th>
              <th>CAREER</th>
              <th>AGE</th>
              <th>MOVIES</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {actors.map((actor) => (
              <ActorRow
                key={actor._id}
                actor={actor}
                onEdit={() => handleEditActor(actor)}
              />
            ))}
          </tbody>
        </table>
        
        {actors.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted">No actors found. Add your first actor!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ActorRow({ actor, onEdit }: { actor: any; onEdit: () => void }) {
  const deleteActor = useMutation(api.actors.deleteActor);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this actor?")) return;
    
    setIsDeleting(true);
    try {
      await deleteActor({ id: actor._id });
    } catch (error) {
      console.error("Failed to delete actor:", error);
      alert("Failed to delete actor");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr>
      <td>
        <div className="catalog__user">
          <div className="catalog__avatar">
            {actor.imageUrl ? (
              <img src={actor.imageUrl} alt={actor.name} />
            ) : (
              <div className="catalog__avatar-placeholder">
                {actor.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="catalog__meta">
            <h3>{actor.name}</h3>
            <span>{actor.placeOfBirth}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="catalog__text">{actor.career}</div>
      </td>
      <td>
        <div className="catalog__text">{actor.age || 'N/A'}</div>
      </td>
      <td>
        <div className="catalog__text">{actor.totalMovies || 'N/A'}</div>
      </td>
      <td>
        <div className="catalog__btns">
          <button 
            type="button" 
            className="catalog__btn catalog__btn--edit"
            onClick={onEdit}
            title="Edit Actor"
          >
            <i className="ti ti-edit"></i>
          </button>
          <button 
            type="button" 
            className="catalog__btn catalog__btn--delete" 
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Actor"
          >
            <i className="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}

function ActorForm({ actor, onClose }: { actor?: any; onClose: () => void }) {
  const createActor = useMutation(api.actors.createActor);
  const updateActor = useMutation(api.actors.updateActor);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: actor?.name || "",
    career: actor?.career || "",
    height: actor?.height || "",
    dateOfBirth: actor?.dateOfBirth || "",
    placeOfBirth: actor?.placeOfBirth || "",
    age: actor?.age || "",
    zodiac: actor?.zodiac || "",
    genres: actor?.genres?.join(", ") || "",
    totalMovies: actor?.totalMovies || "",
    firstMovie: actor?.firstMovie || "",
    lastMovie: actor?.lastMovie || "",
    bestMovie: actor?.bestMovie || "",
    biography: actor?.biography || "",
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
      let imageId = actor?.imageId;

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

      const actorData = {
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

      if (actor) {
        await updateActor({ id: actor._id, ...actorData });
      } else {
        await createActor(actorData);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save actor:", error);
      alert("Failed to save actor");
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
                {actor ? "Edit Actor" : "Add New Actor"}
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
                      placeholder="e.g., 1.65 m"
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
                      placeholder="e.g., July 12, 1978"
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
                      placeholder="e.g., San Antonio, Texas, United States"
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
                      placeholder="e.g., Cancer"
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
                      placeholder="e.g., Action, Thriller, Drama"
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
                      placeholder="e.g., Girl Fight (2000)"
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
                      placeholder="e.g., Fast and the Furious 10 (2023)"
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
                      placeholder="e.g., Avatar"
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
                    {actor?.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={actor.imageUrl}
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
                  <span>{isSubmitting ? "Saving..." : (actor ? "Update" : "Create")}</span>
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