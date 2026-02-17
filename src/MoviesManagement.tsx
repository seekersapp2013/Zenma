import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

export function MoviesManagement() {
  const navigate = useNavigate();
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Id<"items"> | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Id<"categories">[]>([]);

  const allMovies = useQuery(api.items.getAllItems);
  const allCategories = useQuery(api.categories.getCategories);
  const deleteItem = useMutation(api.items.deleteItem);
  const addItemToCategory = useMutation(api.items.addItemToCategory);
  const removeItemFromCategory = useMutation(api.items.removeItemFromCategory);
  
  // Test tools mutations
  const duplicateItemsTo100 = useMutation(api.seed.duplicateItemsTo100);
  const deleteDuplicatedItems = useMutation(api.seed.deleteDuplicatedItems);
  const populateNewCategories = useMutation(api.seed.populateNewCategories);
  const deletePopulatedCategoryItems = useMutation(api.seed.deletePopulatedCategoryItems);

  const handleDuplicateItems = async () => {
    if (!confirm("This will duplicate your existing items to reach 100 items for testing. Continue?")) {
      return;
    }
    
    setIsTestLoading(true);
    try {
      const result = await duplicateItemsTo100();
      alert(result);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleDeleteDuplicates = async () => {
    if (!confirm("This will delete all duplicated items (items with 'Copy' in title). Continue?")) {
      return;
    }
    
    setIsTestLoading(true);
    try {
      const result = await deleteDuplicatedItems();
      alert(result);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  const handlePopulateNewCategories = async () => {
    if (!confirm("This will populate the new categories (Trending, Top Rated, New Releases) with sample data. Continue?")) {
      return;
    }
    
    setIsTestLoading(true);
    try {
      const result = await populateNewCategories();
      alert(result);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleDeletePopulatedItems = async () => {
    if (!confirm("This will delete all items created by 'Populate New Categories' and remove the new category types. Continue?")) {
      return;
    }
    
    setIsTestLoading(true);
    try {
      const result = await deletePopulatedCategoryItems();
      alert(result);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleManageCategories = (movieId: Id<"items">) => {
    setSelectedMovie(movieId);
    setShowCategoryModal(true);
  };

  const handleAddToCategories = async () => {
    if (!selectedMovie || selectedCategories.length === 0) return;

    try {
      for (const categoryId of selectedCategories) {
        try {
          await addItemToCategory({ itemId: selectedMovie, categoryId });
        } catch (error) {
          // Skip if already exists
          console.log(`Skipping category ${categoryId}: ${error}`);
        }
      }
      setShowImportModal(false);
      setSelectedCategories([]);
      alert("Movie added to selected categories!");
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const handleRemoveFromCategory = async (movieId: Id<"items">, categoryId: Id<"categories">) => {
    if (!confirm("Remove this movie from the category?")) return;

    try {
      await removeItemFromCategory({ itemId: movieId, categoryId });
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (allMovies === undefined || allCategories === undefined) {
    return (
      <div className="d-flex align-items-center justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const selectedMovieData = allMovies.find(m => m._id === selectedMovie);

  return (
    <AdminLayout 
      currentPage="movies" 
      pageTitle="Movies" 
      totalCount={allMovies?.length}
      titleActions={
        <>
          <button 
            onClick={() => navigate('/admin/movies/new')}
            className="main__title-link main__title-link--wrap"
          >
            Add Movie
          </button>
        </>
      }
    >
      {/* Test Tools */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#2b2b31', 
        borderRadius: '8px',
        border: '2px solid #ff9800'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <span style={{ 
            color: '#ff9800', 
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            ⚠️ TEST TOOLS:
          </span>
          <button
            onClick={handlePopulateNewCategories}
            disabled={isTestLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9c27b0',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isTestLoading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              opacity: isTestLoading ? 0.6 : 1
            }}
          >
            {isTestLoading ? 'Processing...' : '🚀 Populate New Categories'}
          </button>
          <button
            onClick={handleDeletePopulatedItems}
            disabled={isTestLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff5722',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isTestLoading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              opacity: isTestLoading ? 0.6 : 1
            }}
          >
            {isTestLoading ? 'Processing...' : '🗑️ Delete Populated Items'}
          </button>
          <button
            onClick={handleDuplicateItems}
            disabled={isTestLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isTestLoading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              opacity: isTestLoading ? 0.6 : 1
            }}
          >
            {isTestLoading ? 'Processing...' : 'Duplicate to 100 Items'}
          </button>
          <button
            onClick={handleDeleteDuplicates}
            disabled={isTestLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isTestLoading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              opacity: isTestLoading ? 0.6 : 1
            }}
          >
            {isTestLoading ? 'Processing...' : 'Delete Duplicates'}
          </button>
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#b3b3b3', fontStyle: 'italic' }}>
          Test tools for populating and managing sample data.
        </div>
      </div>

      {/* Movies Table */}
      <div className="catalog catalog--1">
        <table className="catalog__table">
          <thead>
            <tr>
              <th>POSTER</th>
              <th>TITLE</th>
              <th>GENRES</th>
              <th>CATEGORIES</th>
              <th>RATING</th>
              <th>CREATED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {allMovies.map((movie) => (
              <tr key={movie._id}>
                <td>
                  <div className="catalog__text">
                    <img 
                      src={movie.imageUrl} 
                      alt={movie.title}
                      style={{ 
                        width: '50px', 
                        height: '75px', 
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </td>
                <td>
                  <div className="catalog__text">
                    <a href={`/details/${movie.slug}`} target="_blank" rel="noopener noreferrer">
                      {movie.title}
                    </a>
                  </div>
                </td>
                <td>
                  <div className="catalog__text">
                    {movie.genres.slice(0, 2).map((genre) => (
                      <span
                        key={genre}
                        className="badge me-1"
                        style={{ 
                          fontSize: '0.7rem',
                          backgroundColor: '#404040',
                          color: '#fff',
                          marginRight: '4px'
                        }}
                      >
                        {genre}
                      </span>
                    ))}
                    {movie.genres.length > 2 && (
                      <span style={{ fontSize: '0.7rem', color: '#b3b3b3' }}>
                        +{movie.genres.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="catalog__text">
                    {movie.categories && movie.categories.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {movie.categories.map((category) => (
                          <span
                            key={category._id}
                            className="badge"
                            style={{ 
                              fontSize: '0.7rem',
                              backgroundColor: '#ff1493',
                              color: '#fff',
                              position: 'relative',
                              paddingRight: '20px'
                            }}
                          >
                            {category.title}
                            <button
                              onClick={() => handleRemoveFromCategory(movie._id, category._id)}
                              style={{
                                position: 'absolute',
                                right: '2px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                padding: '0 2px',
                                fontSize: '12px'
                              }}
                              title="Remove from category"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#666', fontSize: '0.8rem' }}>No categories</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="catalog__text">
                    <span className={`item__rate ${
                      (movie.dynamicRating || movie.adminRating || movie.rating || 0) >= 8 ? 'item__rate--green' :
                      (movie.dynamicRating || movie.adminRating || movie.rating || 0) >= 6 ? 'item__rate--yellow' :
                      'item__rate--red'
                    }`} style={{ position: 'static', fontSize: '0.8rem' }}>
                      {movie.dynamicRating?.toFixed(1) || movie.adminRating?.toFixed(1) || movie.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="catalog__text">
                    {formatDate(movie._creationTime)}
                  </div>
                </td>
                <td>
                  <div className="catalog__btns">
                    <button 
                      type="button" 
                      className="catalog__btn catalog__btn--view"
                      onClick={() => {
                        setSelectedMovie(movie._id);
                        setShowImportModal(true);
                      }}
                      title="Add to Categories"
                    >
                      <i className="ti ti-category-plus"></i>
                    </button>
                    <button 
                      type="button" 
                      className="catalog__btn catalog__btn--edit"
                      onClick={() => navigate(`/admin/movies/edit/${movie._id}`)}
                      title="Edit Movie"
                    >
                      <i className="ti ti-edit"></i>
                    </button>
                    <button 
                      type="button" 
                      className="catalog__btn catalog__btn--delete" 
                      onClick={() => {
                        if (confirm(`Delete "${movie.title}"? This will remove it from all categories.`)) {
                          deleteItem({ itemId: movie._id });
                        }
                      }}
                      title="Delete Movie"
                    >
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add to Categories Modal */}
      {showImportModal && selectedMovieData && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal__content">
                <div className="modal__form">
                  <h4 className="modal__title">Add "{selectedMovieData.title}" to Categories</h4>
                  
                  <div className="row">
                    <div className="col-12">
                      <div className="sign__group">
                        <label className="sign__label">Select Categories</label>
                        <div style={{ 
                          maxHeight: '300px', 
                          overflowY: 'auto',
                          backgroundColor: '#2b2b2b',
                          padding: '10px',
                          borderRadius: '4px'
                        }}>
                          {allCategories.map((category) => {
                            const isInCategory = selectedMovieData.categories?.some(c => c._id === category._id);
                            const isSelected = selectedCategories.includes(category._id);
                            
                            return (
                              <div 
                                key={category._id}
                                style={{
                                  padding: '8px',
                                  marginBottom: '8px',
                                  backgroundColor: isInCategory ? '#1a4d1a' : isSelected ? '#404040' : '#1a1a1a',
                                  borderRadius: '4px',
                                  cursor: isInCategory ? 'not-allowed' : 'pointer',
                                  opacity: isInCategory ? 0.6 : 1
                                }}
                                onClick={() => {
                                  if (isInCategory) return;
                                  setSelectedCategories(prev => 
                                    prev.includes(category._id)
                                      ? prev.filter(id => id !== category._id)
                                      : [...prev, category._id]
                                  );
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isInCategory || isSelected}
                                  disabled={isInCategory}
                                  onChange={() => {}}
                                  style={{ marginRight: '8px' }}
                                />
                                <span style={{ color: '#fff' }}>
                                  {category.title}
                                  {isInCategory && <span style={{ color: '#4caf50', marginLeft: '8px' }}>(Already added)</span>}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal__btns">
                    <button 
                      className="modal__btn modal__btn--apply" 
                      type="button"
                      onClick={handleAddToCategories}
                      disabled={selectedCategories.length === 0}
                    >
                      <span>Add to Categories</span>
                    </button>
                    <button 
                      className="modal__btn modal__btn--dismiss" 
                      type="button" 
                      onClick={() => {
                        setShowImportModal(false);
                        setSelectedCategories([]);
                        setSelectedMovie(null);
                      }}
                    >
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
