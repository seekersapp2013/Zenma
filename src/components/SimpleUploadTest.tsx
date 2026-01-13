import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function SimpleUploadTest() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setResult("");
    setIsUploading(true);
    setUploadProgress(0);

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`Testing upload: ${file.name} (${fileSizeMB}MB)`);

    try {
      // Step 1: Get upload URL
      console.log("Step 1: Getting upload URL...");
      const uploadUrl = await generateUploadUrl();
      console.log("Step 1: Upload URL received");

      // Step 2: Upload file
      console.log("Step 2: Starting file upload...");
      const uploadResult = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        let lastProgress = 0;
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            console.log(`Progress: ${progress}% (${e.loaded}/${e.total} bytes)`);
            
            // Check for progress going backwards (retry indicator)
            if (progress < lastProgress) {
              console.warn(`Progress went backwards: ${lastProgress}% -> ${progress}%`);
            }
            lastProgress = progress;
            
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          console.log(`Upload completed with status: ${xhr.status}`);
          console.log(`Response: ${xhr.responseText}`);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }));
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', (e) => {
          console.error('Network error:', e);
          reject(new Error('Network error'));
        });

        xhr.addEventListener('timeout', () => {
          console.error('Upload timeout');
          reject(new Error('Upload timeout'));
        });

        xhr.open('POST', uploadUrl);
        xhr.timeout = 0; // No timeout limit
        
        console.log(`Sending file: ${file.name} (${file.size} bytes) - no timeout limit`);
        xhr.send(file);
      });

      // Step 3: Parse response
      console.log("Step 3: Parsing response...");
      const responseData = await uploadResult.json();
      console.log("Response data:", responseData);

      if (responseData.storageId) {
        setResult(`Success! Storage ID: ${responseData.storageId}`);
        console.log("Upload successful!");
      } else {
        throw new Error("No storageId in response");
      }

    } catch (error) {
      console.error("Upload failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setError(`Upload failed: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Upload Test</h3>
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="mb-4"
        accept="image/*,video/*"
      />
      
      {isUploading && (
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}
      
      {result && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-green-800">
          {result}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-800">
          {error}
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Check browser console for detailed logs
      </p>
    </div>
  );
}