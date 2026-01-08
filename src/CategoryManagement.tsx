import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { FileUpload } from "./components/FileUpload";
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
  type: "featured" | "full" | "short";
  title: string;
}

interface ItemFormData {
  title: string;
  imageId: Id<"_storage"> | null;
  genres: string[];
}

export function CategoryManagement() {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState<Id<"categories"> | null>(null);
  const [editingItem, setEditingItem] = useState<Id<"items"> | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    type: "featured",
    title: "",
  });
  const [itemForm, setItemForm] = useState<ItemFormData>({
    title: "",
    imageId: null,
    genres: [],
  });
  const [genreInput, setGenreInput] = useState("");

  const categories = useQuery(api.categories.getCategories);
  const createCategory = useMutation(api.categories.createCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);
  const updateCategory = useMutation(api.categories.updateCategory);
  const updateCategoryOrder = useMutation(api.categories.updateCategoryOrder);
  const createItem = useMutation(api.items.createItem);
  const updateItem = useMutation(api.items.updateItem);
  const deleteItem = useMutation(api.items.deleteItem);

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

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title.trim() || !itemForm.imageId || !showItemForm) return;

    try {
      if (editingItem) {
        await updateItem({
          itemId: editingItem,
          title: itemForm.title,
          imageId: itemForm.imageId,
          genres: itemForm.genres,
        });
      } else {
        await createItem({
          categoryId: showItemForm,
          title: itemForm.title,
          imageId: itemForm.imageId,
          genres: itemForm.genres,
        });
      }
      setItemForm({ title: "", imageId: null, genres: [] });
      setShowItemForm(null);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const addGenre = () => {
    if (genreInput.trim() && !itemForm.genres.includes(genreInput.trim())) {
      setItemForm(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }));
      setGenreInput("");
    }
  };

  const removeGenre = (genre: string) => {
    setItemForm(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
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
      default:
        return "";
    }
  };

  if (categories === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Category
        </button>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Category</h2>
            <form onSubmit={handleCreateCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={categoryForm.type}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="featured">Featured (Hero Carousel)</option>
                  <option value="full">Full (Grid Layout)</option>
                  <option value="short">Short (Horizontal Carousel)</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {getTypeDescription(categoryForm.type)}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., NEW OF THIS SEASON"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use &lt;b&gt;word&lt;/b&gt; to make words bold
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h2>
            <form onSubmit={handleCreateItem}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={itemForm.title}
                  onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Movie/Show title"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <FileUpload
                  onUploadComplete={(storageId) => setItemForm(prev => ({ ...prev, imageId: storageId }))}
                  currentImageUrl={editingItem ? undefined : undefined} // We'll handle this in the edit case
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genres
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    placeholder="Add genre"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                  />
                  <button
                    type="button"
                    onClick={addGenre}
                    className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {itemForm.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {genre}
                      <button
                        type="button"
                        onClick={() => removeGenre(genre)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!itemForm.imageId}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingItem ? "Update Item" : "Create Item"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowItemForm(null);
                    setEditingItem(null);
                    setItemForm({ title: "", imageId: null, genres: [] });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map(c => c._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {categories.map((category) => (
              <SortableCategoryCard
                key={category._id}
                category={category}
                onDelete={() => deleteCategory({ categoryId: category._id })}
                onAddItem={() => setShowItemForm(category._id)}
                onEditItem={(item) => {
                  setEditingItem(item._id);
                  setItemForm({
                    title: item.title,
                    imageId: item.imageId,
                    genres: item.genres,
                  });
                  setShowItemForm(category._id);
                }}
                onDeleteItem={(itemId) => deleteItem({ itemId })}
                formatTitle={formatTitle}
                getTypeDescription={getTypeDescription}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableCategoryCard({ 
  category, 
  onDelete, 
  onAddItem, 
  onEditItem, 
  onDeleteItem, 
  formatTitle, 
  getTypeDescription 
}: {
  category: any;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            </svg>
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {formatTitle(category.title)}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {category.type} - {getTypeDescription(category.type)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddItem}
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Add Item
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {items === undefined ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No items in this category</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="border border-gray-200 rounded-md p-3">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                {item.genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditItem(item)}
                  className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteItem(item._id)}
                  className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}