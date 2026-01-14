import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AdminLayout } from "./AdminLayout";
import { toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";

export function ContactUsEditor() {
  const contactContent = useQuery(api.contacts.getContactContent);
  const submissions = useQuery(api.contacts.getAllContactSubmissions);
  const updateContent = useMutation(api.contacts.updateContactContent);
  const updateStatus = useMutation(api.contacts.updateContactStatus);
  const deleteSubmission = useMutation(api.contacts.deleteContactSubmission);

  const [activeTab, setActiveTab] = useState<"content" | "submissions">("content");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    heading: "",
    description: "",
    phone: "",
    email: "",
    facebook: "",
    twitter: "",
    instagram: "",
    discord: "",
    telegram: "",
    tiktok: "",
  });

  useEffect(() => {
    if (contactContent) {
      setFormData({
        heading: contactContent.heading,
        description: contactContent.description,
        phone: contactContent.phone,
        email: contactContent.email,
        facebook: contactContent.facebook,
        twitter: contactContent.twitter,
        instagram: contactContent.instagram,
        discord: contactContent.discord,
        telegram: contactContent.telegram,
        tiktok: contactContent.tiktok,
      });
    }
  }, [contactContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateContent(formData);
      toast.success("Contact page content updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (submissionId: Id<"contactSubmissions">, status: "new" | "read" | "archived") => {
    try {
      await updateStatus({ submissionId, status });
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (submissionId: Id<"contactSubmissions">) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    
    try {
      await deleteSubmission({ submissionId });
      toast.success("Submission deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete submission");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const newSubmissionsCount = submissions?.filter(s => s.status === "new").length || 0;

  return (
    <AdminLayout 
      currentPage="contactus" 
      pageTitle="Contact Us Management"
      titleActions={
        <a href="/contactus" target="_blank" className="main__title-link">
          <i className="ti ti-eye"></i> Preview Page
        </a>
      }
    >
      {/* Tabs */}
      <div className="row">
        <div className="col-12">
          <ul className="nav nav-tabs main__tabs" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "content" ? "active" : ""}`}
                onClick={() => setActiveTab("content")}
              >
                <i className="ti ti-edit"></i> Edit Content
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "submissions" ? "active" : ""}`}
                onClick={() => setActiveTab("submissions")}
              >
                <i className="ti ti-mail"></i> Submissions
                {newSubmissionsCount > 0 && (
                  <span className="badge bg-danger ms-2">{newSubmissionsCount}</span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="row">
          <div className="col-12 col-lg-8">
            <div className="sign__wrap">
              <div className="row">
                <div className="col-12">
                  <h4 className="sign__title">Contact Page Content</h4>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label">Heading</label>
                    <input
                      type="text"
                      className="sign__input"
                      value={formData.heading}
                      onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="sign__group">
                    <label className="sign__label">Description</label>
                    <textarea
                      className="sign__textarea"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Phone</label>
                    <input
                      type="text"
                      className="sign__input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Email</label>
                    <input
                      type="email"
                      className="sign__input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <h5 className="sign__subtitle">Social Media Links</h5>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Facebook</label>
                    <input
                      type="text"
                      className="sign__input"
                      placeholder="https://facebook.com/..."
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Twitter/X</label>
                    <input
                      type="text"
                      className="sign__input"
                      placeholder="https://twitter.com/..."
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Instagram</label>
                    <input
                      type="text"
                      className="sign__input"
                      placeholder="https://instagram.com/..."
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Discord</label>
                    <input
                      type="text"
                      className="sign__input"
                      placeholder="https://discord.gg/..."
                      value={formData.discord}
                      onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">Telegram</label>
                    <input
                      type="text"
                      className="sign__input"
                      placeholder="https://t.me/..."
                      value={formData.telegram}
                      onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="sign__group">
                    <label className="sign__label">TikTok</label>
                    <input
                      type="text"
                      className="sign__input"
                      placeholder="https://tiktok.com/@..."
                      value={formData.tiktok}
                      onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <button
                    type="button"
                    className="sign__btn"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
        <div className="row">
          <div className="col-12">
            <div className="main__table-wrap">
              <table className="main__table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions?.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                        No submissions yet
                      </td>
                    </tr>
                  ) : (
                    submissions?.map((submission) => (
                      <tr key={submission._id}>
                        <td>
                          <div className="main__table-text">{formatDate(submission.createdAt)}</div>
                        </td>
                        <td>
                          <div className="main__table-text">{submission.name}</div>
                        </td>
                        <td>
                          <div className="main__table-text">{submission.email}</div>
                        </td>
                        <td>
                          <div className="main__table-text">{submission.subject}</div>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={submission.status}
                            onChange={(e) => handleStatusChange(submission._id, e.target.value as any)}
                            style={{
                              background: submission.status === "new" ? "#ff1493" : 
                                         submission.status === "read" ? "#28a745" : "#6c757d",
                              color: "#fff",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px"
                            }}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td>
                          <div className="main__table-btns">
                            <button
                              className="main__table-btn main__table-btn--view"
                              title="View Message"
                              onClick={() => {
                                alert(`From: ${submission.name}\nEmail: ${submission.email}\nSubject: ${submission.subject}\n\nMessage:\n${submission.message}`);
                                if (submission.status === "new") {
                                  handleStatusChange(submission._id, "read");
                                }
                              }}
                            >
                              <i className="ti ti-eye"></i>
                            </button>
                            <button
                              className="main__table-btn main__table-btn--delete"
                              title="Delete"
                              onClick={() => handleDelete(submission._id)}
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
