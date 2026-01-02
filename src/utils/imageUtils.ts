import heic2any from "heic2any";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Converts HEIC files to JPEG
 */
export const convertHeicToJpg = async (file: File): Promise<Blob> => {
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  
  return Array.isArray(result) ? result[0] : result;
};

/**
 * Checks if file is HEIC format
 */
export const isHeicFile = (file: File): boolean => {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  );
};

/**
 * Crops an image and converts to JPG
 */
export const cropAndConvertToJpg = (
  imageSrc: string,
  crop: CropArea,
  outputWidth: number,
  outputHeight: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      
      // Fill with white background (for transparency)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      
      // Draw cropped area
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        outputWidth,
        outputHeight
      );
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.85
      );
    };
    
    image.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    
    image.src = imageSrc;
  });
};

/**
 * Converts any image to JPG without cropping
 */
export const convertToJpg = (imageSrc: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      
      // Fill with white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(image, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.85
      );
    };
    
    image.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    
    image.src = imageSrc;
  });
};

/**
 * Parse aspect ratio from recommended size string
 * e.g. "1920 x 1080 px (16:9)" => { width: 16, height: 9 }
 */
export const parseAspectRatio = (
  recommendedSize: string
): { width: number; height: number } => {
  const match = recommendedSize.match(/\((\d+):(\d+)/);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }
  // Default to 16:9
  return { width: 16, height: 9 };
};

/**
 * Parse output dimensions from recommended size string
 * e.g. "1920 x 1080 px (16:9)" => { width: 1920, height: 1080 }
 */
export const parseOutputDimensions = (
  recommendedSize: string
): { width: number; height: number } => {
  const match = recommendedSize.match(/(\d+)\s*x\s*(\d+)\s*px/i);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }
  // Default dimensions
  return { width: 800, height: 600 };
};

/**
 * Load file as data URL
 */
export const loadFileAsDataUrl = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
