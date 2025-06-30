// Frappe API Client for Voice AI Platform

interface LoginCredentials {
  usr: string;
  pwd: string;
}

interface LoginResponse {
  message: string;
  home_page?: string;
  full_name?: string;
}

class FrappeApiClient {
  private baseUrl: string;

  constructor() {
    // Use relative path for local dev so Vite proxy handles API requests
    const envUrl = import.meta.env.VITE_FRAPPE_BASE_URL as string | undefined;
    this.baseUrl = typeof envUrl === 'string' && envUrl.length > 0
      ? envUrl
      : '';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      credentials: 'include', // Include cookies for session management
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/api/method/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Get logged in user
  async getLoggedInUser(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/method/frappe.auth.get_logged_user');
  }

  // Logout user
  async logout(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/method/logout', {
      method: 'POST',
    });
  }

  // Get call logs
  async getCallLogs(filters?: any[], orFilters?: any[]): Promise<unknown[]> {
    let endpoint = '/api/resource/Voice Agent Call Log?fields=["name","caller_name","phone_number","intent","summary","status","creation"]';
    if (filters && filters.length > 0) {
      endpoint += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }
    if (orFilters && orFilters.length > 0) {
      endpoint += `&or_filters=${encodeURIComponent(JSON.stringify(orFilters))}`;
    }
    const response = await this.makeRequest<{ data: unknown[] }>(endpoint);
    return response.data;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.getLoggedInUser();
      return response.message !== 'Guest';
    } catch {
      return false;
    }
  }

  // Get user role
  async getUserRole(): Promise<{ role: string }> {
    return this.makeRequest<{ role: string }>('/api/method/get_user_role');
  }
}

// Export singleton instance
export const frappeApi = new FrappeApiClient();
export default frappeApi;
