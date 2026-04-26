const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bk-zenparking.vercel.app/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
  skipAuthRefresh?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(options?: FetchOptions): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (options?.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    return headers;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const refreshToken = localStorage.getItem('zenparking_refresh_token');
      if (!refreshToken) return null;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      localStorage.setItem('zenparking_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('zenparking_refresh_token', data.refresh_token);
      }
      return data.access_token;
    } catch {
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const { token, skipAuthRefresh, ...fetchOptions } = options;

    let response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders({ token }),
        ...(fetchOptions.headers || {}),
      },
    });

    if (response.status === 401 && !skipAuthRefresh && token) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        response = await fetch(url, {
          ...fetchOptions,
          headers: {
            ...this.getHeaders({ token: newToken }),
            ...(fetchOptions.headers || {}),
          },
        });
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('zenparking_token');
          localStorage.removeItem('zenparking_refresh_token');
          localStorage.removeItem('zenparking_user');
          window.location.href = '/login';
        }
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error de conexión' }));
      throw new Error(error.detail || `HTTP error ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      token,
    });
  }

  async put<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      token,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      token,
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { API_BASE_URL };