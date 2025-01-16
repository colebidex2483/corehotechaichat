import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import { ToasterProvider } from '@/components/toaster-provider'
import { ModalProvider } from '@/components/modal-provider'
import 'react-loading-skeleton/dist/skeleton.css'
// import { CrispProvider } from '@/components/crisp-provider'

import './globals.css'
import Providers from '@/components/Providers'

const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CorehotechAI',
  description: 'AI Platform',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        {/* <CrispProvider /> */}
        <Providers>
        <body className={font.className}>
          <ToasterProvider />
          <ModalProvider />
          {children}
        </body>
        </Providers>
       
      </html>
    </ClerkProvider>
  )
}
