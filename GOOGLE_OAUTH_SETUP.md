# How to Fix Google OAuth Error 400: redirect_uri_mismatch

## Problem
You're getting this error when trying to sign in with Google:
```
Access blocked: This app's request is invalid
Error 400: redirect_uri_mismatch
```

## Root Cause
The redirect URI that your app is sending to Google doesn't match the authorized redirect URIs configured in your Google Cloud Console project.

## Solution: Add Authorized Redirect URIs

You need to add the following URIs to your Google Cloud Console:

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `790934983566-nj5jifujqlasmtoi2crsgm9mq3vo3h96`
3. Click on it to edit

### Step 2: Add Authorized JavaScript Origins
Add these origins to the "Authorized JavaScript origins" section:
```
https://quickstart-guide-6.preview.emergentagent.com
https://quickstart-guide-6.cluster-8.preview.emergentcf.cloud
http://localhost:3000
http://localhost:5173
```

### Step 3: Add Authorized Redirect URIs
Add these URIs to the "Authorized redirect URIs" section:
```
https://quickstart-guide-6.preview.emergentagent.com
https://quickstart-guide-6.preview.emergentagent.com/
https://quickstart-guide-6.cluster-8.preview.emergentcf.cloud
https://quickstart-guide-6.cluster-8.preview.emergentcf.cloud/
http://localhost:3000
http://localhost:3000/
http://localhost:5173
http://localhost:5173/
```

**Important Notes:**
- Add both with and without trailing slashes
- Include both the .emergentagent.com and .emergentcf.cloud domains
- Include localhost URLs for local development

### Step 4: Save Changes
Click "Save" at the bottom of the page.

### Step 5: Wait (if needed)
Sometimes it takes a few minutes for Google to propagate the changes. Wait 2-3 minutes and try again.

---

## Alternative Solution: Use Different OAuth Flow

If you don't have access to the Google Cloud Console to add redirect URIs, you can create a new Google OAuth Client ID:

### Option A: Create New OAuth Client ID

1. Go to https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Select "Web application"
4. Name it "FanZFolio Dev"
5. Add Authorized JavaScript origins:
   ```
   https://quickstart-guide-6.preview.emergentagent.com
   http://localhost:3000
   ```
6. Add Authorized redirect URIs:
   ```
   https://quickstart-guide-6.preview.emergentagent.com
   http://localhost:3000
   ```
7. Click "Create"
8. Copy the new Client ID
9. Update `/app/frontend/.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID
   ```
10. Restart frontend: `sudo supervisorctl restart frontend`

---

## How @react-oauth/google Works

The `@react-oauth/google` library uses Google's One Tap and OAuth 2.0 flow:

1. **User clicks "Continue with Google"**
2. **Google opens popup** for authentication
3. **After authentication**, Google redirects back to your app with an access token
4. **The redirect URI** must be the current page URL (or the origin)

The library automatically uses `window.location.origin` as the redirect URI, which in your case is:
- `https://quickstart-guide-6.preview.emergentagent.com`

This URI **must be authorized** in Google Cloud Console.

---

## Testing After Fix

1. Clear your browser cookies/cache (or use incognito)
2. Go to: https://quickstart-guide-6.preview.emergentagent.com
3. Select role (Fan or Creator)
4. Click "Continue with Google"
5. Sign in with your Google account
6. You should be redirected back successfully

---

## Common Issues

### Issue: Still getting error after adding URIs
**Solution:** Wait 2-3 minutes for Google to propagate changes, then try in incognito mode

### Issue: "localhost:3000" works but preview domain doesn't
**Solution:** Make sure you added BOTH:
- JavaScript origin: `https://quickstart-guide-6.preview.emergentagent.com`
- Redirect URI: `https://quickstart-guide-6.preview.emergentagent.com`

### Issue: Different error "origin_mismatch"
**Solution:** Check the "Authorized JavaScript origins" section and add your domain there

---

## Current Configuration

**Client ID:** `790934983566-nj5jifujqlasmtoi2crsgm9mq3vo3h96.apps.googleusercontent.com`  
**App URL:** `https://quickstart-guide-6.preview.emergentagent.com`  
**Configured in:** `/app/frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

---

## For Production Deployment

When deploying to production (e.g., fanzfolio.com), you'll need to:

1. Add production URLs to authorized URIs:
   ```
   https://fanzfolio.com
   https://www.fanzfolio.com
   ```
2. Update `.env` if needed
3. Rebuild the frontend: `yarn build`

---

## Need Help?

If you don't have access to the Google Cloud Console project, you'll need to:
1. Get access from the project owner, OR
2. Create a new OAuth Client ID (see "Option A" above)

The error will persist until the redirect URIs are properly configured in Google Cloud Console.
