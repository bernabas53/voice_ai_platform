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
