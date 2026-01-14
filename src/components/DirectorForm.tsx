import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom";
import { Id } from "../../convex/_generated/dataModel";

type FormStep = 1 | 2 | 3;

export function DirectorForm() {
  const navigate = useNavigate();
  const { directorId } = useParams();
  const isEditing = !!directorId;

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const directors = useQuery(api.directors.getDirectors);
  const director = directors?.find(d => d._id === directorId);

  const createDirector = useMutation(api.directors.createDirector);
  const updateDirector = useMutation(api.directors.updateDirector);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(director?.imageUrl || null);

  const [formData, setFormData] = useState({
    name: director?.name || "",
    career: director?.career || "",
    height: director?.height || "",
    dateOfBirth: director?.dateOfBirth || "",
    placeOfBirth: director?.placeOfBirth || "",
    age: director?.age?.toString() || "",
    zodiac: director?.zodiac || "",
    genres: director?.genres?.join(", ") || "",
    totalMovies: director?.totalMovies?.toString() || "",
    firstMovie: director?.firstMovie || "",
    lastMovie: director?.lastMovie || "",
    bestMovie: director?.bestMovie || "",
    biography: director?.biography || "",
  });

  if (loggedInUser === undefined || directors === undefined) {
    return (
      <div className="main__content">
        <div className="d-flex align-items-center justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!loggedInUser?.profile || loggedInUser.profile.role !== "admin") {
    navigate("/");
    return null;
  }

  if (isEditing && !director) {
    return (
      <div className="main__content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="main__title">
                <h2>Director not found</h2>
              </div>
              <button onClick={() => navigate("/directors")} className="sign__btn">
                Back to Directors
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as FormStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as FormStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageId = director?.imageId;

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

      if (isEditing && directorId) {
        await updateDirector({ id: directorId as Id<"directors">, ...directorData });
      } else {
        await createDirector(directorData);
      }

      navigate("/directors");
    } catch (error) {
      console.error("Failed to save director:", error);
      alert("Failed to save director");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.name.trim() !== "" && formData.career.trim() !== "";

  return (
    <div className="main__content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="main__title">
              <h2>{isEditing ? "Edit Director" : "Add New Director"}</h2>
              <button 
                onClick={() => navigate("/directors")}
                className="main__title-link"
              >
                <i className="ti ti-arrow-left"></i> Back to Directors
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
                <div className="wizard-step-label">Career Details</div>
              </div>
              <div className="wizard-step-line"></div>
              <div className={`wizard-step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="wizard-step-number">3</div>
                <div className="wizard-step-label">Biography & Image</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <form onSubmit={handleSubmit} className="sign__form sign__form--profile">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="row">
                  <div className="col-12">
                    <h4 className="sign__title mb-4">Basic Information</h4>
                  </div>

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
                        placeholder="e.g., Director, Producer"
                        required
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
                      <label className="sign__label">Place of Birth</label>
                      <input
                        type="text"
                        name="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={handleInputChange}
                        placeholder="e.g., London, England"
                        className="sign__input"
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
                </div>
              )}

              {/* Step 2: Career Details */}
              {currentStep === 2 && (
                <div className="row">
                  <div className="col-12">
                    <h4 className="sign__title mb-4">Career Details</h4>
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

                  <div className="col-12 col-md-6">
                    <div className="sign__group">
                      <label className="sign__label">First Movie</label>
                      <input
                        type="text"
                        name="firstMovie"
                        value={formData.firstMovie}
                        onChange={handleInputChange}
                        placeholder="e.g., Movie Title (1995)"
                        className="sign__input"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="sign__group">
                      <label className="sign__label">Last Movie</label>
                      <input
                        type="text"
                        name="lastMovie"
                        value={formData.lastMovie}
                        onChange={handleInputChange}
                        placeholder="e.g., Movie Title (2023)"
                        className="sign__input"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="sign__group">
                      <label className="sign__label">Best Movie</label>
                      <input
                        type="text"
                        name="bestMovie"
                        value={formData.bestMovie}
                        onChange={handleInputChange}
                        placeholder="e.g., Best Known Movie"
                        className="sign__input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Biography & Image */}
              {currentStep === 3 && (
                <div className="row">
                  <div className="col-12">
                    <h4 className="sign__title mb-4">Biography & Image</h4>
                  </div>

                  <div className="col-12">
                    <div className="sign__group">
                      <label className="sign__label">Biography</label>
                      <textarea
                        name="biography"
                        value={formData.biography}
                        onChange={handleInputChange}
                        rows={6}
                        className="sign__textarea"
                        placeholder="Write a brief biography about the director..."
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
                      {imagePreview && (
                        <div className="mt-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{ 
                              height: '150px', 
                              width: '150px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              border: '2px solid #2b2b31'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                  
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="sign__btn"
                      disabled={currentStep === 1 && !isStep1Valid}
                    >
                      Next <i className="ti ti-arrow-right"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="sign__btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : (isEditing ? "Update Director" : "Create Director")}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
