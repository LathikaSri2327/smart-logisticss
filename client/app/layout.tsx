'use client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Smart Logistics & Shipment Tracking</title>
        <meta name="description" content="Enterprise logistics and shipment management platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})()`
        }} />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            duration: 4000,
            style: { borderRadius: '10px', fontSize: '14px' },
          }} />
        </AuthProvider>
      </body>
    </html>
  );
}
