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
  siteName: (import.meta.env.VITE_FRAPPE_SITE_NAME as string) ?? 'voice_ai_platform',
  environment: (import.meta.env.VITE_NODE_ENV as AppConfig['environment']) ?? 'development',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
  appVersion: (import.meta.env.VITE_APP_VERSION as string) ?? '1.0.0',
  appName: (import.meta.env.VITE_APP_NAME as string) ?? 'Voice AI Platform',
};

export default config;

// Helper functions
export const isDevelopment = () => config.environment === 'development';
export const isProduction = () => config.environment === 'production';
export const isTest = () => config.environment === 'test';
