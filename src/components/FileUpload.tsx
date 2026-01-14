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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
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
      } else if (fileType === 'video') {
        setUploadedFileName(file.name);
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
    <div className={className} style={{ marginBottom: '8px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fileType === 'image' ? (
          // Image preview
          previewUrl ? (
            <div style={{ position: 'relative', width: '100%', maxWidth: '200px' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ 
                  width: '100%', 
                  height: '120px', 
                  objectFit: 'cover', 
                  borderRadius: '8px', 
                  border: '2px solid rgba(255, 255, 255, 0.1)' 
                }}
              />
              {isUploading && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(0, 0, 0, 0.7)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '8px' 
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      border: '3px solid rgba(255, 255, 255, 0.3)', 
                      borderTop: '3px solid #fff', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 8px'
                    }}></div>
                    <div style={{ color: '#fff', fontSize: '12px' }}>{uploadProgress}%</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              maxWidth: '200px',
              height: '120px', 
              border: '2px dashed rgba(255, 255, 255, 0.2)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(22, 21, 27, 0.5)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <svg style={{ width: '32px', height: '32px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 auto 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                </svg>
                <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>No image</p>
              </div>
            </div>
          )
        ) : (
          // Video upload indicator
          <div style={{ 
            width: '100%', 
            border: '2px dashed rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '16px',
            background: 'rgba(22, 21, 27, 0.5)'
          }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              {isUploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    border: '3px solid rgba(255, 20, 147, 0.3)', 
                    borderTop: '3px solid #ff1493', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>{uploadProgress}%</p>
                </div>
              ) : uploadedFileName ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p style={{ fontSize: '12px', color: '#fff', margin: 0, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFileName}</p>
                </div>
              ) : (
                <>
                  <svg style={{ width: '32px', height: '32px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 auto 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                  </svg>
                  <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>No video</p>
                </>
              )}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="sign__btn"
            style={{ 
              width: 'auto', 
              padding: '0 16px', 
              height: '40px',
              marginTop: 0,
              fontSize: '12px'
            }}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : `Upload ${fileType === 'image' ? 'Image' : 'Video'}`}
          </button>
          
          {isUploading && (
            <button
              type="button"
              onClick={handleCancel}
              className="sign__btn"
              style={{ 
                width: 'auto', 
                padding: '0 16px', 
                height: '40px',
                marginTop: 0,
                fontSize: '12px',
                background: 'linear-gradient(135deg, #dc2626, #991b1b)'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div style={{ 
          color: '#ef4444', 
          fontSize: '12px', 
          textAlign: 'center', 
          background: 'rgba(239, 68, 68, 0.1)', 
          padding: '8px', 
          borderRadius: '6px',
          marginTop: '8px'
        }}>
          {error}
        </div>
      )}
      
      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', margin: '4px 0 0 0' }}>
        {fileType === 'image' 
          ? `Supported: JPG, PNG, GIF (no size limit)`
          : `Supported: MP4, WebM, MOV (no size limit)`
        }
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}