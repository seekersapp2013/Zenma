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
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">General Settings</h1>
        <p className="text-gray-600">Configure app-wide settings and content moderation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Settings */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">App Configuration</h3>
            <p className="text-sm text-gray-600 mt-1">Basic app settings and branding</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* App Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                App Title
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter app title"
                />
                <button
                  onClick={() => handleUpdateSetting("title", title)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">This will appear in the browser tab</p>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/logo.svg"
                />
                <button
                  onClick={() => handleUpdateSetting("favicon", favicon)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Path to favicon file (e.g., /logo.svg)</p>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Scheme
              </label>
              <div className="flex gap-2">
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Choose the app's color theme</p>
            </div>
          </div>
        </div>

        {/* Banned Words Management */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Content Moderation</h3>
            <p className="text-sm text-gray-600 mt-1">Manage banned words for comments and reviews</p>
          </div>
          
          <div className="p-6">
            {/* Add Banned Word Form */}
            <form onSubmit={handleAddBannedWord} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Banned Word
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBannedWord}
                  onChange={(e) => setNewBannedWord(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter word to ban"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Words will be automatically replaced with asterisks</p>
            </form>

            {/* Banned Words List */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Current Banned Words ({bannedWords?.length || 0})
              </h4>
              
              {bannedWords && bannedWords.length > 0 ? (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                  <div className="divide-y divide-gray-200">
                    {bannedWords.map((wordData) => (
                      <div key={wordData._id} className="p-3 flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {wordData.word}
                          </p>
                          <p className="text-xs text-gray-500">
                            Added by {wordData.creatorUsername} • {new Date(wordData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveBannedWord(wordData.word)}
                          className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-md">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No banned words configured</p>
                  <p className="text-xs mt-1">Add words above to start content moderation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Settings Preview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">App Title:</span>
              <p className="text-gray-600 mt-1">{appSettings.title}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Favicon:</span>
              <p className="text-gray-600 mt-1">{appSettings.favicon}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Color Scheme:</span>
              <p className="text-gray-600 mt-1 capitalize">{appSettings.colorScheme}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}