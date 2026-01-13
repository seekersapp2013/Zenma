import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function GeneralSettings() {
  const [title, setTitle] = useState("");
  const [favicon, setFavicon] = useState("");
  const [colorScheme, setColorScheme] = useState("default");
  const [newBannedWord, setNewBannedWord] = useState("");
  
  const appSettings = useQuery(api.settings?.getAppSettings);
  const bannedWords = useQuery(api.settings?.getBannedWordsWithDetails);
  
  const updateAppSetting = useMutation(api.settings?.updateAppSetting);
  const addBannedWord = useMutation(api.settings?.addBannedWord);
  const removeBannedWord = useMutation(api.settings?.removeBannedWord);

  // Initialize form with current settings
  useEffect(() => {
    if (appSettings) {
      setTitle(appSettings.title || "");
      setFavicon(appSettings.favicon || "");
      setColorScheme(appSettings.colorScheme || "default");
    }
  }, [appSettings]);

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await updateAppSetting({ key, value });
      toast.success(`${key} updated successfully`);
      
      // Apply changes immediately for title and favicon
      if (key === "title") {
        document.title = value;
      } else if (key === "favicon") {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (link) {
          link.href = value;
        }
      }
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      toast.error(`Failed to update ${key}`);
    }
  };

  const handleAddBannedWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannedWord.trim()) {
      toast.error("Please enter a word");
      return;
    }

    try {
      await addBannedWord({ word: newBannedWord.trim() });
      setNewBannedWord("");
      toast.success("Banned word added successfully");
    } catch (error) {
      console.error("Error adding banned word:", error);
      toast.error("Failed to add banned word");
    }
  };

  const handleRemoveBannedWord = async (word: string) => {
    if (!confirm(`Are you sure you want to remove "${word}" from the banned words list?`)) {
      return;
    }

    try {
      await removeBannedWord({ word });
      toast.success("Banned word removed successfully");
    } catch (error) {
      console.error("Error removing banned word:", error);
      toast.error("Failed to remove banned word");
    }
  };

  if (appSettings === undefined || bannedWords === undefined) {
    return (
      <div className="d-flex align-items-center justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* App Settings */}
      <div className="col-12 col-lg-6">
        <div className="catalog catalog--1">
          <div className="catalog__title-wrap">
            <h3 className="catalog__title">App Configuration</h3>
            <p className="catalog__text">Basic app settings and branding</p>
          </div>
          
          <div className="p-4">
            {/* App Title */}
            <div className="sign__group">
              <label className="sign__label">App Title</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="sign__input flex-fill"
                  placeholder="Enter app title"
                />
                <button
                  onClick={() => handleUpdateSetting("title", title)}
                  className="btn btn-primary"
                >
                  Update
                </button>
              </div>
              <small className="form-text text-muted">This will appear in the browser tab</small>
            </div>

            {/* Favicon */}
            <div className="sign__group">
              <label className="sign__label">Favicon URL</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  className="sign__input flex-fill"
                  placeholder="/logo.svg"
                />
                <button
                  onClick={() => handleUpdateSetting("favicon", favicon)}
                  className="btn btn-primary"
                >
                  Update
                </button>
              </div>
              <small className="form-text text-muted">Path to favicon file (e.g., /logo.svg)</small>
            </div>

            {/* Color Scheme */}
            <div className="sign__group">
              <label className="sign__label">Color Scheme</label>
              <div className="d-flex gap-2">
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  className="sign__input flex-fill"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                </select>
                <button
                  onClick={() => handleUpdateSetting("colorScheme", colorScheme)}
                  className="btn btn-primary"
                >
                  Update
                </button>
              </div>
              <small className="form-text text-muted">Choose the app's color theme</small>
            </div>
          </div>
        </div>
      </div>

      {/* Banned Words Management */}
      <div className="col-12 col-lg-6">
        <div className="catalog catalog--1">
          <div className="catalog__title-wrap">
            <h3 className="catalog__title">Content Moderation</h3>
            <p className="catalog__text">Manage banned words for comments and reviews</p>
          </div>
          
          <div className="p-4">
            {/* Add Banned Word Form */}
            <form onSubmit={handleAddBannedWord} className="mb-4">
              <div className="sign__group">
                <label className="sign__label">Add Banned Word</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    value={newBannedWord}
                    onChange={(e) => setNewBannedWord(e.target.value)}
                    className="sign__input flex-fill"
                    placeholder="Enter word to ban"
                  />
                  <button
                    type="submit"
                    className="btn btn-danger"
                  >
                    Add
                  </button>
                </div>
                <small className="form-text text-muted">Words will be automatically replaced with asterisks</small>
              </div>
            </form>

            {/* Banned Words List */}
            <div>
              <h4 className="text-white mb-3" style={{ fontSize: '1rem' }}>
                Current Banned Words ({bannedWords?.length || 0})
              </h4>
              
              {bannedWords && bannedWords.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="catalog__table-wrap">
                  <table className="catalog__table">
                    <tbody>
                      {bannedWords.map((wordData) => (
                        <tr key={wordData._id}>
                          <td>
                            <div className="catalog__text">
                              <strong>{wordData.word}</strong>
                              <br />
                              <small className="text-muted">
                                Added by {wordData.creatorUsername} • {new Date(wordData.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div className="catalog__btns">
                              <button
                                onClick={() => handleRemoveBannedWord(wordData.word)}
                                className="catalog__btn catalog__btn--delete"
                                title="Remove word"
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
              ) : (
                <div className="text-center py-4">
                  <i className="ti ti-shield-check" style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}></i>
                  <p className="text-muted">No banned words configured</p>
                  <small className="text-muted">Add words above to start content moderation</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="col-12 mt-4">
        <div className="catalog catalog--1">
          <div className="catalog__title-wrap">
            <h3 className="catalog__title">Current Settings Preview</h3>
          </div>
          <div className="p-4">
            <div className="row">
              <div className="col-12 col-md-4">
                <div className="catalog__text">
                  <strong>App Title:</strong>
                  <p className="text-muted mt-1">{appSettings.title}</p>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="catalog__text">
                  <strong>Favicon:</strong>
                  <p className="text-muted mt-1">{appSettings.favicon}</p>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="catalog__text">
                  <strong>Color Scheme:</strong>
                  <p className="text-muted mt-1" style={{ textTransform: 'capitalize' }}>{appSettings.colorScheme}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}