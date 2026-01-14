import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom";
import { Id } from "../../convex/_generated/dataModel";

type FormStep = 1 | 2 | 3;

export function ActorForm() {
  const navigate = useNavigate();
  const { actorId } = useParams();
  const isEditing = !!actorId;

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const actors = useQuery(api.actors.getActors);
  const actor = actors?.find(a => a._id === actorId);

  const createActor = useMutation(api.actors.createActor);
  const updateActor = useMutation(api.actors.updateActor);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(actor?.imageUrl || null);

  const [formData, setFormData] = useState({
    name: actor?.name || "",
    career: actor?.career || "",
    height: actor?.height || "",
    dateOfBirth: actor?.dateOfBirth || "",
    placeOfBirth: actor?.placeOfBirth || "",
    age: actor?.age?.toString() || "",
    zodiac: actor?.zodiac || "",
    genres: actor?.genres?.join(", ") || "",
    totalMovies: actor?.totalMovies?.toString() || "",
    firstMovie: actor?.firstMovie || "",
    lastMovie: actor?.lastMovie || "",
    bestMovie: actor?.bestMovie || "",
    biography: actor?.biography || "",
  });

  if (loggedInUser === undefined || actors === undefined) {
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

  if (isEditing && !actor) {
    return (
      <div className="main__content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="main__title">
                <h2>Actor not found</h2>
              </div>
              <button onClick={() => navigate("/actors")} className="sign__btn">
                Back to Actors
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
      let imageId = actor?.imageId;

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

      if (isEditing && actorId) {
        await updateActor({ id: actorId as Id<"actors">, ...actorData });
      } else {
        await createActor(actorData);
      }

      navigate("/actors");
    } catch (error) {
      console.error("Failed to save actor:", error);
      alert("Failed to save actor");
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
              <h2>{isEditing ? "Edit Actor" : "Add New Actor"}</h2>
              <button 
                onClick={() => navigate("/actors")}
                className="main__title-link"
              >
                <i className="ti ti-arrow-left"></i> Back to Actors
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
                        placeholder="e.g., Actor, Producer"
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
                        placeholder="Write a brief biography about the actor..."
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
                      {isSubmitting ? "Saving..." : (isEditing ? "Update Actor" : "Create Actor")}
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
