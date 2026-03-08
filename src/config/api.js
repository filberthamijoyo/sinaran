// Copied from root src/config/api.js so frontend app in apps/frontend uses same API configuration

const getApiUrl = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost';
  const port = process.env.REACT_APP_API_PORT || '3001';
  return `${baseUrl}:${port}/api`;
};

const apiBase = getApiUrl();

export const API_ENDPOINTS = {
  quality: `${apiBase}/quality`,
  production: `${apiBase}/production`
};

// Helper function for making API calls
export const apiCall = async (url, options = {}) => {
  const { body, headers = {}, ...fetchOptions } = options;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...fetchOptions
  };

  // Stringify body if it's an object
  if (body && typeof body === 'object') {
    defaultOptions.body = JSON.stringify(body);
  } else if (body) {
    defaultOptions.body = body;
  }

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default API_ENDPOINTS;

