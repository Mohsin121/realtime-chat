import { ApiErrorResponse } from "@/shared/types/api";

export class ApiClient {
  async request<T>(
    url: string,
    options?: RequestInit,
    retry = true
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    // 1. Safe JSON parsing (prevents crash on 204 No Content or HTML errors)
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (response.ok) {
      return data as T;
    }

    // 2. Refresh & retry logic
    if (
      response.status === 401 &&
      retry &&
      url !== "/api/auth/refresh" &&
      url !== "/api/auth/me"
    ) {
      const refreshed = await this.request<{ success: boolean }>(
        "/api/auth/refresh",
        { method: "POST" },
        false
      ).catch(() => null);

      if (refreshed) {
        return await this.request<T>(url, options, false);
      }
    }

    throw (data ?? { message: response.statusText }) as ApiErrorResponse;
  }

  get<T>(url: string) {
    return this.request<T>(url);
  }

  post<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  patch<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete<T>(url: string) {
    return this.request<T>(url, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();