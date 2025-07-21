'use client';

import React, { useState, useEffect } from 'react';
import { LanguageContext, Language, languages } from './languageContext';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    // IP-basierte Spracherkennung
    const detectLanguage = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code.toLowerCase();
        
        // Setze Sprache basierend auf Ländercode
        if (countryCode === 'de' || countryCode === 'at' || countryCode === 'ch') {
          setCurrentLanguage(languages[0]); // Deutsch
        } else {
          setCurrentLanguage(languages[1]); // English
        }
      } catch (error) {
        console.error('Fehler bei der Spracherkennung:', error);
        // Fallback zu Deutsch
        setCurrentLanguage(languages[0]);
      }
    };

    detectLanguage();
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    // Hier können Sie später die Übersetzungen laden
    // und weitere sprachspezifische Einstellungen vornehmen
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}; 