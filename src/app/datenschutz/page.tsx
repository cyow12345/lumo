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
            Verantwortlicher im Sinne der Datenschutzgrundverordnung (DSGVO) ist <span className="italic">Ahmet Kalebas, Kaskelstr. 53,
            10317 Berlin</span>, E-Mail: privacy@lumo.guru.
          </p>

          <h2 className="text-base font-semibold">2. Verarbeitung personenbezogener Daten</h2>
          <p>
            Wir verarbeiten personenbezogene Daten, die Sie uns bei der Registrierung und Nutzung unserer
            App mitteilen:
          </p>
          <ul className="list-none space-y-2">
            <li><strong>Kontaktdaten:</strong> Name, E-Mail-Adresse</li>
            <li><strong>Beziehungsdaten:</strong> Partner-Verknüpfung, Beziehungsbeginn</li>
            <li><strong>Nutzergenerierte Inhalte:</strong> Chat-Nachrichten mit dem KI-Coach, gemeinsame Ziele, Vibe Check-Einträge, "Ich denk an dich"-Nachrichten</li>
            <li><strong>Nutzungsdaten:</strong> App-Interaktionen (zur Missbrauchsprävention und Kostenkontrolle)</li>
            <li><strong>Technische Daten:</strong> Geräte-Token für Push-Benachrichtigungen</li>
            <li><strong>Geräteerkennung:</strong> Verschlüsselter Geräte-Identifikator (Device Fingerprint) zur Missbrauchsprävention</li>
          </ul>

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
            <li>
              <strong>Missbrauchsprävention</strong> (Art. 6 Abs. 1 lit. f DSGVO – berechtigtes Interesse)
            </li>
          </ul>

          <h2 className="text-base font-semibold">4. Speicherdauer</h2>
          <p>
            Ihre Daten werden so lange gespeichert, wie es für die oben genannten Zwecke erforderlich ist.
            Gesetzliche Aufbewahrungsfristen bleiben unberührt.
          </p>

          <h2 className="text-base font-semibold">5. Drittanbieter-Services &amp; internationale Datentransfers</h2>
          <p>
            Zur Bereitstellung unserer Services nutzen wir folgende Drittanbieter:
          </p>
          
          <h3 className="text-sm font-semibold mt-4">5.1 Supabase (Backend &amp; Datenbank)</h3>
          <ul className="list-none space-y-2">
            <li><strong>Anbieter:</strong> Supabase Inc.</li>
            <li><strong>Zweck:</strong> Datenspeicherung, Authentifizierung, Backend-Infrastruktur</li>
            <li><strong>Verarbeitete Daten:</strong> Alle von Ihnen eingegebenen Daten (Name, E-Mail, Chat-Nachrichten, Ziele, etc.)</li>
            <li><strong>Serverstandort:</strong> EU (Frankfurt, Deutschland)</li>
            <li><strong>Datenschutz:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">https://supabase.com/privacy</a></li>
          </ul>

          <h3 className="text-sm font-semibold mt-4">5.2 Anthropic (KI-Coaching mit Claude)</h3>
          <ul className="list-none space-y-2">
            <li><strong>Anbieter:</strong> Anthropic PBC, USA</li>
            <li><strong>Zweck:</strong> KI-basierte Chat-Antworten, Textgenerierung, Beziehungsanalyse</li>
            <li><strong>Verarbeitete Daten:</strong> Chat-Nachrichten, kontextbezogene Beziehungsinformationen (anonymisiert)</li>
            <li><strong>Serverstandort:</strong> USA</li>
            <li><strong>Rechtsgrundlage für Drittlandtransfer:</strong> EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO)</li>
            <li><strong>Speicherdauer bei Anthropic:</strong> Max. 30 Tage (für Missbrauchserkennung)</li>
            <li><strong>Datenschutz:</strong> <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">https://www.anthropic.com/privacy</a></li>
          </ul>

          <h3 className="text-sm font-semibold mt-4">5.3 Apple (Push-Benachrichtigungen &amp; In-App Käufe)</h3>
          <ul className="list-none space-y-2">
            <li><strong>Anbieter:</strong> Apple Inc.</li>
            <li><strong>Zweck:</strong> Push-Benachrichtigungen, Abonnement-Verwaltung</li>
            <li><strong>Verarbeitete Daten:</strong> Geräte-Token, Kauf-Receipts</li>
            <li><strong>Datenschutz:</strong> <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">https://www.apple.com/legal/privacy/</a></li>
          </ul>

          <p className="mt-4 text-xs italic">
            Hinweis: Ihre Chat-Inhalte werden bei der Übermittlung an Anthropic anonymisiert. Es werden keine
            Namen oder direkten Identifikatoren mitgesendet. Die KI erhält nur den inhaltlichen Kontext für
            qualitativ hochwertige Antworten.
          </p>

          <h2 className="text-base font-semibold">6. Ihre Rechte</h2>
          <p>Sie haben folgende Rechte bezüglich Ihrer Daten:</p>
          <ul className="list-none space-y-2">
            <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
            <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie können unrichtige Daten berichtigen lassen (auch in der App unter "Profil")</li>
            <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer Daten verlangen</li>
            <li><strong>Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie können die Einschränkung der Verarbeitung verlangen</li>
            <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie können Ihre Daten in einem strukturierten Format erhalten</li>
            <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie können der Verarbeitung Ihrer Daten widersprechen</li>
          </ul>
          <p className="mt-4">
            <strong>So können Sie Ihre Rechte ausüben:</strong><br />
            Für Datenschutzanfragen (Auskunft, Löschung, Datenexport) kontaktieren Sie uns bitte per E-Mail an:{' '}
            <a href="mailto:privacy@lumo.guru" className="text-purple-600 hover:underline">privacy@lumo.guru</a>
            <br />
            Wir werden Ihre Anfrage innerhalb von 30 Tagen bearbeiten.
          </p>

          <h2 className="text-base font-semibold">7. Kontaktformular &amp; Support</h2>
          <p>
            Wenn Sie uns per E-Mail oder Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben
            zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen gespeichert (Art. 6 Abs. 1
            lit. b DSGVO).
          </p>

          <h2 className="text-base font-semibold">8. Geräteerkennung zur Missbrauchsprävention</h2>
          <p>
            Um sicherzustellen, dass unsere kostenlose Testphase fair genutzt wird, speichern wir einen 
            verschlüsselten Geräte-Identifikator (Device Fingerprint). Dieser wird verwendet, um zu verhindern, 
            dass dieselbe Testphase mehrfach auf einem Gerät genutzt wird.
          </p>
          <p className="mt-2">
            <strong>Erfasste Daten:</strong>
          </p>
          <ul className="list-none space-y-2 mt-2">
            <li>• iOS: IDFV (Identifier for Vendor) – eine von Apple bereitgestellte Geräte-ID</li>
            <li>• Android: Android-ID – eine eindeutige Geräte-ID</li>
          </ul>
          <p className="mt-2">
            Diese IDs werden mit SHA-256 verschlüsselt (gehashed), bevor sie gespeichert werden. Eine direkte 
            Rückverfolgung zum Gerät ist nicht möglich.
          </p>
          <p className="mt-2">
            <strong>Zweck:</strong> Verhinderung von Missbrauch der kostenlosen Testphase
          </p>
          <p className="mt-2">
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
          </p>
          <p className="mt-2">
            <strong>Speicherdauer:</strong> Bis zur Löschung des Accounts oder auf Anfrage
          </p>
          <p className="mt-2">
            <strong>Keine Tracking-Zwecke:</strong> Der Device Fingerprint wird ausschließlich zur Missbrauchsprävention 
            verwendet, nicht für Tracking, Werbung oder Analyse.
          </p>

          <h2 className="text-base font-semibold">9. Cookies, Tracking &amp; Werbung</h2>
          <p>
            <strong>Kein Werbe-Tracking:</strong> Unsere App verwendet KEINE Tracking-Tools für Werbezwecke.
            Es werden keine Daten an Werbenetzwerke (Google Ads, Facebook, etc.) weitergegeben.
          </p>
          <p className="mt-2">
            <strong>Technisch notwendige Daten:</strong> Wir speichern ausschließlich technisch notwendige
            Informationen wie Login-Status (JWT Tokens) und App-Funktionalitätsdaten.
          </p>
          <p className="mt-2">
            <strong>Internes Usage-Tracking:</strong> Zur Missbrauchsprävention und Kostenkontrolle erfassen
            wir grundlegende Nutzungsdaten (z.B. Anzahl gesendeter Chat-Nachrichten). Diese Daten werden
            NICHT für Werbung oder externe Analysen verwendet.
          </p>

          <h2 className="text-base font-semibold">10. Datensicherheit</h2>
          <p>
            Wir setzen geeignete technische und organisatorische Maßnahmen ein, um Ihre Daten vor Verlust,
            Missbrauch oder unbefugtem Zugriff zu schützen:
          </p>
          <ul className="list-none space-y-2">
            <li><strong>Verschlüsselung in Transit:</strong> Alle Datenübertragungen erfolgen über TLS/HTTPS</li>
            <li><strong>Verschlüsselung at Rest:</strong> Datenbank-Verschlüsselung mit AES-256</li>
            <li><strong>Authentifizierung:</strong> Sichere JWT-Token-basierte Authentifizierung</li>
            <li><strong>Row Level Security (RLS):</strong> Sie können nur Ihre eigenen Daten sehen und bearbeiten</li>
            <li><strong>Zugriffskontrolle:</strong> Strikte Berechtigungssysteme für Backend-Zugriffe</li>
          </ul>

          <h2 className="text-base font-semibold">11. Mindestalter</h2>
          <p>
            Unsere App richtet sich ausschließlich an Personen ab 17 Jahren. Wir verarbeiten wissentlich
            keine Daten von Personen unter 17 Jahren. Falls Sie als Erziehungsberechtigter feststellen,
            dass Ihr Kind uns ohne Ihre Zustimmung personenbezogene Daten zur Verfügung gestellt hat,
            kontaktieren Sie uns bitte unter privacy@lumo.guru, damit wir die Daten umgehend löschen können.
          </p>

          <h2 className="text-base font-semibold">12. Beschwerderecht</h2>
          <p>
            Ihnen steht ein Beschwerderecht bei einer Aufsichtsbehörde zu – zuständig ist in der Regel der
            Landesdatenschutzbeauftragte Ihres Wohnsitzes oder die Berliner Beauftragte für Datenschutz
            und Informationsfreiheit.
          </p>

          <h2 className="text-base font-semibold">13. Änderungen der Datenschutzerklärung</h2>
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