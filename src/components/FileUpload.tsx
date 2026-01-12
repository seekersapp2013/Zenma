import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface FileUploadProps {
  onUploadComplete: (storageId: Id<"_storage">) => void;
  currentImageUrl?: string;
  className?: string;
  accept?: string;
  fileType?: 'image' | 'video';
  maxSize?: number; // in MB
}

export function FileUpload({ 
  onUploadComplete, 
  currentImageUrl, 
  className = "",
  accept = "image/*",
  fileType = 'image',
  maxSize = fileType === 'video' ? 200 : 20 // Default: 200MB for videos, 20MB for images
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Display file size for user reference
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`Selected file: ${file.name} (${fileSizeMB}MB)`);

    // Validate file type
    const expectedType = fileType === 'image' ? 'image/' : 'video/';
    if (!file.type.startsWith(expectedType)) {
      alert(`Please select a ${fileType} file`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview (only for images)
      if (fileType === 'image') {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      }

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload file with progress tracking
      const result = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed: Network error'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload failed: Timeout'));
        });

        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.timeout = fileType === 'video' ? 300000 : 60000; // 5 minutes for video, 1 minute for images
        xhr.send(file);
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const { storageId } = await result.json();
      onUploadComplete(storageId);

      // Clean up object URL (only for images)
      if (fileType === 'image' && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed. Please try again.";
      alert(errorMessage);
      if (fileType === 'image') {
        setPreviewUrl(currentImageUrl || null);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex flex-col items-center space-y-4">
        {fileType === 'image' ? (
          // Image preview
          previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-500">No image</p>
              </div>
            </div>
          )
        ) : (
          // Video upload indicator
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              {isUploading ? (
                <div className="space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-xs text-gray-500">{uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500">No video</p>
                </>
              )}
            </div>
          </div>
        )}
        
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? `Uploading... ${uploadProgress}%` : `Upload ${fileType === 'image' ? 'Image' : 'Video'}`}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        {fileType === 'image' 
          ? `Supported formats: JPG, PNG, GIF`
          : `Supported formats: MP4, WebM, MOV`
        }
      </p>
    </div>
  );
}