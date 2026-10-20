# Ready-made template videos

The Templates page (`/templates`) offers ready-made videos of every Quranic dua and every masnoon surah part, recited by Mishary Alafasy with the Saheeh International translation. Visitors download them and post them anywhere.

## Making the videos

1. GitHub → Actions → **Template videos** → Run workflow.
2. Leave the inputs empty to render everything that is not stored yet (about 70 videos, a few hours). Or fill in:
   - `only` — `duas`, `masnoon`, a preset id such as `mulk`, or a key such as `duas/dunya-akhirah`
   - `force` — re-render videos that already exist
   - `limit` — stop after this many videos
3. Each video and its thumbnail go to the private Vercel Blob store under `templates/videos/`, and `templates/manifest.json` lists what is ready. The page shows videos as soon as they are in the manifest.

The workflow needs the `BLOB_READ_WRITE_TOKEN` secret (already used by the daily job). The Vercel project needs the same token to list and serve the videos.

## Where things live

- `src/lib/templates/videoTemplates.ts` — the list of template videos, built from `src/lib/collections/`
- `template-videos.ts` — the render script (`DRY_RUN=1` renders into `out/templates/` without uploading)
- `src/app/api/templates/videos` and `src/app/api/templates/download` — list and download routes
- `src/components/templates/` — the Templates page section and the home page Hadith & Azkar gallery
