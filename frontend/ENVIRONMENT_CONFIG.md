# FanZFolio Environment Configuration

## Frontend Environment Variables (.env)

The following environment variables have been configured in `/app/frontend/.env`:

### 1. VITE_GOOGLE_CLIENT_ID
```
VITE_GOOGLE_CLIENT_ID=790934983566-nj5jifujqlasmtoi2crsgm9mq3vo3h96.apps.googleusercontent.com
```
**Purpose:** Google OAuth 2.0 Client ID for user authentication
**Usage:** Used by the AuthContext to enable "Continue with Google" functionality

### 2. VITE_SHOW_PROTOTYPE_BAR
```
VITE_SHOW_PROTOTYPE_BAR=false
```
**Purpose:** Toggle the prototype navigation bar visibility
**Usage:** When set to `false`, hides the bottom prototype bar used during development

### 3. VITE_API_BASE_URL
```
VITE_API_BASE_URL=http://localhost:8001/api/v1
```
**Purpose:** Base URL for all backend API calls
**Usage:** Dynamically replaces hardcoded localhost URLs in api-config.json

## How It Works

### API Service Integration
The `apiService.ts` has been modified to automatically replace any hardcoded `localhost:8001/api/v1` URLs in the API configuration with the value from `VITE_API_BASE_URL`.

**Code modification in `/src/app/services/apiService.ts`:**
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (apiBaseUrl) {
  const configStr = JSON.stringify(config);
  const updatedConfigStr = configStr.replace(/http:\/\/localhost:8001\/api\/v1/g, apiBaseUrl);
  _apiConfig = JSON.parse(updatedConfigStr);
}
```

This allows you to:
- Change the backend URL without modifying api-config.json
- Use different URLs for development, staging, and production
- Point to remote backend servers by updating the .env file

## Environment Variable Access in Vite

Vite exposes environment variables prefixed with `VITE_` to the client-side code via `import.meta.env`:

```typescript
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const showPrototypeBar = import.meta.env.VITE_SHOW_PROTOTYPE_BAR === 'true';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

## Testing the Configuration

### 1. Verify Google OAuth is configured:
- Check the "Continue with Google" button on login page
- Client ID should be properly loaded

### 2. Verify Prototype Bar is hidden:
- Navigate to any page
- Bottom prototype bar should not be visible

### 3. Verify API calls use correct URL:
- Open browser DevTools → Network tab
- Submit a creator analysis or make any API call
- Check that requests go to `http://localhost:8001/api/v1/...`

## Deployment Notes

For production deployment, update the `.env` file:

```bash
VITE_GOOGLE_CLIENT_ID=<your-production-client-id>
VITE_SHOW_PROTOTYPE_BAR=false
VITE_API_BASE_URL=https://api.fanzfolio.com/api/v1
```

**Important:** 
- Vite bundles environment variables at **build time**
- Changes to .env require rebuilding the app: `yarn build`
- For development, Vite hot-reloads when .env changes

## Current Status

✅ Environment variables configured  
✅ API service updated to use VITE_API_BASE_URL  
✅ Google OAuth Client ID set  
✅ Prototype bar disabled  
✅ Frontend restarted and running

All API calls will now use `http://localhost:8001/api/v1` as the base URL.
