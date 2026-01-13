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
  maxSize?: number; // in MB, defaults to Infinity (no limit)
}

export function FileUpload({ 
  onUploadComplete, 
  currentImageUrl, 
  className = "",
  accept = "image/*",
  fileType = 'image',
  maxSize = Infinity // No file size limit
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Display file size for user reference
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`Selected file: ${file.name} (${fileSizeMB}MB)`);

    // Validate file type only
    const expectedType = fileType === 'image' ? 'image/' : 'video/';
    if (!file.type.startsWith(expectedType)) {
      setError(`Please select a ${fileType} file`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Create preview (only for images under 10MB to avoid memory issues)
      if (fileType === 'image' && file.size < 10 * 1024 * 1024) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      }

      console.log('Getting upload URL...');
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();
      console.log('Upload URL received, starting upload...');

      // Upload file with no timeout restrictions
      const result = await uploadFile(file, uploadUrl, abortControllerRef.current.signal, (progress) => {
        setUploadProgress(progress);
      });

      if (!result.ok) {
        const errorText = await result.text();
        console.error('Upload response error:', result.status, result.statusText, errorText);
        throw new Error(`Upload failed: ${result.status} ${result.statusText}`);
      }

      const responseData = await result.json();
      console.log('Upload response:', responseData);
      
      if (!responseData.storageId) {
        throw new Error('Invalid response: missing storageId');
      }

      console.log('Upload successful, storageId:', responseData.storageId);
      onUploadComplete(responseData.storageId);

      // Clean up object URL (only for images)
      if (fileType === 'image' && previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      if (error instanceof Error && error.name === 'AbortError') {
        setError("Upload cancelled");
      } else {
        const errorMessage = error instanceof Error ? error.message : "Upload failed. Please try again.";
        setError(errorMessage);
      }
      
      if (fileType === 'image') {
        setPreviewUrl(currentImageUrl || null);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
    }
  };

  const uploadFile = async (
    file: File, 
    uploadUrl: string, 
    signal: AbortSignal,
    onProgress: (progress: number) => void
  ): Promise<Response> => {
    return new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Handle abort signal
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          console.log(`Upload progress: ${progress}% (${e.loaded}/${e.total} bytes)`);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        console.log('Upload completed with status:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new Response(xhr.responseText, { status: xhr.status }));
        } else {
          console.error('Upload failed with status:', xhr.status, xhr.statusText, xhr.responseText);
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', (e) => {
        console.error('Upload network error:', e);
        reject(new Error('Upload failed: Network error'));
      });

      xhr.addEventListener('timeout', () => {
        console.error('Upload timeout');
        reject(new Error('Upload failed: Request timeout'));
      });

      xhr.addEventListener('abort', () => {
        console.log('Upload aborted');
        reject(new Error('Upload cancelled'));
      });

      // Configure request
      xhr.open('POST', uploadUrl);
      
      // No timeout - let it run as long as needed
      xhr.timeout = 0;
      
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`Starting upload: ${file.name} (${fileSizeMB}MB), no timeout limit`);
      
      // Send file
      xhr.send(file);
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
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
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <div className="text-white text-xs">{uploadProgress}%</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500">No video</p>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : `Upload ${fileType === 'image' ? 'Image' : 'Video'}`}
          </button>
          
          {isUploading && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        {fileType === 'image' 
          ? `Supported formats: JPG, PNG, GIF (no size limit)`
          : `Supported formats: MP4, WebM, MOV (no size limit)`
        }
      </p>
    </div>
  );
}