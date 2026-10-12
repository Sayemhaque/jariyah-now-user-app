import { LayoutGrid } from 'lucide-react'
import type { TemplatePreset } from '@/lib/templatePresets'
import { TemplateCard } from './TemplateCard'

interface TemplateGridProps {
  templates: TemplatePreset[]
  onSelect: (templateId: string) => void
}

export function TemplateGrid({ templates, onSelect }: TemplateGridProps) {
  return (
    <section className="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} onSelect={onSelect} />
          ))}
        </div>
        {templates.length === 0 && (
          <div className="text-center py-16">
            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-muted text-muted-foreground mx-auto mb-4">
              <LayoutGrid className="h-7 w-7" />
            </div>
            <p className="text-muted-foreground">No templates in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
