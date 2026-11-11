import { apiClient } from '@/api/client';

/**
 * Converts any user-selected image file (PNG, JPG, BMP, HEIC, etc.)
 * directly into a clean, optimized WebP Blob in the browser with a random name.
 */
export async function convertImageToWebP(file: File, maxDim = 512): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate center square crop
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        const targetDim = Math.min(minDim, maxDim);
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context not available'));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped center square
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetDim, targetDim);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Gagal mengonversi gambar ke WebP'));
            }
            // Generate purely random filename
            const randomString = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
            const webpFile = new File([blob], `${randomString}.webp`, { type: 'image/webp' });
            resolve(webpFile);
          },
          'image/webp',
          0.88
        );
      };
      img.onerror = () => reject(new Error('Gagal membaca gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an avatar image file (automatically converted to WebP) to the backend.
 * Returns the FE static URL path: /uploads/avatars/<random>.webp
 */
export async function uploadAvatarImage(file: File): Promise<string> {
  const webpFile = await convertImageToWebP(file);
  const formData = new FormData();
  formData.append('avatar', webpFile);

  const res = await apiClient.post<{ message: string; url: string }>('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.url;
}
