export function getApiBase() {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl && configuredUrl.trim()) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');

    if (isLocalhost) {
      return 'http://localhost:5000';
    }

    // In production, use the same origin as the frontend
    if (window.location.origin) {
      return window.location.origin;
    }
  }

  return 'http://localhost:5000';
}

export const API_BASE = getApiBase();
export const API_URL = `${API_BASE}/api`;
