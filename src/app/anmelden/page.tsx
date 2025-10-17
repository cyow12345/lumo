'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Redirect zur Hauptseite, die jetzt den App-Download zeigt
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#332d6e] mx-auto"></div>
        <p className="mt-4 text-gray-600">Weiterleitung...</p>
      </div>
    </div>
  );
} 