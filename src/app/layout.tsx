import '../index.css';
import Providers from '../components/Providers';
import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lumo: KI für Paare & Liebe – Täglich mehr Nähe & Liebe',
  description: 'Lumo übersetzt, was gemeint ist. "Nie machst du..." wird zu "Ich brauche mehr von uns." 24/7 verfügbar für 3,33 €/Monat (für beide). 7 Tage kostenlos testen.',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
    apple: [
      {
        url: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        {/* iOS Smart App Banner */}
        <meta name="apple-itunes-app" content="app-id=123456789" />
        
        {/* Android App Banner */}
        <meta name="google-play-app" content="app-id=com.lumo.app" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Meta Tags für App */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lumo" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 