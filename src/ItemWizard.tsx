import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { FileUpload } from "./components/FileUpload";
import { HybridUpload } from "./components/HybridUpload";

interface ItemFormData {
  title: string;
  imageId: Id<"_storage"> | null;
  genres: string[];
  description: string;
  director: string;
  cast: string[];
  premiereYear: number | null;
  runningTime: number | null;
  country: string;
  rating: number | null;
  posterImageId: Id<"_storage"> | null;
  posterImageUrl: string;
  videoSources: Array<{
    videoId: Id<"_storage"> | null;
    url: string;
    quality: string;
    type: string;
  }>;
  captions: Array<{
    label: string;
    srcLang: string;
    src: string;
    default?: boolean;
  }>;
}

interface ItemWizardProps {
  categoryId: Id<"categories">;
  editingItem?: Id<"items"> | null;
  initialData?: Partial<ItemFormData>;
  onClose: () => void;
  onSuccess: () => void;
}

export function ItemWizard({ categoryId, editingItem, initialData, onClose, onSuccess }: ItemWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [itemForm, setItemForm] = useState<ItemFormData>({
    title: "",
    imageId: null,
    genres: [],
    description: "",
    director: "",
    cast: [],
    premiereYear: null,
    runningTime: null,
    country: "",
    rating: null,
    posterImageId: null,
    posterImageUrl: "",
    videoSources: [],
    captions: [],
    ...initialData,
  });

  // Input states for dynamic arrays
  const [genreInput, setGenreInput] = useState("");
  const [castInput, setCastInput] = useState("");
  const [videoSourceInput, setVideoSourceInput] = useState({ 
    videoId: null as Id<"_storage"> | null, 
    url: "",
    quality: "", 
    type: "video/mp4" 
  });
  const [captionInput, setCaptionInput] = useState({ label: "", srcLang: "", src: "", default: false });

  const createItem = useMutation(api.items.createItem);
  const updateItem = useMutation(api.items.updateItem);

  const steps = [
    { id: 1, title: "Basic Info", description: "Title, image, and genres" },
    { id: 2, title: "Details", description: "Description, cast, and metadata" },
    { id: 3, title: "Video Player", description: "Video sources and captions" },
    { id: 4, title: "Review", description: "Review and submit" },
  ];

  // Helper functions
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

  const addCast = () => {
    if (castInput.trim() && !itemForm.cast.includes(castInput.trim())) {
      setItemForm(prev => ({
        ...prev,
        cast: [...prev.cast, castInput.trim()]
      }));
      setCastInput("");
    }
  };

  const removeCast = (actor: string) => {
    setItemForm(prev => ({
      ...prev,
      cast: prev.cast.filter(c => c !== actor)
    }));
  };

  const addVideoSource = () => {
    if ((videoSourceInput.videoId || videoSourceInput.url.trim()) && videoSourceInput.quality.trim()) {
      setItemForm(prev => ({
        ...prev,
        videoSources: [...prev.videoSources, { ...videoSourceInput }]
      }));
      setVideoSourceInput({ videoId: null, url: "", quality: "", type: "video/mp4" });
    }
  };

  const removeVideoSource = (index: number) => {
    setItemForm(prev => ({
      ...prev,
      videoSources: prev.videoSources.filter((_, i) => i !== index)
    }));
  };

  const addCaption = () => {
    if (captionInput.label.trim() && captionInput.srcLang.trim() && captionInput.src.trim()) {
      setItemForm(prev => ({
        ...prev,
        captions: [...prev.captions, { ...captionInput }]
      }));
      setCaptionInput({ label: "", srcLang: "", src: "", default: false });
    }
  };

  const removeCaption = (index: number) => {
    setItemForm(prev => ({
      ...prev,
      captions: prev.captions.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!itemForm.title.trim() || !itemForm.imageId || itemForm.genres.length === 0) {
      console.error("Validation failed:", {
        title: itemForm.title.trim(),
        imageId: itemForm.imageId,
        genres: itemForm.genres.length
      });
      return;
    }

    try {
      console.log("Submitting item:", itemForm);
      
      if (editingItem) {
        await updateItem({
          itemId: editingItem,
          title: itemForm.title,
          imageId: itemForm.imageId,
          genres: itemForm.genres,
          description: itemForm.description || undefined,
          director: itemForm.director || undefined,
          cast: itemForm.cast.length > 0 ? itemForm.cast : undefined,
          premiereYear: itemForm.premiereYear || undefined,
          runningTime: itemForm.runningTime || undefined,
          country: itemForm.country || undefined,
          rating: itemForm.rating || undefined,
          posterImageId: itemForm.posterImageId || undefined,
          posterImageUrl: itemForm.posterImageUrl || undefined,
          videoSources: itemForm.videoSources.length > 0 ? itemForm.videoSources : undefined,
          captions: itemForm.captions.length > 0 ? itemForm.captions : undefined,
        });
      } else {
        await createItem({
          categoryId,
          title: itemForm.title,
          imageId: itemForm.imageId,
          genres: itemForm.genres,
          description: itemForm.description || undefined,
          director: itemForm.director || undefined,
          cast: itemForm.cast.length > 0 ? itemForm.cast : undefined,
          premiereYear: itemForm.premiereYear || undefined,
          runningTime: itemForm.runningTime || undefined,
          country: itemForm.country || undefined,
          rating: itemForm.rating || undefined,
          posterImageId: itemForm.posterImageId || undefined,
          posterImageUrl: itemForm.posterImageUrl || undefined,
          videoSources: itemForm.videoSources.length > 0 ? itemForm.videoSources : undefined,
          captions: itemForm.captions.length > 0 ? itemForm.captions : undefined,
        });
      }
      console.log("Item saved successfully");
      onSuccess();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving item. Please check the console for details.");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return itemForm.title.trim() && itemForm.imageId && itemForm.genres.length > 0;
      case 2:
        return true; // All fields in step 2 are optional
      case 3:
        return true; // All fields in step 3 are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image *
              </label>
              <FileUpload
                onUploadComplete={(storageId) => setItemForm(prev => ({ ...prev, imageId: storageId }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genres *
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={itemForm.description}
                onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Movie/show description"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Director
              </label>
              <input
                type="text"
                value={itemForm.director}
                onChange={(e) => setItemForm(prev => ({ ...prev, director: e.target.value }))}
                placeholder="Director name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cast
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  placeholder="Add cast member"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCast())}
                />
                <button
                  type="button"
                  onClick={addCast}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {itemForm.cast.map((actor) => (
                  <span
                    key={actor}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {actor}
                    <button
                      type="button"
                      onClick={() => removeCast(actor)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Premiere Year
                </label>
                <input
                  type="number"
                  value={itemForm.premiereYear || ""}
                  onChange={(e) => setItemForm(prev => ({ 
                    ...prev, 
                    premiereYear: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="2024"
                  min="1900"
                  max="2030"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Running Time (minutes)
                </label>
                <input
                  type="number"
                  value={itemForm.runningTime || ""}
                  onChange={(e) => setItemForm(prev => ({ 
                    ...prev, 
                    runningTime: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="120"
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={itemForm.country}
                  onChange={(e) => setItemForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="USA"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  value={itemForm.rating || ""}
                  onChange={(e) => setItemForm(prev => ({ 
                    ...prev, 
                    rating: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  placeholder="8.4"
                  min="1"
                  max="10"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <HybridUpload
                label="Poster Image"
                onUploadComplete={(storageId) => setItemForm(prev => ({ ...prev, posterImageId: storageId, posterImageUrl: "" }))}
                onUrlComplete={(url) => setItemForm(prev => ({ ...prev, posterImageUrl: url, posterImageId: null }))}
                accept="image/*"
                fileType="image"
                maxSize={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Sources
              </label>
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-6">
                  <HybridUpload
                    label=""
                    onUploadComplete={(storageId) => setVideoSourceInput(prev => ({ ...prev, videoId: storageId, url: "" }))}
                    onUrlComplete={(url) => setVideoSourceInput(prev => ({ ...prev, url: url, videoId: null }))}
                    accept="video/*"
                    fileType="video"
                    maxSize={200}
                  />
                </div>
                <input
                  type="text"
                  value={videoSourceInput.quality}
                  onChange={(e) => setVideoSourceInput(prev => ({ ...prev, quality: e.target.value }))}
                  placeholder="Quality (e.g., 720p)"
                  className="col-span-3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={videoSourceInput.type}
                  onChange={(e) => setVideoSourceInput(prev => ({ ...prev, type: e.target.value }))}
                  className="col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="video/mp4">MP4</option>
                  <option value="video/webm">WebM</option>
                  <option value="video/ogg">OGG</option>
                </select>
                <button
                  type="button"
                  onClick={addVideoSource}
                  className="col-span-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="space-y-2">
                {itemForm.videoSources.map((source, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <span className="flex-1 text-sm">
                      <strong>{source.quality}</strong> - {source.videoId ? 'Uploaded Video' : 'URL Video'} ({source.type})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVideoSource(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Captions/Subtitles
              </label>
              <div className="grid grid-cols-12 gap-2 mb-2">
                <input
                  type="text"
                  value={captionInput.label}
                  onChange={(e) => setCaptionInput(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Label (e.g., English)"
                  className="col-span-3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={captionInput.srcLang}
                  onChange={(e) => setCaptionInput(prev => ({ ...prev, srcLang: e.target.value }))}
                  placeholder="Lang (e.g., en)"
                  className="col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={captionInput.src}
                  onChange={(e) => setCaptionInput(prev => ({ ...prev, src: e.target.value }))}
                  placeholder="VTT file URL"
                  className="col-span-5 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={captionInput.default}
                    onChange={(e) => setCaptionInput(prev => ({ ...prev, default: e.target.checked }))}
                    className="mr-1"
                  />
                  <span className="text-xs">Default</span>
                </label>
                <button
                  type="button"
                  onClick={addCaption}
                  className="col-span-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="space-y-2">
                {itemForm.captions.map((caption, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <span className="flex-1 text-sm">
                      <strong>{caption.label}</strong> ({caption.srcLang}) - {caption.src}
                      {caption.default && <span className="text-blue-600 ml-2">[Default]</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCaption(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Review Your Item</h3>
            
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <div>
                <strong>Title:</strong> {itemForm.title}
              </div>
              <div>
                <strong>Genres:</strong> {itemForm.genres.join(", ") || "None"}
              </div>
              {itemForm.description && (
                <div>
                  <strong>Description:</strong> {itemForm.description.substring(0, 100)}...
                </div>
              )}
              {itemForm.director && (
                <div>
                  <strong>Director:</strong> {itemForm.director}
                </div>
              )}
              {itemForm.cast.length > 0 && (
                <div>
                  <strong>Cast:</strong> {itemForm.cast.join(", ")}
                </div>
              )}
              {itemForm.premiereYear && (
                <div>
                  <strong>Premiere Year:</strong> {itemForm.premiereYear}
                </div>
              )}
              {itemForm.runningTime && (
                <div>
                  <strong>Running Time:</strong> {itemForm.runningTime} minutes
                </div>
              )}
              {itemForm.country && (
                <div>
                  <strong>Country:</strong> {itemForm.country}
                </div>
              )}
              {itemForm.rating && (
                <div>
                  <strong>Rating:</strong> {itemForm.rating}/10
                </div>
              )}
              {itemForm.videoSources.length > 0 && (
                <div>
                  <strong>Video Sources:</strong> {itemForm.videoSources.length} source(s)
                </div>
              )}
              {itemForm.captions.length > 0 && (
                <div>
                  <strong>Captions:</strong> {itemForm.captions.length} language(s)
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-4">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  <div className="ml-2 text-sm">
                    <div className={`font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-gray-400 text-xs">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 w-12 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingItem ? "Update Item" : "Create Item"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}