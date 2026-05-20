import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
