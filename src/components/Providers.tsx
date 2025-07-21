'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from '../lib/languageContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
} 