import React, { useState, useEffect, useRef } from 'react';
import { Smile, Heart, Gift, Quote, Bell, Check, Users, LinkIcon, CheckCircle2, Loader2, AlertCircle, MessageCircle, User as UserIcon, LogOut, Settings as SettingsIcon, ShoppingBag, Home } from "lucide-react";
import Card from "./Card";
import { supabase } from '../lib/supabaseClient';
import { analyzeRelationship, PersonData, RelationshipData, AnalysisResult, triggerAnalysisUpdate, AnalysisUpdateTrigger, shouldUpdateAnalysis } from '../services/analyzeRelationship';
import PartnerStatusBox from './PartnerStatusBox';
import WeeklyReflectionCard from './WeeklyReflectionCard';
import LumoHerzensfluesterer from './LumoHerzensfluesterer';
import Profile from './Profile';
import Settings from './Settings';
import Shop from './Shop';

// Füge die LumoChat Interface-Definition am Anfang der Datei hinzu
interface LumoChatWindow extends Window {
  LumoChat?: {
    setShowTypeSelector: (show: boolean) => void;
  }
}

declare const window: LumoChatWindow;

// Federn-Belohnungen für verschiedene Aktionen
const FEATHER_REWARDS = {
  VIBE_CHECK: 10,
  THINKING_OF_YOU: 5,
  FIRST_VIBE_CHECK: 20,
  STREAK_BONUS: 15
};

interface DashboardProps {
  userId: string;
  featherBalance?: number;
  onFeatherBalanceChange?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, featherBalance, onFeatherBalanceChange }) => {
  const [notificationSent, setNotificationSent] = useState(false);
  const [notificationDisabled, setNotificationDisabled] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [partnerLinked, setPartnerLinked] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [showPartnerLinkedInfo, setShowPartnerLinkedInfo] = useState(false);

  // State für die Analyse
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // State für das Startdatum der Beziehung
  const [relationshipStartDate, setRelationshipStartDate] = useState<string | null>(null);

  // Entferne Astro-bezogene States
  const [activeTab, setActiveTab] = useState<'analyse' | 'home' | 'profile' | 'settings'>('analyse');

  // Dashboard reload helper
  const reloadDashboard = async () => {
    await loadUserData();
  };

  // Lade Benutzerdaten und Partnerverknüpfung
  const [userData, setUserData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  const loadUserData = async () => {
    if (!userId) return;

    // Bereinige die userId von möglichen Zusätzen
    const cleanUserId = userId.split(':')[0];
    console.log('Lade Benutzerdaten für bereinigte ID:', cleanUserId);

    try {
      const { data: userDataRaw, error: userError } = await supabase
        .from('user_profiles')
        .select('name, invite_code, partner_id, age, gender, attachment_style, addressing_issues, relationship_values, parental_influence, relationship_start_date, relationship_status, avatar_url')
        .eq('id', cleanUserId)
        .single();

      if (userError) {
        console.error('Fehler beim Laden der Benutzerdaten:', userError);
        throw userError;
      }

      if (userDataRaw && typeof userDataRaw === 'object' && 'name' in userDataRaw) {
        console.log('Benutzerdaten geladen:', userDataRaw);
        setUserData(userDataRaw);
        setUserName('name' in userDataRaw ? userDataRaw.name : 'Benutzer');
        setInviteCode('invite_code' in userDataRaw ? userDataRaw.invite_code : '');
        setPartnerLinked('partner_id' in userDataRaw && !!userDataRaw.partner_id);
        setRelationshipStartDate('relationship_start_date' in userDataRaw ? userDataRaw.relationship_start_date : null);
        setPartnerName('');

        if ('partner_id' in userDataRaw && userDataRaw.partner_id) {
          console.log('Lade Partnerdaten für:', userDataRaw.partner_id);
          const { data: partnerDataRaw, error: partnerError } = await supabase
            .from('user_profiles')
            .select('id, name, partner_id, age, gender, attachment_style, addressing_issues, relationship_values, parental_influence')
            .eq('id', userDataRaw.partner_id)
            .single();

          if (!partnerError && partnerDataRaw && typeof partnerDataRaw === 'object' && 'name' in partnerDataRaw) {
            console.log('Partnerdaten geladen:', partnerDataRaw);
            setPartnerData(partnerDataRaw);
            setPartnerName('name' in partnerDataRaw ? partnerDataRaw.name : '');

            // Aktualisiere Partner-IDs wenn nötig
            if (partnerDataRaw.partner_id !== cleanUserId) {
              console.log('Aktualisiere Partner-ID des Partners');
              await supabase
                .from('user_profiles')
                .update({ partner_id: cleanUserId })
                .eq('id', partnerDataRaw.id);
            }
            if (userDataRaw.partner_id !== partnerDataRaw.id) {
              console.log('Aktualisiere Partner-ID des Benutzers');
              await supabase
                .from('user_profiles')
                .update({ partner_id: partnerDataRaw.id })
                .eq('id', cleanUserId);
            }

            // Starte Analyse
            setAnalysisLoading(true);
            setAnalysisError(null);
            try {
              console.log('Bereite Analysedaten vor...');
              const personA: PersonData = {
                id: cleanUserId,
                name: userDataRaw.name,
                age: userDataRaw.age,
                gender: userDataRaw.gender,
                attachmentStyle: userDataRaw.attachment_style,
                communication: userDataRaw.addressing_issues,
                values: userDataRaw.relationship_values || [],
                childhood: userDataRaw.parental_influence
              };
              const personB: PersonData = {
                id: partnerDataRaw.id,
                name: partnerDataRaw.name,
                age: partnerDataRaw.age,
                gender: partnerDataRaw.gender,
                attachmentStyle: partnerDataRaw.attachment_style,
                communication: partnerDataRaw.addressing_issues,
                values: partnerDataRaw.relationship_values || [],
                childhood: partnerDataRaw.parental_influence
              };
              const relationship: RelationshipData = {
                relationshipStartDate: userDataRaw.relationship_start_date,
                relationshipStatus: userDataRaw.relationship_status,
              };
              console.log('Starte Analyse mit Daten:', { personA, personB, relationship });
              const result = await analyzeRelationship(personA, personB, relationship);
              if (!result) {
                throw new Error('Analyse ergab kein Ergebnis');
              }
              console.log('Analyseergebnis:', result);
              setAnalysis(result);
            } catch (err: any) {
              console.error('Fehler bei der Analyse:', err);
              setAnalysisError(err.message || 'Analyse fehlgeschlagen. Bitte versuche es später erneut.');
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
    document.title = 'Lumo - liest zwischen den Zeilen, damit ihr euch wirklich hört!';
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

  // Entferne den lokalen featherBalance State
  const [showFeatherAnimation, setShowFeatherAnimation] = useState(false);
  const [earnedFeathers, setEarnedFeathers] = useState<number>(0);

  // Funktion zum Hinzufügen von Federn
  const addFeathers = async (amount: number, reason: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('golden_feather_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          reason: reason
        });

      if (error) throw error;

      setEarnedFeathers(amount);
      setShowFeatherAnimation(true);
      setTimeout(() => {
        setShowFeatherAnimation(false);
        setEarnedFeathers(0);
        if (onFeatherBalanceChange) {
          onFeatherBalanceChange();
        }
      }, 2000);
    } catch (err) {
      console.error('Fehler beim Hinzufügen der Federn:', err);
    }
  };

  // Lade den Federn-Stand beim Start
  useEffect(() => {
    if (onFeatherBalanceChange) {
      onFeatherBalanceChange();
    }
  }, [userId]);

  // Prüfe, ob heute bereits eine Nachricht gesendet wurde
  useEffect(() => {
    if (!userId) return;

    const checkTodayNotification = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('thinking_of_you_notifications')
        .select('sent_at')
        .eq('user_id', userId)
        .gte('sent_at', today.toISOString())
        .order('sent_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Fehler beim Prüfen der Benachrichtigungen:', error);
        return;
      }

      if (data && data.length > 0) {
        setNotificationDisabled(true);
        setNotificationSent(true);
      }
    };

    checkTodayNotification();
  }, [userId]);

  const sendThinkingOfYouNotification = async () => {
    if (!userId || notificationDisabled) return;

    try {
      // Speichere die Benachrichtigung in der Datenbank
      const { error: notificationError } = await supabase
        .from('thinking_of_you_notifications')
        .insert([{ user_id: userId }]);

      if (notificationError) throw notificationError;

      setNotificationSent(true);
      setNotificationDisabled(true);
      
      // Füge Federn hinzu und zeige Animation
      await addFeathers(FEATHER_REWARDS.THINKING_OF_YOU, 'thinking_of_you');
      setEarnedFeathers(FEATHER_REWARDS.THINKING_OF_YOU);
      setShowFeatherAnimation(true);
      
      // Zeige Erfolgsanimation für 3 Sekunden
      setTimeout(() => {
        setNotificationSent(false);
      }, 3000);

      // Verstecke Federn-Animation nach 2 Sekunden
      setTimeout(() => {
        setShowFeatherAnimation(false);
        setEarnedFeathers(0);
        if (onFeatherBalanceChange) {
          onFeatherBalanceChange();
        }
      }, 2000);
    } catch (error) {
      console.error('Fehler beim Senden der Benachrichtigung:', error);
    }
  };

  // Entferne Astro-bezogene Funktionen
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [nextUpdateDate, setNextUpdateDate] = useState<Date | null>(null);

  useEffect(() => {
    const checkUpdateStatus = async () => {
      if (userId && partnerData?.id) {
        try {
          // Hole den Update-Status aus der Datenbank
          const { data: analysisData } = await supabase
            .from('relationship_analysis')
            .select('next_update_at')
            .eq('user_id', userId)
            .eq('partner_id', partnerData.id)
            .single();

          if (analysisData) {
            const nextUpdate = new Date(analysisData.next_update_at);
            setNextUpdateDate(nextUpdate);
            setCanUpdate(nextUpdate <= new Date());
          } else {
            setCanUpdate(true);
          }
        } catch (error) {
          console.error('Fehler beim Prüfen des Update-Status:', error);
        }
      }
    };

    checkUpdateStatus();
  }, [userId, partnerData?.id]);

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
  const [showShop, setShowShop] = useState(false);

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
  const lumoLogo = '/lumo_logo.png';

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

  // Partner-UUID laden, wenn userId bekannt
  useEffect(() => {
    if (!userId) return;
    const fetchPartnerId = async () => {
      // Hole das eigene Profil
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('partner_id')
        .eq('id', userId)
        .single();
      if (!error && userProfile && userProfile.partner_id) {
        setPartnerId(userProfile.partner_id);
        setPartnerLinked(true);
      } else {
        // Suche, ob jemand diesen User als Partner hat
        const { data: possiblePartner, error: partnerError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('partner_id', userId)
          .single();
        if (!partnerError && possiblePartner && possiblePartner.id) {
          setPartnerId(possiblePartner.id);
          setPartnerLinked(true);
        } else {
          setPartnerId(null);
          setPartnerLinked(false);
        }
      }
    };
    fetchPartnerId();
  }, [userId]);

  // Funktion zur Berechnung des nächsten Jahrestags
  const getNextAnniversary = () => {
    if (!relationshipStartDate) return null;

    const start = new Date(relationshipStartDate);
    const today = new Date();
    
    // Setze das Jahr des Jahrestags auf das aktuelle Jahr
    let nextAnniversary = new Date(start);
    nextAnniversary.setFullYear(today.getFullYear());
    
    // Wenn der Jahrestag dieses Jahr bereits vorbei ist, nehme nächstes Jahr
    if (nextAnniversary < today) {
      nextAnniversary.setFullYear(today.getFullYear() + 1);
    }
    
    // Berechne die Tage bis zum nächsten Jahrestag
    const diffTime = Math.abs(nextAnniversary.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Berechne das wievielte Jahr es sein wird
    const years = nextAnniversary.getFullYear() - start.getFullYear();
    
    return {
      date: nextAnniversary,
      daysUntil: diffDays,
      years: years
    };
  };

  // Event-Listener für das Schließen der Analyse
  useEffect(() => {
    const handleCloseAnalysis = () => {
      setShowFullAnalysis(false);
    };

    window.addEventListener('closeAnalysis', handleCloseAnalysis);
    return () => {
      window.removeEventListener('closeAnalysis', handleCloseAnalysis);
    };
  }, []);

  // Hilfsfunktion für die Begrüßungsnachricht basierend auf der Tageszeit
  const getTimeBasedMessage = () => {
    const now = new Date();
    const hours = now.getHours();

    if (hours < 12) {
      return 'Guten Morgen!';
    } else if (hours < 18) {
      return 'Guten Tag!';
    } else {
      return 'Guten Abend!';
    }
  };

  const greeting = getTimeBasedMessage();

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Header Card mit Profil - noch kompakter */}
      <Card className="border border-lavender/30 bg-white/80 relative p-1.5 mx-2 mt-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* User-Profilbild */}
            <div className="w-6 h-6 md:w-10 md:h-10 bg-lavender rounded-full flex items-center justify-center text-white font-medium text-xs md:text-lg overflow-hidden">
              {userData?.avatar_url ? (
                <img src={userData.avatar_url} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span>{userName?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="text-xs md:text-base">
                {partnerName ? `${userName} & ${partnerName}` : `Hallo ${userName}`}
              </div>
              {partnerName && (
                <div className="text-[10px] md:text-sm text-midnight/60">
                  {getDaysTogether()} Tage zusammen
                </div>
              )}
            </div>
          </div>

          {/* Federn-Anzeige Mobile */}
          <div className="sm:hidden">
            <div 
              className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-200 to-yellow-400 rounded-full shadow-md cursor-pointer hover:shadow-lg transition"
              onClick={() => setShowShop(true)}
            >
              <div className="bg-white/80 rounded-full p-0.5 shadow-inner">
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4 filter drop-shadow">
                  <path
                    d="M20.7 7.5c1.3 3.7.3 7.8-2.5 10.6-2.8 2.8-6.9 3.8-10.6 2.5l-3.1 3.1c-.2.2-.5.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l3.1-3.1c-1.3-3.7-.3-7.8 2.5-10.6 2.8-2.8 6.9-3.8 10.6-2.5l-7.5 7.5c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7.5-7.5z"
                    fill="url(#feather-gradient-mobile)"
                    className="drop-shadow-lg"
                  />
                  <path
                    d="M12 4c-.3 0-.5.1-.7.3l-7 7c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7-7c.4-.4.4-1 0-1.4-.2-.2-.4-.3-.7-.3z"
                    fill="url(#feather-shine-mobile)"
                    className="drop-shadow-md"
                  />
                  <defs>
                    <linearGradient id="feather-gradient-mobile" x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="60%" stopColor="#FFA500" />
                      <stop offset="100%" stopColor="#FF8C00" />
                    </linearGradient>
                    <linearGradient id="feather-shine-mobile" x1="8" y1="4" x2="8" y2="13" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFF5CC" />
                      <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-semibold text-white drop-shadow-sm text-[10px] md:text-sm">{featherBalance}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Federn-Animation */}
      {showFeatherAnimation && (
        <div className="fixed top-4 right-20 z-50 animate-fadeInUp">
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-400 px-3 py-1 rounded-full shadow-lg">
            <div className="bg-white/80 rounded-full p-1 shadow-inner">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 filter drop-shadow"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.7 7.5c1.3 3.7.3 7.8-2.5 10.6-2.8 2.8-6.9 3.8-10.6 2.5l-3.1 3.1c-.2.2-.5.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l3.1-3.1c-1.3-3.7-.3-7.8 2.5-10.6 2.8-2.8 6.9-3.8 10.6-2.5l-7.5 7.5c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7.5-7.5z"
                  fill="url(#feather-gradient-anim)"
                  className="drop-shadow-lg"
                  style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))' }}
                />
                <path
                  d="M12 4c-.3 0-.5.1-.7.3l-7 7c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7-7c.4-.4.4-1 0-1.4-.2-.2-.4-.3-.7-.3z"
                  fill="url(#feather-shine-anim)"
                  className="drop-shadow-md"
                />
                <defs>
                  <linearGradient id="feather-gradient-anim" x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="60%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </linearGradient>
                  <linearGradient id="feather-shine-anim" x1="8" y1="4" x2="8" y2="13" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFF5CC" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-white font-medium">+{earnedFeathers}</span>
          </div>
        </div>
      )}

      {/* Main Content Area - kompaktere Abstände */}
      <div className="flex-1 overflow-y-auto px-2 pt-0.5">
        {showPartnerLinkedInfo && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-2 py-1 mb-0.5 text-center text-[10px]">
            Partner erfolgreich verbunden! 🎉
          </div>
        )}

        {/* Partner Status */}
        <div className="mb-0.5">
          <PartnerStatusBox
            userId={userId || ''}
            userName={userName}
            inviteCode={inviteCode}
            partnerLinked={partnerLinked}
            partnerName={partnerName || ''}
            reloadDashboard={reloadDashboard}
            onPartnerLinked={handlePartnerLinked}
          />
        </div>

        {/* Beziehungsanalyse und Vibe Check nebeneinander auf Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 sm:gap-4">
          {/* Beziehungsanalyse - Links auf Desktop */}
          {partnerLinked && (
            <Card className="border border-lavender/30 bg-white/80">
              <div className="p-1.5 sm:p-5">
                {analysisLoading ? (
                  <div className="flex items-center justify-center py-1.5 sm:py-6">
                    <Loader2 className="animate-spin text-lavender mr-2 w-4 h-4 sm:w-[24px] sm:h-[24px]" />
                    <span className="text-xs sm:text-base text-midnight/70">Analysiere...</span>
                  </div>
                ) : analysisError ? (
                  <div className="flex items-center justify-center py-1.5 sm:py-6 text-red-600 text-xs sm:text-base">
                    <AlertCircle className="w-4 h-4 sm:w-[24px] sm:h-[24px] mr-2" />
                    <span>{analysisError}</span>
                  </div>
                ) : analysis ? (
                  <>
                    <div className="flex items-start gap-1.5 sm:gap-3 bg-lavender/10 p-2 sm:p-5 rounded-lg sm:rounded-xl mb-1.5 sm:mb-4 text-xs sm:text-base">
                      <span className="text-base sm:text-2xl">💜</span>
                      <div className="text-midnight/90 leading-snug">
                        {/* Mobile Version - 3 Sätze */}
                        <div className="block sm:hidden">
                          {(() => {
                            const allText = [analysis.summary, analysis.communication, analysis.attachment, analysis.values].join(' ');
                            const sentences = allText.match(/[^.!?]+[.!?]+/g) || [allText];
                            const summary = sentences.slice(0, 3).join(' ').trim();
                            return replaceNamesWithEure(summary, userName, partnerName || '');
                          })()}
                        </div>
                        {/* Desktop Version - 3 Sätze */}
                        <div className="hidden sm:block">
                          {(() => {
                            const allText = [analysis.summary, analysis.communication, analysis.attachment, analysis.values].join(' ');
                            const sentences = allText.match(/[^.!?]+[.!?]+/g) || [allText];
                            const summary = sentences.slice(0, 3).join(' ').trim();
                            return replaceNamesWithEure(summary, userName, partnerName || '');
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Stärken und Wachstum nur auf Desktop */}
                    <div className="hidden sm:grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="font-medium text-green-700 flex items-center gap-2 mb-2 text-base"><span>💪</span>Stärken</div>
                        <ul className="text-sm text-midnight/90 pl-5 list-disc">
                          {analysis.strengths && analysis.strengths.slice(0, 2).map((s, i) =>
                            <li key={i}>{replaceNamesWithEure(s, userName, partnerName || '')}</li>
                          )}
                        </ul>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="font-medium text-amber-700 flex items-center gap-2 mb-2 text-base"><span>🌱</span>Wachstum</div>
                        <ul className="text-sm text-midnight/90 pl-5 list-disc">
                          {analysis.growthAreas && analysis.growthAreas.slice(0, 2).map((g, i) =>
                            <li key={i}>{replaceNamesWithEure(g, userName, partnerName || '')}</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowFullAnalysis(true)}
                      className="w-full px-2 py-1 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl bg-navlink text-white text-[10px] sm:text-base font-medium shadow hover:bg-navlink/80 transition mt-0 sm:mt-4"
                    >
                      Ausführliche Analyse
                    </button>
                  </>
                ) : (
                  <div className="text-midnight/60 py-1.5 sm:py-6 text-center text-xs sm:text-base">Noch keine Analyse verfügbar.</div>
                )}
              </div>
            </Card>
          )}

          {/* Vibe Check - Rechts auf Desktop */}
          <div className={`${partnerLinked ? '' : 'sm:col-span-2'} space-y-0.5 sm:space-y-4`}>
            <WeeklyReflectionCard
              userId={userId || ''}
              partnerId={partnerId || undefined}
              partnerName={partnerName || undefined}
              onEarnFeathers={addFeathers}
            />

            {/* Thinking of You - kompakter auf Mobile, größer auf Desktop */}
            <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4">
              <div className="flex items-center gap-1 text-[10px] sm:text-sm text-amber-600 mb-2">
                <div className="bg-white/80 rounded-full p-0.5 shadow-inner">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-2.5 h-2.5 sm:w-4 sm:h-4"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="feather-gradient-thinking" x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="60%" stopColor="#FFA500" />
                        <stop offset="100%" stopColor="#FF8C00" />
                      </linearGradient>
                      <linearGradient id="feather-shine-thinking" x1="8" y1="4" x2="8" y2="13" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FFF5CC" />
                        <stop offset="100%" stopColor="#FFD700" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20.7 7.5c1.3 3.7.3 7.8-2.5 10.6-2.8 2.8-6.9 3.8-10.6 2.5l-3.1 3.1c-.2.2-.5.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l3.1-3.1c-1.3-3.7-.3-7.8 2.5-10.6 2.8-2.8 6.9-3.8 10.6-2.5l-7.5 7.5c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7.5-7.5z"
                      fill="url(#feather-gradient-thinking)"
                      className="drop-shadow-lg"
                    />
                    <path
                      d="M12 4c-.3 0-.5.1-.7.3l-7 7c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7-7c.4-.4.4-1 0-1.4-.2-.2-.4-.3-.7-.3z"
                      fill="url(#feather-shine-thinking)"
                      className="drop-shadow-md"
                    />
                  </svg>
                </div>
                <span>+{FEATHER_REWARDS.THINKING_OF_YOU} Federn</span>
              </div>

              {notificationDisabled ? (
                <div className="flex flex-col items-center mt-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-lavender/40 to-navlink/40 flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-50" />
                  </div>
                  <p className="text-xs sm:text-sm text-midnight/50">Heute schon gesendet</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <button
                    onClick={sendThinkingOfYouNotification}
                    disabled={notificationDisabled}
                    className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      notificationDisabled
                        ? 'bg-gradient-to-br from-lavender/40 to-navlink/40'
                        : notificationSent
                          ? 'bg-gradient-to-br from-green-400 to-green-500 scale-95'
                          : 'bg-gradient-to-br from-lavender to-navlink hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {notificationSent ? (
                      <Check className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Heart className={`w-4 h-4 sm:w-6 sm:h-6 text-white ${notificationDisabled ? 'opacity-50' : ''}`} />
                    )}
                  </button>
                  {notificationSent ? (
                    <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">Nachricht gesendet!</p>
                  ) : (
                    <p className="text-xs sm:text-sm text-midnight/80 mt-1">Push-Mitteilung senden</p>
                  )}
                </div>
              )}
            </div>

            {/* Jahrestags-Hinweis - größer auf Mobile */}
            {relationshipStartDate && (
              <div className="bg-white rounded-lg shadow-sm p-2.5 flex items-center gap-2 text-xs">
                <Gift className="w-4 h-4 text-lavender flex-shrink-0" />
                {(() => {
                  const anniversary = getNextAnniversary();
                  if (!anniversary) return null;

                  if (anniversary.daysUntil === 0) {
                    return (
                      <div>
                        <p className="text-midnight">
                          <strong>Heute ist euer {anniversary.years}. Jahrestag!</strong> 🎉
                        </p>
                      </div>
                    );
                  }

                  return (
                    <p className="text-midnight">
                      {anniversary.daysUntil === 1 ? (
                        <>Morgen ist euer <strong>{anniversary.years}. Jahrestag</strong> 💝</>
                      ) : (
                        <>Noch {anniversary.daysUntil} Tage bis zu eurem <strong>{anniversary.years}. Jahrestag</strong> 💭</>
                      )}
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFullAnalysis && (
        <>
          {/* Mobile Version */}
          <div className="fixed inset-0 bg-white z-20 overflow-auto sm:hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 border-b border-lavender/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💜</span>
                <h2 className="text-xl font-bold text-[#332d6e]">Ausführliche Beziehungsanalyse</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Zusammenfassung */}
              <div className="bg-[#f8f5ff] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">📝</span>
                  <h3 className="text-base font-semibold">Zusammenfassung</h3>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {analysis?.summary}
                </div>
              </div>

              {/* Kommunikation */}
              <div className="bg-[#f8f5ff] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">💭</span>
                  <h3 className="text-base font-semibold">Kommunikation</h3>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {analysis?.communication}
                </div>
              </div>

              {/* Stärken */}
              <div className="bg-[#f3fff5] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">💪</span>
                  <h3 className="text-base font-semibold text-green-700">Stärken</h3>
                </div>
                <div className="space-y-2">
                  {analysis?.strengths?.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-sm text-gray-700">•</span>
                      <span className="text-sm text-gray-700">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wachstum */}
              <div className="bg-[#fff8f0] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🌱</span>
                  <h3 className="text-base font-semibold text-amber-700">Wachstum</h3>
                </div>
                <div className="space-y-2">
                  {analysis?.growthAreas?.map((g, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-sm text-gray-700">•</span>
                      <span className="text-sm text-gray-700">{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bindung */}
              <div className="bg-[#f8f5ff] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🔗</span>
                  <h3 className="text-base font-semibold">Bindung</h3>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {analysis?.attachment}
                </div>
              </div>

              {/* Werte */}
              <div className="bg-[#f8f5ff] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">💎</span>
                  <h3 className="text-base font-semibold">Werte</h3>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {analysis?.values}
                </div>
              </div>

              {/* Platzhalter für das Menü */}
              <div className="h-24 bg-white" aria-hidden="true"></div>
            </div>
          </div>

          {/* Desktop Version - bleibt unverändert */}
          <div 
            className="hidden sm:flex fixed inset-0 bg-black/40 z-40 items-center justify-center p-4"
            onClick={() => setShowFullAnalysis(false)}
          >
            <div 
              className="bg-white rounded-3xl p-8 w-full max-w-[1100px] shadow-xl relative animate-fadeIn overflow-y-auto max-h-[95vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
                <span className="text-2xl sm:text-3xl">💜</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#332d6e]">Ausführliche Beziehungsanalyse</h2>
              </div>

              {/* Content Grid - Stack auf Mobile, Grid auf Desktop */}
              <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-[1fr_1fr] sm:gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Zusammenfassung */}
                  <div className="bg-[#f8f5ff] rounded-xl sm:rounded-3xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base sm:text-lg">📝</span>
                      <h3 className="text-base sm:text-lg font-semibold">Zusammenfassung</h3>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {analysis?.summary}
                    </div>
                  </div>

                  {/* Kommunikation */}
                  <div className="bg-[#f8f5ff] rounded-xl sm:rounded-3xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base sm:text-lg">💭</span>
                      <h3 className="text-base sm:text-lg font-semibold">Kommunikation</h3>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {analysis?.communication}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Stärken & Wachstum */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#f3fff5] rounded-xl sm:rounded-3xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base sm:text-lg">💪</span>
                        <h3 className="text-base sm:text-lg font-semibold text-green-700">Stärken</h3>
                      </div>
                      <div className="space-y-2">
                        {analysis?.strengths?.map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-sm text-gray-700">•</span>
                            <span className="text-sm text-gray-700">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#fff8f0] rounded-xl sm:rounded-3xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base sm:text-lg">🌱</span>
                        <h3 className="text-base sm:text-lg font-semibold text-amber-700">Wachstum</h3>
                      </div>
                      <div className="space-y-2">
                        {analysis?.growthAreas?.map((g, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-sm text-gray-700">•</span>
                            <span className="text-sm text-gray-700">{g}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bindung & Werte */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#f8f5ff] rounded-xl sm:rounded-3xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base sm:text-lg">🔗</span>
                        <h3 className="text-base sm:text-lg font-semibold">Bindung</h3>
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {analysis?.attachment}
                      </div>
                    </div>

                    <div className="bg-[#f8f5ff] rounded-xl sm:rounded-3xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base sm:text-lg">💎</span>
                        <h3 className="text-base sm:text-lg font-semibold">Werte</h3>
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {analysis?.values}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowFullAnalysis(false)}
                className="absolute top-3 right-3 text-midnight/60 hover:text-midnight p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating Coach-Button unten rechts */}
      {/* Chat-Button entfernt */}

      {showCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowCoach(false)}>
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden p-0" onClick={e => e.stopPropagation()}>
            <LumoHerzensfluesterer 
              userId={userId || ''} 
              userName={userName} 
              partnerName={partnerName || ''} 
              partnerLinked={partnerLinked} 
              onClose={() => {
                setShowCoach(false);
                // Setze showTypeSelector auf true, wenn der Chat geschlossen wird
                if (window.LumoChat) {
                  window.LumoChat.setShowTypeSelector(true);
                }
              }} 
            />
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

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowShop(false)}>
          <div className="w-full" onClick={e => e.stopPropagation()}>
            <Shop featherBalance={featherBalance || 0} onClose={() => setShowShop(false)} />
          </div>
        </div>
      )}

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-lavender/20 sm:hidden z-50">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => {
              setActiveTab('home');
              setShowFullAnalysis(false);  // Schließe die Analyse
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'home' ? 'text-navlink' : 'text-midnight/60'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px]">Home</span>
          </button>
          <button
            onClick={handleProfile}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'profile' ? 'text-navlink' : 'text-midnight/60'
            }`}
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-[10px]">Profil</span>
          </button>
          <button
            onClick={handleSettings}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'settings' ? 'text-navlink' : 'text-midnight/60'
            }`}
          >
            <SettingsIcon className="w-6 h-6" />
            <span className="text-[10px]">Einstellungen</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-midnight/60"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px]">Abmelden</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard; 