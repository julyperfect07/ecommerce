import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// Create custom axios instance
const api = axios.create({
  baseURL: "http://localhost:3000", // Backend URL
  withCredentials: true, // Send cookies automatically
});

// Response interceptor
api.interceptors.response.use(
  // If request succeeds
  (response: AxiosResponse) => {
    return response;
  },

  // If request fails
  async (error: AxiosError) => {
    // Get failed request
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry: boolean;
    };

    // If token expired and request not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try refreshing token
        await api.post("/auth/refresh");

        // Retry original request
        return api(originalRequest);
      } catch {
        // If refresh fails redirect to login
        window.location.href = "/login";
      }
    }

    // Return error normally
    return Promise.reject(error);
  },
);

// Export axios instance
export default api;
