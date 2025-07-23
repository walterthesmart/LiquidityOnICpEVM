# Network Debugging Guide - "TypeError: Failed to fetch"

This guide helps you debug and fix "TypeError: Failed to fetch" errors in your liquidity project.

## 🚨 Quick Diagnosis

### Step 1: Check Environment Variables
```bash
cd front-end
npm run check:env
```

### Step 2: Test Network Connectivity
1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/debug-network`
3. Click "Run Network Tests" to test all external services

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for specific error messages with URLs

## 🔍 Common Sources of Fetch Errors

### 1. TradingView Widget (Most Common)
**Error Location**: `front-end/src/components/TradingViewWidget.tsx`
**URL**: `https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js`

**Possible Causes**:
- Network connectivity issues
- Corporate firewall blocking TradingView
- Ad blockers blocking external scripts
- CORS issues

**Solutions**:
- Check if TradingView is accessible: `curl -I https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js`
- Disable ad blockers temporarily
- Try different network (mobile hotspot)

### 2. Stock Price Scraping
**Error Location**: `front-end/src/server-actions/stocks/getStocks.ts`
**URL**: `https://afx.kwayisi.org/nse/`

**Possible Causes**:
- External website is down
- Rate limiting
- User-Agent blocking

**Solutions**:
- Check if site is accessible: `curl -I https://afx.kwayisi.org/nse/`
- The code already includes retry logic and random User-Agents

### 3. Paystack Payment API
**Error Location**: `front-end/src/server-actions/paystack/makePaymentRequest.ts`
**URL**: From `PAYSTACK_URL` environment variable

**Possible Causes**:
- Missing `PAYSTACK_URL` environment variable
- Invalid API keys
- Network issues

**Solutions**:
```bash
# Check if PAYSTACK_URL is set
echo $PAYSTACK_URL

# Should be: https://api.paystack.co/transaction/initialize
```

### 4. Database Connection (Turso)
**Error Location**: `front-end/src/db/turso-connection.ts`

**Possible Causes**:
- Missing `TURSO_DATABASE_URL` or `TURSO_AUTH_TOKEN`
- Invalid database URL
- Network connectivity to Turso

**Solutions**:
```bash
# Check environment variables
npm run check:env
```

## 🛠️ Debugging Steps

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local

# Check configuration
npm run check:env
```

### 2. Required Environment Variables
```env
# Minimum required for basic functionality
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_token_here
PAYSTACK_URL=https://api.paystack.co/transaction/initialize
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
```

### 3. Network Testing
```bash
# Test external URLs manually
curl -I https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js
curl -I https://afx.kwayisi.org/nse/
curl -I https://api.paystack.co/transaction/initialize
curl -I https://js.paystack.co/v2/inline.js
```

### 4. Browser-Specific Issues
- **Chrome**: Check if "Block third-party cookies" is enabled
- **Firefox**: Check Enhanced Tracking Protection settings
- **Safari**: Check "Prevent cross-site tracking" setting
- **All browsers**: Disable ad blockers temporarily

## 🔧 Fixes and Workarounds

### 1. TradingView Widget Issues
If TradingView is consistently failing:

```typescript
// Temporary fallback in TradingViewWidget.tsx
const FALLBACK_CHART_URL = "https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=NSENG%3AACCESS&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=%5B%5D&hideideas=1&theme=Light&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=NSENG%3AACCESS";
```

### 2. Stock Price Scraping Issues
If the external stock price API is down:

```typescript
// Use mock data temporarily
const FALLBACK_STOCK_PRICES = {
  DANGCEM: { price: 450.00, change: 2.5 },
  MTNN: { price: 180.00, change: -1.2 },
  // ... add more stocks
};
```

### 3. Payment Processing Issues
For Paystack issues:

```typescript
// Check environment variables at runtime
if (!process.env.PAYSTACK_URL) {
  throw new Error('PAYSTACK_URL environment variable is required');
}
```

## 📊 Monitoring and Logging

The application includes enhanced error logging. Check:

1. **Browser Console**: Detailed fetch error logs
2. **Network Tab**: Failed requests with status codes
3. **Application Logs**: Server-side errors

## 🚀 Testing Your Fixes

1. **Environment Check**: `npm run check:env`
2. **Network Test**: Visit `/debug-network`
3. **Full Application Test**: Navigate through all features
4. **Browser Console**: Should show no fetch errors

## 📞 Getting Help

If you're still experiencing issues:

1. Run the network debugger: `/debug-network`
2. Check browser console for specific error messages
3. Verify all environment variables are set correctly
4. Test on different networks/browsers
5. Check if external services (TradingView, Paystack) are operational

## 🔄 Common Solutions Summary

1. **Set up environment variables** (most common fix)
2. **Check network connectivity**
3. **Disable ad blockers**
4. **Try different browser/network**
5. **Verify external service availability**
