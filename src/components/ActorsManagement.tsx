import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../AdminLayout";

export function ActorsManagement() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const actors = useQuery(api.actors.getActors);

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
    navigate("/actors/new");
  };

  const handleEditActor = (actorId: string) => {
    navigate(`/actors/edit/${actorId}`);
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
                onEdit={handleEditActor}
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

function ActorRow({ actor, onEdit }: { actor: any; onEdit: (actorId: string) => void }) {
  const deleteActor = useMutation(api.actors.deleteActor);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <tr 
      onClick={() => onEdit(actor._id)}
      style={{ cursor: 'pointer' }}
      className="catalog__row--clickable"
    >
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