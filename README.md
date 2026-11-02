# UPLIFT Website

Next.js site for UPLIFT — recycled balloon products.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build (same as Vercel)

```bash
npm run build
npm start
```

## GitHub repository

Target repo: **https://github.com/adityabahukhandi2010-a11y/landing-page**

To create the repo and push (first time only), run in PowerShell:

```powershell
cd "C:\Users\adity\OneDrive\Desktop\website uplift"
.\scripts\publish-landing-page.ps1
```

That script opens GitHub login in your browser, creates `landing-page`, and pushes `main`.

## Deploy to Vercel

### 1. Push this project to GitHub

Make sure these files are in your repo (not only on your PC):

- `pages/`, `components/`, `public/`, `hooks/`
- `package.json`, `package-lock.json`, `next.config.js`, `.gitignore`
- Do **not** commit `node_modules/` or `.next/` (`.gitignore` handles that)

Using GitHub Desktop:

1. **File → Add local repository** → select this folder.
2. Commit all changes with a message like `Fix build for Vercel`.
3. **Publish** or **Push origin** to `main`.

Using Git (after [installing Git](https://git-scm.com/download/win)):

```bash
cd "path/to/website uplift"
git init
git add .
git commit -m "Fix build for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/UPLIFT.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in (use **Continue with GitHub**).
2. Click **Add New… → Project**.
3. Select your **UPLIFT** repository → **Import**.
4. Vercel should detect **Next.js** automatically. Keep:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** (leave default)
   - **Install Command:** `npm install`
5. Click **Deploy**.

No environment variables are required for this project.

### 3. After deploy

- Vercel gives you a URL like `https://uplift-xxx.vercel.app`.
- Every push to `main` triggers a new deployment.
- In the project **Settings → Domains**, you can add a custom domain later.

### If the build fails on Vercel

1. Open the failed deployment → **Building** logs.
2. Common fixes:
   - **Duplicate code in `pages/404.js`** — file must have only **one** `export default`. Pull latest from this folder and push again.
   - **`next-intl` / missing package** — removed from this project; delete any old `global-context.js` or `locales/` on GitHub if still present.
   - **Wrong root directory** — if the repo has a subfolder, set **Root Directory** in Vercel to that folder.

## Tech stack

- Next.js 12 (Pages Router)
- React 17
- Node 18.x on Vercel

## Instagram section ("SEE THE POP.")

Built in-house (no Elfsight / no view limits, no watermark). Data comes from `/api/instagram`
(cached 10 min; the page re-checks every 5 min and when the tab is reopened).

### Full feed, no limits: Instagram API token (free)
1. Switch @upliftt.ind to a Creator or Business account (Instagram app -> Settings -> Account type; free).
2. developers.facebook.com -> create an app -> add the "Instagram API with Instagram Login" product.
3. Add the account as an Instagram tester, accept the invite in Instagram, then generate a long-lived access token.
4. Vercel -> Settings -> Environment Variables: `IG_ACCESS_TOKEN` = the token. Redeploy.
The site loads your whole feed (up to 100 posts), real follower/following/post counts, and reels play on-site.
The server asks Instagram to extend the token once a day, so it should keep itself alive as long as the site gets visits.

### Alternatives
- `BEHOLD_FEED_URL` (behold.so): no token, but the free plan caps the feed at 6 posts.
- Neither set: falls back to Instagram's public endpoint for counts (often blocked) and the thumbnails in `components/instagramPosts.js`.
