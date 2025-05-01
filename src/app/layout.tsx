import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans'; // Corrected import source
import { GeistMono } from 'geist/font/mono'; // Corrected import source
import './globals.css';
import { Toaster } from "@/components/ui/toaster" // Added import

const geistSans = GeistSans({ // Use GeistSans directly
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({ // Use GeistMono directly
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}> {/* Added font-sans */}
        {children}
        <Toaster /> {/* Added Toaster */}
      </body>
    </html>
  );
}
