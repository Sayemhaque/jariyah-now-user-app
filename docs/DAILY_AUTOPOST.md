# Daily Quran reel auto-post

Every day at **22:00 Bangladesh time** (16:00 UTC), `.github/workflows/daily-reel.yml`:

1. Picks a surah. It works through a shuffled order of all 114 surahs, so no surah repeats until every surah has been posted (one cycle takes 114 days).
2. Fetches the ayats and audio, and keeps as many ayats as fit in **85 s**. Short surahs go out whole. Long surahs get an excerpt that starts at a random ayat.
3. Renders a 1080×1920 MP4 with Remotion. It uses the same `AyatVideo` composition as the app, with a rotating reciter and video background.
4. Posts it with a title, description and hashtags to every platform that has credentials set.

The reciter, background and starting ayat all come from the date. Re-running a day's job builds the same video, and the job stores no state between runs.

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
| `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` | In Google Cloud Console, enable **YouTube Data API v3**. Create an OAuth client of type **Desktop app**. |
| `YOUTUBE_REFRESH_TOKEN` | Authorize that client once with scope `https://www.googleapis.com/auth/youtube.upload`, signed in as the channel owner. The [OAuth Playground](https://developers.google.com/oauthplayground) works: click the gear icon and choose "Use your own OAuth credentials". Copy the refresh token. |

⚠️ Until your Google Cloud project passes YouTube's **API compliance audit**, YouTube forces every video uploaded through the API to **private**. Request the audit from the YouTube API Services form. While the OAuth consent screen is in "Testing" mode, refresh tokens expire after 7 days, so publish the app to production.

### Facebook Page Reels + Instagram Reels
| Secret | How to get it |
|---|---|
| `FACEBOOK_PAGE_ID` | Your Page's numeric ID (Page → About → Page transparency). |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Create a Meta app of type Business. Grant `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `publish_video`, and for Instagram also `instagram_basic` and `instagram_content_publish`. Get a **long-lived user token**, then call `GET /me/accounts`. The Page token it returns does not expire. |
| `INSTAGRAM_USER_ID` | The Instagram professional account must be linked to the Page. Get the ID from `GET /{page-id}?fields=instagram_business_account`. Instagram reuses the Page token. |

Facebook Reels must be 3–90 s long, which is why the job keeps videos at 85 s or less.

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

## Settings (`src/lib/daily/dailyConfig.ts`)

| Field | Default | Purpose |
|---|---|---|
| `reciterId` | `random` | A reciter id from `src/lib/reciters.ts`, or `random` to rotate through 7 reciters |
| `translationKey` | `bengali` | Translation shown under the Arabic |
| `maxDurationSec` | `85` | Longest video length |
| `extraHashtags` | `JariyahNow`, `Quran` | Hashtags added to every post |
| `platforms` | all four | Platforms to post to; ones without secrets are skipped |
| `youtubePrivacy` | `public` | `public`, `unlisted` or `private` |
| `tiktokPrivacy` | `SELF_ONLY` | `PUBLIC_TO_EVERYONE` after TikTok approves the app |

## Notes

- GitHub runs scheduled workflows only from the **default branch**. A schedule can also start a few minutes late when GitHub is busy.
- In a public repo, GitHub disables scheduled workflows after 60 days without repository activity. Re-enable it from the Actions tab.
- If one platform fails, the job still posts to the others, then marks the run as failed. GitHub emails you, and the summary shows which platform failed.
- Re-running a successful day's job posts the same video again.
