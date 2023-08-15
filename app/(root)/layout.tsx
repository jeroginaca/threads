import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from "@clerk/nextjs"

import LeftSidebar from '@/components/shared/LeftSidebar'
import RightSidebar from '@/components/shared/RightSidebar'
import Bottombar from '@/components/shared/Bottombar'
import Topbar from '@/components/shared/Topbar'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Threads",
  description: "A Next.js 13 Meta Threads Application"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
         
        <main>
          <Topbar />
          <div className='flex flex-row'>
            <LeftSidebar />
            
            <section className="main-container">
              <div className="w-full max-w-4xl">
                {children}
              </div>
            </section>

            <RightSidebar />
          </div>

          <Bottombar />
        </main>
      </body>
    </html>
    </ClerkProvider>
  )
}
