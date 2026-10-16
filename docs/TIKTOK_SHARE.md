# Post to TikTok from the website

After an export finishes, the Done panel shows **Post to TikTok**. The flow uses TikTok **Login Kit** and the **Content Posting API** (Direct Post, `PULL_FROM_URL`).

1. **Continue with TikTok** opens `/api/tiktok/login` in a popup. TikTok asks the user to allow `user.info.basic` and `video.publish`.
2. `/api/tiktok/callback` swaps the code for an access token and stores it in an encrypted, http-only cookie. The popup tells the page it is connected and closes.
3. The post screen loads `/api/tiktok/creator` (creator info) and shows what TikTok's sharing guidelines require: the creator's name, a video preview, an editable caption, a privacy choice with no default, Comment / Duet / Stitch switches that start off, commercial content disclosure, and the Music Usage Confirmation (plus Branded Content Policy when it applies).
4. **Post to TikTok** calls `/api/tiktok/post`. The server checks the choices against creator info again, then asks TikTok to pull the video from `/api/render/download?jobId=…`. The screen polls `/api/tiktok/status` and tells the user TikTok may take a few minutes to process it.

Code: `src/lib/tiktok/` (rules, API client, session cookie), `src/app/api/tiktok/`, `src/components/tiktok/`, `src/hooks/useTikTokConnection.ts`, `src/hooks/useTikTokPost.ts`.

## Setup

**TikTok Developer Portal**
- Products: **Login Kit** and **Content Posting API** only, with Direct Post turned on.
- Scopes: `user.info.basic` and `video.publish` only.
- Login Kit redirect URI: `https://jariyahnow.vercel.app/api/tiktok/callback`
- Content Posting API → verified URL prefix: `https://jariyahnow.vercel.app/`
- Sandbox: add your TikTok account as a target user.

**Vercel environment variables**

| Name | Value |
|---|---|
| `TIKTOK_CLIENT_KEY` | Client key (sandbox key while recording the demo) |
| `TIKTOK_CLIENT_SECRET` | Client secret |
| `TIKTOK_REDIRECT_URI` | `https://jariyahnow.vercel.app/api/tiktok/callback` |
| `TIKTOK_MEDIA_ORIGIN` | `https://jariyahnow.vercel.app` (must match the verified URL prefix) |

Redeploy after adding them.

## Demo video for review

Record the screen at `https://jariyahnow.vercel.app`:
1. Open the site, go to the app, pick a surah, load the ayats and export the video.
2. Click **Post to TikTok** → **Continue with TikTok**, log in, and approve both scopes.
3. Show your name on the post screen, edit the caption, choose a privacy option, turn a switch on, and open the commercial disclosure to show both choices and the label.
4. Click **Post to TikTok** and wait for the confirmation.
5. Open TikTok and show the posted video.

Unaudited apps can only post with privacy **Only me** (`SELF_ONLY`); choose that while recording in the sandbox.

Each push to this branch also gets a Vercel preview deployment. Record the review demo on `https://jariyahnow.vercel.app` (the verified domain), not on a preview URL.
