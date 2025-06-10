
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "djgoyuzks",
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "wireframe_to_code",
  apiKey: "844348228843748", // Added API key
  apiSecret: "yhqY6AXKBh24t15wdApQ9ZdN59s", // Added API secret
  folder: "wireframes",
  maxFileSize: 20 * 1024 * 1024, // 20 MB limit
  acceptedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
};

export const validateImage = (file: File): { valid: boolean; message?: string } => {
  // Check file size
  if (file.size > cloudinaryConfig.maxFileSize) {
    return {
      valid: false,
      message: "Image size must be less than 20MB"
    };
  }

  // Check file format
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!cloudinaryConfig.acceptedFormats.includes(fileExtension)) {
    return {
      valid: false,
      message: `Unsupported file format. Please use: ${cloudinaryConfig.acceptedFormats.join(', ')}`
    };
  }

  return { valid: true };
};

// Helper function to make Cloudinary uploads more robust
export const uploadToCloudinary = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload");
  }
  
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', cloudinaryConfig.uploadPreset);
  data.append('cloud_name', cloudinaryConfig.cloudName);
  data.append('api_key', cloudinaryConfig.apiKey); // Include API key
  data.append('folder', cloudinaryConfig.folder);
  
  try {
    console.log("Uploading image to Cloudinary...", {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type
    });
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, 
      {
        method: 'POST',
        body: data,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary error response:", errorData);
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
    }
    
    const imageData = await response.json();
    console.log("Image uploaded successfully:", imageData.secure_url);
    return imageData.secure_url;
  } catch (error) {
    console.error("Failed to upload image to Cloudinary:", error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
