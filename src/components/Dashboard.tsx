import React, { useState, useEffect, useRef } from 'react';
import { Smile, Heart, Gift, Quote, Bell, Check, Users, LinkIcon, CheckCircle2, Loader2, AlertCircle, MessageCircle, User as UserIcon, LogOut, Settings as SettingsIcon } from "lucide-react";
import Card from "./Card";
import { supabase } from '../lib/supabaseClient';
import { analyzeRelationship, PersonData, RelationshipData, AnalysisResult } from '../services/analyzeRelationship';
import PartnerStatusBox from './PartnerStatusBox';
import WeeklyReflectionCard from './WeeklyReflectionCard';
import LumoCoach from './LumoCoach';
import Profile from './Profile';
import Settings from './Settings';

interface DashboardProps {
  userId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [notificationSent, setNotificationSent] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [partnerLinked, setPartnerLinked] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [showPartnerLinkedInfo, setShowPartnerLinkedInfo] = useState(false);

  // Analyse-Status
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Füge State für die Geburtsdaten hinzu
  const [userAstroData, setUserAstroData] = useState<{ birthDate?: string; birthTime?: string; birthPlace?: string }>({});
  const [partnerAstroData, setPartnerAstroData] = useState<{ birthDate?: string; birthTime?: string; birthPlace?: string }>({});

  const [activeTab, setActiveTab] = useState<'analyse' | 'astro'>('analyse');

  // State für das Startdatum der Beziehung
  const [relationshipStartDate, setRelationshipStartDate] = useState<string | null>(null);

  // Dashboard reload helper
  const reloadDashboard = async () => {
    await loadUserData();
  };

  // Lade Benutzerdaten und Partnerverknüpfung
  const [userData, setUserData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const loadUserData = async () => {
    if (!userId) return;
    try {
      const { data: userDataRaw, error: userError } = await supabase
        .from('user_profiles')
        .select('name, invite_code, partner_id, age, gender, attachment_style, addressing_issues, relationship_values, parental_influence, birth_date, birth_time, birth_place, relationship_start_date, relationship_status, email, astrology')
        .eq('id', userId)
        .single();
      if (userError) throw userError;
      if (userDataRaw) {
        setUserData(userDataRaw);
        setUserName(userDataRaw.name || 'Benutzer');
        setInviteCode(userDataRaw.invite_code || '');
        setPartnerLinked(!!userDataRaw.partner_id);
        setUserAstroData({
          birthDate: userDataRaw.birth_date,
          birthTime: userDataRaw.birth_time,
          birthPlace: userDataRaw.birth_place,
        });
        setRelationshipStartDate(userDataRaw.relationship_start_date || null);
        setPartnerName('');
        if (userDataRaw.partner_id) {
          const { data: partnerDataRaw, error: partnerError } = await supabase
            .from('user_profiles')
            .select('id, name, partner_id, age, gender, attachment_style, addressing_issues, relationship_values, parental_influence, birth_date, birth_time, birth_place, astrology')
            .eq('id', userDataRaw.partner_id)
            .single();
          if (!partnerError && partnerDataRaw) {
            setPartnerData(partnerDataRaw);
            setPartnerName(partnerDataRaw.name || '');
            setPartnerAstroData({
              birthDate: partnerDataRaw.birth_date,
              birthTime: partnerDataRaw.birth_time,
              birthPlace: partnerDataRaw.birth_place,
            });
            if (partnerDataRaw.partner_id !== userId) {
              await supabase
                .from('user_profiles')
                .update({ partner_id: userId })
                .eq('id', partnerDataRaw.id);
            }
            if (userDataRaw.partner_id !== partnerDataRaw.id) {
              await supabase
                .from('user_profiles')
                .update({ partner_id: partnerDataRaw.id })
                .eq('id', userId);
            }
            setAnalysisLoading(true);
            setAnalysisError(null);
            try {
              const personA: PersonData = {
                name: userDataRaw.name,
                age: userDataRaw.age,
                gender: userDataRaw.gender,
                attachmentStyle: userDataRaw.attachment_style,
                communication: userDataRaw.addressing_issues,
                values: userDataRaw.relationship_values || [],
                childhood: userDataRaw.parental_influence,
                birthDate: userDataRaw.birth_date,
                birthTime: userDataRaw.birth_time,
                birthPlace: userDataRaw.birth_place,
              };
              const personB: PersonData = {
                name: partnerDataRaw.name,
                age: partnerDataRaw.age,
                gender: partnerDataRaw.gender,
                attachmentStyle: partnerDataRaw.attachment_style,
                communication: partnerDataRaw.addressing_issues,
                values: partnerDataRaw.relationship_values || [],
                childhood: partnerDataRaw.parental_influence,
                birthDate: partnerDataRaw.birth_date,
                birthTime: partnerDataRaw.birth_time,
                birthPlace: partnerDataRaw.birth_place,
              };
              const relationship: RelationshipData = {
                relationshipStartDate: userDataRaw.relationship_start_date,
                relationshipStatus: userDataRaw.relationship_status,
              };
              const result = await analyzeRelationship(personA, personB, relationship);
              setAnalysis(result);
            } catch (err: any) {
              setAnalysisError('Analyse fehlgeschlagen. Bitte versuche es später erneut.');
            } finally {
              setAnalysisLoading(false);
            }
          }
        } else {
          setPartnerData(null);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
      // Fallback auf lokale Daten
      const localData = localStorage.getItem('onboardingData');
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          setUserName(parsedData.name || 'Benutzer');
          if (!inviteCode && parsedData.invite_code) {
            setInviteCode(parsedData.invite_code);
          } else if (!inviteCode) {
            const timestamp = Date.now().toString(36);
            const randomChars = Math.random().toString(36).substring(2, 6);
            setInviteCode(`${timestamp}-${randomChars}`.toUpperCase());
          }
        } catch (e) {
          console.error('Fehler beim Parsen der lokalen Daten:', e);
        }
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  useEffect(() => {
    document.title = 'Lumo – KI-Coach für echte Beziehungstiefe';
  }, []);

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(inviteCode).then(
      () => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 3000);
      },
      (err) => console.error('Fehler beim Kopieren: ', err)
    );
  };

  const sendThinkingOfYouNotification = () => {
    setNotificationSent(true);
    setTimeout(() => {
      setNotificationSent(false);
    }, 3000);
  };

  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [showAstroAnalysis, setShowAstroAnalysis] = useState(false);

  // Hilfsfunktion für kurze Zusammenfassung
  function getShortSummary(text: string, maxSentences = 2) {
    if (!text) return '';
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.slice(0, maxSentences).join(' ').trim() + (sentences.length > maxSentences ? ' ...' : '');
  }

  // Zeige die Info für 5 Sekunden, wenn Partner erfolgreich verknüpft wurde
  const handlePartnerLinked = () => {
    setShowPartnerLinkedInfo(true);
    setTimeout(() => setShowPartnerLinkedInfo(false), 5000);
    reloadDashboard();
  };

  // Dummy-Daten für Willkommens-Card (analog Coach-Page)
  const lastCheckIn = 3; // Tage
  // Dynamische Berechnung der Tage zusammen
  function getDaysTogether() {
    const startDate = relationshipStartDate;
    if (startDate) {
      const start = new Date(startDate);
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    }
    return 9572; // Fallback-Wert, falls kein Datum vorhanden
  }

  // Hilfsfunktion für kompakte Geburtsdatenanzeige
  function formatBirthInfo(birth: string | undefined) {
    if (!birth) return '';
    const dateMatch = birth.match(/Geburtsdatum: ([0-9]{4}-[0-9]{2}-[0-9]{2})/);
    const timeMatch = birth.match(/-zeit: ([0-9]{2}:[0-9]{2})/);
    const placeMatch = birth.match(/-ort: ([^,]+)/);
    let date = dateMatch ? dateMatch[1] : '';
    let time = timeMatch ? timeMatch[1] : '';
    let place = placeMatch ? placeMatch[1].trim() : '';
    if (date) {
      const [y, m, d] = date.split('-');
      date = `${d}.${m}.${y}`;
    }
    if (time) {
      time = `${time} Uhr`;
    }
    return [date, time, place].filter(Boolean).join(' · ');
  }

  // Hilfsfunktion für astrologische Zeichen (nur das Zeichen, ohne Namenszusatz)
  function cleanAstroValue(val?: string) {
    if (!val) return '';
    const parts = val.split(':');
    return parts.length > 1 ? parts[1].trim() : val.trim();
  }

  // Hilfsfunktion für Absätze statt Listenpunkte
  function splitToParagraphs(text?: string) {
    if (!text) return null;
    // Splitte an Zeilenumbrüchen, • oder -
    const arr = text.split(/\n|•|- /).map(t => t.trim()).filter(Boolean);
    // Wenn nur ein Absatz, gib ihn als einfachen Text zurück
    if (arr.length === 1) return <div>{arr[0]}</div>;
    // Sonst als Absätze
    return arr.map((t, i) => <div key={i} className="mb-1">{t}</div>);
  }

  // Hilfsfunktion für Tipps mit Punkt
  function splitTipsWithDot(text?: string) {
    if (!text) return null;
    // Splitte an "1. ", "2. ", "3. ", Zeilenumbrüchen oder •
    const arr = text.split(/\s*\d+\.\s*|\n|•|- /).map(t => t.trim()).filter(Boolean);
    return arr.map((t, i) => (
      <div key={i} className="mb-2 flex items-start gap-2"><span className="text-lavender">•</span><span>{t}</span></div>
    ));
  }

  const [showCoach, setShowCoach] = useState(false);

  // Logout-Handler für den Abmelden-Button
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Handler für Navigation (Platzhalter)
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const handleProfile = () => setShowProfilePopup(true);
  const handleSettings = () => setShowSettingsPopup(true);

  // Lumo-Logo Pfad wie in App.tsx
  const lumoLogo = process.env.PUBLIC_URL + '/lumo_logo.png';

  const [showAstroForm, setShowAstroForm] = useState(false);
  const [astroForm, setAstroForm] = useState({ birthDate: '', birthTime: '', birthPlace: '' });
  const [astroFormLoading, setAstroFormLoading] = useState(false);
  const [astroFormError, setAstroFormError] = useState<string | null>(null);
  const [astroFormSuccess, setAstroFormSuccess] = useState(false);

  const [birthPlaceSuggestions, setBirthPlaceSuggestions] = useState<string[]>([]);
  const birthPlaceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleBirthPlaceInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAstroForm(f => ({ ...f, birthPlace: value }));
    if (birthPlaceTimeout.current) clearTimeout(birthPlaceTimeout.current);
    if (value.length >= 2) {
      birthPlaceTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(value)}&format=json&limit=5`);
          const data = await res.json();
          setBirthPlaceSuggestions(data.map((item: any) => item.display_name));
        } catch {
          setBirthPlaceSuggestions([]);
        }
      }, 300);
    } else {
      setBirthPlaceSuggestions([]);
    }
  };

  const handleBirthPlaceSelect = (suggestion: string) => {
    setAstroForm(f => ({ ...f, birthPlace: suggestion }));
    setBirthPlaceSuggestions([]);
  };

  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // E-Mail aus Supabase Auth laden
    async function fetchEmail() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user?.email) setUserEmail(data.user.email);
    }
    fetchEmail();
  }, []);

  // Hilfsfunktion: Prüft, ob Astro-Daten vollständig und aktiviert sind
  function isAstroReady(astroData: { birthDate?: string; birthTime?: string; birthPlace?: string }, astrologyFlag?: boolean) {
    return astrologyFlag === true && !!astroData.birthDate && !!astroData.birthTime && !!astroData.birthPlace;
  }

  // Verbesserte Hilfsfunktion zum Ersetzen der Namen
  function replaceNamesWithEure(text: string, nameA: string, nameB: string) {
    if (!text) return '';
    let result = text;
    // 1. Kombi: 'NameA und NameB' oder 'NameB und NameA' → 'Eure'
    const regexPair = new RegExp(`(?:${nameA}\s+und\s+${nameB}|${nameB}\s+und\s+${nameA})`, 'gi');
    result = result.replace(regexPair, 'Eure');
    // 2. Einzelne Namen → 'ihr' (nur wenn nicht schon durch 'Eure' ersetzt)
    // Verhindere, dass 'Eure' zu 'ihr' wird
    // Ersetze nur, wenn der Name nicht Teil von 'Eure' ist
    const regexA = new RegExp(`\b${nameA}\b`, 'gi');
    const regexB = new RegExp(`\b${nameB}\b`, 'gi');
    result = result.replace(regexA, 'ihr');
    result = result.replace(regexB, 'ihr');
    // 3. Dopplung 'Eure und Eure' → 'Eure'
    result = result.replace(/Eure und Eure/gi, 'Eure');
    // 4. Dopplung 'ihr und ihr' → 'ihr'
    result = result.replace(/ihr und ihr/gi, 'ihr');
    // 5. Begrüßung: 'Hey ihr!' statt 'Hey Eure!'
    result = result.replace(/Hey Eure/gi, 'Hey ihr');
    return result;
  }

  return (
    <div className="space-y-6 w-full relative pb-24">
      {/* Begrüßungs-Card mit Profilbereich und Abmelde-Icon */}
      <Card className="border border-lavender/30 bg-white/80 mb-2 relative p-4 sm:p-5">
        {/* Icon-Buttons rechts oben */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 sm:gap-3 z-10">
          <button
            onClick={handleProfile}
            className="p-1.5 sm:p-2 rounded-full hover:bg-lavender/10 text-lavender hover:text-navlink transition"
            title="Profil"
          >
            <UserIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          <button
            onClick={handleSettings}
            className="p-1.5 sm:p-2 rounded-full hover:bg-lavender/10 text-lavender hover:text-navlink transition"
            title="Einstellungen"
          >
            <SettingsIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 sm:p-2 rounded-full hover:bg-lavender/10 text-lavender hover:text-navlink transition shadow-lg"
            title="Abmelden"
          >
            <LogOut className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Lumo-Logo: auf Mobil ausblenden */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-lavender rounded-full flex items-center justify-center text-white font-medium text-xl overflow-hidden hidden sm:flex">
            <img src={lumoLogo} alt="Lumo Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          </div>
          <div>
            <div className="font-semibold text-base sm:text-lg">Hallo {userName}</div>
            {partnerName && (
              <div className="text-xs sm:text-sm text-midnight/80 mt-1">
                Du bist mit {partnerName} schon {getDaysTogether()} Tage zusammen.
              </div>
            )}
          </div>
        </div>
      </Card>
      {/* Features-Card (neutral, ohne Profil) */}
      <Card title={<span className="flex items-center gap-2 text-navlink"><span className="text-2xl">✨</span>Lumo liest zwischen den Zeilen, damit ihr euch wirklich hört.</span>} className="border border-lavender/30 bg-white/80 mb-2">
        <ul className="list-disc pl-5 text-midnight/90 text-base space-y-1 mb-4">
          <li><strong>Next-Level Coach:</strong> Lumo erkennt Muster, analysiert alle Daten und gibt dir ehrliches, individuelles Feedback.</li>
          <li><strong>Glasklare Insights:</strong> Lumo liest zwischen den Zeilen und liefert sofort umsetzbare Impulse für mehr Nähe.</li>
          <li><strong>Astro & Psychologie:</strong> 360°-Beziehungsblick – klar, modern, einzigartig.</li>
        </ul>
        <button
          className="mt-6 px-5 py-2 rounded-xl bg-lavender text-white font-medium shadow hover:bg-lavender/80 transition"
          onClick={() => setShowCoach(true)}
        >
          Mit Lumo sprechen
        </button>
      </Card>
      {showPartnerLinkedInfo && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-6 py-4 mb-2 text-center font-medium shadow-sm">
          Partner erfolgreich verbunden! 🎉
        </div>
      )}
      <PartnerStatusBox
        userId={userId || ''}
        userName={userName}
        inviteCode={inviteCode}
        partnerLinked={partnerLinked}
        partnerName={partnerName}
        reloadDashboard={reloadDashboard}
        onPartnerLinked={handlePartnerLinked}
      />

      {/* Analyse/Astroanalyse Tabs */}
      {partnerLinked && (
        <Card className="border border-lavender/30 bg-white/80">
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${activeTab === 'analyse' ? 'bg-lavender text-white' : 'bg-lavender/10 text-lavender'}`}
              onClick={() => { setActiveTab('analyse'); reloadDashboard(); }}
            >
              Beziehung
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${activeTab === 'astro' ? 'bg-lavender text-white' : 'bg-lavender/10 text-lavender'}`}
              onClick={() => { setActiveTab('astro'); reloadDashboard(); }}
            >
              Astro
            </button>
          </div>
          <div className="pt-2">
            {activeTab === 'analyse' && (
              analysisLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="animate-spin text-lavender mb-3" size={32} />
                  <span className="text-midnight/70">Lumo analysiert eure Beziehung…</span>
                </div>
              ) : analysisError ? (
                <div className="flex flex-col items-center justify-center py-8 text-red-600">
                  <AlertCircle size={32} className="mb-2" />
                  <span>{analysisError}</span>
                </div>
              ) : analysis ? (
                <>
                  {/* Chat-Bubble mit Emoji statt Lumo-Avatar */}
                  <div className="flex items-start gap-3 bg-lavender/10 p-4 rounded-t-xl mb-2">
                    <span className="text-2xl">💜</span>
                    <div className="text-midnight/90 text-base">{(() => {
                      const allText = [analysis.summary, analysis.communication, analysis.attachment, analysis.values].join(' ');
                      const sentences = allText.match(/[^.!?]+[.!?]+/g) || [allText];
                      const summary = sentences.slice(0, 3).join(' ').trim();
                      return replaceNamesWithEure(summary, userName, partnerName);
                    })()}</div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 p-2">
                    <div className="bg-green-50 rounded-xl p-4 flex-1">
                      <div className="font-semibold text-green-700 flex items-center gap-2 mb-1 text-lg"><span>💪</span>Stärken</div>
                      <ul className="list-disc pl-5 text-midnight/90 text-sm">
                        {analysis.strengths && analysis.strengths.map((s, i) => <li key={i}>{replaceNamesWithEure(s, userName, partnerName)}</li>)}
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 flex-1">
                      <div className="font-semibold text-amber-700 flex items-center gap-2 mb-1 text-lg"><span>🌱</span>Wachstum</div>
                      <ul className="list-disc pl-5 text-midnight/90 text-sm">
                        {analysis.growthAreas && analysis.growthAreas.map((g, i) => <li key={i}>{replaceNamesWithEure(g, userName, partnerName)}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="p-4">
                    <button
                      onClick={() => setShowFullAnalysis(true)}
                      className="px-5 py-2 rounded-xl bg-lavender text-white font-medium shadow hover:bg-lavender/80 transition"
                    >
                      Ausführliche Analyse
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-midnight/60 py-6 text-center">Noch keine Analyse verfügbar.</div>
              )
            )}
            {activeTab === 'astro' && (
              analysisLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="animate-spin text-lavender mb-3" size={32} />
                  <span className="text-midnight/70">Astrologische Analyse wird erstellt…</span>
                </div>
              ) : analysisError ? (
                <div className="flex flex-col items-center justify-center py-8 text-red-600">
                  <AlertCircle size={32} className="mb-2" />
                  <span>{analysisError}</span>
                </div>
              ) : (!isAstroReady(userAstroData, userData?.astrology) && isAstroReady(partnerAstroData, partnerData?.astrology)) ? (
                <>
                  <div className="mb-3 text-midnight/80 text-sm text-center font-medium">
                    Dein Partner wartet auf dich! Gib jetzt deine Daten ein, damit Lumo eure astrologische Analyse berechnen kann.
                  </div>
                  <form
                    className="flex flex-col gap-3 bg-lavender/5 p-4 rounded-xl max-w-xs mx-auto"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setAstroFormLoading(true);
                      setAstroFormError(null);
                      setAstroFormSuccess(false);
                      try {
                        // E-Mail holen (aus State oder Supabase Auth)
                        let email = userEmail;
                        if (!email) {
                          const { data } = await supabase.auth.getUser();
                          email = data?.user?.email || '';
                        }
                        const { error } = await supabase
                          .from('user_profiles')
                          .update({
                            birth_date: astroForm.birthDate,
                            birth_time: astroForm.birthTime,
                            birth_place: astroForm.birthPlace,
                            astrology: true,
                            email: email,
                          })
                          .eq('id', userId);
                        if (error) throw error;
                        setAstroFormSuccess(true);
                        await reloadDashboard();
                      } catch (err: any) {
                        setAstroFormError('Fehler beim Speichern. Bitte versuche es erneut.');
                      } finally {
                        setAstroFormLoading(false);
                      }
                    }}
                  >
                    <label className="block text-sm font-medium text-midnight">Geburtsdatum</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender text-sm"
                      value={astroForm.birthDate}
                      onChange={e => setAstroForm(f => ({ ...f, birthDate: e.target.value }))}
                      required
                    />
                    <label className="block text-sm font-medium text-midnight">Geburtszeit</label>
                    <input
                      type="time"
                      className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender text-sm"
                      value={astroForm.birthTime}
                      onChange={e => setAstroForm(f => ({ ...f, birthTime: e.target.value }))}
                      required
                    />
                    <label className="block text-sm font-medium text-midnight">Geburtsort</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender text-sm"
                        value={astroForm.birthPlace}
                        onChange={handleBirthPlaceInput}
                        autoComplete="off"
                        required
                        placeholder="Geburtsort"
                      />
                      {birthPlaceSuggestions.length > 0 && (
                        <ul className="absolute z-10 left-0 right-0 bg-white border border-lavender/30 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg">
                          {birthPlaceSuggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="px-3 py-2 cursor-pointer hover:bg-lavender/10 text-midnight text-xs"
                              onClick={() => handleBirthPlaceSelect(suggestion)}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {astroFormError && <div className="text-red-600 text-xs mt-2">{astroFormError}</div>}
                    <button
                      type="submit"
                      className="mt-2 px-4 py-2 rounded-xl bg-lavender text-white font-medium shadow hover:bg-lavender/80 transition text-sm"
                      disabled={astroFormLoading}
                    >
                      {astroFormLoading ? 'Speichere…' : 'Astro-Daten speichern'}
                    </button>
                  </form>
                </>
              ) : (!isAstroReady(userAstroData, userData?.astrology) && !isAstroReady(partnerAstroData, partnerData?.astrology)) ? (
                <>
                  <div className="mb-3 text-midnight/80 text-sm text-center font-medium">
                    Gib deine Geburtsdaten ein, damit Lumo eine ausführliche astrologische Analyse für euch erstellen kann.
                  </div>
                  <form
                    className="flex flex-col gap-3 bg-lavender/5 p-4 rounded-xl max-w-xs mx-auto"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setAstroFormLoading(true);
                      setAstroFormError(null);
                      setAstroFormSuccess(false);
                      try {
                        // E-Mail holen (aus State oder Supabase Auth)
                        let email = userEmail;
                        if (!email) {
                          const { data } = await supabase.auth.getUser();
                          email = data?.user?.email || '';
                        }
                        const { error } = await supabase
                          .from('user_profiles')
                          .update({
                            birth_date: astroForm.birthDate,
                            birth_time: astroForm.birthTime,
                            birth_place: astroForm.birthPlace,
                            astrology: true,
                            email: email,
                          })
                          .eq('id', userId);
                        if (error) throw error;
                        setAstroFormSuccess(true);
                        await reloadDashboard();
                      } catch (err: any) {
                        setAstroFormError('Fehler beim Speichern. Bitte versuche es erneut.');
                      } finally {
                        setAstroFormLoading(false);
                      }
                    }}
                  >
                    <label className="block text-sm font-medium text-midnight">Geburtsdatum</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender text-sm"
                      value={astroForm.birthDate}
                      onChange={e => setAstroForm(f => ({ ...f, birthDate: e.target.value }))}
                      required
                    />
                    <label className="block text-sm font-medium text-midnight">Geburtszeit</label>
                    <input
                      type="time"
                      className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender text-sm"
                      value={astroForm.birthTime}
                      onChange={e => setAstroForm(f => ({ ...f, birthTime: e.target.value }))}
                      required
                    />
                    <label className="block text-sm font-medium text-midnight">Geburtsort</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender text-sm"
                        value={astroForm.birthPlace}
                        onChange={handleBirthPlaceInput}
                        autoComplete="off"
                        required
                        placeholder="Geburtsort"
                      />
                      {birthPlaceSuggestions.length > 0 && (
                        <ul className="absolute z-10 left-0 right-0 bg-white border border-lavender/30 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg">
                          {birthPlaceSuggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="px-3 py-2 cursor-pointer hover:bg-lavender/10 text-midnight text-xs"
                              onClick={() => handleBirthPlaceSelect(suggestion)}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {astroFormError && <div className="text-red-600 text-xs mt-2">{astroFormError}</div>}
                    <button
                      type="submit"
                      className="mt-2 px-4 py-2 rounded-xl bg-lavender text-white font-medium shadow hover:bg-lavender/80 transition text-sm"
                      disabled={astroFormLoading}
                    >
                      {astroFormLoading ? 'Speichere…' : 'Astro-Daten speichern'}
                    </button>
                  </form>
                </>
              ) : (analysis && analysis.astrology ? (
                <>
                  {/* Chat-Bubble mit Emoji statt Lumo-Avatar für Astro */}
                  <div className="flex items-start gap-3 bg-lavender/10 p-4 rounded-t-xl mb-2">
                    <span className="text-2xl">🔮</span>
                    <div className="text-midnight/90 text-base">
                      {(() => {
                        const s1 = analysis.astrology.gemeinsameStaerken || '';
                        const s2 = analysis.astrology.emotionaleDynamik || '';
                        const sentences = (s1 + ' ' + s2).match(/[^.!?]+[.!?]+/g) || [s1 + ' ' + s2];
                        return sentences.slice(0, 2).join(' ').trim();
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 p-2">
                    <div className="bg-green-50 rounded-xl p-4 flex-1">
                      <div className="font-semibold text-green-700 flex items-center gap-2 mb-1 text-lg"><span>💪</span>Astro-Stärken</div>
                      <ul className="list-disc pl-5 text-midnight/90 text-sm">
                        {analysis.astrology.gemeinsameStaerken &&
                          !['ausführlicher fließtext', 'in euren gemeinsamen astrologischen stärken zeigt sich eine tiefe verbundenheit'].some(placeholder => analysis.astrology.gemeinsameStaerken.toLowerCase().includes(placeholder)) &&
                          analysis.astrology.gemeinsameStaerken
                            .split(/\n|•|-/)
                            .map(s => s.trim())
                            .filter(Boolean)
                            .map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 flex-1">
                      <div className="font-semibold text-amber-700 flex items-center gap-2 mb-1 text-lg"><span>🌱</span>Astro-Wachstum</div>
                      <ul className="list-disc pl-5 text-midnight/90 text-sm">
                        {analysis.astrology.wachstumspotenzial &&
                          !['ausführlicher fließtext', 'euer wachstumspotenzial liegt in der vertiefung eurer emotionalen bindung', 'bewusst an eurer individuellen entwicklung und gemeinsamen zielen zu arbeiten'].some(placeholder => analysis.astrology.wachstumspotenzial.toLowerCase().includes(placeholder)) &&
                          analysis.astrology.wachstumspotenzial
                            .split(/\n|•|-/)
                            .map(s => s.trim())
                            .filter(Boolean)
                            .map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="p-4">
                    <button
                      onClick={() => setShowAstroAnalysis(true)}
                      className="px-5 py-2 rounded-xl bg-lavender text-white font-medium shadow hover:bg-lavender/80 transition"
                    >
                      Ausführliche Astroanalyse
                    </button>
                  </div>
                </>
              ) : null)
            )}
          </div>
        </Card>
      )}
      {/* Zweispaltiges Layout: Links Reflexion, rechts Aktionen */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto mt-6">
        {/* Linke Spalte: WeeklyReflectionCard + Jahrestag */}
        <div className="flex-1 min-w-[320px] flex flex-col gap-6">
          <WeeklyReflectionCard userId={userId || ''} partnerId={partnerLinked ? partnerName : undefined} />
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-sm w-full">
            <Gift className="w-6 h-6 text-lavender" />
            <p className="text-midnight">Jahrestag in 3 Tagen – <strong>Zeit für etwas Besonderes?</strong></p>
          </div>
        </div>
        {/* Rechte Spalte: Aktionen */}
        <div className="flex-1 min-w-[280px] flex flex-col gap-6">
          <Card title="Ich denk an dich" className="">
            <div className="py-4 px-2 flex flex-col items-center justify-center">
              <button 
                onClick={sendThinkingOfYouNotification}
                disabled={notificationSent}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  notificationSent 
                  ? 'bg-lavender' 
                  : 'bg-gradient-to-br from-lavender to-navlink hover:shadow-lg hover:scale-105'
                }`}
              >
                {notificationSent ? (
                  <Check className="w-7 h-7 text-white" />
                ) : (
                  <Heart className="w-7 h-7 text-white" />
                )}
              </button>
              <p className="text-xs text-center text-midnight/80 mt-3">
                {notificationSent 
                  ? "Nachricht gesendet!" 
                  : "Push-Mitteilung an deinen Partner senden"}
              </p>
            </div>
          </Card>
          <Card title="Vorgeschlagene Aktivitäten" className="">
            <div className="grid grid-cols-1 gap-2">
              <ActivityCard 
                title="Gemeinsam kochen" 
                description="Probiert dieses Wochenende ein neues Rezept aus"
                icon={<span className="text-2xl">🍲</span>}
              />
              <ActivityCard 
                title="Film-Abend" 
                description="Schaut euch einen Film aus eurer gemeinsamen Liste an"
                icon={<span className="text-2xl">🎬</span>}
              />
              <ActivityCard 
                title="Kommunikations-Challenge" 
                description="5 Minuten aktives Zuhören ohne Unterbrechung"
                icon={<span className="text-2xl">🗣️</span>}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* MODALS für ausführliche Analysen */}
      {showFullAnalysis && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-xl relative animate-fadeIn overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-midnight/60 hover:text-midnight text-2xl"
              onClick={() => setShowFullAnalysis(false)}
              aria-label="Schließen"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-navlink mb-6 flex items-center gap-2"><span>💜</span>Ausführliche Beziehungsanalyse</h2>
            <div className="space-y-5 text-midnight/90 text-base">
              <div className="bg-lavender/10 rounded-xl p-4 mb-2">
                <div className="font-semibold text-lavender flex items-center gap-2 mb-1 text-lg"><span>📝</span>Zusammenfassung</div>
                <div>{analysis?.summary}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="font-semibold text-green-700 flex items-center gap-2 mb-1 text-lg"><span>💪</span>Stärken</div>
                  <div>{analysis?.strengths?.join(' ')}</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="font-semibold text-amber-700 flex items-center gap-2 mb-1 text-lg"><span>🌱</span>Wachstum</div>
                  <div>{analysis?.growthAreas?.join(' ')}</div>
                </div>
              </div>
              <div className="bg-lavender/10 rounded-xl p-4">
                <div className="font-semibold text-lavender flex items-center gap-2 mb-1 text-lg"><span>🗣️</span>Kommunikation</div>
                <div>{analysis?.communication}</div>
              </div>
              <div className="bg-lavender/10 rounded-xl p-4">
                <div className="font-semibold text-lavender flex items-center gap-2 mb-1 text-lg"><span>🔗</span>Bindung</div>
                <div>{analysis?.attachment}</div>
              </div>
              <div className="bg-lavender/10 rounded-xl p-4">
                <div className="font-semibold text-lavender flex items-center gap-2 mb-1 text-lg"><span>💎</span>Werte</div>
                <div>{analysis?.values}</div>
              </div>
              <div className="bg-lavender/10 rounded-xl p-4">
                <div className="font-semibold text-lavender flex items-center gap-2 mb-1 text-lg"><span>💡</span>Tipp</div>
                <div>{analysis?.tip}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAstroAnalysis && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-xl relative animate-fadeIn overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-midnight/60 hover:text-midnight text-2xl"
              onClick={() => setShowAstroAnalysis(false)}
              aria-label="Schließen"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-navlink mb-6 flex items-center gap-2"><span>🔮</span>Ausführliche Astroanalyse</h2>
            {analysis?.astrology && (
              <div className="space-y-6 text-midnight/90 text-base">
                {/* Persönlichkeiten kompakt */}
                <div>
                  <div className="font-semibold text-lg mb-2 flex items-center gap-2"><span>🧿</span>Einzelanalyse & Persönlichkeiten</div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 bg-white rounded-xl p-4 border border-lavender/20">
                      <div className="font-bold text-lg mb-1">{analysis.astrology.personAName}</div>
                      <div className="text-sm text-midnight/70 mb-1">{formatBirthInfo(analysis.astrology.personABirth)}</div>
                      <div className="flex gap-2 text-sm mb-1">
                        <span>☀️ Sternzeichen: {cleanAstroValue(analysis.astrology.personASonne)}</span>
                        <span>🌙 Mondzeichen: {cleanAstroValue(analysis.astrology.personAMond)}</span>
                        <span>⬆️ Aszendent: {cleanAstroValue(analysis.astrology.personAAszendent)}</span>
                      </div>
                      <div className="text-midnight">{analysis.astrology.personACharakterKurz}</div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-4 border border-lavender/20">
                      <div className="font-bold text-lg mb-1">{analysis.astrology.personBName}</div>
                      <div className="text-sm text-midnight/70 mb-1">{formatBirthInfo(analysis.astrology.personBBirth)}</div>
                      <div className="flex gap-2 text-sm mb-1">
                        <span>☀️ Sternzeichen: {cleanAstroValue(analysis.astrology.personBSonne)}</span>
                        <span>🌙 Mondzeichen: {cleanAstroValue(analysis.astrology.personBMond)}</span>
                        <span>⬆️ Aszendent: {cleanAstroValue(analysis.astrology.personBAszendent)}</span>
                      </div>
                      <div className="text-midnight">{analysis.astrology.personBCharakterKurz}</div>
                    </div>
                  </div>
                </div>
                {/* Beziehungsdynamik */}
                <div>
                  <div className="font-semibold text-lg mb-2 flex items-center gap-2"><span>❤️</span>Synastrie & Beziehungsdynamik</div>
                  <div>{analysis.astrology.synastrie && splitToParagraphs(analysis.astrology.synastrie)}</div>
                </div>
                {/* Karmische Aspekte */}
                <div>
                  <div className="font-semibold text-lg mb-2 flex items-center gap-2"><span>🌀</span>Karmische & Seelenaspekte</div>
                  <div>{analysis.astrology.karmisch && splitToParagraphs(analysis.astrology.karmisch)}</div>
                </div>
                {/* Zusammenfassung */}
                <div>
                  <div className="font-semibold text-lg mb-2 flex items-center gap-2"><span>🌟</span>Zusammenfassung</div>
                  <div>{analysis.astrology.zusammenfassung && splitToParagraphs(analysis.astrology.zusammenfassung)}</div>
                </div>
                {/* Stärken & Herausforderungen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="font-semibold text-green-700 flex items-center gap-2 mb-1 text-lg"><span>💪</span>Stärken</div>
                    <div className="text-midnight/90 text-sm">{analysis.astrology.gemeinsameStaerken && splitToParagraphs(analysis.astrology.gemeinsameStaerken)}</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="font-semibold text-amber-700 flex items-center gap-2 mb-1 text-lg"><span>🌱</span>Herausforderungen</div>
                    <div className="text-midnight/90 text-sm">{analysis.astrology.wachstumspotenzial && splitToParagraphs(analysis.astrology.wachstumspotenzial)}</div>
                  </div>
                </div>
                {/* Tipps */}
                <div>
                  <div className="font-semibold text-lg mb-2 flex items-center gap-2"><span>💡</span>Tipps</div>
                  <div>{analysis.astrology.tipps && splitTipsWithDot(analysis.astrology.tipps)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Coach-Button unten rechts */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="bg-lavender text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:bg-lavender/80 transition"
          onClick={() => setShowCoach(true)}
          aria-label="Coach-Chat öffnen"
        >
          💬
        </button>
      </div>

      {showCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowCoach(false)}>
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden p-0" onClick={e => e.stopPropagation()}>
            <LumoCoach userId={userId || ''} userName={userName} partnerName={partnerName} onClose={() => setShowCoach(false)} />
          </div>
        </div>
      )}

      {/* Profile Popup */}
      {showProfilePopup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowProfilePopup(false)}>
          <div className="w-full max-w-xl m-6 bg-white rounded-2xl shadow-2xl overflow-hidden p-0 relative animate-fadeIn" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-midnight/60 hover:text-midnight text-2xl z-20"
              onClick={() => setShowProfilePopup(false)}
              aria-label="Schließen"
            >
              ✕
            </button>
            <div className="p-8">
              <Profile userId={userId || ''} />
            </div>
          </div>
        </div>
      )}

      {/* Settings Popup */}
      {showSettingsPopup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowSettingsPopup(false)}>
          <div className="w-full max-w-2xl m-6 bg-white rounded-2xl shadow-2xl overflow-hidden p-0 relative animate-fadeIn" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-midnight/60 hover:text-midnight text-2xl z-20"
              onClick={() => setShowSettingsPopup(false)}
              aria-label="Schließen"
            >
              ✕
            </button>
            <div className="p-8">
              <Settings user={{ id: userId || '' }} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ActivityCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#f3f0fa] p-4 rounded-xl flex items-start gap-3 hover:bg-[#ebe5f7] transition cursor-pointer">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-medium text-sm text-midnight">{title}</h3>
        <p className="text-xs text-midnight/70 mt-1">{description}</p>
      </div>
    </div>
  );
}

// Komponente für die kompakte Astro-Info-Card
function AstroSummaryDisplay({ astrologyText }: { astrologyText: string }) {
  // Extrahiere die Zusammenfassung (z.B. die ersten 2-3 Sätze)
  const sentences = astrologyText.match(/[^.!?]+[.!?]+/g) || [astrologyText];
  const summary = sentences.slice(0, 3).join(' ').trim();
  return (
    <div className="text-midnight/90 text-base mb-2">{summary}</div>
  );
}

export default Dashboard; 