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
        <div className="bg-white border-b border-gray-200 px-3 py-2 fixed top-0 left-0 right-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
            <button
              onClick={() => setShowAppBanner(false)}
              className="text-gray-500 hover:text-gray-700 p-0.5 flex-shrink-0"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-[40px] h-[40px] rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src="/lumo_logo_upscaled.png"
                  alt="Lumo"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs text-gray-900 truncate">Lumo – Gemeinsam wachsen mit KI</h3>
                <p className="text-[10px] text-gray-600 truncate">Verbessert Kommunikation, 100 % privat.</p>
              </div>
            </div>
            <button
              onClick={handleAppDownload}
              className="bg-[#007AFF] text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-[#0051D5] transition-colors flex-shrink-0"
            >
              LADEN
            </button>
          </div>
        </div>
      )}

      <div className={`${showAppBanner ? 'pt-[48px]' : 'pt-0'} transition-all duration-300`}>
        {/* Hero-Section mit voller Viewport-Höhe */}
        <div ref={heroRef} className={`bg-white ${showAppBanner ? 'h-[calc(100vh-48px)]' : 'h-screen'} relative transition-all duration-300`}>
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
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4 text-center px-4">
                  Wachst gemeinsam. Mit KI, die euch versteht.
                </h1>
                <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6 text-center px-4">
                  Der erste KI-Coach, mit dem ihr als Paar zusammen chattet – für mehr Tiefe, mehr Verständnis, mehr Verbindung.
                </p>

                <div className="w-full px-4 md:px-0 space-y-4">
                  <button 
                    onClick={handleAppDownload}
                    className="w-full bg-gradient-to-r from-navlink to-lavender text-white py-4 px-6 rounded-xl hover:brightness-105 transition duration-200 font-semibold shadow-lg shadow-lavender/30 text-base flex items-center justify-center gap-3"
                  >
                    <Apple className="w-6 h-6" />
                    Kostenlos starten
                  </button>

                  <p className="text-center text-xs md:text-sm text-gray-600">
                    Frankfurt-Server · DSGVO-konform
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
                  <div className="text-2xl font-bold text-[#2B237C]">10+ Experten</div>
                  <div className="mt-1 text-sm text-gray-600">Psychologen & Coaches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2B237C]">1.200+ Gespräche</div>
                  <div className="mt-1 text-sm text-gray-600">Training-Datenbasis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2B237C]">€150/Std Wert</div>
                  <div className="mt-1 text-sm text-gray-600">Kostenlos für euch</div>
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
                  Chattet<br />
                  gemeinsam<br />
                  mit eurer KI
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-md mx-auto md:mx-0">
                  <span className="text-[#2B237C] font-semibold">Beide Partner im gleichen Chat.</span> Gemeinsam verstehen, gemeinsam wachsen – mit eurem persönlichen Beziehungs-Coach. Keine getrennten Chats. Keine Missverständnisse.
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
                  Echte Ziele.<br />
                  Echte<br />
                  Entwicklung.
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-md mx-auto md:mx-0">
                  <span className="text-[#2B237C] font-semibold">Keine Floskeln.</span> Konkrete Impulse, wöchentliche Reflexion und Ziele, die ihr wirklich erreicht. Mit Weekly Vibe Checks, Relationship Analysis und KI-gestützter Planung.
                </p>
              </div>
            </div>

            {/* Dritte Sektion */}
            <div className="grid md:grid-cols-2 gap-2 md:gap-12 items-center mb-12 md:mb-32">
              <div className="space-y-4 md:space-y-6 text-center md:text-left">
                <h2 className="text-2xl md:text-[52px] font-bold text-[#2B237C] leading-tight">
                  Eure Daten<br />
                  bleiben in<br />
                  Deutschland
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-md mx-auto md:mx-0">
                  <span className="text-[#2B237C] font-semibold">Frankfurt-Server (eu-central-1).</span> DSGVO-konform seit Tag 1. Vollständiger Datenexport jederzeit. Kein Tracking, keine Werbung. Eure Beziehung bleibt eure.
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

        {/* Trust & Expertise Sektion */}
        <div className="bg-gradient-to-b from-white to-[#F3E8FF]/30 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-[#2B237C] mb-4">
                10 Beziehungsexperten.<br />
                Eine KI.
              </h2>
              <p className="text-base md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                Wir haben Psychologen, Paartherapeuten und Coaches interviewt, um Lumo zu trainieren. 
                Das Ergebnis: <span className="text-[#2B237C] font-semibold">Expertise, die sonst €150/Stunde kostet – für euch zugänglich.</span>
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-[#2B237C] mb-2">10+</div>
                <div className="text-base md:text-lg font-semibold text-gray-900 mb-1">Experten-Interviews</div>
                <div className="text-sm text-gray-600">Psychologen, Therapeuten, Coaches</div>
              </div>
              
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-[#2B237C] mb-2">1.200+</div>
                <div className="text-base md:text-lg font-semibold text-gray-900 mb-1">Trainings-Gespräche</div>
                <div className="text-sm text-gray-600">Echte Paardialoge, kuratiert</div>
              </div>
              
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-[#2B237C] mb-2">€0</div>
                <div className="text-base md:text-lg font-semibold text-gray-900 mb-1">Statt €150/Stunde</div>
                <div className="text-sm text-gray-600">Therapie-Level Insights, kostenlos</div>
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
                    <Link href="/nutzungsbedingungen" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">AGBs</Link>
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