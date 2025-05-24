import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api', // Default if not set in .env
});

// Function to set the auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token); // Also save token to localStorage
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Request interceptor to add token if available (alternative to setting default header manually everywhere)
// This is more robust if the token might be set/cleared from multiple places or at different times.
// However, for this project, setting default headers in AuthContext might be simpler.
// We'll stick to setting default headers in AuthContext for now as per instructions.

// Example of how to get user from localStorage to initialize state (will be in AuthContext)
// const initialToken = localStorage.getItem('token');
// if (initialToken) {
//   setAuthToken(initialToken); 
//   // Ideally, also fetch user profile here to validate token and get fresh user data
// }

export default api;
