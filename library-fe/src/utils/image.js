export const API_BASE = 'http://localhost:5237';

export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('https')) return url;
  if (url.startsWith('data:image')) return url; // Handle base64
  return `${API_BASE}${url}`;
};
