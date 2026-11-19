# Daily Quran reel auto-post

Once a day, at **10:00 Bangladesh time** (04:00 UTC), `.github/workflows/daily-reel.yml` posts one reel to Facebook, Instagram and YouTube. On Fridays the reel is Surah Al-Kahf 1–10. Instagram and YouTube get the reel with English translation; Facebook gets the same reel rendered with **Bengali translation**. The job:

1. Picks a surah. It works through a shuffled order of all 114 surahs, so no surah repeats until every surah has been posted (one cycle takes 114 days).
2. Fetches the ayats and audio, and keeps up to **10 ayats**. Short surahs go out whole. Long surahs get an excerpt that starts at a random ayat.
3. Renders a 1080×1920 MP4 with Remotion. It uses the same `AyatVideo` composition as the app, with a rotating reciter and background. Backgrounds go through all 27 scenes in a shuffled order, so one comes back only after every other scene has been used.
4. Posts it with a title, description and hashtags to every platform that has credentials set.

The reciter, background and starting ayat all come from the date and post slot. Re-running a slot's job builds the same video, and the job stores no state between runs.

Code: `src/lib/daily/` (planning), `src/lib/social/` (uploaders), `daily-reel.ts` (entry point).

## Try it first

**Actions → Daily Quran reel → Run workflow** runs the same job as the schedule and posts for real. The run summary shows the title and the result for each platform.

To check a video without posting, render it locally (needs `ffprobe` on PATH):

```bash
DRY_RUN=1 SURAH=112 npx tsx daily-reel.ts   # → out/daily-YYYY-MM-DD.mp4
```

## Secrets (Settings → Secrets and variables → Actions)

Each platform is optional. A platform with missing secrets is skipped.

### YouTube Shorts
| Secret | How to get it |
|---|---|
| `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` | In Google Cloud Console, enable **YouTube Data API v3**. Create an OAuth client of type **Web application** and add `https://developers.google.com/oauthplayground` under **Authorized redirect URIs** (a Desktop app client fails in the Playground with `redirect_uri_mismatch`). |
| `YOUTUBE_REFRESH_TOKEN` | Authorize that client once with scope `https://www.googleapis.com/auth/youtube.upload`, signed in as the channel owner. The [OAuth Playground](https://developers.google.com/oauthplayground) works: click the gear icon and choose "Use your own OAuth credentials". Copy the refresh token. |

⚠️ Until your Google Cloud project passes YouTube's **API compliance audit**, YouTube forces every video uploaded through the API to **private**. Request the audit from the YouTube API Services form. While the OAuth consent screen is in "Testing" mode, refresh tokens expire after 7 days, so publish the app to production.

### Facebook Page Reels + Instagram Reels
| Secret | How to get it |
|---|---|
| `FACEBOOK_PAGE_ID` | Your Page's numeric ID (Page → About → Page transparency). |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Create a Meta app of type Business. Grant `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `publish_video`, and for Instagram also `instagram_basic` and `instagram_content_publish`. Get a **long-lived user token**, then call `GET /me/accounts`. The Page token it returns does not expire. |
| `BLOB_READ_WRITE_TOKEN` | The Vercel Blob token the app already uses (Vercel → Project → Settings → Environment Variables). When set, the job uploads the video to Blob, gives Instagram a one-hour signed link, and deletes the file after publishing. Instagram's direct upload often fails with `ProcessingFailedError`, so this is recommended. |
| `INSTAGRAM_USER_ID` | The Instagram professional account must be linked to the Page. Get the ID from `GET /{page-id}?fields=instagram_business_account`. Instagram reuses the Page token. |

Facebook Reels must be 3–90 s long. Videos have no length limit, so a long excerpt can be rejected by Facebook while Instagram still posts it.

### TikTok
| Secret | How to get it |
|---|---|
| `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | Create an app at developers.tiktok.com and add the **Content Posting API** with the `video.publish` scope. |
| `TIKTOK_REFRESH_TOKEN` | Complete the OAuth login once as the posting account. The refresh token is valid for 365 days. If TikTok rotates it, the run summary tells you to update the secret. |

⚠️ Until TikTok audits your app, it only allows `SELF_ONLY` (private) posts. After approval, set `tiktokPrivacy` in `src/lib/daily/dailyConfig.ts` to `PUBLIC_TO_EVERYONE`.

### Other
| Secret | Purpose |
|---|---|
| `UMMAHAPI_KEY` | UmmahAPI key, if you use one |

## Image posts

Masnoon Surahs, Quranic Duas, Hadith and Azkar are posted as premium image cards (1080×1350 JPEG), not videos. A masnoon surah or dua longer than one card becomes an Instagram carousel and a Facebook multi-photo post of up to 10 slides. Hadith posts pick a short Sahih or Hasan hadith from the open Hadith API (Bukhari, Muslim, the Sunan, Muwatta, an-Nawawi), rotating collections and chapters. Card designs live in `src/cards/` and `src/lib/cards/` and rotate through 8 themes, one per post. Instagram can only fetch images from a URL, so image posts need the `BLOB_READ_WRITE_TOKEN` secret; the images are deleted right after publishing. YouTube and TikTok skip image posts.

## Timing

Claude Routines start the workflow at each post time with `slot: auto`. The run renders and publishes straight away (about 3–5 minutes for a reel, under a minute for images); it never waits. GitHub's own schedule fires at 04:00, 04:17 and 04:47 UTC and again in the next two hours as a backup, because GitHub often starts scheduled runs late or skips them. A run that starts late posts the slot it missed (up to three hours late), and the posted marker in Blob storage stops a slot from posting twice.

## Settings (`src/lib/daily/dailyConfig.ts`)

| Field | Default | Purpose |
|---|---|---|
| `reciterId` | `random` | A reciter id from `src/lib/reciters.ts`, or `random` to rotate through 7 reciters |
| `translationKey` | `sahiih_international` (English) | Translation shown under the Arabic on Instagram and YouTube |
| `facebookTranslationKey` | `bengali` | Translation of the separate Facebook render. Remove it to post the same video everywhere |
| `postTimes` | `10:00` | Bangladesh times of the daily posts. Each run works out its slot from the time it starts, so every post gets its own surah, reciter and background. Keep the `cron` lines in the workflow in sync |
| `coverAtMs` | `2500` | Moment of the video Instagram uses as the cover (`thumb_offset`), after the title and first ayah have appeared |
| `contentRotation` | `quran`, `masnoon`, `hadith`, `duas`, `azkar` | Content types to rotate through, one per post. `quran` is a reel; the others are image posts built from `src/lib/collections/` |
| `textLanguage` | `english` | Language of hadith and azkar cards: `english` or `bangla` |
| `maxAyats` | `10` | Most ayat in one video. There is no length limit |
| `extraHashtags` | `JariyahNow`, `Quran` | Hashtags added to every post |
| `platforms` | `instagram`, `facebook`, `youtube` | Platforms to post to: `youtube`, `facebook`, `instagram`, `tiktok`. Ones without secrets are skipped |
| `youtubePrivacy` | `public` | `public`, `unlisted` or `private` |
| `tiktokPrivacy` | `SELF_ONLY` | `PUBLIC_TO_EVERYONE` after TikTok approves the app |

## Notes

- GitHub runs scheduled workflows only from the **default branch**. A schedule can also start a few minutes late when GitHub is busy.
- In a public repo, GitHub disables scheduled workflows after 60 days without repository activity. Re-enable it from the Actions tab.
- If one platform fails, the job still posts to the others, then marks the run as failed. GitHub emails you, and the summary shows which platform failed.
- Re-running a successful day's job posts the same video again.
