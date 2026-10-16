interface BrandChoiceProps {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function BrandChoice({ title, description, checked, onChange }: BrandChoiceProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-muted/40">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}
