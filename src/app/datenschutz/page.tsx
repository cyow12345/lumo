'use client';

import React from 'react';

const DatenschutzPage = () => (
  <div className="fixed inset-0 bg-white/95 flex flex-col items-center justify-center overflow-hidden p-4">
    <div className="w-full max-w-2xl relative">
      <button 
        onClick={() => window.history.back()} 
        className="absolute -right-2 top-0 text-2xl text-gray-600 hover:text-gray-800"
      >
        ×
      </button>
      
      <div className="mt-12 mb-8 text-center">
        <h1 className="text-2xl font-bold text-navlink">Datenschutz</h1>
        <p className="text-sm text-midnight/80 mt-2">
          Stand: {new Date().toLocaleDateString('de-DE')}
        </p>
      </div>

      <div className="overflow-y-auto max-h-[70vh] px-4 text-center">
        <section className="space-y-4 text-sm leading-relaxed text-midnight">
          <h2 className="text-base font-semibold">1. Verantwortlicher</h2>
          <p>
            Verantwortlicher im Sinne der Datenschutzgrundverordnung (DSGVO) ist die <span className="italic">Lumo GmbH, Musterstraße 1,
            12345 Berlin</span>, E-Mail: privacy@lumo.guru.
          </p>

          <h2 className="text-base font-semibold">2. Verarbeitung personenbezogener Daten</h2>
          <p>
            Wir verarbeiten personenbezogene Daten, die Sie uns bei der Registrierung und Nutzung unserer
            App mitteilen. Dazu gehören insbesondere Name, E-Mail-Adresse, Angaben zu Ihrer Beziehung sowie
            Nutzungsdaten.
          </p>

          <h2 className="text-base font-semibold">3. Zweck &amp; Rechtsgrundlage</h2>
          <ul className="list-none space-y-2">
            <li>
              <strong>Bereitstellung der App</strong> (Art. 6 Abs. 1 lit. b DSGVO)
            </li>
            <li>
              <strong>Nutzer-Support</strong> (Art. 6 Abs. 1 lit. b DSGVO)
            </li>
            <li>
              <strong>Verbesserung des Angebots</strong> durch anonymisierte Statistiken (Art. 6 Abs. 1 lit. f DSGVO)
            </li>
          </ul>

          <h2 className="text-base font-semibold">4. Speicherdauer</h2>
          <p>
            Ihre Daten werden so lange gespeichert, wie es für die oben genannten Zwecke erforderlich ist.
            Gesetzliche Aufbewahrungsfristen bleiben unberührt.
          </p>

          <h2 className="text-base font-semibold">5. Weitergabe an Dritte</h2>
          <p>
            Eine Weitergabe Ihrer Daten erfolgt nur, wenn dies zur Vertragserfüllung erforderlich ist, wir
            gesetzlich dazu verpflichtet sind oder Sie eingewilligt haben.
          </p>

          <h2 className="text-base font-semibold">6. Ihre Rechte</h2>
          <p>Sie haben das Recht,</p>
          <ul className="list-none space-y-2">
            <li>Auskunft über Ihre gespeicherten Daten zu erhalten (Art. 15 DSGVO),</li>
            <li>unrichtige Daten berichtigen zu lassen (Art. 16 DSGVO),</li>
            <li>Daten löschen zu lassen (Art. 17 DSGVO),</li>
            <li>die Verarbeitung einschränken zu lassen (Art. 18 DSGVO),</li>
            <li>Datenübertragbarkeit zu verlangen (Art. 20 DSGVO),</li>
            <li>Widerspruch gegen die Verarbeitung einzulegen (Art. 21 DSGVO).</li>
          </ul>

          <h2 className="text-base font-semibold">7. Kontaktformular &amp; Support</h2>
          <p>
            Wenn Sie uns per E-Mail oder Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben
            zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen gespeichert (Art. 6 Abs. 1
            lit. b DSGVO).
          </p>

          <h2 className="text-base font-semibold">8. Cookies &amp; Tracking</h2>
          <p>
            Unsere App verwendet ausschließlich technisch notwendige Cookies. Für Analysezwecke nutzen wir
            anonymisierte Statistik-Tools, die keine personenbezogenen Daten speichern.
          </p>

          <h2 className="text-base font-semibold">9. Datensicherheit</h2>
          <p>
            Wir setzen geeignete technische und organisatorische Maßnahmen ein, um Ihre Daten vor Verlust,
            Missbrauch oder unbefugtem Zugriff zu schützen.
          </p>

          <h2 className="text-base font-semibold">10. Beschwerderecht</h2>
          <p>
            Ihnen steht ein Beschwerderecht bei einer Aufsichtsbehörde zu – zuständig ist in der Regel der
            Landesdatenschutzbeauftragte Ihres Wohnsitzes.
          </p>

          <h2 className="text-base font-semibold">11. Änderungen der Datenschutzerklärung</h2>
          <p className="mb-8">
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte
            Rechtslagen oder neue Funktionen der App anzupassen. Die jeweils aktuelle Version ist stets
            unter diesem Link verfügbar.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default DatenschutzPage; 