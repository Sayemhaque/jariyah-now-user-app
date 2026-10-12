import { appFontVariables } from '@/lib/appFonts'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className={appFontVariables}>{children}</div>
}
