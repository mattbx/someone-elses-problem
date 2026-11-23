// app/layout.tsx - fonts + dark-by-default
// npm i next-themes
// registry.directory itself uses next-themes with defaultTheme "system";
// here it's forced to dark first, with the light theme still available via a toggle.

import type { Metadata } from "next"
import { Schibsted_Grotesk, IBM_Plex_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
})

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
})

export const metadata: Metadata = {
  title: "Someone Else's Problem",
  description: "Names for your projects, so naming isn't your problem.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

// Their logo/wordmark style: IBM Plex Mono, 18px, weight 600, letter-spacing -0.02em
// e.g. <h1 className="font-mono text-lg font-semibold tracking-[-0.02em]">someone.else's.problem</h1>
//
// Code snippets on the site use Shiki with the "github-dark" theme (for the CLI/MCP block).
