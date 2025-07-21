'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PasswordReset() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier kommt später die Passwort-Reset Logik
    console.log('Reset password for:', email);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 py-6">
            <Link href="/" className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative w-[179px] h-[42px] flex items-center justify-center">
                  <Image
                    src="/Lumo_eule.png"
                    alt="Lumo Logo"
                    width={179}
                    height={42}
                    className="transform hover:scale-105 transition-transform duration-200"
                    priority
                  />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Passwort vergessen
          </h1>
          <p className="text-gray-600">
            Wir senden dir eine E-Mail mit Anweisungen, wie du dein Passwort zurücksetzen kannst.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-Mail-Adresse angeben
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#332d6e] focus:border-transparent"
              placeholder="deine@email.de"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#332d6e] text-white py-3 px-4 rounded-xl hover:bg-[#2a2558] transition-colors font-medium"
          >
            Senden
          </button>

          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-[#332d6e] hover:text-[#2a2558] transition-colors">
              Zurück zur Startseite
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 