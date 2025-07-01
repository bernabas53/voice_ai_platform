import config from './config';

interface AuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

class AuthManager {
  private readonly TOKEN_KEY = 'voice_ai_auth_token';
  private readonly SESSION_KEY = 'voice_ai_session';

  // Store token securely
  setToken(token: AuthToken): void {
    try {
      // In production, consider using httpOnly cookies instead
      if (config.environment === 'production') {
        // For now, we'll use localStorage but in a real production app,
        // you should use httpOnly cookies set by the backend
        localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));
      } else {
        localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));
      }
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  // Get stored token
  getToken(): AuthToken | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) return null;

      const token = JSON.parse(tokenData) as AuthToken;

      // Check if token is expired
      if (token.expires_at && Date.now() > token.expires_at) {
        this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      this.clearToken();
      return null;
    }
  }

  // Clear stored token
  clearToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token?.access_token !== undefined;
  }

  // Get access token
  getAccessToken(): string | null {
    const token = this.getToken();
    return token?.access_token ?? null;
  }

  // Set session data
  setSession(sessionData: Record<string, unknown>): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  // Get session data
  getSession(): Record<string, unknown> | null {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      return sessionData ? (JSON.parse(sessionData) as Record<string, unknown>) : null;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  // Clear session
  clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Logout - clear all auth data
  logout(): void {
    this.clearToken();
    this.clearSession();
  }
}

// Export singleton instance
export const authManager = new AuthManager();
export default authManager;
