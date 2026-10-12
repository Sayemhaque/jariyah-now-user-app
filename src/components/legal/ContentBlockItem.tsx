import type { ContentBlock } from '@/lib/content/richText'
import { RichText } from './RichText'

export function ContentBlockItem({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'ul':
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )
    case 'h2':
      return <h2><RichText text={block.text} /></h2>
    case 'h3':
      return <h3><RichText text={block.text} /></h3>
    case 'note':
      return <p className="text-xs text-muted-foreground mt-8"><RichText text={block.text} /></p>
    default:
      return <p><RichText text={block.text} /></p>
  }
}
