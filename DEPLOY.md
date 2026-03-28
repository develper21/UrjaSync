# UrjaSync Production Deployment Guide

## 1. Backend Deploy (Render)

### Step 1: Create MongoDB Atlas Database
1. Jaa [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up / Login
3. Create new cluster (FREE tier available)
4. Network Access → Add IP: `0.0.0.0/0` (allow all for Render)
5. Database Access → Create user
6. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/urjasync`

### Step 2: Deploy on Render
1. Jaa [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo
4. Select the `server/render.yaml` file
5. Environment variables set karo:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `CLIENT_URL`: Netlify URL (pehle placeholder, baad mein update)
6. Deploy!

**Your backend URL**: `https://urjasync-backend.onrender.com`

---

## 2. Frontend Deploy (Netlify)

### Method 1: Drag & Drop (Easiest)
1. Build locally:
   ```bash
   npm run build
   ```
2. Jaa [Netlify Drop](https://app.netlify.com/drop)
3. Drag `dist/` folder
4. Done!

### Method 2: Git Integration (Recommended)
1. Jaa [Netlify](https://app.netlify.com)
2. **"Add new site"** → **"Import from GitHub"**
3. Select repo
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment variables:
   - `VITE_API_URL`: Your Render backend URL
6. Deploy!

---

## 3. Environment Variables

### Backend (Render Dashboard)
| Variable | Value Example |
|----------|---------------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render sets this) |
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | Auto-generated or set manually |
| `JWT_REFRESH_SECRET` | Auto-generated or set manually |
| `CLIENT_URL` | `https://urjasync.netlify.app` |

### Frontend (Netlify Dashboard → Site Settings → Environment Variables)
| Variable | Value Example |
|----------|---------------|
| `VITE_API_URL` | `https://urjasync-backend.onrender.com/api` |

---

## 4. Post-Deploy Steps

1. **Update CORS**: Backend ke `CLIENT_URL` mein Netlify URL daal
2. **Update Frontend API calls**: `VITE_API_URL` environment variable check karo
3. **Test**: `/health` endpoint check karo

---

## 5. Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB connection fail | Check IP whitelist & connection string |
| CORS errors | Update `CLIENT_URL` in Render env vars |
| 404 on refresh | `netlify.toml` redirects check karo |
| WebSocket fail | Socket.io CORS origin update karo |
