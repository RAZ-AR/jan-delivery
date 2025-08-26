# 🚀 Render.com Deployment Instructions

## 🔑 Add OpenRouteService API Key to Production

### Step 1: Access Render Dashboard
1. Go to https://dashboard.render.com
2. Log in to your account
3. Select the **jan-delivery** service (production)

### Step 2: Add Environment Variable
1. Click on **Environment** tab
2. Click **Add Environment Variable**
3. Add:
   - **Key**: `OPENROUTE_API_KEY`
   - **Value**: `eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjM2MGYxZjNhODhjNjRlNDI5MzkxY2VhNjBiMjcxNTE0IiwiaCI6Im11cm11cjY0In0=`

### Step 3: Redeploy
1. Service will automatically redeploy
2. Wait for deployment to complete

## 🧪 Test Production API Key

After deployment, test the geocoding endpoints:

```bash
# Test address search
curl "https://jan-delivery.onrender.com/api/geocode/search?q=Belgrade"

# Test reverse geocoding
curl -X POST "https://jan-delivery.onrender.com/api/geocode/reverse" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 44.7866, "longitude": 20.4489}'
```

Expected response format:
```json
{
  "success": true,
  "data": [
    {
      "id": "node/7893807050",
      "text": "Galerija Belgrade, Belgrade, BG, Serbia",
      "address": "Galerija Belgrade",
      "coordinates": {
        "longitude": 20.444763,
        "latitude": 44.801274
      }
    }
  ]
}
```

## ⚠️ Important Notes

- Production backend currently runs on `main` branch
- New geocoding endpoints are available only in `develop` branch
- Need to merge `develop` → `main` after adding API key
- Staging environment needs to be set up separately

## 🔄 Next Steps

1. ✅ Add API key to production environment  
2. 🔄 Merge develop → main to get new endpoints
3. 🔄 Set up staging environment
4. 🔄 Test both environments