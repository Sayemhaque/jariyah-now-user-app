import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import { join } from 'node:path'
import { backgroundScenes } from '@/lib/backgroundPresets'

async function main() {
  const outDir = join(process.cwd(), 'public/scene-previews')
  const serveUrl = await bundle({
    entryPoint: join(process.cwd(), 'src/remotion/Root.tsx'),
    webpackOverride: (config) => ({ ...config, resolve: { ...config.resolve, alias: { ...(config.resolve?.alias as object), '@': join(process.cwd(), 'src') } } }),
  })
  const browserExecutable = process.env.BROWSER_EXECUTABLE || null
  for (const scene of backgroundScenes) {
    const inputProps = { sceneKey: scene.key }
    const composition = await selectComposition({ serveUrl, id: 'ScenePreview', inputProps, browserExecutable })
    await renderStill({ composition, serveUrl, inputProps, frame: 60, output: join(outDir, `${scene.key}.jpg`), imageFormat: 'jpeg', jpegQuality: 82, browserExecutable })
    console.log('thumb', scene.key)
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
