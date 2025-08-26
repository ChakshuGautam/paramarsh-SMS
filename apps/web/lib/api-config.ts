// Centralized API configuration
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:3005/api/v1";
};

// Helper to get full API URL for a path
export const getApiUrl = (path: string) => {
  const baseUrl = getBackendUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
};