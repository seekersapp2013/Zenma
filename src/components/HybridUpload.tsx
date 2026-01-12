import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { Id } from "../../convex/_generated/dataModel";

interface HybridUploadProps {
  onUploadComplete?: (storageId: Id<"_storage">) => void;
  onUrlComplete?: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
  accept?: string;
  fileType?: 'image' | 'video';
  maxSize?: number;
  label?: string;
}

export function HybridUpload({
  onUploadComplete,
  onUrlComplete,
  currentImageUrl,
  className = "",
  accept = "image/*",
  fileType = 'image',
  maxSize = 200, // Increased default size limit
  label = "Media"
}: HybridUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState("");
  const [urlAdded, setUrlAdded] = useState(false);

  const handleUrlSubmit = () => {
    if (urlInput.trim() && onUrlComplete) {
      onUrlComplete(urlInput.trim());
      setUrlInput("");
      setUrlAdded(true);
      // Reset the feedback after 2 seconds
      setTimeout(() => setUrlAdded(false), 2000);
    }
  };

  const handleUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlSubmit();
    }
  };

  const handleFileUpload = (storageId: Id<"_storage">) => {
    if (onUploadComplete) {
      onUploadComplete(storageId);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        
        {/* Method Selection */}
        <div className="flex space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="upload"
              checked={uploadMethod === 'upload'}
              onChange={(e) => setUploadMethod(e.target.value as 'upload' | 'url')}
              className="mr-2"
            />
            <span className="text-sm">Upload File</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="url"
              checked={uploadMethod === 'url'}
              onChange={(e) => setUploadMethod(e.target.value as 'upload' | 'url')}
              className="mr-2"
            />
            <span className="text-sm">Use URL</span>
          </label>
        </div>

        {/* Upload Method */}
        {uploadMethod === 'upload' ? (
          <FileUpload
            onUploadComplete={handleFileUpload}
            currentImageUrl={currentImageUrl}
            accept={accept}
            fileType={fileType}
            maxSize={maxSize}
          />
        ) : (
          /* URL Method */
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={handleUrlKeyPress}
                placeholder={`Enter ${fileType} URL`}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {urlAdded ? "✓ Added" : "Add URL"}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Enter a direct URL to the {fileType} file
            </p>
            {urlAdded && (
              <p className="text-xs text-green-600">
                ✓ URL added successfully!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}