import '../index.css';
import Providers from '../components/Providers';
import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lumo - Dein persönlicher KI-Coach für Beziehungen',
  description: 'Dein persönlicher KI-Coach für Beziehungen und Wohlbefinden',
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
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 