# Refactoring prompt — Next.js + React

Use this prompt when asking an AI agent (or a teammate) to refactor code in this repo.

---

You are refactoring a Next.js 16 (App Router) + React 19 + TypeScript codebase. Make the code simpler and easier to read **without changing what the app does or how it looks**. Every page, video render, and API response must behave exactly as before.

## Rules

1. **Naming: camelCase for every variable, constant, function, parameter, prop and hook.**
   - Write `maxAyatsPerVideo`, `bgPresets`, `fps` — never `MAX_AYATS_PER_VIDEO`, `BG_PRESETS`, `FPS`.
   - The only identifiers that start with a capital letter are React components (`VideoPreview`), types/interfaces (`AyatSlide`), and classes. React requires component names to be capitalized, so this is not optional.
   - Leave names you don't own unchanged: environment variable names (`process.env.UMMAHAPI_BASE_URL`), external API fields (`reciter_id`, `upload_url`), CSS class names, and HTTP headers.
   - Do not rename files.

2. **No comments.** Remove every comment: `//`, `/* */`, JSDoc, and JSX `{/* */}`. Make the code explain itself with clear names and small functions instead.

3. **One component per file.** A `.tsx` file exports exactly one component. Do not define helper components inside another component's file. Move them to their own file.

4. **Components stay under 60–70 lines.** If a component grows past that:
   - move state and effects into a custom hook (`useExportRender`, `useSurahSearch`) in its own file,
   - move pure logic (formatting, calculations, data mapping) into `src/lib/`,
   - split repeated or self-contained JSX into a child component.

5. **Reuse instead of repeating.** When the same JSX shape shows up more than once (a labelled slider, a feature card, a legal-page section, a settings row), build one generic component that takes props and use it everywhere. Never copy-paste a component and tweak it. Before creating a component, search for an existing one that already does the job.

6. **Data over markup.** Lists of similar items (features, FAQ entries, presets, legal sections) live in a data array and render through `.map()` with one reusable component.

7. **Keep behaviour identical.**
   - Do not change public API routes, store shape, Remotion composition props, or test expectations.
   - Keep `"use client"` where it is needed.
   - Keep imports through the `@/` alias.

8. **Leave generated code alone.** Do not touch the shadcn/ui primitives in `src/components/ui/`.

## Before you finish

Run everything the CI runs and make sure it is clean:

```bash
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
```

Then open the main pages (`/`, `/app`, `/templates`, `/about`, `/privacy`, `/terms`) and check they look the same as before.
