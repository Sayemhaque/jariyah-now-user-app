import { BookOpen, ListTree } from 'lucide-react'
import { SelectItem } from '@/components/ui/select'
import { FieldLabel } from '@/components/selection/FieldLabel'
import { PickerSelect } from '@/components/selection/PickerSelect'
import { hadithBooks } from '@/lib/hadith/hadithBooks'
import { findHadithBook } from '@/lib/hadith/hadithApi'
import { chapterTitle } from '@/lib/hadith/hadithText'

interface HadithBookPickerProps {
  book: string
  section: number
  onBook: (book: string, section: number) => void
  onSection: (section: number) => void
}

export function HadithBookPicker({ book, section, onBook, onSection }: HadithBookPickerProps) {
  const sections = findHadithBook(book)?.sections ?? []
  return (
    <div className="space-y-2.5">
      <div className="space-y-1.5">
        <FieldLabel icon={BookOpen}>Collection</FieldLabel>
        <PickerSelect value={book} onChange={(key) => onBook(key, findHadithBook(key)!.sections[0]![0])} placeholder="Choose a collection">
          {hadithBooks.map((b) => (
            <SelectItem key={b.key} value={b.key}>{b.name}</SelectItem>
          ))}
        </PickerSelect>
      </div>
      <div className="space-y-1.5">
        <FieldLabel icon={ListTree}>Chapter</FieldLabel>
        <PickerSelect value={String(section)} onChange={(v) => onSection(Number(v))} placeholder="Choose a chapter" contentClassName="max-h-80">
          {sections.map(([number, name, first, last]) => (
            <SelectItem key={number} value={String(number)}>
              {number}. {chapterTitle(name)} <span className="text-muted-foreground">({last - first + 1})</span>
            </SelectItem>
          ))}
        </PickerSelect>
      </div>
    </div>
  )
}
