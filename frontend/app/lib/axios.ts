import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const defaultApiHost = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NODE_ENV === "production"
  ? "https://ecommerce-production-a23b.up.railway.app"
  : "http://localhost:3000";

const clientBase = `${defaultApiHost}/api`;

const api = axios.create({
  baseURL: clientBase,
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
