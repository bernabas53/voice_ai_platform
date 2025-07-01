# Production-Ready Frontend Setup for ERPNext Dashboard

A comprehensive guide for building and deploying a production-ready React frontend that connects securely with your ERPNext backend.

## 🎯 Overview

This guide provides a complete setup for creating a robust, secure, and production-ready React application that integrates with ERPNext. It includes enterprise-grade error handling, security best practices, and deployment automation.

## 📋 Prerequisites

- **Backend**: ERPNext instance with CORS enabled
- **Frontend**: Node.js 18+, Yarn, Git
- **Deployment**: Vercel account (or other hosting platform)
- **Security**: SSL certificates for production domains

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   API Gateway   │    │   ERPNext       │
│   (Frontend)    │◄──►│   (Vercel)      │◄──►│   (Backend)     │
│                 │    │                 │    │                 │
│ • Error Boundary│    │ • CORS Proxy    │    │ • REST API      │
│ • Auth Manager  │    │ • Rate Limiting │    │ • Session Mgmt  │
│ • Loading States│    │ • Security      │    │ • Data Access   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Backend Configuration

### 1. Create API-Enabled User in ERPNext

1. **Login as Administrator**
2. **Navigate**: Users & Permissions → User → New
3. **Configure User**:
   - Name/Email: `api-user@yourdomain.com`
   - Enabled: ✅
   - API Access: ✅
   - Role: System Manager (or custom role with required permissions)
4. **Generate API Credentials**:
   - Save user
   - Reopen user
   - Click "Generate API Key / API Secret"
   - Copy API Key and Secret securely

### 2. Configure CORS in ERPNext

In `sites/your-site/site_config.json`:

```json
{
  "allow_cors": [
    "https://your-frontend.vercel.app",
    "https://your-frontend.com"
  ],
  "cors_allowed_origins": [
    "https://your-frontend.vercel.app",
    "https://your-frontend.com"
  ],
  "cors_allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "cors_allowed_headers": ["Content-Type", "Authorization", "X-Frappe-CSRF-Token"]
}
```

**Restart ERPNext container:**
```bash
docker-compose restart frappe
```

### 3. Verify Backend Connectivity

```bash
# Test basic connectivity
curl -X GET "https://erp.your-domain.com/api/method/frappe.auth.get_logged_user" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET"

# Test resource access
curl -X GET "https://erp.your-domain.com/api/resource/User?fields=[\"name\",\"full_name\"]" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET"
```

## 🚀 Frontend Setup

### 1. Project Structure

```
src/
├── components/
│   ├── ErrorBoundary.tsx      # Error handling
│   ├── LoadingSpinner.tsx     # Loading states
│   ├── Login.tsx              # Authentication
│   └── Dashboard.tsx          # Main app
├── lib/
│   ├── config.ts              # Environment config
│   ├── auth.ts                # Authentication manager
│   ├── frappeApi.ts           # API client
│   └── socket.ts              # Real-time updates
├── hooks/
│   └── useAuth.ts             # Authentication hook
├── types/
│   └── index.ts               # TypeScript definitions
└── App.tsx                    # Main component
```

### 2. Environment Configuration

Create `.env.example`:
```bash
# API Configuration
VITE_FRAPPE_API_URL=https://erp.your-domain.com
VITE_FRAPPE_SITE_NAME=your_site_name

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false

# Build Configuration
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=ERPNext Dashboard
```

Create `.env.production`:
```bash
VITE_FRAPPE_API_URL=https://erp.your-domain.com
VITE_FRAPPE_SITE_NAME=your_site_name
VITE_NODE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=ERPNext Dashboard
```

### 3. Configuration Management (`src/lib/config.ts`)

```typescript
interface AppConfig {
  apiUrl: string;
  siteName: string;
  environment: 'development' | 'production' | 'test';
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  appVersion: string;
  appName: string;
}

const config: AppConfig = {
  apiUrl: (import.meta.env.VITE_FRAPPE_API_URL as string) ?? 'http://localhost:8000',
  siteName: (import.meta.env.VITE_FRAPPE_SITE_NAME as string) ?? 'site1.localhost',
  environment: (import.meta.env.VITE_NODE_ENV as AppConfig['environment']) ?? 'development',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
  appVersion: (import.meta.env.VITE_APP_VERSION as string) ?? '1.0.0',
  appName: (import.meta.env.VITE_APP_NAME as string) ?? 'ERPNext Dashboard',
};

export default config;
export const isDevelopment = () => config.environment === 'development';
export const isProduction = () => config.environment === 'production';
```

### 4. Enhanced API Client (`src/lib/frappeApi.ts`)

```typescript
import config from './config';

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
  private maxRetries = 3;
  private retryDelay = 1000;

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

    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
        const errorMessage = (errorData.message as string) ?? `HTTP error! status: ${response.status}`;

        // Retry on 5xx errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          console.warn(`Retrying request (${retryCount + 1}/${this.maxRetries}) due to server error`);
          await this.delay(this.retryDelay * Math.pow(2, retryCount));
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }

        throw new Error(errorMessage);
      }

      return await response.json() as T;
    } catch (error) {
      // Handle network errors with retry
      if (error instanceof TypeError && retryCount < this.maxRetries) {
        console.warn(`Retrying request (${retryCount + 1}/${this.maxRetries}) due to network error`);
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      throw error;
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
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get logged in user
  async getLoggedInUser(): Promise<{ message: string }> {
    try {
      return await this.makeRequest<{ message: string }>('/api/method/frappe.auth.get_logged_user');
    } catch (error) {
      throw new Error(`Failed to get logged in user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get ERPNext resources
  async getResource(doctype: string, filters?: any[], fields?: string[]): Promise<unknown[]> {
    try {
      let endpoint = `/api/resource/${doctype}`;
      const params = new URLSearchParams();

      if (fields && fields.length > 0) {
        params.append('fields', JSON.stringify(fields));
      }
      if (filters && filters.length > 0) {
        params.append('filters', JSON.stringify(filters));
      }

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await this.makeRequest<{ data: unknown[] }>(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch ${doctype}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
}

export const frappeApi = new FrappeApiClient();
export default frappeApi;
```

### 5. Authentication Manager (`src/lib/auth.ts`)

```typescript
import config from './config';

interface AuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

class AuthManager {
  private readonly TOKEN_KEY = 'erpnext_auth_token';
  private readonly SESSION_KEY = 'erpnext_session';

  setToken(token: AuthToken): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  getToken(): AuthToken | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) return null;

      const token = JSON.parse(tokenData) as AuthToken;

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

  clearToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token?.access_token !== undefined;
  }

  logout(): void {
    this.clearToken();
    this.clearSession();
  }

  setSession(sessionData: Record<string, unknown>): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  getSession(): Record<string, unknown> | null {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      return sessionData ? (JSON.parse(sessionData) as Record<string, unknown>) : null;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }
}

export const authManager = new AuthManager();
export default authManager;
```

### 6. Error Boundary (`src/components/ErrorBoundary.tsx`)

```typescript
import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import config from '../lib/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    if (config.environment === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    if (config.enableErrorTracking && config.environment === 'production') {
      // Send to error tracking service (Sentry, LogRocket, etc.)
      console.error('Error tracking enabled - would send to service:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
              <p className="mt-2 text-sm text-gray-500">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {config.environment === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 7. Loading Spinner (`src/components/LoadingSpinner.tsx`)

```typescript
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
```

### 8. Main App Component (`src/App.tsx`)

```typescript
import { useState, useEffect } from 'react';
import { frappeApi } from './lib/frappeApi';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      frappeApi.isAuthenticated()
        .then(authenticated => {
          setIsAuthenticated(authenticated);
        })
        .catch(() => {
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading ERPNext Dashboard..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <div className="min-h-screen bg-white text-black">
          {isAuthenticated ? (
            <Dashboard />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
```

### 9. Sample Dashboard Component

```typescript
import { useState, useEffect } from 'react';
import { frappeApi } from '../lib/frappeApi';
import LoadingSpinner from './LoadingSpinner';

interface User {
  name: string;
  full_name: string;
  email: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    frappeApi.getResource('User', [], ['name', 'full_name', 'email'])
      .then((data: unknown[]) => {
        setUsers(data as User[]);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ERPNext Users</h1>
      <div className="grid gap-4">
        {users.map(user => (
          <div key={user.name} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{user.full_name}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🚀 Deployment

### 1. Vercel Deployment

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Production-ready ERPNext dashboard"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Set Framework Preset: **Vite**
   - Build Command: `yarn build`
   - Output Directory: `dist`
   - Install Command: `yarn install`

3. **Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   VITE_FRAPPE_API_URL=https://erp.your-domain.com
   VITE_FRAPPE_SITE_NAME=your_site_name
   VITE_NODE_ENV=production
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_ERROR_TRACKING=true
   ```

4. **Deploy**
   - Click "Deploy"
   - Note your production URL (e.g., `https://your-dashboard.vercel.app`)

### 2. Update CORS Configuration

After deployment, update your ERPNext CORS settings to include your Vercel domain:

```json
{
  "allow_cors": [
    "https://your-dashboard.vercel.app"
  ]
}
```

Restart ERPNext:
```bash
docker-compose restart frappe
```

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.production` to Git
- ✅ Use Vercel's environment variable system
- ✅ Rotate API keys regularly
- ✅ Use least-privilege API roles

### 2. CORS Configuration
- ✅ Whitelist specific domains only
- ✅ Avoid using `"*"` in production
- ✅ Include both development and production URLs

### 3. Error Handling
- ✅ Don't expose sensitive information in error messages
- ✅ Log errors appropriately for debugging
- ✅ Provide user-friendly error messages

### 4. Authentication
- ✅ Use session-based authentication
- ✅ Implement proper logout functionality
- ✅ Handle token expiration gracefully

## 📊 Monitoring and Analytics

### 1. Error Tracking
Consider integrating error tracking services:
- **Sentry**: Error monitoring and performance tracking
- **LogRocket**: Session replay and error tracking
- **Bugsnag**: Error monitoring and crash reporting

### 2. Performance Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: User behavior tracking
- **Core Web Vitals**: Performance metrics

### 3. Health Checks
Create health check endpoints:
```bash
# Check frontend
curl -f https://your-dashboard.vercel.app/

# Check API connectivity
curl -f https://erp.your-domain.com/api/method/frappe.auth.get_logged_user
```

## 🧪 Testing

### 1. Unit Tests
```bash
# Run tests
yarn test

# Run tests with coverage
yarn test --coverage
```

### 2. Integration Tests
Test API connectivity:
```bash
# Test login
curl -X POST "https://erp.your-domain.com/api/method/login" \
  -H "Content-Type: application/json" \
  -d '{"usr":"test@example.com","pwd":"password"}'

# Test resource access
curl -X GET "https://erp.your-domain.com/api/resource/User" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET"
```

### 3. End-to-End Tests
Consider using Playwright or Cypress for E2E testing.

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Check CORS configuration
   curl -H "Origin: https://your-dashboard.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS https://erp.your-domain.com/api/method/frappe.auth.get_logged_user
   ```

2. **Authentication Issues**
   - Verify API credentials
   - Check user permissions in ERPNext
   - Ensure session cookies are enabled

3. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check TypeScript errors

4. **Performance Issues**
   - Enable gzip compression
   - Use CDN for static assets
   - Optimize bundle size

### Debug Commands

```bash
# Check build output
ls -la dist/

# Verify environment variables
grep -r "VITE_" .env.production

# Test API connectivity
curl -v https://erp.your-domain.com/api/method/frappe.auth.get_logged_user

# Check Vercel deployment
vercel logs
```

## 📈 Performance Optimization

### 1. Bundle Optimization
- Use code splitting
- Implement lazy loading
- Optimize images
- Enable tree shaking

### 2. Caching
- Cache static assets
- Implement service workers
- Use CDN for global distribution

### 3. API Optimization
- Implement request caching
- Use pagination for large datasets
- Optimize API queries

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Error boundaries implemented
- [ ] Loading states added
- [ ] Authentication flow working
- [ ] API retry logic implemented
- [ ] Security headers configured
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Performance optimized
- [ ] Tests passing
- [ ] Error tracking enabled

## 🎉 Success!

Your ERPNext dashboard is now production-ready with:
- ✅ Enterprise-grade error handling
- ✅ Secure authentication
- ✅ Comprehensive monitoring
- ✅ Performance optimization
- ✅ Security best practices
- ✅ Automated deployment

---

**Last Updated**: $(date)
**Version**: 2.0.0
**Framework**: React + TypeScript + Vite
**Backend**: ERPNext
**Deployment**: Vercel

