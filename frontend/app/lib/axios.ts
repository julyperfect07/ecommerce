import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: "/api",
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

      if (originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          const protectedRoutes = ["/orders", "/profile", "/admin", "/cart"];
          const isProtected = protectedRoutes.some((route) =>
            window.location.pathname.startsWith(route),
          );
          if (isProtected) {
            window.location.href = "/login";
          }
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
