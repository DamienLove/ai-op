import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

// Removed incorrect function calls for Geist fonts.
// const geistSans = GeistSans({ ... }); was incorrect.
// const geistMono = GeistMono({ ... }); was incorrect.

export const metadata: Metadata = {
  title: 'Remote AI Assistant', // Updated title
  description: 'AI-powered remote computer operation', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply font variables directly to the html tag
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      {/* Apply base font style to body */}
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
