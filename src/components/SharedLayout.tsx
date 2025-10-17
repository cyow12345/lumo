'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OnboardingFlow from './OnboardingFlow';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender/5 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-24">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/">
                  <div className="relative w-[100px] md:w-[179px] h-[28px] md:h-[42px] flex items-center justify-center">
                    <Image
                      src="/Lumo_eule.png"
                      alt="Lumo Logo"
                      width={179}
                      height={42}
                      className="transform hover:scale-105 transition-transform duration-200"
                      priority
                    />
                  </div>
                </Link>
              </div>
            </div>

            {/* Navigation Buttons (Mobile & Desktop) */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link 
                href="/anmelden"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium bg-gray-50 md:bg-transparent px-3 md:px-0 py-1.5 md:py-0 rounded-lg md:rounded-none text-sm md:text-base"
              >
                Anmelden
              </Link>
              <button 
                onClick={() => setShowOnboarding(true)}
                className="bg-[#332d6e] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-sm md:text-base hover:bg-[#2a2558] transition-colors font-medium"
              >
                Anfangen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with padding-top for fixed header */}
      <div className="pt-16 md:pt-24">
        {children}
      </div>

      {/* Footer */}
      <footer className="bg-[#332d6e] text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {/* Über uns */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-base md:text-lg mb-6">Über uns</h3>
              <ul className="space-y-4 text-center md:text-left">
                <li>
                  <Link href="/mission" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Mission</Link>
                </li>
                <li>
                  <Link href="/karriere" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Karriere</Link>
                </li>
                <li>
                  <Link href="/kontakt" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Kontakt</Link>
                </li>
              </ul>
            </div>

            {/* Sozial */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-base md:text-lg mb-6">Sozial</h3>
              <ul className="space-y-4 text-center md:text-left">
                <li>
                  <a href="https://tiktok.com/@lumo" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">TikTok</a>
                </li>
                <li>
                  <a href="https://twitter.com/lumo" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Twitter</a>
                </li>
                <li>
                  <a href="https://instagram.com/lumo" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Instagram</a>
                </li>
              </ul>
            </div>

            {/* Rechtliches */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-base md:text-lg mb-6">Rechtliches</h3>
              <ul className="space-y-4 text-center md:text-left">
                <li>
                  <Link href="/nutzungsbedingungen" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Nutzungsbedingungen</Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Datenschutz</Link>
                </li>
                <li>
                  <Link href="/impressum" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Impressum</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={(userData) => {
            console.log('Onboarding completed:', userData);
            setShowOnboarding(false);
          }}
          onCancel={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
} 