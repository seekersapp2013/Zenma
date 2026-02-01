import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AdminLayout } from "../AdminLayout";
import { toast } from "sonner";

export function DirectorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Fetch director data if editing
  const directors = useQuery(api.directors.getDirectors);
  const director = directors?.find(d => d._id === id);

  const createDirector = useMutation(api.directors.createDirector);
  const updateDirector = useMutation(api.directors.updateDirector);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    career: "",
    height: "",
    dateOfBirth: "",
    placeOfBirth: "",
    age: "",
    zodiac: "",
    genres: "",
    totalMovies: "",
    firstMovie: "",
    lastMovie: "",
    bestMovie: "",
    biography: "",
  });

  // Load director data when editing
  useEffect(() => {
    if (director) {
      setFormData({
        name: director.name || "",
        career: director.career || "",
        height: director.height || "",
        dateOfBirth: director.dateOfBirth || "",
        placeOfBirth: director.placeOfBirth || "",
        age: director.age?.toString() || "",
        zodiac: director.zodiac || "",
        genres: director.genres?.join(", ") || "",
        totalMovies: director.totalMovies?.toString() || "",
        firstMovie: director.firstMovie || "",
        lastMovie: director.lastMovie || "",
        bestMovie: director.bestMovie || "",
        biography: director.biography || "",
      });
      if (director.imageUrl) {
        setImagePreview(director.imageUrl);
      }
    }
  }, [director]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== "" && formData.career.trim() !== "";
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      navigate("/admin/directors");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.career.trim()) {
      toast.error("Name and Career are required");
      setCurrentStep(1);
      return;
    }

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

      if (isEditing && id) {
        await updateDirector({ id: id as Id<"directors">, ...directorData });
        toast.success("Director updated successfully!");
      } else {
        await createDirector(directorData);
        toast.success("Director created successfully!");
      }

      navigate("/admin/directors");
    } catch (error) {
      console.error("Failed to save director:", error);
      toast.error("Failed to save director. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-center mb-3">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="d-flex align-items-center">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center ${
                  currentStep >= step ? "bg-primary" : "bg-secondary"
                }`}
                style={{
                  width: "40px",
                  height: "40px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={currentStep > step ? "bg-primary" : "bg-secondary"}
                  style={{ width: "60px", height: "4px", margin: "0 8px" }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-white">
          <h5>Step {currentStep} of 4</h5>
          <p className="text-muted mb-0">
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Personal Details"}
            {currentStep === 3 && "Career Information"}
            {currentStep === 4 && "Biography & Review"}
          </p>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
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
            placeholder="Enter director name"
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
                  height: "120px",
                  width: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "2px solid #404040",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="row">
      <div className="col-12">
        <h4 className="sign__title mb-4">Personal Details</h4>
      </div>

      <div className="col-12 col-md-6">
        <div className="sign__group">
          <label className="sign__label">Height</label>
          <input
            type="text"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            className="sign__input"
            placeholder="e.g., 1.75 m"
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
            className="sign__input"
            placeholder="e.g., March 30, 1970"
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
            className="sign__input"
            placeholder="e.g., London, England, United Kingdom"
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
            placeholder="e.g., 53"
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
            className="sign__input"
            placeholder="e.g., Aries"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="row">
      <div className="col-12">
        <h4 className="sign__title mb-4">Career Information</h4>
      </div>

      <div className="col-12">
        <div className="sign__group">
          <label className="sign__label">Genres (comma-separated)</label>
          <input
            type="text"
            name="genres"
            value={formData.genres}
            onChange={handleInputChange}
            className="sign__input"
            placeholder="e.g., Action, Sci-Fi, Thriller"
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
            placeholder="e.g., 35"
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
            className="sign__input"
            placeholder="e.g., Duel (1971)"
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
            className="sign__input"
            placeholder="e.g., Indiana Jones 5 (2023)"
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
            className="sign__input"
            placeholder="e.g., Jurassic Park"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="row">
      <div className="col-12">
        <h4 className="sign__title mb-4">Biography & Review</h4>
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
            placeholder="Enter director biography..."
          />
        </div>
      </div>

      <div className="col-12">
        <div className="sign__group">
          <h5 className="text-white mb-3">Review Your Information</h5>
          <div className="p-3" style={{ backgroundColor: "#2b2b2b", borderRadius: "8px" }}>
            <div className="row">
              <div className="col-md-6 mb-2">
                <strong className="text-white">Name:</strong>
                <span className="text-muted ms-2">{formData.name || "Not provided"}</span>
              </div>
              <div className="col-md-6 mb-2">
                <strong className="text-white">Career:</strong>
                <span className="text-muted ms-2">{formData.career || "Not provided"}</span>
              </div>
              <div className="col-md-6 mb-2">
                <strong className="text-white">Height:</strong>
                <span className="text-muted ms-2">{formData.height || "Not provided"}</span>
              </div>
              <div className="col-md-6 mb-2">
                <strong className="text-white">Age:</strong>
                <span className="text-muted ms-2">{formData.age || "Not provided"}</span>
              </div>
              <div className="col-md-6 mb-2">
                <strong className="text-white">Place of Birth:</strong>
                <span className="text-muted ms-2">{formData.placeOfBirth || "Not provided"}</span>
              </div>
              <div className="col-md-6 mb-2">
                <strong className="text-white">Total Movies:</strong>
                <span className="text-muted ms-2">{formData.totalMovies || "Not provided"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isEditing && !director && directors !== undefined) {
    return (
      <AdminLayout currentPage="directors" pageTitle="Director Not Found">
        <div className="text-center py-5">
          <h4 className="text-white mb-3">Director not found</h4>
          <button onClick={() => navigate("/admin/directors")} className="btn btn-primary">
            Back to Directors
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      currentPage="directors"
      pageTitle={isEditing ? "Edit Director" : "Add New Director"}
      titleActions={
        <button onClick={() => navigate("/admin/directors")} className="main__title-link">
          <i className="ti ti-arrow-left"></i> Back to Directors
        </button>
      }
    >
      <div className="row">
        <div className="col-12 col-lg-10 col-xl-8 mx-auto">
          <div className="sign__wrap">
            <div>
              {renderStepIndicator()}

              <div className="mb-4">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="sign__btn"
                  style={{ backgroundColor: "#6c757d", width: "auto", padding: "0 30px" }}
                >
                  Cancel
                </button>

                <div className="d-flex gap-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="sign__btn"
                      style={{ backgroundColor: "#404040", width: "auto", padding: "0 30px" }}
                    >
                      <i className="ti ti-arrow-left"></i> Previous
                    </button>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="sign__btn"
                      style={{ width: "auto", padding: "0 30px" }}
                      disabled={!canProceedToNextStep()}
                    >
                      Next <i className="ti ti-arrow-right"></i>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e)}
                      className="sign__btn"
                      style={{ width: "auto", padding: "0 30px" }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : isEditing ? "Update Director" : "Create Director"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
