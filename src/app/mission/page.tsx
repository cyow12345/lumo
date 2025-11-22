'use client';

import React from 'react';
import SharedLayout from '../../components/SharedLayout';

export default function Mission() {
  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-5">Unsere Mission</h1>
            <p className="text-lg md:text-xl text-gray-600">Mit Herz und Verstand für bessere Beziehungen</p>
          </div>

          <div className="space-y-12 md:space-y-16">
            <section className="prose prose-sm md:prose-lg mx-auto px-0">
              <div className="mb-12 md:mb-16">
                <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-4 md:mb-6">Unsere Vision</h2>
                <p className="text-base md:text-lg text-gray-700">
                  Hey! Schön, dass du da bist. Wir sind ein junges Team aus Berlin, das sich einer Sache verschrieben hat: 
                  Menschen dabei zu helfen, glücklichere und erfülltere Beziehungen zu führen. Wir glauben fest daran, dass 
                  jede Beziehung es verdient hat zu wachsen und zu blühen - und genau dabei möchten wir helfen!
                </p>
              </div>

              <div className="mb-12 md:mb-16">
                <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-4 md:mb-6">Was uns antreibt</h2>
                <ul className="space-y-6 md:space-y-8 text-base md:text-lg text-gray-700 list-none pl-0">
                  <li className="flex flex-col bg-white/50 rounded-lg p-4 md:p-6">
                    <strong className="text-purple-800 mb-2">Echte Verbindungen schaffen</strong>
                    Wir möchten, dass du und dein:e Partner:in euch noch besser versteht. 
                    Kein schnödes Beziehungs-ABC, sondern echte, tiefe Verbindungen.
                  </li>
                  <li className="flex flex-col bg-white/50 rounded-lg p-4 md:p-6">
                    <strong className="text-purple-800 mb-2">Innovation mit Herz</strong>
                    Klar nutzen wir modernste Technik - aber immer mit dem Fokus darauf, 
                    was dir und deiner Beziehung wirklich hilft. Berliner Direktheit meets Silicon Valley! ✨
                  </li>
                  <li className="flex flex-col bg-white/50 rounded-lg p-4 md:p-6">
                    <strong className="text-purple-800 mb-2">Gemeinsam wachsen</strong>
                    Wir sind keine Beziehungsgurus, die von oben herab predigen. 
                    Wir lernen jeden Tag dazu - von Expert:innen, voneinander und vor allem von euch!
                  </li>
                </ul>
              </div>

              <div className="mt-12 md:mt-20">
                <h2 className="text-xl md:text-2xl font-semibold text-purple-800 mb-6 md:mb-8">Das macht uns aus</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="bg-white p-5 md:p-7 rounded-lg shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-purple-700 mb-3 md:mb-4">Echt & Ehrlich</h3>
                    <p className="text-sm md:text-base text-gray-600">Keine Masken, keine Spielchen - bei uns kriegst du ehrliche, direkte Kommunikation!</p>
                  </div>
                  <div className="bg-white p-5 md:p-7 rounded-lg shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-purple-700 mb-3 md:mb-4">Vertrauenswürdig</h3>
                    <p className="text-sm md:text-base text-gray-600">Deine Daten sind bei uns absolut sicher - Datenschutz made in Berlin.</p>
                  </div>
                  <div className="bg-white p-5 md:p-7 rounded-lg shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-purple-700 mb-3 md:mb-4">Innovativ</h3>
                    <p className="text-sm md:text-base text-gray-600">Frischer Wind für deine Beziehung - direkt aus der Startup-Hauptstadt!</p>
                  </div>
                  <div className="bg-white p-5 md:p-7 rounded-lg shadow-sm">
                    <h3 className="text-lg md:text-xl font-semibold text-purple-700 mb-3 md:mb-4">Gemeinsam stark</h3>
                    <p className="text-sm md:text-base text-gray-600">Zusammen sind wir unschlagbar - wie eine starke Community!</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
} 