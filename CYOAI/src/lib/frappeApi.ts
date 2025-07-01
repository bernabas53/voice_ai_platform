import config from './config';

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

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class FrappeApiClient {
  private baseUrl: string;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second
  private apiKey = '53e38f087dadeef';
  private apiSecret = 'd4ac7a0577da40c';

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `token ${this.apiKey}:${this.apiSecret}`,
      ...(options.headers || {}),
    };

    const defaultOptions: RequestInit = {
      credentials: 'include', // Include cookies for session management
      headers: defaultHeaders,
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
        const apiError: ApiError = {
          message: (errorData.message as string) ?? `HTTP error! status: ${response.status}`,
          status: response.status,
          code: errorData.code as string,
        };

        // Retry on 5xx errors (server errors)
        if (response.status >= 500 && retryCount < this.maxRetries) {
          console.warn(`Retrying request (${retryCount + 1}/${this.maxRetries}) due to server error:`, apiError);
          await this.delay(this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }

        throw new Error(apiError.message);
      }

      return await response.json() as T;
    } catch (error) {
      // Handle network errors with retry
      if (error instanceof TypeError && retryCount < this.maxRetries) {
        console.warn(`Retrying request (${retryCount + 1}/${this.maxRetries}) due to network error:`, error);
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      return await this.makeRequest<LoginResponse>('/api/method/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: Unknown error');
    }
  }

  // Get logged in user
  async getLoggedInUser(): Promise<{ message: string }> {
    try {
      return await this.makeRequest<{ message: string }>('/api/method/frappe.auth.get_logged_user');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get logged in user: ${error.message}`);
      }
      throw new Error('Failed to get logged in user: Unknown error');
    }
  }

  // Logout user
  async logout(): Promise<{ message: string }> {
    try {
      return await this.makeRequest<{ message: string }>('/api/method/logout', {
        method: 'POST',
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Logout failed: ${error.message}`);
      }
      throw new Error('Logout failed: Unknown error');
    }
  }

  // Get call logs
  async getCallLogs(filters?: any[], orFilters?: any[]): Promise<unknown[]> {
    try {
      // Updated endpoint to work with Voice Agent Call Log app
      let endpoint = '/api/resource/Voice Agent Call Log?fields=["name","caller_name","phone_number","intent","summary","status","creation","modified"]&limit_page_length=50';

      if (filters && filters.length > 0) {
        endpoint += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
      }
      if (orFilters && orFilters.length > 0) {
        endpoint += `&or_filters=${encodeURIComponent(JSON.stringify(orFilters))}`;
      }

      console.log('Fetching call logs from:', `${this.baseUrl}${endpoint}`);
      const response = await this.makeRequest<{ data: unknown[] }>(endpoint);
      console.log('Call logs response:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching call logs:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch call logs: ${error.message}`);
      }
      throw new Error('Failed to fetch call logs: Unknown error');
    }
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
    try {
      return await this.makeRequest<{ role: string }>('/api/method/get_user_role');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get user role: ${error.message}`);
      }
      throw new Error('Failed to get user role: Unknown error');
    }
  }
}

// Export singleton instance
export const frappeApi = new FrappeApiClient();
export default frappeApi;
