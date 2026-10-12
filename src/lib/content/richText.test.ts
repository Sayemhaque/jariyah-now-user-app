import { describe, it, expect } from 'vitest'
import { parseRichText } from './richText'

describe('parseRichText', () => {
  it('returns plain text unchanged', () => {
    expect(parseRichText('hello world')).toEqual([{ kind: 'text', value: 'hello world' }])
  })

  it('parses bold, links, arabic, muted and line breaks', () => {
    expect(parseRichText('a **b** [c](https://x.com) {{د}}\n^^e^^')).toEqual([
      { kind: 'text', value: 'a ' },
      { kind: 'bold', value: 'b' },
      { kind: 'text', value: ' ' },
      { kind: 'link', value: 'c', href: 'https://x.com' },
      { kind: 'text', value: ' ' },
      { kind: 'arabic', value: 'د' },
      { kind: 'break' },
      { kind: 'muted', value: 'e' },
    ])
  })
})
