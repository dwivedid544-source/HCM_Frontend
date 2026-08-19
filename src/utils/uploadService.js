// ============================================================
// Upload Service — Frontend cloud file upload utility
// ============================================================
// Provides helper functions to upload files to the backend's
// /api/upload endpoints (which route to Cloudinary/ImageKit).
// Returns cloud URLs for storage in form payloads.
// ============================================================

import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

// Create a separate axios instance for file uploads (multipart/form-data)
const UploadAPI = axios.create({
  baseURL: getBaseURL(),
});

// Attach auth token
UploadAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('hcm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Upload an image file (avatar, logo) → Cloudinary ──
// Accepts a File object from <input type="file">
// Returns: { url, publicId, provider }
export async function uploadImageFile(file, folder = 'hcm/images') {
  const formData = new FormData();
  formData.append('file', file);

  const response = await UploadAPI.post(`/upload/image?folder=${encodeURIComponent(folder)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data?.data;
}

// ── Upload a document file (resume, PDF, proof) → ImageKit ──
// Accepts a File object from <input type="file">
// Returns: { url, fileId, provider }
export async function uploadDocumentFile(file, folder = 'hcm/documents') {
  const formData = new FormData();
  formData.append('file', file);

  const response = await UploadAPI.post(`/upload/document?folder=${encodeURIComponent(folder)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data?.data;
}

// ── Smart upload — auto-detect image vs document ──
// Uses file MIME type to determine which endpoint to use
export async function uploadFile(file, folder = 'hcm/uploads') {
  if (file.type && file.type.startsWith('image/')) {
    return uploadImageFile(file, folder);
  }
  return uploadDocumentFile(file, folder);
}

// ── Convert a File to base64 data URL (for backward compatibility) ──
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Upload from base64 data URL ──
// Converts base64 back to a File, then uploads via the API.
// This is useful when the UI already has a base64 preview.
export async function uploadBase64Image(base64DataUrl, fileName = 'image.png', folder = 'hcm/images') {
  const response = await fetch(base64DataUrl);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: blob.type });
  return uploadImageFile(file, folder);
}

export async function uploadBase64Document(base64DataUrl, fileName = 'document.pdf', folder = 'hcm/documents') {
  const response = await fetch(base64DataUrl);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: blob.type });
  return uploadDocumentFile(file, folder);
}

// ── Check if a string is a base64 data URL ──
export function isBase64DataUrl(str) {
  return typeof str === 'string' && str.startsWith('data:') && str.includes(';base64,');
}

// ── Check if a string is a valid URL (not base64) ──
export function isCloudUrl(str) {
  return typeof str === 'string' && (str.startsWith('http://') || str.startsWith('https://'));
}
