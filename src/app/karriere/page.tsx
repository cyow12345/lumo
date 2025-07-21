'use client';

import React from 'react';
import SharedLayout from '../../components/SharedLayout';

export default function Karriere() {
  const positions = [
    {
      title: 'Senior Full-Stack Entwickler (m/w/d)',
      type: 'Vollzeit',
      location: 'Remote / Hamburg',
      description: 'Entwicklung und Optimierung unserer Next.js/React Plattform mit Supabase Backend.'
    },
    {
      title: 'Beziehungsberater & Coach (m/w/d)',
      type: 'Teilzeit / Vollzeit',
      location: 'Remote',
      description: 'Unterstützung bei der Entwicklung von Coaching-Inhalten und Beratung unserer Nutzer.'
    },
    {
      title: 'Marketing Manager (m/w/d)',
      type: 'Vollzeit',
      location: 'Hamburg',
      description: 'Entwicklung und Umsetzung unserer Marketing-Strategie mit Fokus auf Social Media und Content.'
    }
  ];

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Moin! Wir suchen Verstärkung</h1>
            <p className="text-lg md:text-xl text-gray-600">Komm in unser Team und hilf Menschen, glücklicher zu werden</p>
          </div>

          <section className="mb-12 md:mb-16">
            <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-6 md:mb-8">So ticken wir</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
              <div className="bg-white p-5 md:p-7 rounded-lg shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-purple-700 mb-2 md:mb-3">Entspannt arbeiten</h3>
                <p className="text-sm md:text-base text-gray-600">Flexible Arbeitszeiten, Remote oder in unserem gemütlichen Büro in der Schanze. Plus: 30 Tage zum Chillen!</p>
              </div>
              <div className="bg-white p-5 md:p-7 rounded-lg shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-purple-700 mb-2 md:mb-3">Immer am Start</h3>
                <p className="text-sm md:text-base text-gray-600">Budget für Weiterbildung, spannende Workshops und 'ne Menge zu lernen!</p>
              </div>
              <div className="bg-white p-5 md:p-7 rounded-lg shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-purple-700 mb-2 md:mb-3">Team-Spirit</h3>
                <p className="text-sm md:text-base text-gray-600">Afterwork am Michel, Team-Events und regelmäßige Auszeiten zusammen. Moin Moin!</p>
              </div>
              <div className="bg-white p-5 md:p-7 rounded-lg shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-purple-700 mb-2 md:mb-3">Mehr als nur Job</h3>
                <p className="text-sm md:text-base text-gray-600">Modernes Equipment, Gesundheitsbonus und jeden Tag frisches Obst aus dem Hamburger Großmarkt!</p>
              </div>
            </div>
          </section>

          <section className="mb-12 md:mb-16">
            <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-6 md:mb-8">Hier kannst du einsteigen</h2>
            <div className="space-y-6 md:space-y-8">
              {positions.map((position, index) => (
                <div key={index} className="bg-white p-5 md:p-7 rounded-lg shadow-sm">
                  <h3 className="text-lg md:text-xl font-semibold text-purple-700 mb-3">{position.title}</h3>
                  <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {position.type}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {position.location}
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 mb-5">{position.description}</p>
                  <button className="w-full md:w-auto bg-[#332d6e] text-white px-6 py-2.5 rounded-lg hover:bg-[#2a2558] transition-colors text-sm md:text-base font-medium">
                    Lass uns schnacken!
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 md:mt-20 text-center">
            <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-3 md:mb-4">Nichts Passendes dabei?</h2>
            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
              Kein Problem! Schreib uns einfach, was du drauf hast - wir sind immer offen für neue Gesichter! ✨
            </p>
            <button className="w-full md:w-auto bg-[#332d6e] text-white px-8 py-3 rounded-lg hover:bg-[#2a2558] transition-colors text-sm md:text-base font-medium">
              Hier lang!
            </button>
          </section>
        </div>
      </div>
    </SharedLayout>
  );
} 