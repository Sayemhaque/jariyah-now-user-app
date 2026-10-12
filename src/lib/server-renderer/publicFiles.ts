import { existsSync } from 'node:fs'
import { join, normalize, sep } from 'node:path'

const publicDir = join(process.cwd(), 'public')

export function resolvePublicFile(url: string): string | null {
  const candidate = normalize(join(publicDir, url))
  if (!candidate.startsWith(publicDir + sep)) return null
  return existsSync(candidate) ? candidate : null
}
