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
  maxSize = Infinity, // No size limit
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
    <div className={className} style={{ marginBottom: '8px' }}>
      {label && (
        <label className="sign__label" style={{ marginBottom: '8px' }}>
          {label}
        </label>
      )}
      
      {/* Method Selection */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            value="upload"
            checked={uploadMethod === 'upload'}
            onChange={(e) => setUploadMethod(e.target.value as 'upload' | 'url')}
            style={{ marginRight: '6px' }}
          />
          <span style={{ fontSize: '13px', color: '#fff' }}>Upload File</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            value="url"
            checked={uploadMethod === 'url'}
            onChange={(e) => setUploadMethod(e.target.value as 'upload' | 'url')}
            style={{ marginRight: '6px' }}
          />
          <span style={{ fontSize: '13px', color: '#fff' }}>Use URL</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={handleUrlKeyPress}
              placeholder={`Enter ${fileType} URL`}
              className="sign__input"
              style={{ flex: 1, height: '40px', fontSize: '13px' }}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="sign__btn"
              style={{ 
                width: 'auto', 
                padding: '0 16px', 
                height: '40px',
                marginTop: 0,
                fontSize: '12px'
              }}
            >
              {urlAdded ? "✓ Added" : "Add URL"}
            </button>
          </div>
          {urlAdded && (
            <p style={{ fontSize: '11px', color: '#4ade80', margin: 0 }}>
              ✓ URL added successfully!
            </p>
          )}
        </div>
      )}
    </div>
  );
}