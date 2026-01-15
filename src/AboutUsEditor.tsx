import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { AdminLayout } from "./AdminLayout";
import { toast } from "sonner";

export function AboutUsEditor() {
  const aboutContent = useQuery(api.settings.getAboutUsContent);
  const updateAboutUs = useMutation(api.settings.updateAboutUsContent);

  const [formData, setFormData] = useState({
    mainDescription: "",
    secondaryDescription: "",
    missionStatement: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Update form data when content loads
  useEffect(() => {
    if (aboutContent) {
      setFormData({
        mainDescription: aboutContent.mainDescription || "",
        secondaryDescription: aboutContent.secondaryDescription || "",
        missionStatement: aboutContent.missionStatement || "",
      });
    }
  }, [aboutContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateAboutUs({
        mainDescription: formData.mainDescription,
        secondaryDescription: formData.secondaryDescription,
        missionStatement: formData.missionStatement,
      });
      toast.success("About Us content updated successfully!");
    } catch (error) {
      console.error("Error updating About Us content:", error);
      toast.error("Failed to update About Us content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (aboutContent === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
      </div>
    );
  }

  return (
    <AdminLayout 
      currentPage="aboutus" 
      pageTitle="About Us Content"
      titleActions={
        <a href="/aboutus" target="_blank" className="main__title-link">
          <i className="ti ti-eye"></i> Preview Page
        </a>
      }
    >
      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="sign__wrap">
            <div className="row">
              <div className="col-12">
                <h4 className="sign__title">Edit About Us Page</h4>
                <p className="sign__text">Update the content that visitors see on your About Us page</p>
              </div>

              <div className="col-12">
                <form onSubmit={handleSubmit}>
                  <div className="sign__group">
                    <label className="sign__label">Main Description</label>
                    <textarea
                      className="sign__textarea"
                      placeholder="Enter main description..."
                      value={formData.mainDescription}
                      onChange={(e) => handleInputChange("mainDescription", e.target.value)}
                      rows={4}
                      required
                    />
                    <span className="sign__text sign__text--small">The primary description that appears at the top of the About Us page</span>
                  </div>

                  <div className="sign__group">
                    <label className="sign__label">Secondary Description</label>
                    <textarea
                      className="sign__textarea"
                      placeholder="Enter secondary description..."
                      value={formData.secondaryDescription}
                      onChange={(e) => handleInputChange("secondaryDescription", e.target.value)}
                      rows={4}
                      required
                    />
                    <span className="sign__text sign__text--small">Additional description that provides more details about your platform</span>
                  </div>

                  <div className="sign__group">
                    <label className="sign__label">Mission Statement (Optional)</label>
                    <textarea
                      className="sign__textarea"
                      placeholder="Enter mission statement..."
                      value={formData.missionStatement}
                      onChange={(e) => handleInputChange("missionStatement", e.target.value)}
                      rows={3}
                    />
                    <span className="sign__text sign__text--small">Your company's mission statement or core values</span>
                  </div>

                  <button 
                    type="submit" 
                    className="sign__btn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update About Us Content"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}