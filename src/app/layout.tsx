import './globals.css'
import { rootMetadata } from '@/lib/content/site'
import { siteFontVariables } from '@/lib/siteFonts'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/Providers'

export const metadata = rootMetadata

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${siteFontVariables} antialiased bg-background text-foreground`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
