'use client';

import React from 'react';
import SharedLayout from '../../components/SharedLayout';

export default function Impressum() {
  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Impressum</h1>
            <p className="text-lg md:text-xl text-gray-600">Das Kleingedruckte</p>
          </div>

          <div className="prose prose-sm md:prose-lg mx-auto">
            <section className="mb-8 md:mb-12 bg-white/50 rounded-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-4 md:mb-6">Wer wir sind</h2>
              <p className="text-sm md:text-base text-gray-700">
                Ahmet Kalebas<br />
                Kaskelstr. 53<br />
                10317 Berlin<br />
                Deutschland
              </p>
              
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mt-6 mb-2">So erreichst du uns</h3>
              <p className="text-sm md:text-base text-gray-700">
                E-Mail: info@lumo.guru
              </p>
            </section>

            <section className="mb-8 md:mb-12 bg-white/50 rounded-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-4 md:mb-6">Verantwortlich für den Inhalt</h2>
              <p className="text-sm md:text-base text-gray-700">
                Ahmet Kalebas<br />
                Kaskelstr. 53<br />
                10317 Berlin
              </p>
            </section>

            <section className="mb-8 md:mb-12 bg-white/50 rounded-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-4 md:mb-6">Falls mal was nicht klappt</h2>
              <p className="text-sm md:text-base text-gray-700">
                Die EU hat eine Plattform für Online-Streitbeilegung eingerichtet:<br />
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[#332d6e] hover:text-[#2a2558]">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="text-sm md:text-base text-gray-700 mt-4">
                Bei Problemen sprich uns einfach direkt an - wir finden bestimmt eine Lösung.
              </p>
            </section>

            <section className="bg-white/50 rounded-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-4 md:mb-6">Das Rechtliche</h2>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mt-6 mb-2">Über unsere Inhalte</h3>
              <p className="text-sm md:text-base text-gray-700">
                Wir geben uns Mühe, dass hier alles stimmt. Aber auch wir sind nur Menschen - 
                für absolute Perfektion können wir nicht garantieren.
              </p>

              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mt-6 mb-2">Über Links</h3>
              <p className="text-sm md:text-base text-gray-700">
                Wir verlinken manchmal auf andere Seiten, aber was die da machen, dafür können wir natürlich 
                nicht unsere Hand ins Feuer legen. Das checken die jeweiligen Seitenbetreiber selbst.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
} 