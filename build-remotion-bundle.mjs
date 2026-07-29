import { bundle } from '@remotion/bundler'
import path from 'node:path'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'

async function main() {
  const entryPoint = path.join(process.cwd(), 'src/remotion/Root.tsx')
  const outDir = path.join(process.cwd(), '.next/remotion-bundle')

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true })
  }

  console.log(`Bundling Remotion project from ${entryPoint}...`)
  console.log(`Output: ${outDir}`)

  const serveUrl = await bundle({
    entryPoint,
    outDir,
    webpackOverride: (config) => {
      config.resolve = config.resolve ?? {}
      config.resolve.alias = {
        ...(config.resolve.alias),
        '@': path.resolve(process.cwd(), 'src'),
      }
      return config
    },
  })

  const bundleInfo = JSON.stringify({ serveUrl }, null, 2)
  writeFileSync(path.join(outDir, 'bundle-info.json'), bundleInfo)
  console.log(`Bundle complete: ${serveUrl}`)
  console.log(`Bundle info written to ${outDir}/bundle-info.json`)
}

main().catch((err) => {
  console.error('Bundle failed:', err)
  process.exit(1)
})
