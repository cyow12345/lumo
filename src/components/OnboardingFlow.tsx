import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle2, Copy, AlertCircle, Sparkles, Heart, MessageCircle, Star, Settings } from 'lucide-react';
import './OnboardingFlow.css';

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
  onCancel: () => void;
  isLoginOnboarding?: boolean;
}

interface UserData {
  // Schritt 1: Willkommen & Basics
  name: string;
  age: string;
  gender: string;
  happy_moments: string;
  growth_description: string;
  
  // Schritt 2: Über dich
  try_new_things: number;
  social_energy: number;
  plan_ahead: number;
  harmony_oriented: number;
  emotional_depth: number;
  
  // Schritt 3: Deine Beziehung
  relationship_start_date: string;
  time_together_pref: string;
  closeness_style: string;
  
  // Schritt 4: Kommunikation
  show_understanding: string;
  resolve_conflicts: string;
  evening_alone: string;
  separation_style: string;
  attachment_style: string;
  addressing_issues: string;
  emotional_expression: string;
  hurt_response: string;
  previous_conflict: string;
  emotional_conflicts: string;
  criticism_response: string;
  
  // Schritt 5: Werte & Persönlichkeit
  openness: number;
  extraversion: number;
  conscientiousness: number;
  agreeableness: number;
  neuroticism: number;
  relationship_values: RelationshipValue[];
  fidelity_meaning: string;
  values_priority: any;
  parental_influence: string;
  trust_experience: string;
  parental_patterns: string;
  
  // Schritt 6: Features
  whatsapp_import: boolean;
  astrology: boolean;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  
  // Schritt 7: Account
  email: string;
  password: string;
  
  // Schritt 8: Partner
  partner_code: string;
}

type RelationshipValue = 'Vertrauen' | 'Ehrlichkeit' | 'Kommunikation' | 'Respekt' | 'Leidenschaft' | 'Unabhängigkeit' | 'Humor' | 'Treue';

const RELATIONSHIP_VALUES: RelationshipValue[] = ['Vertrauen', 'Ehrlichkeit', 'Kommunikation', 'Respekt', 'Leidenschaft', 'Unabhängigkeit', 'Humor', 'Treue'];

const OnboardingFlow = ({ onComplete, onCancel, isLoginOnboarding = false }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);
  const [birthPlaceSuggestions, setBirthPlaceSuggestions] = useState<string[]>([]);
  const birthPlaceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const onboardingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (onboardingRef.current && !onboardingRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  const [userData, setUserData] = useState<UserData>({
    // Schritt 1: Willkommen & Basics
    name: '',
    age: '',
    gender: '',
    happy_moments: '',
    growth_description: '',
    
    // Schritt 2: Über dich
    try_new_things: 0,
    social_energy: 0,
    plan_ahead: 0,
    harmony_oriented: 0,
    emotional_depth: 0,
    
    // Schritt 3: Deine Beziehung
    relationship_start_date: '',
    time_together_pref: '',
    closeness_style: '',
    
    // Schritt 4: Kommunikation
    show_understanding: '',
    resolve_conflicts: '',
    evening_alone: '',
    separation_style: '',
    attachment_style: '',
    addressing_issues: '',
    emotional_expression: '',
    hurt_response: '',
    previous_conflict: '',
    emotional_conflicts: '',
    criticism_response: '',
    
    // Schritt 5: Werte & Persönlichkeit
    openness: 0,
    extraversion: 0,
    conscientiousness: 0,
    agreeableness: 0,
    neuroticism: 0,
    relationship_values: [],
    fidelity_meaning: '',
    values_priority: {},
    parental_influence: '',
    trust_experience: '',
    parental_patterns: '',
    
    // Schritt 6: Features
    whatsapp_import: false,
    astrology: false,
    birth_date: '',
    birth_time: '',
    birth_place: '',
    
    // Schritt 7: Account
    email: '',
    password: '',
    
    // Schritt 8: Partner
    partner_code: ''
  });

  // Reduziere die Anzahl der Schritte
  const totalSteps = 7;

  // Generiere einen Einladungscode im letzten Schritt
  useEffect(() => {
    if (step === totalSteps) {
      generateInviteCode();
    }
  }, [step]);

  // Generiere einen Einladungscode
  const generateInviteCode = () => {
    // Einfacher Code: Timestamp + 4 zufällige alphanumerische Zeichen
    const timestamp = Date.now().toString(36);
    const randomChars = Math.random().toString(36).substring(2, 6);
    const code = `${timestamp}-${randomChars}`.toUpperCase();
    setInviteCode(code);
  };

  // Kopiere den Code in die Zwischenablage
  const copyCodeToClipboard = () => {
    if (codeRef.current) {
      codeRef.current.select();
      document.execCommand('copy');
      setCodeCopied(true);
      
      // Zurücksetzen des Copy-Status nach 3 Sekunden
      setTimeout(() => setCodeCopied(false), 3000);
    }
  };

  // Generische Eingabeänderung mit Spezialfall für Geburtsuhrzeit
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Bei der Geburtsuhrzeit nur Ziffern und Doppelpunkte erlauben
    if (name === 'birth_time') {
      const sanitized = value.replace(/[^0-9:]/g, '');
      setUserData(prev => ({ ...prev, [name]: sanitized }));
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleScaleChange = (name: string, value: number) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name: string, value: RelationshipValue[]) => {
    if (name === 'relationship_values') {
      setUserData(prev => ({ ...prev, relationship_values: value }));
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      try {
        // Registrierung bei Supabase (wie gehabt)
        if (!userData.email) throw new Error('Bitte gib eine E-Mail-Adresse ein');
        if (!userData.password || userData.password.length < 8) throw new Error('Passwort muss mindestens 8 Zeichen lang sein');

        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              age: userData.age,
              gender: userData.gender,
              invite_code: inviteCode.toUpperCase()
            }
          }
        });

        if (error) {
          console.error('Registrierungsfehler:', error);
          alert(`Fehler bei der Registrierung: ${error.message}`);
          throw error;
        }

        // Profildaten in user_profiles speichern (jetzt garantiert mit invite_code)
        if (data.user) {
          const profileData = {
            name: userData.name,
            age: Number(userData.age),
            gender: userData.gender,
            happy_moments: userData.happy_moments,
            growth_description: userData.growth_description,
            relationship_start_date: userData.relationship_start_date || null,
            time_together_pref: userData.time_together_pref,
            closeness_style: userData.closeness_style,
            show_understanding: userData.show_understanding,
            resolve_conflicts: userData.resolve_conflicts,
            evening_alone: userData.evening_alone,
            separation_anxiety: userData.separation_style,
            attachment_style: userData.attachment_style,
            addressing_issues: userData.addressing_issues,
            emotional_expression: userData.emotional_expression,
            hurt_response: userData.hurt_response,
            previous_conflict: userData.previous_conflict,
            emotional_conflicts: userData.emotional_conflicts,
            criticism_response: userData.criticism_response,
            openness: userData.openness,
            extraversion: userData.extraversion,
            conscientiousness: userData.conscientiousness,
            agreeableness: userData.agreeableness,
            neuroticism: userData.neuroticism,
            relationship_values: userData.relationship_values,
            fidelity_meaning: userData.fidelity_meaning,
            values_priority: userData.values_priority,
            parental_influence: userData.parental_influence,
            trust_experience: userData.trust_experience,
            parental_patterns: userData.parental_patterns,
            whatsapp_import: userData.whatsapp_import,
            astrology: userData.astrology,
            birth_date: userData.birth_date || null,
            birth_time: userData.birth_time && userData.birth_time.length === 5 ? userData.birth_time + ':00' : userData.birth_time || null,
            birth_place: userData.birth_place,
            invite_code: inviteCode.toUpperCase()
          };
          console.log('[LUMO DEBUG] Profil wird gespeichert:', profileData);
          await supabase
            .from('user_profiles')
            .upsert([
              {
                id: data.user.id,
                ...profileData
              }
            ]);
          // Partnercode-Verknüpfung im Hintergrund
          if (userData.partner_code.trim()) {
            try {
              const { data: partner, error: partnerError } = await supabase
                .from('user_profiles')
                .select('id, partner_id')
                .eq('invite_code', userData.partner_code.trim().toUpperCase())
                .single();
              if (!partnerError && partner && typeof partner === 'object' && 'id' in partner && !('partner_id' in partner && partner.partner_id)) {
                // Verknüpfe beide User gegenseitig
                await supabase
                  .from('user_profiles')
                  .update({ partner_id: partner.id })
                  .eq('id', data.user.id);
                await supabase
                  .from('user_profiles')
                  .update({ partner_id: data.user.id })
                  .eq('id', partner.id);
                // Warte, bis die eigene partner_id wirklich gesetzt ist
                let tries = 0;
                let linked = false;
                while (tries < 10 && !linked) {
                  const { data: me } = await supabase
                    .from('user_profiles')
                    .select('partner_id')
                    .eq('id', data.user.id)
                    .single();
                  if (me && typeof me === 'object' && 'partner_id' in me && me.partner_id) {
                    linked = true;
                  } else {
                    await new Promise(res => setTimeout(res, 400));
                    tries++;
                  }
                }
              }
            } catch (err) {
              // Fehler bei der Partnerverknüpfung werden nicht angezeigt, Flow geht weiter
              console.warn('Partnerverknüpfung fehlgeschlagen:', err);
            }
          }
        }
        // Onboarding abschließen und direkt zum Dashboard weiterleiten
        onComplete(userData);
        window.location.reload();
      } catch (error) {
        console.error('Error during registration:', error);
        const message = error instanceof Error 
          ? error.message 
          : 'Es gab einen Fehler bei der Registrierung. Bitte versuche es erneut.';
        alert(message);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1: // Account + Basics
        return !userData.email ||
               !userData.password || userData.password.length < 8 ||
               !userData.name || !userData.age || !userData.gender;
      case 2: // Über dich
        return userData.try_new_things === 0 || 
               userData.social_energy === 0 || 
               userData.plan_ahead === 0 || 
               userData.harmony_oriented === 0 || 
               userData.emotional_depth === 0;
      case 3: // Deine Beziehung
        return !userData.relationship_start_date || 
               !userData.time_together_pref || 
               !userData.closeness_style;
      case 4: // Kommunikation
        return !userData.show_understanding || 
               !userData.resolve_conflicts;
      case 5: // Werte
        return userData.relationship_values.length === 0;
      case 6: // Features
        if (userData.astrology) {
          // Wenn Geburtsuhrzeit angegeben ist, muss sie exakt dem Muster HH:MM entsprechen
          if (userData.birth_time && !/^\d{2}:\d{2}$/.test(userData.birth_time)) {
            return true;
          }
        }
        return false; // Optional, solange obige Bedingung nicht greift
      case 7: // Partner + Einverständnisse
        return !acceptedPrivacy || !acceptedTerms;
      default:
        return false;
    }
  };

  // Hilfsfunktion für Skala-Komponente
  const ScaleInput = ({ 
    name, 
    value, 
    label, 
    minLabel = "Niedrig",
    maxLabel = "Hoch",
    icon
  }: { 
    name: string; 
    value: number; 
    label: string;
    minLabel?: string;
    maxLabel?: string;
    icon?: React.ReactNode;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <label className="text-sm font-medium text-midnight">{label}</label>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => handleScaleChange(name, parseInt(e.target.value))}
          className="w-full h-2 bg-lavender/20 rounded-lg appearance-none cursor-pointer accent-lavender"
        />
        <div className="flex justify-between text-xs text-midnight/60">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );

  // Autocomplete für Geburtsort
  const handleBirthPlaceInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserData(prev => ({ ...prev, birth_place: value }));
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
    setUserData(prev => ({ ...prev, birth_place: suggestion }));
    setBirthPlaceSuggestions([]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 z-50" onClick={() => onCancel()}>
      <div ref={onboardingRef} className="bg-white w-full h-full md:h-auto md:rounded-2xl md:max-h-[90vh] md:w-full md:max-w-3xl shadow-xl relative animate-fadeIn z-20 flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Logo - nur auf Desktop anzeigen */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none hidden md:block">
          <img src="/lumo_logox.png" alt="Lumo Logo" className="w-20 h-20" />
        </div>

        {/* Progress Bar */}
        <div className="px-4 md:px-8 pt-4 md:pt-12">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-midnight/60">Schritt {step} von {totalSteps}</span>
            <span className="text-xs font-medium text-navlink">{Math.round((step / totalSteps) * 100)}% geschafft</span>
          </div>
          <div className="h-1.5 bg-lavender/10 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-navlink to-lavender rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-4">
          {/* Schritt 1 */}
          {step === 1 && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="text-center space-y-1">
                <h2 className="text-lg md:text-xl font-bold text-navlink">✨ Willkommen bei Lumo!</h2>
                <p className="text-sm text-midnight/80">Lass uns dich ein bisschen kennenlernen</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-midnight">Wie heißt du?</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    placeholder="Dein Name"
                    className="w-full p-2.5 border border-lavender/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/20 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-midnight">Wie alt bist du?</label>
                  <input
                    type="number"
                    name="age"
                    value={userData.age}
                    onChange={handleInputChange}
                    placeholder="Dein Alter"
                    min="18"
                    max="120"
                    className="w-full p-2.5 border border-lavender/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/20 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-midnight">E-Mail-Adresse</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    placeholder="deine@email.de"
                    className="w-full p-2.5 border border-lavender/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/20 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-midnight">Passwort</label>
                  <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    placeholder="Min. 8 Zeichen"
                    className="w-full p-2.5 border border-lavender/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/20 text-sm"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-medium text-midnight">Dein Geschlecht</label>
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-lavender/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/20 text-sm"
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="male">Männlich</option>
                    <option value="female">Weiblich</option>
                    <option value="diverse">Divers</option>
                    <option value="no_answer">Keine Angabe</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-medium text-midnight">
                    Was macht dich in deiner Beziehung besonders glücklich?
                    <span className="text-midnight/60 text-xs block mt-0.5">
                      Das hilft uns, dich und deine Beziehung besser zu verstehen
                    </span>
                  </label>
                  <textarea
                    name="happy_moments"
                    value={userData.happy_moments}
                    onChange={handleInputChange}
                    placeholder="z.B. gemeinsames Lachen, tiefe Gespräche, spontane Überraschungen..."
                    className="w-full p-2.5 border border-lavender/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/20 text-sm h-16"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Schritt 2 */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-navlink">🌟 Über dich</h2>
                <p className="text-sm sm:text-base text-midnight/80">Ein paar Fragen zu deiner Persönlichkeit</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ScaleInput
                    name="try_new_things"
                    value={userData.try_new_things}
                    label="Ich liebe es, Neues auszuprobieren"
                    minLabel="Trifft gar nicht zu"
                    maxLabel="Trifft voll zu"
                    icon={<Star className="w-5 h-5 text-lavender" />}
                  />

                  <ScaleInput
                    name="social_energy"
                    value={userData.social_energy}
                    label="Zeit mit anderen Menschen gibt mir Energie"
                    minLabel="Eher nicht"
                    maxLabel="Absolut"
                    icon={<Heart className="w-5 h-5 text-lavender" />}
                  />

                  <ScaleInput
                    name="plan_ahead"
                    value={userData.plan_ahead}
                    label="Ich plane gerne im Voraus"
                    minLabel="Spontan ist besser"
                    maxLabel="Plane gerne"
                    icon={<Settings className="w-5 h-5 text-lavender" />}
                  />

                  <ScaleInput
                    name="harmony_oriented"
                    value={userData.harmony_oriented}
                    label="Harmonie ist mir wichtig"
                    minLabel="Nicht so wichtig"
                    maxLabel="Sehr wichtig"
                    icon={<MessageCircle className="w-5 h-5 text-lavender" />}
                  />

                  <ScaleInput
                    name="emotional_depth"
                    value={userData.emotional_depth}
                    label="Ich denke viel über Gefühle nach"
                    minLabel="Eher selten"
                    maxLabel="Sehr oft"
                    icon={<Heart className="w-5 h-5 text-lavender" />}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Schritt 3 */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-navlink">❤️ Deine Beziehung</h2>
                <p className="text-sm sm:text-base text-midnight/80">Erzähl uns von eurer gemeinsamen Zeit</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-6 shadow-sm">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-midnight">Wann hat eure Beziehung angefangen?</label>
                    <input
                      type="date"
                      name="relationship_start_date"
                      value={userData.relationship_start_date}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-midnight/60">Dieser besondere Tag hilft uns, eure Meilensteine zu feiern</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-midnight">Wie verbringt ihr am liebsten Zeit zusammen?</label>
                    <select
                      name="time_together_pref"
                      value={userData.time_together_pref}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="activities">Gemeinsame Aktivitäten & Abenteuer</option>
                      <option value="talks">Tiefe Gespräche führen</option>
                      <option value="relaxing">Entspannt zusammen sein</option>
                      <option value="hobbies">Gemeinsame Hobbies teilen</option>
                      <option value="mixed">Eine Mischung aus allem</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-midnight">Was bedeutet Nähe für dich?</label>
                    <select
                      name="closeness_style"
                      value={userData.closeness_style}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="emotional">Emotionale Verbundenheit & tiefe Gespräche</option>
                      <option value="physical">Körperliche Nähe & Zärtlichkeit</option>
                      <option value="activities">Gemeinsame Erlebnisse teilen</option>
                      <option value="support">Füreinander da sein & sich unterstützen</option>
                    </select>
                  </div>
                </div>

                <div className="bg-lavender/5 rounded-xl p-4">
                  <p className="text-xs text-midnight/70 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-lavender" />
                    Jede Beziehung ist einzigartig - wir helfen euch, eure Stärken zu entdecken!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Schritt 4 */}
          {step === 4 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-navlink">💭 Kommunikation</h2>
                <p className="text-sm sm:text-base text-midnight/80">Der Schlüssel zu einer starken Beziehung</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-6 shadow-sm">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-midnight">
                      Wie zeigst du deinem Partner, dass du ihn/sie verstehst?
                      <span className="text-xs text-midnight/60 block mt-1">
                        Deine persönliche Art der Anteilnahme
                      </span>
                    </label>
                    <select
                      name="show_understanding"
                      value={userData.show_understanding}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="listen">Aktiv zuhören und nachfragen</option>
                      <option value="comfort">Trösten und in den Arm nehmen</option>
                      <option value="support">Praktische Unterstützung anbieten</option>
                      <option value="space">Raum für Gefühle geben</option>
                      <option value="share">Eigene ähnliche Erfahrungen teilen</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-midnight">
                      Wie löst du Meinungsverschiedenheiten am liebsten?
                      <span className="text-xs text-midnight/60 block mt-1">
                        Dein Weg zu gemeinsamen Lösungen
                      </span>
                    </label>
                    <select
                      name="resolve_conflicts"
                      value={userData.resolve_conflicts}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="talk">Ruhig darüber sprechen</option>
                      <option value="compromise">Nach Kompromissen suchen</option>
                      <option value="pause">Eine Pause nehmen und später besprechen</option>
                      <option value="understand">Versuchen, den anderen zu verstehen</option>
                      <option value="creative">Kreative Lösungen finden</option>
                    </select>
                  </div>
                </div>

                <div className="bg-lavender/5 rounded-xl p-4">
                  <p className="text-xs text-midnight/70 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-lavender" />
                    Toll! Offene Kommunikation ist der Weg zu mehr Verbundenheit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Schritt 5 - Werte */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h2 className="text-xl font-bold text-navlink">⭐ Eure Beziehungswerte</h2>
                <p className="text-sm text-midnight/80">Was macht eure Beziehung besonders?</p>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-midnight mb-2">
                      Wähle 3 Werte, die eure Beziehung besonders auszeichnen
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { value: 'Vertrauen', icon: '🤝', description: 'Wir können uns blind aufeinander verlassen' },
                        { value: 'Ehrlichkeit', icon: '💫', description: 'Wir sind immer offen und ehrlich zueinander' },
                        { value: 'Kommunikation', icon: '💭', description: 'Wir sprechen über alles, was uns bewegt' },
                        { value: 'Respekt', icon: '🙏', description: 'Wir schätzen unsere Unterschiede' },
                        { value: 'Leidenschaft', icon: '❤️', description: 'Unsere Liebe ist voller Energie' },
                        { value: 'Unabhängigkeit', icon: '🦋', description: 'Wir geben uns Freiraum zur Entfaltung' },
                        { value: 'Humor', icon: '😊', description: 'Wir lachen viel zusammen' },
                        { value: 'Treue', icon: '💝', description: 'Wir stehen füreinander ein' }
                      ].map(({ value, icon, description }) => (
                        <label 
                          key={value} 
                          className={`flex items-start p-2 border rounded-lg cursor-pointer transition-all text-sm ${
                            userData.relationship_values.includes(value as RelationshipValue)
                              ? 'border-lavender bg-lavender/5 text-navlink'
                              : 'border-lavender/30 hover:bg-lavender/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={userData.relationship_values.includes(value as RelationshipValue)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleMultiSelect('relationship_values', [...userData.relationship_values, value as RelationshipValue].slice(0, 3));
                              } else {
                                handleMultiSelect('relationship_values', userData.relationship_values.filter(v => v !== value));
                              }
                            }}
                            className="form-checkbox text-lavender mr-2 mt-1"
                            disabled={!userData.relationship_values.includes(value as RelationshipValue) && userData.relationship_values.length >= 3}
                          />
                          <div>
                            <div className="flex items-center gap-1 font-medium">
                              <span>{icon}</span>
                              <span>{value}</span>
                            </div>
                            <p className="text-xs text-midnight/60 mt-0.5 line-clamp-2">{description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {userData.relationship_values.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-midnight">
                        Woran möchtet ihr gemeinsam wachsen?
                        <span className="text-midnight/60 text-xs block">
                          Jede Beziehung entwickelt sich stetig weiter
                        </span>
                      </label>
                      <textarea
                        name="growth_description"
                        value={userData.growth_description || ''}
                        onChange={handleInputChange}
                        placeholder="z.B.: Wir möchten mehr Zeit für tiefe Gespräche finden..."
                        className="w-full p-2 border border-lavender/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/20 text-sm h-16"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Schritt 6 - Features */}
          {step === 6 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-navlink">✨ Zusätzliche Features</h2>
                <p className="text-sm sm:text-base text-midnight/80">Entdecke mehr Möglichkeiten mit Lumo</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-green-50 rounded-xl">
                      <div className="flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-green-900">WhatsApp Chat-Import</h3>
                        <p className="text-xs text-green-700 mt-1">
                          Importiere eure WhatsApp-Chats für tiefere Einblicke in eure Kommunikation
                        </p>
                        <div className="mt-3 flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="whatsapp_import"
                              checked={userData.whatsapp_import === true}
                              onChange={() => setUserData(prev => ({ ...prev, whatsapp_import: true }))}
                              className="form-radio text-green-600"
                            />
                            <span className="text-sm text-green-900">Ja, interessiert mich</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="whatsapp_import"
                              checked={userData.whatsapp_import === false}
                              onChange={() => setUserData(prev => ({ ...prev, whatsapp_import: false }))}
                              className="form-radio text-green-600"
                            />
                            <span className="text-sm text-green-900">Nein, danke</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-purple-50 rounded-xl">
                      <div className="flex-shrink-0">
                        <Star className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-purple-900">Astrologie-Features</h3>
                        <p className="text-xs text-purple-700 mt-1">
                          Entdecke astrologische Einblicke in eure Beziehungsdynamik
                        </p>
                        <div className="mt-3 flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="astrology"
                              checked={userData.astrology === true}
                              onChange={() => setUserData(prev => ({ ...prev, astrology: true }))}
                              className="form-radio text-lavender"
                            />
                            <span className="text-sm text-purple-900">Ja, interessiert mich</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="astrology"
                              checked={userData.astrology === false}
                              onChange={() => setUserData(prev => ({ ...prev, astrology: false }))}
                              className="form-radio text-lavender"
                            />
                            <span className="text-sm text-purple-900">Nein, danke</span>
                          </label>
                        </div>

                        {userData.astrology && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
                            {/* Geburtsort */}
                            <div className="space-y-2 sm:col-span-4">
                              <label className="block text-xs font-medium text-midnight/80">Geburtsort</label>
                              <input
                                type="text"
                                name="birth_place"
                                value={userData.birth_place}
                                onChange={handleBirthPlaceInput}
                                placeholder="Stadt oder Ort"
                                className="w-full p-3 border border-lavender/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                              />
                              {birthPlaceSuggestions.length > 0 && (
                                <ul className="border border-lavender/30 rounded-lg bg-white max-h-40 overflow-y-auto mt-1 text-sm">
                                  {birthPlaceSuggestions.map((suggestion) => (
                                    <li
                                      key={suggestion}
                                      onClick={() => handleBirthPlaceSelect(suggestion)}
                                      className="px-3 py-2 hover:bg-lavender/10 cursor-pointer"
                                    >
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Geburtszeit */}
                            <div className="space-y-2 sm:col-span-1">
                              <label className="block text-xs font-medium text-midnight/80">Geburtsuhrzeit</label>
                              <input
                                type="text"
                                name="birth_time"
                                value={userData.birth_time}
                                onChange={handleInputChange}
                                placeholder="HH:MM"
                                maxLength={5}
                                inputMode="numeric"
                                pattern="[0-9]{2}:[0-9]{2}"
                                className="w-32 sm:w-24 p-3 border border-lavender/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm appearance-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schritt 7 */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h2 className="text-xl font-bold text-navlink">💑 Verbindet eure Profile</h2>
                <p className="text-sm text-midnight/80">Startet eure gemeinsame Reise mit Lumo</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Persönlicher Einladungscode */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Dein persönlicher Code</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      ref={codeRef}
                      type="text"
                      value={inviteCode}
                      readOnly
                      className="bg-white p-2 rounded-lg border border-blue-200 w-full text-center text-sm"
                    />
                    <button
                      onClick={copyCodeToClipboard}
                      className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {codeCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Teile diesen Code mit deinem Partner
                  </p>
                </div>

                {/* Partner Code Eingabe */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Code deines Partners</h3>
                  <input
                    type="text"
                    name="partner_code"
                    value={userData.partner_code}
                    onChange={handleInputChange}
                    placeholder="CODE EINGEBEN"
                    className="w-full bg-white p-2 rounded-lg border border-blue-200 text-center text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <p className="text-xs text-blue-700 mt-1">
                    Gib hier den Code deines Partners ein
                  </p>
                </div>

                {/* Features Liste */}
                <div className="sm:col-span-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-midnight/70">
                    <div className="flex items-center gap-1 bg-lavender/5 rounded-lg p-2">
                      <CheckCircle2 className="w-4 h-4 text-lavender" />
                      <span>Beziehung verstehen</span>
                    </div>
                    <div className="flex items-center gap-1 bg-lavender/5 rounded-lg p-2">
                      <CheckCircle2 className="w-4 h-4 text-lavender" />
                      <span>Gemeinsame Ziele</span>
                    </div>
                    <div className="flex items-center gap-1 bg-lavender/5 rounded-lg p-2">
                      <CheckCircle2 className="w-4 h-4 text-lavender" />
                      <span>Kommunikation</span>
                    </div>
                    <div className="flex items-center gap-1 bg-lavender/5 rounded-lg p-2">
                      <CheckCircle2 className="w-4 h-4 text-lavender" />
                      <span>Gegenseitige Hilfe</span>
                    </div>
                  </div>
                </div>

                {/* Rechtliche Einverständnisse */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="flex items-start gap-2 text-sm text-midnight/80">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 form-checkbox text-navlink"
                    />
                    <span className="text-xs">
                      Ich akzeptiere die <a href="/agb" target="_blank" className="underline hover:text-navlink">AGBs</a>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-sm text-midnight/80">
                    <input
                      type="checkbox"
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      className="mt-0.5 form-checkbox text-navlink"
                    />
                    <span className="text-xs">
                      Ich akzeptiere die <a href="/datenschutz" target="_blank" className="underline hover:text-navlink">Datenschutzerklärung</a>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons - fixed at bottom on mobile */}
        <div className="mt-auto border-t border-lavender/20 p-4 bg-white">
          <div className="flex justify-between gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm text-midnight/60 hover:text-midnight transition-colors"
            >
              Zurück
            </button>
            <button
              onClick={handleNext}
              disabled={isNextDisabled()}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                isNextDisabled()
                  ? 'bg-navlink/30 text-white cursor-not-allowed'
                  : 'bg-navlink text-white hover:bg-navlink/80'
              }`}
            >
              {step === totalSteps ? 'Fertig' : 'Weiter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow; 