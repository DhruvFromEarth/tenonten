import axios from "axios";

const backend_url='http://localhost:8083/api';

const instance = axios.create({
  baseURL: backend_url,
  withCredentials: true, // This is important for cookies
});

// Add a request interceptor to add the token to all requests
instance.interceptors.request.use(
  (config) => {
    // Get token from cookie (it's httpOnly, so we don't need to manually add it)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Instead of redirecting, we'll let the component handle the auth modal
      console.error('Authentication required');
    }
    return Promise.reject(error);
  }
);

export default instance;