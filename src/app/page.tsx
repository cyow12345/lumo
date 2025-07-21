'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Brain, Heart, Shield, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';
import Link from 'next/link';
import OnboardingFlow from '../components/OnboardingFlow';
import { supabase } from '../lib/supabaseClient';
import App from '../App';

export default function Home() {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<any>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showHeaderCTA, setShowHeaderCTA] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prüfe, ob ein aktiver Session existiert
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen für Auth-Änderungen
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup Funktion
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setSession(data.session);
    } catch (error: any) {
      console.error('Fehler beim Login:', error.message);
      if (error.message === 'Invalid login credentials') {
        setAuthError('Ungültige Anmeldedaten. Bitte überprüfe E-Mail und Passwort.');
      } else {
        setAuthError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderLanguageSelector = () => (
    <div className="flex items-center gap-4">
      {/* Language Selector */}
      <div className={`relative ${showHeaderCTA ? 'hidden md:block' : ''}`} ref={languageMenuRef}>
        <button
          onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors duration-200"
        >
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="text-lg mr-1">{currentLanguage.flag}</span>
          <span className="text-gray-700 text-sm font-medium">{currentLanguage.name}</span>
          <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${isLanguageMenuOpen ? 'transform rotate-180' : ''}`} />
        </button>

        {isLanguageMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div className="py-1.5">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    setLanguage(language);
                    setIsLanguageMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="text-gray-700 text-sm">{language.name}</span>
                  {currentLanguage.code === language.code && (
                    <span className="ml-auto text-[#6B4EFF]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button - erscheint wenn gescrollt */}
      {showHeaderCTA && (
        <button
          onClick={() => setShowOnboarding(true)}
          className="bg-[#332d6e] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#2a2558] transition-colors"
        >
          Kostenlos Anfangen
        </button>
      )}
    </div>
  );

  if (session) {
    return <App />;
  }

  const validateEmail = (email: string) => {
    return email.includes('@');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender/5 to-white">
      {showOnboarding && (
        <OnboardingFlow
          onComplete={(userData) => {
            setShowOnboarding(false);
          }}
          onCancel={() => setShowOnboarding(false)}
        />
      )}
      
      <header className={`bg-white shadow-sm fixed top-0 left-0 right-0 z-40 ${showOnboarding ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative w-[110px] md:w-[150px] h-[26px] md:h-[35px] flex items-center justify-center">
                  <Image
                    src="/Lumo_eule.png"
                    alt="Lumo Logo"
                    width={150}
                    height={35}
                    className="transform hover:scale-105 transition-transform duration-200"
                    priority
                  />
                </div>
              </div>
            </div>
            {renderLanguageSelector()}
          </div>
        </div>
      </header>

      <div className="pt-16 md:pt-20">
        <style jsx global>{`
          input:invalid:not(:focus):not(:placeholder-shown) {
            border-color: #7744b3 !important;
          }
          
          input:invalid:not(:focus):not(:placeholder-shown) {
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%237744b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>');
            background-position: right 8px center;
            background-repeat: no-repeat;
            padding-right: 32px;
          }
        `}</style>
        {/* Hero-Section mit voller Viewport-Höhe */}
        <div ref={heroRef} className="bg-white h-[calc(100vh-4rem)] relative">
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
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 text-center px-4">
                  Effektiv und persönlich deine Beziehung stärken – mit KI-Coaching!
                </h1>

                <div className="w-full px-4 md:px-0">
                  <button 
                    onClick={() => setShowOnboarding(true)}
                    className="w-full bg-gradient-to-r from-navlink to-lavender text-white py-2.5 md:py-2 px-4 rounded-xl hover:brightness-105 transition duration-200 font-medium shadow-md shadow-lavender/30 mb-3 md:mb-4 text-sm"
                  >
                    Kostenlos Anfangen
                  </button>

                  <div className="bg-white/70 p-3 md:p-4 rounded-xl border border-lavender/30">
                    <h3 className="text-navlink font-medium text-center mb-3 text-sm">
                      Ich habe schon ein Konto
                    </h3>
                    <form onSubmit={handleLogin} className="space-y-2.5" noValidate>
                      {authError && (
                        <div className="text-red-600 text-xs text-center mb-2">
                          {authError}
                        </div>
                      )}
                      <div className="space-y-1">
                        <label htmlFor="email" className="text-xs font-medium text-midnight/70">
                          E-Mail
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setEmailTouched(true)}
                            className={`w-full p-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/50 text-sm ${
                              emailTouched && !validateEmail(email) ? 'border-[#7744b3]' : 'border-lavender/30'
                            }`}
                            placeholder="deine@email.de"
                            disabled={isLoading}
                          />
                          {emailTouched && !validateEmail(email) && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 pointer-events-none">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#7744b3" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12" y2="12" stroke="#7744b3" strokeWidth="2"/>
                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#7744b3" strokeWidth="2"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        {emailTouched && !validateEmail(email) && (
                          <div className="text-[#7744b3] text-xs mt-1">
                            Die E-Mail-Adresse muss ein @-Zeichen enthalten.
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="password" className="text-xs font-medium text-midnight/70">
                          Passwort
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setPasswordTouched(true)}
                            className={`w-full p-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/50 text-sm ${
                              passwordTouched && !password ? 'border-[#7744b3]' : 'border-lavender/30'
                            }`}
                            placeholder="Dein Passwort"
                            disabled={isLoading}
                          />
                          {passwordTouched && !password && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 pointer-events-none">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#7744b3" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12" y2="12" stroke="#7744b3" strokeWidth="2"/>
                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#7744b3" strokeWidth="2"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        {passwordTouched && !password && (
                          <div className="text-[#7744b3] text-xs mt-1">
                            Bitte gib ein Passwort ein.
                          </div>
                        )}
                      </div>
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-navlink border-2 border-navlink py-1.5 px-4 rounded-lg hover:bg-navlink/5 transition duration-200 font-medium text-sm mt-4"
                      >
                        {isLoading ? 'Bitte warten...' : 'Anmelden'}
                      </button>
                      <div className="text-center">
                        <Link href="/passwort-vergessen" className="text-xs text-navlink hover:text-navlink/80 transition-colors">
                          Passwort vergessen?
                        </Link>
                      </div>
                    </form>
                  </div>
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
        <footer className="bg-[#332d6e] text-white py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
              {/* Über uns */}
              <div className="flex flex-col items-center">
                <h3 className="font-bold text-base md:text-lg mb-4">Über uns</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="/mission" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Mission</a>
                  </li>
                  <li>
                    <a href="/karriere" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Karriere</a>
                  </li>
                  <li>
                    <a href="/kontakt" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Kontakt</a>
                  </li>
                  <li>
                    <a href="/impressum" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Impressum</a>
                  </li>
                </ul>
              </div>

              {/* Rechtliches */}
              <div className="flex flex-col items-center">
                <h3 className="font-bold text-base md:text-lg mb-4">Rechtliches</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="/agb" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">AGB</a>
                  </li>
                  <li>
                    <a href="/datenschutz" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Datenschutz</a>
                  </li>
                </ul>
              </div>

              {/* Sozial */}
              <div className="flex flex-col items-center col-span-2 md:col-span-1 mt-8 md:mt-0">
                <h3 className="font-bold text-base md:text-lg mb-4">Sozial</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="https://instagram.com/lumo" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Instagram</a>
                  </li>
                  <li>
                    <a href="https://tiktok.com/@lumo" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">TikTok</a>
                  </li>
                  <li>
                    <a href="https://twitter.com/lumo" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-white hover:opacity-80 transition-colors">Twitter</a>
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