import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"

import "../globals.css" // importamos la hoja de estilos.

export const metadata = {
    title: "Threads",
    description: "A Next.js 13 Meta Threads Application"
}

const inter = Inter({ subsets: ["latin"]})

export default function RootLayout({ children }: { children: React.ReactNode }){
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${inter.className} bg-dark-1`}> 
                    <main className="w-full flex justify-center items-center min-h-screen">
                        {children}
                    </main>
                </body>
            </html>
        </ClerkProvider>
    )
}