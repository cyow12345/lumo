'use client';

import React, { useState } from 'react';
import SharedLayout from '../../components/SharedLayout';

export default function Kontakt() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    betreff: '',
    nachricht: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier würde die Logik zum Senden des Formulars implementiert werden
    console.log('Formular gesendet:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Lass uns schnacken!</h1>
            <p className="text-lg md:text-xl text-gray-600">Fragen, Ideen, oder einfach nur Moin sagen? Wir sind ganz Ohr! 👋</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Kontaktinformationen */}
            <div className="mb-8 md:mb-0">
              <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-6">Hier findest du uns</h2>
              
              <div className="space-y-6 md:space-y-8">
                <div className="bg-white/50 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Komm vorbei!</h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Lumo GmbH<br />
                    Barmbeker Str. 33<br />
                    22303 Hamburg
                  </p>
                </div>

                <div className="bg-white/50 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Schreib uns</h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Allgemein: moin@lumo-app.de<br />
                    Support: hilfe@lumo-app.de
                  </p>
                </div>

                <div className="bg-white/50 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Wann wir da sind</h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Mo - Fr: 9:00 - 18:00 Uhr<br />
                    (Freitags gern auch mal beim After-Work-Schnack! 🍻)
                  </p>
                </div>
              </div>
            </div>

            {/* Kontaktformular */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-6">Schreib uns 'ne Nachricht</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Wie heißt du?
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#332d6e] focus:border-[#332d6e] text-sm md:text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Deine E-Mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#332d6e] focus:border-[#332d6e] text-sm md:text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="betreff" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Worum geht's?
                  </label>
                  <select
                    id="betreff"
                    name="betreff"
                    value={formData.betreff}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#332d6e] focus:border-[#332d6e] text-sm md:text-base"
                    required
                  >
                    <option value="">Wähl was aus...</option>
                    <option value="support">Ich brauch Hilfe!</option>
                    <option value="feedback">Hab da mal 'ne Idee...</option>
                    <option value="business">Business Anfrage</option>
                    <option value="other">Sonstiges Geschnack</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="nachricht" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Was liegt dir auf dem Herzen?
                  </label>
                  <textarea
                    id="nachricht"
                    name="nachricht"
                    value={formData.nachricht}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#332d6e] focus:border-[#332d6e] text-sm md:text-base"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#332d6e] text-white px-6 py-3 rounded-lg hover:bg-[#2a2558] transition-colors text-sm md:text-base font-medium"
                >
                  Ab die Post!
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
} 