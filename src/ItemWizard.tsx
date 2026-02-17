import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { FileUpload } from "./components/FileUpload";
import { HybridUpload } from "./components/HybridUpload";
import "./wizard.css";

interface ItemFormData {
  title: string;
  imageId: Id<"_storage"> | null;
  imageUrl?: string; // Add imageUrl for displaying existing image
  genres: string[];
  description: string;
  director: string[];
  cast: Array<{
    castName: string;
    actorName: string;
  }>;
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
  categoryId?: Id<"categories">; // Made optional for standalone movie creation
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
    director: [],
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
  const [selectedActors, setSelectedActors] = useState<string[]>([]);
  const [videoSourceInput, setVideoSourceInput] = useState({ 
    videoId: null as Id<"_storage"> | null, 
    url: "",
    quality: "", 
    type: "video/mp4" 
  });
  const [captionInput, setCaptionInput] = useState({ label: "", srcLang: "", src: "", default: false });

  const createItem = useMutation(api.items.createItem);
  const updateItem = useMutation(api.items.updateItem);
  
  // Fetch actors, directors, and genres from database
  const actors = useQuery(api.actors.getActors);
  const directors = useQuery(api.directors.getDirectors);
  const genres = useQuery(api.genres.getGenres);

  const steps = [
    { id: 1, title: "Basic Info", description: "Title, image, and genres" },
    { id: 2, title: "Details", description: "Description, cast, and metadata" },
    { id: 3, title: "Video Player", description: "Video sources and captions" },
    { id: 4, title: "Review", description: "Review and submit" },
  ];

  // Helper functions
  const toggleGenre = (genre: string) => {
    setItemForm(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const toggleDirector = (director: string) => {
    setItemForm(prev => ({
      ...prev,
      director: prev.director.includes(director)
        ? prev.director.filter(d => d !== director)
        : [...prev.director, director]
    }));
  };

  const toggleActorSelection = (actorName: string) => {
    setSelectedActors(prev =>
      prev.includes(actorName)
        ? prev.filter(a => a !== actorName)
        : [...prev, actorName]
    );
  };

  const addSelectedActorsToCast = () => {
    const newCastMembers = selectedActors
      .filter(actorName => !itemForm.cast.some(c => c.actorName === actorName))
      .map(actorName => ({
        castName: "",
        actorName: actorName
      }));
    
    if (newCastMembers.length > 0) {
      setItemForm(prev => ({
        ...prev,
        cast: [...prev.cast, ...newCastMembers]
      }));
      setSelectedActors([]);
    }
  };

  const updateCastCharacterName = (index: number, castName: string) => {
    setItemForm(prev => ({
      ...prev,
      cast: prev.cast.map((c, i) => i === index ? { ...c, castName } : c)
    }));
  };

  const removeCast = (index: number) => {
    setItemForm(prev => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index)
    }));
  };

  const addVideoSource = () => {
    if ((videoSourceInput.videoId || videoSourceInput.url.trim()) && videoSourceInput.quality.trim()) {
      setItemForm(prev => ({
        ...prev,
        videoSources: [...prev.videoSources, { 
          ...videoSourceInput,
          videoId: videoSourceInput.videoId || null, // Ensure null instead of undefined
        }]
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
      
      // Process video sources to ensure proper null handling
      const processedVideoSources = itemForm.videoSources.map(source => ({
        ...source,
        videoId: source.videoId || null, // Ensure null instead of undefined
        url: source.url || undefined,
      }));
      
      if (editingItem) {
        await updateItem({
          itemId: editingItem,
          title: itemForm.title,
          imageId: itemForm.imageId,
          genres: itemForm.genres,
          description: itemForm.description || undefined,
          director: itemForm.director.length > 0 ? itemForm.director : undefined,
          cast: itemForm.cast.length > 0 ? itemForm.cast : undefined,
          premiereYear: itemForm.premiereYear || undefined,
          runningTime: itemForm.runningTime || undefined,
          country: itemForm.country || undefined,
          rating: itemForm.rating || undefined,
          posterImageId: itemForm.posterImageId || undefined,
          posterImageUrl: itemForm.posterImageUrl || undefined,
          videoSources: processedVideoSources.length > 0 ? processedVideoSources : undefined,
          captions: itemForm.captions.length > 0 ? itemForm.captions : undefined,
        });
      } else {
        // Create item - with or without category
        if (categoryId) {
          // Old flow: create with category (will be added to junction table via backend)
          await createItem({
            title: itemForm.title,
            imageId: itemForm.imageId,
            genres: itemForm.genres,
            description: itemForm.description || undefined,
            director: itemForm.director.length > 0 ? itemForm.director : undefined,
            cast: itemForm.cast.length > 0 ? itemForm.cast : undefined,
            premiereYear: itemForm.premiereYear || undefined,
            runningTime: itemForm.runningTime || undefined,
            country: itemForm.country || undefined,
            rating: itemForm.rating || undefined,
            posterImageId: itemForm.posterImageId || undefined,
            posterImageUrl: itemForm.posterImageUrl || undefined,
            videoSources: processedVideoSources.length > 0 ? processedVideoSources : undefined,
            captions: itemForm.captions.length > 0 ? itemForm.captions : undefined,
          });
        } else {
          // New flow: create without category (orphaned movie)
          await createItem({
            title: itemForm.title,
            imageId: itemForm.imageId,
            genres: itemForm.genres,
            description: itemForm.description || undefined,
            director: itemForm.director.length > 0 ? itemForm.director : undefined,
            cast: itemForm.cast.length > 0 ? itemForm.cast : undefined,
            premiereYear: itemForm.premiereYear || undefined,
            runningTime: itemForm.runningTime || undefined,
            country: itemForm.country || undefined,
            rating: itemForm.rating || undefined,
            posterImageId: itemForm.posterImageId || undefined,
            posterImageUrl: itemForm.posterImageUrl || undefined,
            videoSources: processedVideoSources.length > 0 ? processedVideoSources : undefined,
            captions: itemForm.captions.length > 0 ? itemForm.captions : undefined,
          });
        }
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
          <div className="row">
            <div className="col-12">
              <h4 className="sign__title mb-4">Basic Information</h4>
            </div>

            <div className="col-12">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Title *</label>
                <input
                  type="text"
                  value={itemForm.title}
                  onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Movie/Show title"
                  className="sign__input"
                  required
                />
              </div>
            </div>
            
            <div className="col-12">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Cover Image *</label>
                {editingItem && itemForm.imageId && itemForm.imageUrl && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#222028', 
                      borderRadius: '8px',
                      border: '1px solid #404040'
                    }}>
                      <p style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '10px' }}>
                        Current cover image:
                      </p>
                      <img 
                        src={itemForm.imageUrl} 
                        alt="Current cover"
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '300px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          display: 'block'
                        }}
                      />
                      <p style={{ color: '#ff9800', fontSize: '0.85rem', marginTop: '10px', marginBottom: 0 }}>
                        Upload a new image below to replace it
                      </p>
                    </div>
                  </div>
                )}
                <FileUpload
                  onUploadComplete={(storageId) => setItemForm(prev => ({ ...prev, imageId: storageId }))}
                />
              </div>
            </div>
            
            <div className="col-12">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Genres * (Click to select/deselect)</label>
                <div className="d-flex flex-wrap gap-2">
                  {genres?.map((genre) => {
                    const isSelected = itemForm.genres.includes(genre.name);
                    return (
                      <span
                        key={genre._id}
                        onClick={() => toggleGenre(genre.name)}
                        className="badge d-flex align-items-center gap-1"
                        style={{
                          fontSize: '14px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#ff1493' : '#2b2b31',
                          color: '#fff',
                          border: isSelected ? '2px solid #ff1493' : '2px solid #404040',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSelected && <i className="ti ti-check" style={{ fontSize: '12px' }}></i>}
                        {genre.name}
                      </span>
                    );
                  })}
                </div>
                {itemForm.genres.length === 0 && (
                  <small style={{ color: '#ff9800', marginTop: '8px', display: 'block' }}>
                    Please select at least one genre
                  </small>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="sign__title mb-4">Details</h4>
            </div>

            <div className="col-12">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Movie/show description"
                  rows={4}
                  className="sign__textarea"
                />
              </div>
            </div>

            <div className="col-12">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Directors (Click to select/deselect)</label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {directors?.map((director) => {
                    const isSelected = itemForm.director.includes(director.name);
                    return (
                      <span
                        key={director._id}
                        onClick={() => toggleDirector(director.name)}
                        className="badge d-flex align-items-center gap-1"
                        style={{
                          fontSize: '14px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#ff1493' : '#2b2b31',
                          color: '#fff',
                          border: isSelected ? '2px solid #ff1493' : '2px solid #404040',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSelected && <i className="ti ti-check" style={{ fontSize: '12px' }}></i>}
                        {director.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Cast - Select Actors (Click to select/deselect)</label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {actors?.map((actor) => {
                    const isSelected = selectedActors.includes(actor.name);
                    const isAlreadyInCast = itemForm.cast.some(c => c.actorName === actor.name);
                    return (
                      <span
                        key={actor._id}
                        onClick={() => !isAlreadyInCast && toggleActorSelection(actor.name)}
                        className="badge d-flex align-items-center gap-1"
                        style={{
                          fontSize: '14px',
                          padding: '8px 12px',
                          cursor: isAlreadyInCast ? 'not-allowed' : 'pointer',
                          backgroundColor: isAlreadyInCast ? '#1a1a1a' : (isSelected ? '#ff1493' : '#2b2b31'),
                          color: isAlreadyInCast ? '#666' : '#fff',
                          border: isAlreadyInCast ? '2px solid #333' : (isSelected ? '2px solid #ff1493' : '2px solid #404040'),
                          transition: 'all 0.2s ease',
                          opacity: isAlreadyInCast ? 0.5 : 1
                        }}
                      >
                        {isSelected && <i className="ti ti-check" style={{ fontSize: '12px' }}></i>}
                        {isAlreadyInCast && <i className="ti ti-check" style={{ fontSize: '12px' }}></i>}
                        {actor.name}
                      </span>
                    );
                  })}
                </div>
                {selectedActors.length > 0 && (
                  <button
                    type="button"
                    onClick={addSelectedActorsToCast}
                    className="sign__btn"
                    style={{ width: 'auto', padding: '8px 20px', marginBottom: '15px' }}
                  >
                    Add {selectedActors.length} Selected Actor{selectedActors.length > 1 ? 's' : ''} to Cast
                  </button>
                )}
                
                {itemForm.cast.length > 0 && (
                  <>
                    <label className="sign__label" style={{ marginTop: '15px' }}>Cast List (Edit character names)</label>
                    <div className="d-flex flex-column gap-2">
                      {itemForm.cast.map((castMember, index) => (
                        <div key={index} className="d-flex align-items-center gap-2 p-2" style={{ backgroundColor: '#222028', borderRadius: '8px' }}>
                          <div className="flex-grow-1 d-flex align-items-center gap-2">
                            <input
                              type="text"
                              value={castMember.castName}
                              onChange={(e) => updateCastCharacterName(index, e.target.value)}
                              placeholder="Character name (optional)"
                              className="sign__input"
                              style={{ marginBottom: 0, flex: 1 }}
                            />
                            <span style={{ fontSize: '14px', color: '#b3b3b3', minWidth: '150px' }}>
                              {castMember.actorName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCast(index)}
                            className="btn-close btn-close-white"
                            aria-label="Remove"
                          >
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Premiere Year</label>
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
                  className="sign__input"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Running Time (minutes)</label>
                <input
                  type="number"
                  value={itemForm.runningTime || ""}
                  onChange={(e) => setItemForm(prev => ({ 
                    ...prev, 
                    runningTime: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="120"
                  min="1"
                  className="sign__input"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Country</label>
                <input
                  type="text"
                  value={itemForm.country}
                  onChange={(e) => setItemForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="USA"
                  className="sign__input"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Rating (1-10)</label>
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
                  className="sign__input"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="sign__title mb-4">Video Player</h4>
            </div>

            <div className="col-12">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Poster Image (for video player)</label>
                {editingItem && (itemForm.posterImageId || itemForm.posterImageUrl) && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#222028', 
                      borderRadius: '8px',
                      border: '1px solid #404040'
                    }}>
                      <p style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '10px' }}>
                        Current poster image:
                      </p>
                      <div style={{ 
                        maxWidth: '300px', 
                        maxHeight: '200px', 
                        overflow: 'hidden',
                        borderRadius: '8px',
                        backgroundColor: '#1a1a1a'
                      }}>
                        {itemForm.posterImageUrl ? (
                          <img 
                            src={itemForm.posterImageUrl} 
                            alt="Current poster"
                            style={{ 
                              width: '100%',
                              height: 'auto',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <div style={{ 
                            padding: '20px', 
                            textAlign: 'center',
                            color: '#666'
                          }}>
                            Poster image uploaded (ID: {itemForm.posterImageId?.slice(0, 8)}...)
                          </div>
                        )}
                      </div>
                      <p style={{ color: '#ff9800', fontSize: '0.85rem', marginTop: '10px', marginBottom: 0 }}>
                        Upload a new image below to replace it
                      </p>
                    </div>
                  </div>
                )}
                <HybridUpload
                  label="Poster Image"
                  onUploadComplete={(storageId) => setItemForm(prev => ({ ...prev, posterImageId: storageId, posterImageUrl: "" }))}
                  onUrlComplete={(url) => setItemForm(prev => ({ ...prev, posterImageUrl: url, posterImageId: null }))}
                  accept="image/*"
                  fileType="image"
                />
              </div>
            </div>

            <div className="col-12">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Video Sources</label>
                
                {/* Show existing video sources */}
                {itemForm.videoSources.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '10px' }}>
                      Current video sources:
                    </p>
                    <div className="d-flex flex-column gap-2">
                      {itemForm.videoSources.map((source, index) => (
                        <div key={index} className="d-flex align-items-center gap-2 p-2" style={{ backgroundColor: '#222028', borderRadius: '8px' }}>
                          <span className="flex-grow-1" style={{ fontSize: '14px' }}>
                            <strong>{source.quality}</strong> - {source.videoId ? 'Uploaded Video' : source.url ? `URL: ${source.url.substring(0, 40)}...` : 'No source'} ({source.type})
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVideoSource(index)}
                            className="btn-close btn-close-white"
                            aria-label="Remove"
                          >
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add new video source */}
                <p style={{ color: '#ff9800', fontSize: '0.9rem', marginBottom: '10px' }}>
                  Add new video source:
                </p>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <HybridUpload
                      label=""
                      onUploadComplete={(storageId) => setVideoSourceInput(prev => ({ ...prev, videoId: storageId, url: "" }))}
                      onUrlComplete={(url) => setVideoSourceInput(prev => ({ ...prev, url: url, videoId: null }))}
                      accept="video/*"
                      fileType="video"
                    />
                  </div>
                  <div className="col-3">
                    <input
                      type="text"
                      value={videoSourceInput.quality}
                      onChange={(e) => setVideoSourceInput(prev => ({ ...prev, quality: e.target.value }))}
                      placeholder="Quality (e.g., 720p)"
                      className="sign__input"
                    />
                  </div>
                  <div className="col-2">
                    <select
                      value={videoSourceInput.type}
                      onChange={(e) => setVideoSourceInput(prev => ({ ...prev, type: e.target.value }))}
                      className="sign__input"
                    >
                      <option value="video/mp4">MP4</option>
                      <option value="video/webm">WebM</option>
                      <option value="video/ogg">OGG</option>
                    </select>
                  </div>
                  <div className="col-1">
                    <button
                      type="button"
                      onClick={addVideoSource}
                      className="sign__btn"
                      style={{ width: '100%', padding: '0' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="sign__group" style={{ marginBottom: '12px' }}>
                <label className="sign__label">Captions/Subtitles</label>
                <div className="row g-2 mb-2">
                  <div className="col-3">
                    <input
                      type="text"
                      value={captionInput.label}
                      onChange={(e) => setCaptionInput(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Label (e.g., English)"
                      className="sign__input"
                    />
                  </div>
                  <div className="col-2">
                    <input
                      type="text"
                      value={captionInput.srcLang}
                      onChange={(e) => setCaptionInput(prev => ({ ...prev, srcLang: e.target.value }))}
                      placeholder="Lang (e.g., en)"
                      className="sign__input"
                    />
                  </div>
                  <div className="col-5">
                    <input
                      type="url"
                      value={captionInput.src}
                      onChange={(e) => setCaptionInput(prev => ({ ...prev, src: e.target.value }))}
                      placeholder="VTT file URL"
                      className="sign__input"
                    />
                  </div>
                  <div className="col-1 d-flex align-items-center">
                    <label className="d-flex align-items-center" style={{ fontSize: '12px', color: '#fff' }}>
                      <input
                        type="checkbox"
                        checked={captionInput.default}
                        onChange={(e) => setCaptionInput(prev => ({ ...prev, default: e.target.checked }))}
                        className="me-1"
                      />
                      Default
                    </label>
                  </div>
                  <div className="col-1">
                    <button
                      type="button"
                      onClick={addCaption}
                      className="sign__btn"
                      style={{ width: '100%', padding: '0' }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="d-flex flex-column gap-2">
                  {itemForm.captions.map((caption, index) => (
                    <div key={index} className="d-flex align-items-center gap-2 p-2" style={{ backgroundColor: '#222028', borderRadius: '8px' }}>
                      <span className="flex-grow-1" style={{ fontSize: '14px' }}>
                        <strong>{caption.label}</strong> ({caption.srcLang}) - {caption.src}
                        {caption.default && <span style={{ color: '#ff1493', marginLeft: '8px' }}>[Default]</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCaption(index)}
                        className="btn-close btn-close-white"
                        aria-label="Remove"
                      >
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="sign__title mb-4">Review Your Item</h4>
            </div>
            
            <div className="col-12">
              <div className="p-4" style={{ backgroundColor: '#222028', borderRadius: '8px' }}>
                <div className="mb-3">
                  <strong style={{ color: '#ff1493' }}>Title:</strong> <span style={{ color: '#fff' }}>{itemForm.title}</span>
                </div>
                <div className="mb-3">
                  <strong style={{ color: '#ff1493' }}>Genres:</strong> <span style={{ color: '#fff' }}>{itemForm.genres.join(", ") || "None"}</span>
                </div>
                {itemForm.description && (
                  <div className="mb-3">
                    <strong style={{ color: '#ff1493' }}>Description:</strong> <span style={{ color: '#fff' }}>{itemForm.description.substring(0, 100)}...</span>
                  </div>
                )}
                {itemForm.director.length > 0 && (
                  <div className="mb-3">
                    <strong style={{ color: '#ff1493' }}>Directors:</strong> <span style={{ color: '#fff' }}>{itemForm.director.join(", ")}</span>
                  </div>
                )}
                {itemForm.cast.length > 0 && (
                  <div className="mb-3">
                    <strong style={{ color: '#ff1493' }}>Cast:</strong> <span style={{ color: '#fff' }}>{itemForm.cast.map(c => `${c.castName} (${c.actorName})`).join(", ")}</span>
                  </div>
                )}
                {itemForm.premiereYear && (
                  <div className="mb-3">
                    <strong style={{ color: '#ff1493' }}>Premiere Year:</strong> <span style={{ color: '#fff' }}>{itemForm.premiereYear}</span>
                  </div>
                )}
                {itemForm.runningTime && (
                  <div className="mb-3">
                    <strong style={{ color: '#ff1493' }}>Running Time:</strong> <span style={{ color: '#fff' }}>{itemForm.runningTime} minutes</span>
                  </div>
                )}
                {itemForm.country && (
                  <div className="mb-3">
                    <strong style={{ color: '#ff1493' }}>Country:</strong> <span style={{ color: '#fff' }}>{itemForm.country}</span>
                  </div>
                )}
                {itemForm.rating && (
                  <div className="mb-3">
                    <strong style={{ color: '#ff1493' }}>Rating:</strong> <span style={{ color: '#fff' }}>{itemForm.rating}/10</span>
                  </div>
                )}
                {itemForm.videoSources.length > 0 && (
                  <div className="mb-3">
                    <strong style={{ color: '#ff1493' }}>Video Sources:</strong> <span style={{ color: '#fff' }}>{itemForm.videoSources.length} source(s)</span>
                  </div>
                )}
                {itemForm.captions.length > 0 && (
                  <div className="mb-3">
                    <strong style={{ color: '#ff1493' }}>Captions:</strong> <span style={{ color: '#fff' }}>{itemForm.captions.length} language(s)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="main__content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="main__title">
              <h2>{editingItem ? "Edit Item" : "Add New Item"}</h2>
              <button 
                onClick={onClose}
                className="main__title-link"
              >
                <i className="ti ti-arrow-left"></i> Back
              </button>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="row">
          <div className="col-12">
            <div className="wizard-steps mb-4">
              <div className={`wizard-step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="wizard-step-number">1</div>
                <div className="wizard-step-label">Basic Info</div>
              </div>
              <div className="wizard-step-line"></div>
              <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="wizard-step-number">2</div>
                <div className="wizard-step-label">Details</div>
              </div>
              <div className="wizard-step-line"></div>
              <div className={`wizard-step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="wizard-step-number">3</div>
                <div className="wizard-step-label">Video Player</div>
              </div>
              <div className="wizard-step-line"></div>
              <div className={`wizard-step ${currentStep >= 4 ? 'active' : ''}`}>
                <div className="wizard-step-number">4</div>
                <div className="wizard-step-label">Review</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="sign__form sign__form--profile">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="col-12">
                <div className="sign__group sign__group--btns">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="sign__btn"
                      style={{ marginRight: '10px' }}
                    >
                      <i className="ti ti-arrow-left"></i> Previous
                    </button>
                  )}
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="sign__btn"
                      disabled={!canProceed()}
                    >
                      Next <i className="ti ti-arrow-right"></i>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="sign__btn"
                      disabled={!canProceed()}
                    >
                      {editingItem ? "Update Item" : "Create Item"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}