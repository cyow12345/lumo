'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Apple } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [showHeaderCTA, setShowHeaderCTA] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [showAppBanner, setShowAppBanner] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const isHeroOutOfView = heroRect.bottom < 0;
        setShowHeaderCTA(isHeroOutOfView);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAppDownload = () => {
    // iOS App Store Link (wenn verfügbar)
    const appStoreUrl = 'https://apps.apple.com/de/app/lumo/id123456789'; // Ersetze mit echter App Store ID
    window.open(appStoreUrl, '_blank');
  };

  const renderHeaderCTA = () => (
    <div className="flex items-center">
      {/* Button - erscheint wenn gescrollt */}
      {showHeaderCTA && (
        <button
          onClick={handleAppDownload}
          className="bg-[#332d6e] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#2a2558] transition-colors flex items-center gap-2"
        >
          <Apple className="w-4 h-4" />
          App Laden
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender/5 to-white">
      {/* Smart App Banner */}
      {showAppBanner && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowAppBanner(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 flex-1 mx-4">
              <div className="w-[50px] h-[50px] rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src="/lumo_logo_upscaled.png"
                  alt="Lumo"
                  width={50}
                  height={50}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 truncate">Lumo - Beziehungs-Coach</h3>
                <p className="text-xs text-gray-600 truncate">Relationship, KI-Coaching & Mehr</p>
              </div>
            </div>
            <button
              onClick={handleAppDownload}
              className="bg-[#007AFF] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#0051D5] transition-colors flex-shrink-0"
            >
              LADEN
            </button>
          </div>
        </div>
      )}

      <div className={`${showAppBanner ? 'pt-[60px]' : 'pt-0'} transition-all duration-300`}>
        {/* Hero-Section mit voller Viewport-Höhe */}
        <div ref={heroRef} className={`bg-white ${showAppBanner ? 'h-[calc(100vh-60px)]' : 'h-screen'} relative transition-all duration-300`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="grid md:grid-cols-2 gap-6 md:gap-6 items-center justify-items-center w-full -mt-12 md:-mt-36">
              <div className="flex justify-center order-1 md:order-1">
                <Image
                  src="/lumo_logo.png"
                  alt="Lumo Logo"
                  width={500}
                  height={500}
                  priority
                  className="w-[220px] h-[220px] md:w-[420px] md:h-[420px]"
                />
              </div>

              <div className="flex flex-col items-center max-w-sm order-2 md:order-2">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center px-4">
                  Effektiv und kostenlos deine Beziehung stärken – mit KI-Coaching!
                </h1>

                <div className="w-full px-4 md:px-0 space-y-4">
                  <button 
                    onClick={handleAppDownload}
                    className="w-full bg-gradient-to-r from-navlink to-lavender text-white py-4 px-6 rounded-xl hover:brightness-105 transition duration-200 font-semibold shadow-lg shadow-lavender/30 text-base flex items-center justify-center gap-3"
                  >
                    <Apple className="w-6 h-6" />
                    Jetzt im App Store laden
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Verfügbar für iOS · Kostenlos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistik-Sektion am unteren Rand des Viewports - ausgeblendet auf Mobilgeräten */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0 bg-white py-6 border-y border-gray-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#4b4b4b]">94%</div>
                  <div className="mt-1 text-sm text-[#4b4b4b]">Zufriedene Paare</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#4b4b4b]">15 Min</div>
                  <div className="mt-1 text-sm text-[#4b4b4b]">Tägliche Gespräche</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#4b4b4b]">Kostenlos</div>
                  <div className="mt-1 text-sm text-[#4b4b4b]">Aktuell</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Erste Sektion */}
        <div className="bg-white pt-0 pb-8 md:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-2 md:gap-12 items-center mb-20 md:mb-32">
              <div className="space-y-4 md:space-y-6 text-center md:text-left">
                <h2 className="text-2xl md:text-[52px] font-bold text-[#2B237C] leading-tight">
                  KI-gestützt.<br />
                  Intelligent.<br />
                  Intuitiv.
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-md mx-auto md:mx-0">
                  Mit seiner <span className="text-[#2B237C] font-semibold">feinen KI-Nase</span> erkennt Lumo eure Gefühle und Muster. Unser kluges Köpfchen denkt mit und unterstützt euch dabei, eure Beziehung noch stärker zu machen.
                </p>
              </div>
              <div className="relative -mt-2 md:mt-0">
                <div className="relative w-full aspect-square max-w-[260px] md:max-w-[420px] mx-auto">
                  <Image
                    src="/lumo_mitpaar.png"
                    alt="Lumo sitzt mit einem Paar zusammen"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Zweite Sektion */}
            <div className="grid md:grid-cols-2 gap-2 md:gap-12 items-center mb-20 md:mb-32">
              <div className="relative order-2 md:order-1 -mt-2 md:mt-0">
                <div className="relative w-full aspect-square max-w-[260px] md:max-w-[420px] mx-auto">
                  <Image
                    src="/lumo_show.png"
                    alt="Lumo zeigt Präsentation"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="space-y-4 md:space-y-6 text-center md:text-left order-1 md:order-2">
                <h2 className="text-2xl md:text-[52px] font-bold text-[#2B237C] leading-tight">
                  Persönlich.<br />
                  Liebevoll.<br />
                  Passend.
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-md mx-auto md:mx-0">
                  <span className="text-[#2B237C] font-semibold">Lumo kennt euch</span> und eure einzigartige Beziehung. Er gibt euch liebevolle Tipps, die genau zu euch passen und hilft euch dabei, eure Verbindung zu stärken.
                </p>
              </div>
            </div>

            {/* Dritte Sektion */}
            <div className="grid md:grid-cols-2 gap-2 md:gap-12 items-center mb-12 md:mb-32">
              <div className="space-y-4 md:space-y-6 text-center md:text-left">
                <h2 className="text-2xl md:text-[52px] font-bold text-[#2B237C] leading-tight">
                  Kuschelig.<br />
                  Sanft.<br />
                  Herzlich.
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-md mx-auto md:mx-0">
                  <span className="text-[#2B237C] font-semibold">Präventiver Ansatz</span> - Sanft und mit viel Herz zeigt Lumo euch, wo's hakt. Dabei bleibt er immer kuschelig statt kritisch.
                </p>
              </div>
              <div className="relative -mt-2 md:mt-0">
                <div className="relative w-full aspect-square max-w-[260px] md:max-w-[420px] mx-auto">
                  <Image
                    src="/lumo_heart.png"
                    alt="Lumo hält ein Herz"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
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
      </div>
    </div>
  );
} 