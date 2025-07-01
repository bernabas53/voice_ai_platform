#!/bin/bash

# Frappe Backend Verification Script
echo "🔍 Verifying Frappe Backend Setup..."

# Configuration
BACKEND_URL="http://erpnextcyoai.ddns.net:8080"
SITE_NAME="erpnextcyoai"

echo "📍 Backend URL: $BACKEND_URL"
echo "🏷️  Site Name: $SITE_NAME"
echo ""

# Test 1: Basic connectivity
echo "1️⃣ Testing basic connectivity..."
if curl -s --connect-timeout 10 "$BACKEND_URL" > /dev/null; then
    echo "✅ Backend is reachable"
else
    echo "❌ Backend is not reachable"
    echo "   Please check:"
    echo "   - Server is running"
    echo "   - Port 8080 is open"
    echo "   - Firewall allows connections"
    exit 1
fi

# Test 2: Frappe API endpoint
echo ""
echo "2️⃣ Testing Frappe API endpoint..."
API_RESPONSE=$(curl -s --connect-timeout 10 "$BACKEND_URL/api/method/frappe.auth.get_logged_user")
if [[ $API_RESPONSE == *"Not Found"* ]] || [[ $API_RESPONSE == *"error"* ]]; then
    echo "❌ Frappe API not responding correctly"
    echo "   Response: $API_RESPONSE"
    echo "   Please check:"
    echo "   - Frappe is properly installed"
    echo "   - Site is configured correctly"
else
    echo "✅ Frappe API is responding"
fi

# Test 3: Site-specific endpoint
echo ""
echo "3️⃣ Testing site-specific endpoint..."
SITE_RESPONSE=$(curl -s --connect-timeout 10 "$BACKEND_URL/api/method/frappe.client.get_list" \
  -H "Content-Type: application/json" \
  -d '{"doctype": "User", "limit": 1}')
if [[ $SITE_RESPONSE == *"Not Found"* ]] || [[ $SITE_RESPONSE == *"error"* ]]; then
    echo "❌ Site-specific API not responding"
    echo "   Response: $SITE_RESPONSE"
else
    echo "✅ Site-specific API is responding"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. If all tests pass, you're ready for Vercel deployment"
echo "2. If any tests fail, fix the backend issues first"
echo "3. Run: npm run build to create production build"
echo "4. Deploy to Vercel using the instructions in DEPLOYMENT.md"
