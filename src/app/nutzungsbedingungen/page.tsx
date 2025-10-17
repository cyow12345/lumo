'use client';

import React from 'react';

const NutzungsbedingungenPage = () => (
  <div className="fixed inset-0 bg-white/95 flex flex-col items-center justify-center overflow-hidden p-4">
    <div className="w-full max-w-2xl relative">
      <button 
        onClick={() => window.history.back()} 
        className="absolute -right-2 top-0 text-2xl text-gray-600 hover:text-gray-800"
      >
        ×
      </button>
      
      <div className="mt-12 mb-8 text-center">
        <h1 className="text-2xl font-bold text-navlink">Nutzungsbedingungen</h1>
        <p className="text-sm text-midnight/80 mt-2">
          Stand: {new Date().toLocaleDateString('de-DE')}
        </p>
      </div>

      <div className="overflow-y-auto max-h-[70vh] px-4 text-center">
        <section className="space-y-4 text-sm leading-relaxed text-midnight">
          <h2 className="text-base font-semibold">1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge zwischen
            der Lumo App (betrieben von <span className="italic">Lumo GmbH, Barmbeker Str. 33, 22303 Hamburg</span> – nachfolgend „wir" oder
            „uns") und den Nutzerinnen und Nutzern unserer Software‐ as‐a‐Service‐Plattform (nachfolgend
            „Nutzer"). Abweichende Geschäftsbedingungen der Nutzer finden keine Anwendung, es sei denn,
            wir stimmen ihrer Geltung ausdrücklich schriftlich zu.
          </p>

          <h2 className="text-base font-semibold">2. Vertragsgegenstand</h2>
          <p>
            Gegenstand des Vertrages ist die Bereitstellung einer Web-Applikation zur Analyse und
            Verbesserung zwischenmenschlicher Beziehungen. Der Funktionsumfang ergibt sich aus der zum
            Zeitpunkt des Vertragsschlusses gültigen Leistungsbeschreibung.
          </p>

          <h2 className="text-base font-semibold">3. Registrierung &amp; Vertragsschluss</h2>
          <p>
            Durch das Absenden des Registrierungsformulars gibt der Nutzer ein verbindliches Angebot auf
            Abschluss eines Nutzungsvertrags ab. Der Vertrag kommt zustande, sobald wir die Registrierung
            per E-Mail bestätigen oder den Account freischalten.
          </p>

          <h2 className="text-base font-semibold">4. Leistungen &amp; Verfügbarkeit</h2>
          <p>
            Wir stellen die App mit einer Verfügbarkeit von 98 % im Jahresmittel bereit. Davon ausgenommen
            sind Zeiten, in denen die Server aufgrund von Wartungsarbeiten, die in der Regel außerhalb der
            üblichen Geschäftszeiten durchgeführt werden, oder aufgrund von technischen oder sonstigen
            Problemen, die nicht in unserem Einflussbereich liegen, nicht erreichbar sind.
          </p>

          <h2 className="text-base font-semibold">5. Pflichten der Nutzer</h2>
          <ul className="list-none space-y-2">
            <li>Die Zugangsdaten sind geheim zu halten und dürfen nicht an Dritte weitergegeben werden.</li>
            <li>Es dürfen keine rechtswidrigen oder die Rechte Dritter verletzenden Inhalte eingestellt werden.</li>
            <li>Die App darf nicht missbräuchlich verwendet werden, z.&nbsp;B. durch automatisierte Abfragen.</li>
          </ul>

          <h2 className="text-base font-semibold">6. Vergütung</h2>
          <p>
            Die Basisversion der App ist derzeit kostenlos. Sollten künftig kostenpflichtige Funktionen
            angeboten werden, informieren wir die Nutzer rechtzeitig vorab; es kommt erst nach ausdrücklicher
            Zustimmung des Nutzers zu kostenpflichtigen Verträgen.
          </p>

          <h2 className="text-base font-semibold">7. Haftung</h2>
          <p>
            Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der
            Verletzung des Lebens, des Körpers oder der Gesundheit. Bei leicht fahrlässiger Verletzung einer
            wesentlichen Vertragspflicht ist unsere Haftung auf den vertragstypischen, vorhersehbaren Schaden
            begrenzt. Im Übrigen ist die Haftung ausgeschlossen.
          </p>

          <h2 className="text-base font-semibold">8. Laufzeit &amp; Kündigung</h2>
          <p>
            Der Nutzungsvertrag wird auf unbestimmte Zeit geschlossen und kann vom Nutzer jederzeit durch
            Löschen des Accounts oder schriftliche Mitteilung an uns gekündigt werden. Wir können den
            Vertrag mit einer Frist von 14 Tagen kündigen.
          </p>

          <h2 className="text-base font-semibold">9. Änderungen der AGB</h2>
          <p>
            Wir behalten uns vor, diese AGB mit Wirkung für die Zukunft zu ändern. Über Änderungen werden
            die Nutzer spätestens zwei Wochen vor Inkrafttreten per E-Mail informiert. Widerspricht der
            Nutzer nicht innerhalb von zwei Wochen, gelten die Änderungen als akzeptiert.
          </p>

          <h2 className="text-base font-semibold">10. Schlussbestimmungen</h2>
          <p className="mb-8">
            Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts (CISG). Gerichtsstand für alle
            Streitigkeiten aus diesem Vertrag ist Hamburg, sofern der Nutzer Kaufmann ist oder keinen
            allgemeinen Gerichtsstand in Deutschland hat.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default NutzungsbedingungenPage; 