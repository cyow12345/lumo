import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle2, Copy, AlertCircle, Sparkles, Heart, MessageCircle, Star, Settings } from 'lucide-react';

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
  tryNewThings: number;
  socialEnergy: number;
  planAhead: number;
  harmonyOriented: number;
  emotionalDepth: number;
  
  // Schritt 3: Deine Beziehung
  relationshipStartDate: string;
  time_together_pref: string;
  closeness_style: string;
  
  // Schritt 4: Kommunikation
  show_understanding: string;
  resolve_conflicts: string;
  evening_alone: string;
  separationStyle: string;
  attachmentStyle: string;
  addressingIssues: string;
  emotionalExpression: string;
  hurtResponse: string;
  previousConflict: string;
  emotionalConflicts: string;
  criticismResponse: string;
  
  // Schritt 5: Werte & Persönlichkeit
  openness: number;
  extraversion: number;
  conscientiousness: number;
  agreeableness: number;
  neuroticism: number;
  relationshipValues: RelationshipValue[];
  fidelityMeaning: string;
  valuesPriority: any;
  parentalInfluence: string;
  trustExperience: string;
  parentalPatterns: string;
  
  // Schritt 6: Features
  whatsappImport: boolean;
  astrology: boolean;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  
  // Schritt 7: Account
  email: string;
  password: string;
  
  // Schritt 8: Partner
  partnerCode: string;
}

type RelationshipValue = 'Vertrauen' | 'Ehrlichkeit' | 'Kommunikation' | 'Respekt' | 'Leidenschaft' | 'Unabhängigkeit' | 'Humor' | 'Treue';

const RELATIONSHIP_VALUES: RelationshipValue[] = ['Vertrauen', 'Ehrlichkeit', 'Kommunikation', 'Respekt', 'Leidenschaft', 'Unabhängigkeit', 'Humor', 'Treue'];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onCancel, isLoginOnboarding = false }) => {
  const [step, setStep] = useState(1);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);
  const [birthPlaceSuggestions, setBirthPlaceSuggestions] = useState<string[]>([]);
  const birthPlaceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [userData, setUserData] = useState<UserData>({
    // Schritt 1: Willkommen & Basics
    name: '',
    age: '',
    gender: '',
    happy_moments: '',
    growth_description: '',
    
    // Schritt 2: Über dich
    tryNewThings: 0,
    socialEnergy: 0,
    planAhead: 0,
    harmonyOriented: 0,
    emotionalDepth: 0,
    
    // Schritt 3: Deine Beziehung
    relationshipStartDate: '',
    time_together_pref: '',
    closeness_style: '',
    
    // Schritt 4: Kommunikation
    show_understanding: '',
    resolve_conflicts: '',
    evening_alone: '',
    separationStyle: '',
    attachmentStyle: '',
    addressingIssues: '',
    emotionalExpression: '',
    hurtResponse: '',
    previousConflict: '',
    emotionalConflicts: '',
    criticismResponse: '',
    
    // Schritt 5: Werte & Persönlichkeit
    openness: 0,
    extraversion: 0,
    conscientiousness: 0,
    agreeableness: 0,
    neuroticism: 0,
    relationshipValues: [],
    fidelityMeaning: '',
    valuesPriority: {},
    parentalInfluence: '',
    trustExperience: '',
    parentalPatterns: '',
    
    // Schritt 6: Features
    whatsappImport: false,
    astrology: false,
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    
    // Schritt 7: Account
    email: '',
    password: '',
    
    // Schritt 8: Partner
    partnerCode: ''
  });

  // Reduziere die Anzahl der Schritte
  const totalSteps = 8;

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleScaleChange = (name: string, value: number) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name: string, value: RelationshipValue[]) => {
    if (name === 'relationshipValues') {
      setUserData(prev => ({ ...prev, relationshipValues: value }));
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
            relationship_start_date: userData.relationshipStartDate || null,
            time_together_pref: userData.time_together_pref,
            closeness_style: userData.closeness_style,
            show_understanding: userData.show_understanding,
            resolve_conflicts: userData.resolve_conflicts,
            evening_alone: userData.evening_alone,
            separation_anxiety: userData.separationStyle,
            attachment_style: userData.attachmentStyle,
            addressing_issues: userData.addressingIssues,
            emotional_expression: userData.emotionalExpression,
            hurt_response: userData.hurtResponse,
            previous_conflict: userData.previousConflict,
            emotional_conflicts: userData.emotionalConflicts,
            criticism_response: userData.criticismResponse,
            openness: userData.openness,
            extraversion: userData.extraversion,
            conscientiousness: userData.conscientiousness,
            agreeableness: userData.agreeableness,
            neuroticism: userData.neuroticism,
            relationship_values: userData.relationshipValues,
            fidelity_meaning: userData.fidelityMeaning,
            values_priority: userData.valuesPriority,
            parental_influence: userData.parentalInfluence,
            trust_experience: userData.trustExperience,
            parental_patterns: userData.parentalPatterns,
            whatsapp_import: userData.whatsappImport,
            astrology: userData.astrology,
            birth_date: userData.birthDate || null,
            birth_time: userData.birthTime && userData.birthTime.length === 5 ? userData.birthTime + ':00' : userData.birthTime || null,
            birth_place: userData.birthPlace,
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
          if (userData.partnerCode.trim()) {
            try {
              const { data: partner, error: partnerError } = await supabase
                .from('user_profiles')
                .select('id, partner_id')
                .eq('invite_code', userData.partnerCode.trim().toUpperCase())
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
      case 1: // Willkommen & Basics
        return !userData.name || !userData.age || !userData.gender;
      case 2: // Über dich
        return userData.tryNewThings === 0 || 
               userData.socialEnergy === 0 || 
               userData.planAhead === 0 || 
               userData.harmonyOriented === 0 || 
               userData.emotionalDepth === 0;
      case 3: // Deine Beziehung
        return !userData.relationshipStartDate || 
               !userData.time_together_pref || 
               !userData.closeness_style;
      case 4: // Kommunikation
        return !userData.show_understanding || 
               !userData.resolve_conflicts;
      case 5: // Werte
        return userData.relationshipValues.length === 0;
      case 6: // Features
        return false; // Optional
      case 7: // Account
        return !userData.email || 
               !userData.password || 
               userData.password.length < 8;
      case 8: // Partner
        return false; // Optional
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
    setUserData(prev => ({ ...prev, birthPlace: value }));
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
    setUserData(prev => ({ ...prev, birthPlace: suggestion }));
    setBirthPlaceSuggestions([]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl px-6 sm:px-12 pt-16 pb-8 w-full max-w-4xl shadow-xl relative animate-fadeIn z-20">
        {/* Logo */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <img src="/lumo_logo.png" alt="Lumo Logo" className="w-20 h-20 sm:w-24 sm:h-24" />
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8 pt-2">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-midnight/60">Schritt {step} von {totalSteps}</span>
            <span className="text-xs sm:text-sm font-medium text-navlink">{Math.round((step / totalSteps) * 100)}% geschafft</span>
          </div>
          <div className="h-2 bg-lavender/10 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-navlink to-lavender rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-6 sm:mb-8 overflow-y-auto max-h-[calc(100vh-12rem)] sm:max-h-[70vh]">
          {/* Schritt 1 */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-navlink">✨ Willkommen bei Lumo!</h2>
                <p className="text-sm sm:text-base text-midnight/80">Lass uns dich ein bisschen kennenlernen</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-midnight">Wie heißt du?</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    placeholder="Dein Name"
                    className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-midnight">Wie alt bist du?</label>
                  <input
                    type="number"
                    name="age"
                    value={userData.age}
                    onChange={handleInputChange}
                    placeholder="Dein Alter"
                    min="18"
                    max="120"
                    className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-midnight">Dein Geschlecht</label>
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="male">Männlich</option>
                    <option value="female">Weiblich</option>
                    <option value="diverse">Divers</option>
                    <option value="no_answer">Keine Angabe</option>
                  </select>
                </div>

                <div className="space-y-2 mt-6">
                  <label className="block text-sm font-medium text-midnight">
                    Was macht dich in deiner Beziehung besonders glücklich? 
                    <span className="text-midnight/60 text-xs block mt-1">
                      Das hilft uns, dich und deine Beziehung besser zu verstehen
                    </span>
                  </label>
                  <textarea
                    name="happy_moments"
                    value={userData.happy_moments}
                    onChange={handleInputChange}
                    placeholder="z.B. gemeinsames Lachen, tiefe Gespräche, spontane Überraschungen..."
                    className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm h-24"
                  />
                </div>
              </div>

              <div className="bg-lavender/5 rounded-xl p-4 mt-6">
                <p className="text-xs text-midnight/70 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lavender" />
                  Schön, dass du da bist! In den nächsten Schritten lernen wir uns noch besser kennen.
                </p>
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
                    name="tryNewThings"
                    value={userData.tryNewThings}
                    label="Ich liebe es, Neues auszuprobieren"
                    minLabel="Trifft gar nicht zu"
                    maxLabel="Trifft voll zu"
                    icon={<Star className="w-5 h-5 text-lavender" />}
                  />

                  <ScaleInput
                    name="socialEnergy"
                    value={userData.socialEnergy}
                    label="Zeit mit anderen Menschen gibt mir Energie"
                    minLabel="Eher nicht"
                    maxLabel="Absolut"
                    icon={<Heart className="w-5 h-5 text-lavender" />}
                  />

                  <ScaleInput
                    name="planAhead"
                    value={userData.planAhead}
                    label="Ich plane gerne im Voraus"
                    minLabel="Spontan ist besser"
                    maxLabel="Plane gerne"
                    icon={<Settings className="w-5 h-5 text-lavender" />}
                  />

                  <ScaleInput
                    name="harmonyOriented"
                    value={userData.harmonyOriented}
                    label="Harmonie ist mir wichtig"
                    minLabel="Nicht so wichtig"
                    maxLabel="Sehr wichtig"
                    icon={<MessageCircle className="w-5 h-5 text-lavender" />}
                  />

                  <ScaleInput
                    name="emotionalDepth"
                    value={userData.emotionalDepth}
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
                      name="relationshipStartDate"
                      value={userData.relationshipStartDate}
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
                      <option value="space">Nähe mit Freiraum für beide</option>
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
                      name="showUnderstanding"
                      value={userData.showUnderstanding}
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
                      Was hilft dir am besten bei unterschiedlichen Meinungen?
                      <span className="text-xs text-midnight/60 block mt-1">
                        Dein Weg zu gemeinsamen Lösungen
                      </span>
                    </label>
                    <select
                      name="resolveConflicts"
                      value={userData.resolveConflicts}
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
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-navlink">⭐ Eure Beziehungswerte</h2>
                <p className="text-sm sm:text-base text-midnight/80">Was macht eure Beziehung besonders?</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-6 shadow-sm">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-midnight">
                      Wähle 3 Werte, die eure Beziehung besonders auszeichnen
                      <span className="text-xs text-midnight/60 block mt-1">
                        Jeder dieser Werte ist wichtig - wähle die, die euch am besten beschreiben
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                            userData.relationshipValues.includes(value as RelationshipValue)
                              ? 'border-lavender bg-lavender/5 text-navlink'
                              : 'border-lavender/30 hover:bg-lavender/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={userData.relationshipValues.includes(value as RelationshipValue)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleMultiSelect('relationshipValues', [...userData.relationshipValues, value as RelationshipValue].slice(0, 3));
                              } else {
                                handleMultiSelect('relationshipValues', userData.relationshipValues.filter(v => v !== value));
                              }
                            }}
                            className="form-checkbox text-lavender mr-3 mt-1"
                            disabled={!userData.relationshipValues.includes(value as RelationshipValue) && userData.relationshipValues.length >= 3}
                          />
                          <div>
                            <div className="flex items-center gap-2 font-medium">
                              <span>{icon}</span>
                              <span>{value}</span>
                            </div>
                            <p className="text-xs text-midnight/60 mt-1">{description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {userData.relationshipValues.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <label className="block text-sm font-medium text-midnight">
                        Woran möchtet ihr gemeinsam wachsen?
                        <span className="text-midnight/60 text-xs block mt-1">
                          Jede Beziehung entwickelt sich stetig weiter - das ist etwas Positives!
                        </span>
                      </label>
                      <textarea
                        name="growthDescription"
                        value={userData.growthDescription || ''}
                        onChange={handleInputChange}
                        placeholder="z.B.: Wir möchten mehr Zeit für tiefe Gespräche finden und uns gegenseitig noch besser zuhören..."
                        className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm h-24"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-lavender/5 rounded-xl p-4">
                  <p className="text-xs text-midnight/70 flex items-center gap-2">
                    <Star className="w-4 h-4 text-lavender" />
                    Gemeinsames Wachstum stärkt eure Verbindung - schön, dass ihr diesen Weg zusammen geht!
                  </p>
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
                              name="whatsappImport"
                              checked={userData.whatsappImport === true}
                              onChange={() => setUserData(prev => ({ ...prev, whatsappImport: true }))}
                              className="form-radio text-green-600"
                            />
                            <span className="text-sm text-green-900">Ja, interessiert mich</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="whatsappImport"
                              checked={userData.whatsappImport === false}
                              onChange={() => setUserData(prev => ({ ...prev, whatsappImport: false }))}
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schritt 7 */}
          {step === 7 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-navlink">🔐 Dein Account</h2>
                <p className="text-sm sm:text-base text-midnight/80">Sichere dir Zugang zu allen Features</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-midnight">E-Mail-Adresse</label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        placeholder="deine@email.de"
                        className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-midnight">Passwort</label>
                      <input
                        type="password"
                        name="password"
                        value={userData.password}
                        onChange={handleInputChange}
                        placeholder="Min. 8 Zeichen"
                        className="w-full p-3 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-lavender/20 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-midnight/60">
                        Mindestens 8 Zeichen für ein sicheres Passwort
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-lavender/5 rounded-xl p-4">
                  <p className="text-xs text-midnight/70 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-lavender" />
                    Fast geschafft! Im nächsten Schritt kannst du deinen Partner einladen.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Schritt 8 - Partner */}
          {step === 8 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-navlink">💑 Verbindet eure Profile</h2>
                <p className="text-sm sm:text-base text-midnight/80">Startet eure gemeinsame Reise mit Lumo</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-xl text-center">
                      <h3 className="text-sm font-medium text-blue-900">Dein persönlicher Einladungscode</h3>
                      <div className="mt-3 flex items-center justify-center space-x-2">
                        <input
                          ref={codeRef}
                          type="text"
                          value={inviteCode}
                          readOnly
                          className="bg-white p-2 rounded-lg border border-blue-200 w-48 text-center text-sm"
                        />
                        <button
                          onClick={copyCodeToClipboard}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {codeCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        Teile diesen Code mit deinem Partner
                      </p>
                    </div>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-midnight/80">
                        Sobald dein Partner beigetreten ist, könnt ihr gemeinsam:
                      </p>
                      <ul className="text-xs text-midnight/70 space-y-1">
                        <li>• Eure Beziehung besser verstehen</li>
                        <li>• Gemeinsame Ziele setzen</li>
                        <li>• An eurer Kommunikation arbeiten</li>
                        <li>• Euch gegenseitig unterstützen</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-lavender/5 rounded-xl p-4">
                  <p className="text-xs text-midnight/70 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-lavender" />
                    Toll, dass ihr diesen Weg gemeinsam geht!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm sm:text-base text-midnight/60 hover:text-midnight transition-colors"
          >
            Zurück
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className={`px-6 py-2 rounded-xl text-sm sm:text-base font-medium transition-colors ${
              isNextDisabled()
                ? 'bg-lavender/30 text-white cursor-not-allowed'
                : 'bg-lavender text-white hover:bg-lavender/80'
            }`}
          >
            {step === totalSteps ? 'Fertig' : 'Weiter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow; 