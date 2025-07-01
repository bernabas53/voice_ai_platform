# 🚀 Voice AI Platform - Production Deployment Guide

## ✅ Current Status: READY FOR DEPLOYMENT

### Backend Configuration
- ✅ Frappe Backend URL: `http://erpnextcyoai.ddns.net:8080`
- ✅ Site Name: `erpnextcyoai`
- ✅ Backend connectivity verified
- ✅ API endpoints responding correctly

### Frontend Configuration
- ✅ Production build completed successfully
- ✅ Environment variables configured
- ✅ Error handling implemented
- ✅ Loading states implemented
- ✅ Authentication system ready
- ✅ Dashboard with call logs integration ready

### Build Output
- ✅ HTML: `../voice_ai_platform/public/CYOAI/index.html` (0.94 kB)
- ✅ CSS: `../voice_ai_platform/public/CYOAI/assets/index-jiGuhpbf.css` (114.00 kB)
- ✅ JS: `../voice_ai_platform/public/CYOAI/assets/index-C9m9KzRO.js` (594.98 kB)
- ✅ Vendor: `../voice_ai_platform/public/CYOAI/assets/vendor-dQk0gtQ5.js` (11.21 kB)
- ✅ Frappe SDK: `../voice_ai_platform/public/CYOAI/assets/frappe-Cfd86OOD.js` (104.48 kB)

## 🎯 Next Steps: Deploy to Vercel

### 1. Prepare for Vercel Deployment

```bash
# Your project is ready! The build files are in:
# ../voice_ai_platform/public/CYOAI/
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Create new project
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `../voice_ai_platform/public/CYOAI`
   - **Install Command**: `yarn install`

### 3. Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

```
VITE_FRAPPE_API_URL=http://erpnextcyoai.ddns.net:8080
VITE_FRAPPE_SITE_NAME=erpnextcyoai
VITE_NODE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Voice AI Platform
```

### 4. Custom Domain Setup (Optional)

1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `voice.erpnextcyoai.ddns.net`)
4. Update DNS records as instructed by Vercel

### 5. Post-Deployment Verification

After deployment, verify:
- ✅ Login page loads correctly
- ✅ Authentication works with Frappe backend
- ✅ Dashboard displays call logs
- ✅ All API calls succeed
- ✅ Error handling works properly

## 🔧 Troubleshooting

### Build Issues
- If you encounter build errors, run: `npm run build` locally first
- Check that all dependencies are installed: `yarn install`

### CORS Issues
- Ensure your Frappe backend has CORS configured for your Vercel domain
- Check that the API URL is accessible from Vercel's servers

### Authentication Issues
- Verify the site name matches exactly: `erpnextcyoai`
- Check that the Frappe API user has proper permissions

## 📊 Performance Optimization

The build shows some large chunks. Consider:
- Code splitting with dynamic imports
- Lazy loading of components
- Optimizing bundle size for production

## 🎉 Success!

Your Voice AI Platform is now ready for production deployment on Vercel!

## Overview

This guide covers the production deployment of the Voice AI Platform frontend application. The application is built with React, TypeScript, Vite, and Tailwind CSS, integrated with a Frappe backend.

## Prerequisites

- Node.js 18+ and Yarn
- Frappe backend running and accessible
- Production server with HTTPS support
- Domain name configured

## Environment Configuration

### 1. Environment Variables

Create a `.env.production` file in the project root:

```bash
# API Configuration
VITE_FRAPPE_API_URL=https://your-frappe-backend.com
VITE_FRAPPE_SITE_NAME=voice_ai_platform

# Environment
VITE_NODE_ENV=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true

# Build Configuration
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Voice AI Platform
```

### 2. Backend Configuration

Ensure your Frappe backend has:
- CORS configured for your frontend domain
- HTTPS enabled
- Proper authentication endpoints
- API rate limiting configured

## Build Process

### 1. Automated Build

Use the enhanced build script:

```bash
# Make script executable
chmod +x scripts/build.sh

# Run production build
./scripts/build.sh
```

The build script will:
- ✅ Validate environment variables
- ✅ Install dependencies
- ✅ Run type checking
- ✅ Run linting
- ✅ Run tests
- ✅ Build for production
- ✅ Generate build artifacts
- ✅ Provide build size analysis

### 2. Manual Build

```bash
# Install dependencies
yarn install

# Type checking
yarn type-check

# Linting
yarn lint

# Testing
yarn test

# Production build
yarn build
```

## Deployment Options

### Option 1: Static File Hosting (Recommended)

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Root directory
    root /var/www/voice-ai-platform;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to Frappe backend
    location /api/ {
        proxy_pass https://your-frappe-backend.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Deployment Steps

1. **Build the application:**
   ```bash
   ./scripts/build.sh
   ```

2. **Upload to server:**
   ```bash
   # Copy build files to server
   scp -r dist/* user@your-server:/var/www/voice-ai-platform/

   # Or use rsync for better performance
   rsync -avz --delete dist/ user@your-server:/var/www/voice-ai-platform/
   ```

3. **Set permissions:**
   ```bash
   sudo chown -R www-data:www-data /var/www/voice-ai-platform
   sudo chmod -R 755 /var/www/voice-ai-platform
   ```

4. **Restart Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

### Option 2: Docker Deployment

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  voice-ai-frontend:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    environment:
      - VITE_FRAPPE_API_URL=https://your-frappe-backend.com
    restart: unless-stopped
```

#### Deployment Commands

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Or build and run manually
docker build -t voice-ai-platform .
docker run -d -p 80:80 -p 443:443 voice-ai-platform
```

### Option 3: CDN Deployment

For global distribution, consider using a CDN:

1. **Build the application**
2. **Upload to CDN** (AWS CloudFront, Cloudflare, etc.)
3. **Configure custom domain**
4. **Set up SSL certificate**

## Monitoring and Maintenance

### 1. Health Checks

Create a health check endpoint:

```bash
# Check if application is responding
curl -f https://your-domain.com/ || exit 1

# Check API connectivity
curl -f https://your-domain.com/api/method/frappe.auth.get_logged_user || exit 1
```

### 2. Log Monitoring

Set up log monitoring for:
- Nginx access/error logs
- Application errors
- API response times
- User sessions

### 3. Performance Monitoring

Monitor:
- Page load times
- API response times
- Bundle sizes
- User experience metrics

### 4. Security Monitoring

- SSL certificate expiration
- Security headers
- CORS configuration
- API rate limiting

## Backup and Recovery

### 1. Application Backup

```bash
# Backup build files
tar -czf voice-ai-platform-$(date +%Y%m%d).tar.gz dist/

# Backup configuration
tar -czf config-$(date +%Y%m%d).tar.gz .env.production nginx.conf
```

### 2. Recovery Process

1. Restore build files
2. Restore configuration
3. Restart services
4. Verify functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify API URL in environment variables

2. **Authentication Issues**
   - Check session configuration
   - Verify API endpoints

3. **Build Failures**
   - Check Node.js version
   - Verify all dependencies installed
   - Check TypeScript errors

4. **Performance Issues**
   - Enable gzip compression
   - Optimize images
   - Use CDN for static assets

### Debug Commands

```bash
# Check build output
ls -la dist/

# Verify environment variables
grep -r "VITE_" .env.production

# Test API connectivity
curl -v https://your-frappe-backend.com/api/method/frappe.auth.get_logged_user

# Check nginx configuration
nginx -t

# View logs
tail -f /var/log/nginx/error.log
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] API rate limiting enabled
- [ ] Environment variables secured
- [ ] Regular security updates
- [ ] SSL certificate auto-renewal
- [ ] Access logs monitored

## Performance Optimization

- [ ] Gzip compression enabled
- [ ] Static asset caching
- [ ] Image optimization
- [ ] Bundle size analysis
- [ ] CDN configured
- [ ] Database query optimization

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review logs for errors
3. Verify configuration
4. Contact the development team

---

**Last Updated:** $(date)
**Version:** 1.0.0
