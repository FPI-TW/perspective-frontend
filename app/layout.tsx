import type { Metadata } from "next"
import { Fraunces, Space_Grotesk } from "next/font/google"
import type { ReactNode } from "react"
import "./globals.css"
import AppProviders from "./providers"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Analyst Viewpoints",
  description: "Internal dashboard for analyst viewpoints across markets.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${fraunces.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
