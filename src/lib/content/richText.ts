export type RichToken =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'arabic'; value: string }
  | { kind: 'muted'; value: string }
  | { kind: 'break' }
  | { kind: 'link'; value: string; href: string }

export type ContentBlock =
  | { kind: 'p' | 'h2' | 'h3' | 'note'; text: string }
  | { kind: 'ul'; items: string[] }

const tokenPattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\{\{[^}]+\}\}|\^\^[^^]+\^\^|\n)/

export function parseRichText(text: string): RichToken[] {
  return text
    .split(tokenPattern)
    .filter((part) => part !== '')
    .map((part): RichToken => {
      if (part === '\n') return { kind: 'break' }
      if (part.startsWith('**')) return { kind: 'bold', value: part.slice(2, -2) }
      if (part.startsWith('{{')) return { kind: 'arabic', value: part.slice(2, -2) }
      if (part.startsWith('^^')) return { kind: 'muted', value: part.slice(2, -2) }
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) return { kind: 'link', value: link[1]!, href: link[2]! }
      return { kind: 'text', value: part }
    })
}
