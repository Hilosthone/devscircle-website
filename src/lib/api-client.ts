import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://devscircle-api.onrender.com/v1";

export interface NormalizedApiError {
  status: number;
  code: string;
  message: string;
  details?: string[];
}

/**
 * Extracts a clean, user-friendly error object from any NestJS / Axios failure
 */
export function extractApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const data = error.response?.data as any;

    // 1. Custom NestJS structured error: { error: { code, message } }
    if (data?.error?.message) {
      return {
        status,
        code: data.error.code || "API_ERROR",
        message: data.error.message,
      };
    }

    // 2. NestJS ValidationPipe array: { message: ["..."], statusCode: 400 }
    if (Array.isArray(data?.message)) {
      return {
        status,
        code: "VALIDATION_ERROR",
        message: data.message[0] || "Please check your input fields.",
        details: data.message,
      };
    }

    // 3. Standard HTTPException: { message: "...", statusCode: 403 }
    if (typeof data?.message === "string") {
      return {
        status,
        code: data.code || `HTTP_${status}`,
        message: data.message,
      };
    }

    // 4. Network / Timeout / Cold-start errors
    if (error.code === "ECONNABORTED") {
      return {
        status: 408,
        code: "TIMEOUT",
        message: "Server took too long to respond. Please try again.",
      };
    }

    if (!error.response) {
      return {
        status: 0,
        code: "NETWORK_ERROR",
        message: "Network unreachable. Check your internet connection.",
      };
    }
  }

  return {
    status: 500,
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : "An unexpected error occurred.",
  };
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30s to accommodate Render cold starts
});

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || localStorage.getItem("dc_access_token");
};

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken") || localStorage.getItem("dc_refresh_token");
};

const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("dc_access_token");
  localStorage.removeItem("dc_refresh_token");
  localStorage.removeItem("dc_user");
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Queue state for concurrent 401 requests during token rotation
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    // Handle 401 Unauthorized with single-flight token rotation
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      typeof window !== "undefined"
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        clearAuthStorage();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?sessionExpired=true";
        }
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const payload = res.data?.data ?? res.data;

        localStorage.setItem("accessToken", payload.accessToken);
        localStorage.setItem("refreshToken", payload.refreshToken);
        localStorage.setItem("dc_access_token", payload.accessToken);
        localStorage.setItem("dc_refresh_token", payload.refreshToken);

        processQueue(null, payload.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthStorage();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?sessionExpired=true";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Dispatch global UI toast event for 403 Forbidden or 5xx Server Errors
    if (typeof window !== "undefined" && error.response) {
      const normalized = extractApiError(error);
      if (normalized.status === 403 || normalized.status >= 500) {
        window.dispatchEvent(
          new CustomEvent("dc:api-error", { detail: normalized })
        );
      }
    }

    return Promise.reject(error);
  }
);