import { BookOpen, ListTree } from 'lucide-react'
import { SelectItem } from '@/components/ui/select'
import { FieldLabel } from '@/components/selection/FieldLabel'
import { PickerSelect } from '@/components/selection/PickerSelect'
import { hadithBooks } from '@/lib/hadith/hadithBooks'
import { findHadithBook } from '@/lib/hadith/hadithApi'
import { chapterTitle } from '@/lib/hadith/hadithText'
import { banglaBookNames, bnDigits } from '@/lib/cards/bangla'

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
        <FieldLabel icon={BookOpen}>হাদিস গ্রন্থ</FieldLabel>
        <PickerSelect value={book} onChange={(key) => onBook(key, findHadithBook(key)!.sections[0]![0])} placeholder="গ্রন্থ বেছে নিন">
          {hadithBooks.map((b) => (
            <SelectItem key={b.key} value={b.key}>{banglaBookNames[b.key] ?? b.name} <span className="text-muted-foreground">· {b.name}</span></SelectItem>
          ))}
        </PickerSelect>
      </div>
      <div className="space-y-1.5">
        <FieldLabel icon={ListTree}>অধ্যায়</FieldLabel>
        <PickerSelect value={String(section)} onChange={(v) => onSection(Number(v))} placeholder="অধ্যায় বেছে নিন" contentClassName="max-h-80">
          {sections.map(([number, name, first, last]) => (
            <SelectItem key={number} value={String(number)}>
              {bnDigits(number)}. {chapterTitle(name)} <span className="text-muted-foreground">({bnDigits(last - first + 1)}টি)</span>
            </SelectItem>
          ))}
        </PickerSelect>
      </div>
    </div>
  )
}
