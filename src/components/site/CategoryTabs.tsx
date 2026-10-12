import { templateCategories, type TemplateType } from '@/lib/templatePresets'
import { cn } from '@/lib/utils'

export type TemplateCategory = TemplateType | 'all'

interface CategoryTabsProps {
  active: TemplateCategory
  onChange: (category: TemplateCategory) => void
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <section className="border-b border-border/70 bg-card/70 sticky top-16 z-20 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {templateCategories.map((category) => (
          <button
            key={category.key}
            onClick={() => onChange(category.key)}
            className={cn(
              'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border',
              active === category.key
                ? 'text-primary-foreground border-transparent shadow-md [background:var(--primary-gradient)]'
                : 'bg-card/80 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-primary/5',
            )}
          >
            <span aria-hidden>{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>
    </section>
  )
}
