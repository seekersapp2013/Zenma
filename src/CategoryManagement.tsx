import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CategoryFormData {
  type: "featured" | "full" | "short" | "trending" | "topRated" | "newReleases";
  title: string;
}

export function CategoryManagement() {
  const navigate = useNavigate();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    type: "featured",
    title: "",
  });
  const [isTestLoading, setIsTestLoading] = useState(false);

  const categories = useQuery(api.categories.getCategories);
  const createCategory = useMutation(api.categories.createCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);
  const updateCategoryOrder = useMutation(api.categories.updateCategoryOrder);
  const deleteItem = useMutation(api.items.deleteItem);
  const duplicateItemsTo100 = useMutation(api.seed.duplicateItemsTo100);
  const deleteDuplicatedItems = useMutation(api.seed.deleteDuplicatedItems);
  const populateNewCategories = useMutation(api.seed.populateNewCategories);
  const deletePopulatedCategoryItems = useMutation(api.seed.deletePopulatedCategoryItems);

  // Add custom CSS for dropdown and form elements
  useEffect(() => {
    const customCSS = `
      .sign__input select {
        background-color: #2b2b2b !important;
        color: #fff !important;
        border-color: #404040 !important;
      }
      .sign__input select option {
        background-color: #2b2b2b !important;
        color: #fff !important;
      }
      /* Custom scrollbar for items dropdown */
      .items-dropdown::-webkit-scrollbar {
        width: 8px;
      }
      .items-dropdown::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 4px;
      }
      .items-dropdown::-webkit-scrollbar-thumb {
        background: #404040;
        border-radius: 4px;
      }
      .items-dropdown::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      /* Firefox scrollbar */
      .items-dropdown {
        scrollbar-width: thin;
        scrollbar-color: #404040 #1a1a1a;
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = customCSS;
    document.head.appendChild(styleElement);

    return () => {
      // Remove custom styles on cleanup
      const customStyle = document.querySelector('style');
      if (customStyle && customStyle.textContent?.includes('items-dropdown')) {
        customStyle.remove();
      }
    };
  }, []);



  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && categories) {
      const oldIndex = categories.findIndex((item) => item._id === active.id);
      const newIndex = categories.findIndex((item) => item._id === over?.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      
      // Update the order in the database
      for (let i = 0; i < newCategories.length; i++) {
        await updateCategoryOrder({
          categoryId: newCategories[i]._id,
          newOrder: i + 1,
        });
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title.trim()) return;

    try {
      await createCategory({
        type: categoryForm.type,
        title: categoryForm.title,
      });
      setCategoryForm({ type: "featured", title: "" });
      setShowCategoryForm(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const formatTitle = (title: string) => {
    return title.split(' ').map(word => {
      if (word.startsWith('<b>') && word.endsWith('</b>')) {
        return <strong key={word}>{word.slice(3, -4)}</strong>;
      }
      return word;
    }).reduce((prev, curr, index) => {
      return index === 0 ? [curr] : [...prev, ' ', curr];
    }, [] as React.ReactNode[]);
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "featured":
        return "Hero carousel style (like 'NEW OF THIS SEASON')";
      case "full":
        return "Grid layout style (like 'MOVIES FOR YOU')";
      case "short":
        return "Horizontal carousel style (like 'Expected premiere')";
      case "trending":
        return "Trending movies carousel with TRENDING badge";
      case "topRated":
        return "Top rated movies carousel (8.5+ rating)";
      case "newReleases":
        return "New releases carousel with NEW badge";
      default:
        return "";
    }
  };

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

  if (categories === undefined) {
    return (
      <div className="d-flex align-items-center justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      currentPage="categories" 
      pageTitle="Categories" 
      totalCount={categories?.length}
      titleActions={
        <>
          <button 
            onClick={() => setShowCategoryForm(true)}
            className="main__title-link main__title-link--wrap"
          >
            Add Category
          </button>
        </>
      }
    >
      {/* Test Buttons for Lazy Loading */}
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
          Click "Populate New Categories" to create Trending, Top Rated & New Releases sections. Use "Delete Populated Items" to remove them.
        </div>
      </div>

      {/* Categories Table */}
      <div className="catalog catalog--1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories?.map(c => c._id) || []}
            strategy={verticalListSortingStrategy}
          >
            <table className="catalog__table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>TITLE</th>
                  <th>ITEMS COUNT</th>
                  <th>CREATED DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((category, index) => (
                  <SortableCategoryRow
                    key={category._id}
                    category={category}
                    index={index}
                    onDelete={() => deleteCategory({ categoryId: category._id })}
                    onAddItem={() => navigate(`/admin/categories/${category._id}/items/new`)}
                    onEditItem={(item) => {
                      const initialData = {
                        title: item.title,
                        imageId: item.imageId,
                        genres: item.genres,
                        description: item.description || "",
                        director: item.director || "",
                        cast: item.cast || [],
                        premiereYear: item.premiereYear || undefined,
                        runningTime: item.runningTime || undefined,
                        country: item.country || "",
                        rating: item.rating || undefined,
                        posterImageId: item.posterImageId || undefined,
                        posterImageUrl: item.posterImageUrl || undefined,
                        videoSources: item.videoSources || [],
                        captions: item.captions || [],
                      };
                      navigate(`/admin/categories/${category._id}/items/edit?editingItem=${item._id}&initialData=${encodeURIComponent(JSON.stringify(initialData))}`);
                    }}
                    onDeleteItem={(itemId) => deleteItem({ itemId })}
                    formatTitle={formatTitle}
                    getTypeDescription={getTypeDescription}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal__content">
                <form onSubmit={handleCreateCategory} className="modal__form">
                  <h4 className="modal__title">Create New Category</h4>
                  
                  <div className="row">
                    <div className="col-12">
                      <div className="sign__group">
                        <label className="sign__label">Type</label>
                        <select
                          value={categoryForm.type}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, type: e.target.value as any }))}
                          className="sign__input"
                          style={{
                            backgroundColor: '#2b2b2b',
                            color: '#ffffff',
                            border: '1px solid #404040',
                            borderRadius: '4px'
                          }}
                        >
                          <option value="featured" style={{ backgroundColor: '#2b2b2b', color: '#ffffff' }}>Featured (Hero Carousel)</option>
                          <option value="trending" style={{ backgroundColor: '#2b2b2b', color: '#ffffff' }}>Trending (With Badge)</option>
                          <option value="topRated" style={{ backgroundColor: '#2b2b2b', color: '#ffffff' }}>Top Rated (8.5+)</option>
                          <option value="newReleases" style={{ backgroundColor: '#2b2b2b', color: '#ffffff' }}>New Releases (With Badge)</option>
                          <option value="full" style={{ backgroundColor: '#2b2b2b', color: '#ffffff' }}>Full (Grid Layout)</option>
                          <option value="short" style={{ backgroundColor: '#2b2b2b', color: '#ffffff' }}>Short (Horizontal Carousel)</option>
                        </select>
                        <small className="form-text text-muted">
                          {getTypeDescription(categoryForm.type)}
                        </small>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="sign__group">
                        <label className="sign__label">Title</label>
                        <input
                          type="text"
                          value={categoryForm.title}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., NEW OF THIS SEASON"
                          className="sign__input"
                          required
                        />
                        <small className="form-text text-muted">
                          Use &lt;b&gt;word&lt;/b&gt; to make words bold
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="modal__btns">
                    <button className="modal__btn modal__btn--apply" type="submit">
                      <span>Create Category</span>
                    </button>
                    <button 
                      className="modal__btn modal__btn--dismiss" 
                      type="button" 
                      onClick={() => setShowCategoryForm(false)}
                    >
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

function SortableCategoryRow({ 
  category, 
  index,
  onDelete, 
  onAddItem, 
  onEditItem, 
  onDeleteItem, 
  formatTitle, 
  getTypeDescription 
}: {
  category: any;
  index: number;
  onDelete: () => void;
  onAddItem: () => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (itemId: Id<"items">) => void;
  formatTitle: (title: string) => React.ReactNode[];
  getTypeDescription: (type: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const items = useQuery(api.items.getItemsByCategory, { categoryId: category._id });
  const [showItems, setShowItems] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <tr ref={setNodeRef} style={style}>
        <td>
          <div className="catalog__text d-flex align-items-center">
            <button
              {...attributes}
              {...listeners}
              className="btn btn-sm btn-outline-secondary me-2"
              style={{ cursor: 'grab' }}
            >
              <i className="ti ti-grip-vertical"></i>
            </button>
            {index + 1}
          </div>
        </td>
        <td>
          <div className="catalog__text">
            <button 
              onClick={() => setShowItems(!showItems)}
              className="btn btn-link p-0 text-start"
              style={{ textDecoration: 'none' }}
            >
              {formatTitle(category.title)}
            </button>
          </div>
        </td>
        <td>
          <div className="catalog__text">
            {items === undefined ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              items.length
            )}
          </div>
        </td>
        <td>
          <div className="catalog__text">
            {formatDate(category._creationTime)}
          </div>
        </td>
        <td>
          <div className="catalog__btns">
            <button 
              type="button" 
              className="catalog__btn catalog__btn--view"
              onClick={() => setShowItems(!showItems)}
              title="View Items"
            >
              <i className="ti ti-eye"></i>
            </button>
            <button 
              type="button" 
              className="catalog__btn catalog__btn--edit"
              onClick={onAddItem}
              title="Add Item"
            >
              <i className="ti ti-plus"></i>
            </button>
            <button 
              type="button" 
              className="catalog__btn catalog__btn--delete" 
              onClick={onDelete}
              title="Delete Category"
            >
              <i className="ti ti-trash"></i>
            </button>
          </div>
        </td>
      </tr>
      
      {/* Items Row - Expandable */}
      {showItems && (
        <tr>
          <td colSpan={5}>
            <div 
              className="p-3 items-dropdown"
              style={{
                backgroundColor: '#2b2b2b',
                borderTop: '1px solid #404040',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              <h6 className="mb-3 text-white">Items in this category:</h6>
              {items === undefined ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <p className="text-muted text-center py-3">No items in this category</p>
              ) : (
                <div className="row g-3">
                  {items.map((item) => (
                    <div key={item._id} className="col-md-4 col-lg-3">
                      <div 
                        className="card h-100"
                        style={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #404040',
                          borderRadius: '8px'
                        }}
                      >
                        <img
                          src={item.imageUrl || '/admin/img/placeholder.jpg'}
                          alt={item.title}
                          className="card-img-top"
                          style={{ 
                            height: '150px', 
                            objectFit: 'cover',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px'
                          }}
                        />
                        <div className="card-body p-2">
                          <h6 
                            className="card-title mb-1 text-white" 
                            style={{ fontSize: '0.875rem' }}
                          >
                            {item.title}
                          </h6>
                          <div className="mb-2">
                            {item.genres.slice(0, 2).map((genre) => (
                              <span
                                key={genre}
                                className="badge me-1"
                                style={{ 
                                  fontSize: '0.7rem',
                                  backgroundColor: '#404040',
                                  color: '#fff'
                                }}
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                          <div className="d-flex gap-1">
                            <button
                              onClick={() => onEditItem(item)}
                              className="btn btn-sm flex-fill"
                              style={{ 
                                fontSize: '0.75rem',
                                backgroundColor: '#007bff',
                                borderColor: '#007bff',
                                color: '#fff'
                              }}
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                            <button
                              onClick={() => onDeleteItem(item._id)}
                              className="btn btn-sm flex-fill"
                              style={{ 
                                fontSize: '0.75rem',
                                backgroundColor: '#dc3545',
                                borderColor: '#dc3545',
                                color: '#fff'
                              }}
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}