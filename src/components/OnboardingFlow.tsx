import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle2, Copy, AlertCircle } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
  onCancel: () => void;
  isLoginOnboarding?: boolean;
}

type RelationshipValue = 'Vertrauen' | 'Ehrlichkeit' | 'Kommunikation' | 'Respekt' | 'Leidenschaft' | 'Unabhängigkeit' | 'Humor' | 'Treue';

const RELATIONSHIP_VALUES: RelationshipValue[] = ['Vertrauen', 'Ehrlichkeit', 'Kommunikation', 'Respekt', 'Leidenschaft', 'Unabhängigkeit', 'Humor', 'Treue'];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onCancel, isLoginOnboarding = false }) => {
  const [step, setStep] = useState(1);
  // Partner-Link-Status
  const [inviteCode, setInviteCode] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [partnerTab, setPartnerTab] = useState<'generate' | 'join'>('generate');
  const [codeInput, setCodeInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);
  const [birthPlaceSuggestions, setBirthPlaceSuggestions] = useState<string[]>([]);
  const birthPlaceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [userData, setUserData] = useState({
    // Persönliche Infos
    name: '',
    age: '',
    gender: '',
    relationshipStartDate: '',
    relationshipStatus: '',
    
    // Bindungsstil
    eveningAlone: '',
    separationAnxiety: 1,
    attachmentStyle: '',
    
    // Kommunikationsstil
    addressingIssues: '',
    emotionalExpression: 1,
    hurtResponse: '',
    
    // Konfliktverhalten
    previousConflict: '',
    emotionalConflicts: 1,
    criticismResponse: '',
    
    // Persönlichkeit (Big Five)
    openness: 1,
    extraversion: 1,
    conscientiousness: 1,
    agreeableness: 1,
    neuroticism: 1,
    
    // Werte
    relationshipValues: [] as RelationshipValue[],
    fidelityMeaning: '',
    valuesPriority: {
      vertrauen: 1,
      leidenschaft: 1,
      unabhaengigkeit: 1,
      humor: 1,
      treue: 1
    },
    
    // Kindheit & Prägung
    parentalInfluence: '',
    trustExperience: '',
    parentalPatterns: '',

    // Optionale Features
    whatsappImport: false,
    astrology: false,

    // Registrierung
    email: '',
    password: '',

    // Astrologie-Details
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    
    // Partner-Integration
    partnerInviteSent: false
  });

  // Erhöhe die Anzahl der Schritte
  const totalSteps = 11;

  // Generiere einen Einladungscode, wenn der letzte Schritt erreicht wird
  useEffect(() => {
    if (step === 10) {
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
            relationship_start_date: userData.relationshipStartDate || null,
            relationship_status: userData.relationshipStatus,
            evening_alone: userData.eveningAlone,
            separation_anxiety: userData.separationAnxiety,
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
          await supabase
            .from('user_profiles')
            .upsert([
              {
                id: data.user.id,
                ...profileData
              }
            ]);
          // Partnercode-Verknüpfung im Hintergrund
          if (codeInput.trim()) {
            try {
              const { data: partner, error: partnerError } = await supabase
                .from('user_profiles')
                .select('id, partner_id')
                .eq('invite_code', codeInput.trim().toUpperCase())
                .single();
              if (!partnerError && partner && !partner.partner_id) {
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
                  if (me && me.partner_id) {
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
      case 1: // Name & Alter
        return !userData.name || !userData.age;
      case 2: // Geschlecht & Beziehungsstart
        return !userData.gender || !userData.relationshipStartDate;
      case 3: // Bindungsstil
        return !userData.eveningAlone || !userData.attachmentStyle;
      case 4: // Kommunikationsstil
      case 1: // Persönliche Infos
        return !userData.name || !userData.age || !userData.gender || !userData.relationshipStartDate;
      case 2: // Bindungsstil
        return !userData.eveningAlone || !userData.attachmentStyle;
      case 3: // Kommunikationsstil
        return !userData.addressingIssues || !userData.hurtResponse;
      case 4: // Konfliktverhalten
        return !userData.previousConflict || !userData.criticismResponse;
      case 5: // Persönlichkeit
        return userData.openness === 0 || userData.extraversion === 0;
      case 6: // Werte
        return userData.relationshipValues.length === 0;
      case 7: // Kindheit
        return !userData.parentalInfluence;
      case 8: // Optionale Features
        return false; // Immer erlaubt, da optional
      case 9: // Registrierung
        return !userData.email || !userData.password || userData.password.length < 8;
      case 10: // Partner-Integration
        return false; // Immer erlaubt weiterzugehen
      default:
        return false;
    }
  };

  // Hilfsfunktion für Skala-Komponente
  const ScaleInput = ({ name, value, label }: { name: string; value: number; label: string }) => (
    <div className="space-y-6">
      <label className="block text-sm font-medium text-midnight">{label}</label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => handleScaleChange(name, parseInt(e.target.value))}
          className="w-full h-2 bg-lavender/20 rounded-lg appearance-none cursor-pointer accent-lavender"
        />
        <span className="text-sm font-medium text-navlink">{value}</span>
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
      <div className="bg-white rounded-2xl px-8 pt-16 pb-8 max-w-xl w-full shadow-xl relative animate-fadeIn z-20">
        {/* Logo */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <img src={process.env.PUBLIC_URL + '/lumo_logo.png'} alt="Lumo Logo" className="w-24 h-24" />
        </div>
        {/* Progress Bar */}
        <div className="mb-8 pt-2">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-midnight/60">Schritt {step} von {totalSteps}</span>
            <span className="text-sm font-medium text-navlink">{Math.round((step / totalSteps) * 100)}% geschafft</span>
          </div>
          <div className="h-2 bg-lavender/10 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-navlink to-lavender rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <div className="mb-8 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">Persönliche Informationen</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-midnight">Wie heißt du?</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                    placeholder="Dein Name"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-midnight">Wie alt bist du?</label>
                  <input
                    type="number"
                    name="age"
                    value={userData.age}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                    placeholder="Dein Alter"
                    min="18"
                    max="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-midnight">Dein Geschlecht</label>
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="male">Männlich</option>
                    <option value="female">Weiblich</option>
                    <option value="diverse">Divers</option>
                    <option value="no_answer">Keine Angabe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-midnight">Wann hat eure Beziehung angefangen?</label>
                  <input
                    type="date"
                    name="relationshipStartDate"
                    value={userData.relationshipStartDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-midnight/60 mt-1">Dieser Tag hilft uns, wichtige Meilensteine und Jahrestage im Blick zu behalten.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">❤️ Bindungsstil</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-midnight">Wie fühlst du dich, wenn dein Partner mal einen Abend ohne dich verbringen möchte?</label>
                  <select
                    name="eveningAlone"
                    value={userData.eveningAlone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="happy">Ich freue mich, dass er/sie Spaß hat</option>
                    <option value="okay">Es ist okay, aber ich vermisse ihn/sie</option>
                    <option value="worried">Ich mache mir Sorgen oder fühle mich unsicher</option>
                    <option value="difficult">Es fällt mir sehr schwer, damit umzugehen</option>
                  </select>
                </div>
                <ScaleInput
                  name="separationAnxiety"
                  value={userData.separationAnxiety}
                  label="Ich mache mir oft Sorgen, dass mein Partner mich verlassen könnte."
                />
                <div>
                  <label className="block text-sm font-medium text-midnight">Was trifft eher auf dich zu?</label>
                  <div className="space-y-2 mt-1">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="attachmentStyle"
                        value="needsCloseness"
                        checked={userData.attachmentStyle === 'needsCloseness'}
                        onChange={handleInputChange}
                        className="form-radio text-lavender"
                      />
                      <span>Ich brauche viel Nähe und Rückversicherung.</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="attachmentStyle"
                        value="valuesIndependence"
                        checked={userData.attachmentStyle === 'valuesIndependence'}
                        onChange={handleInputChange}
                        className="form-radio text-lavender"
                      />
                      <span>Ich schätze Unabhängigkeit in Beziehungen.</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">Kommunikationsstil</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-midnight">Wie sprichst du es an, wenn dich etwas am Verhalten deines Partners stört?</label>
                  <textarea
                    name="addressingIssues"
                    value={userData.addressingIssues}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1 h-32"
                    placeholder="Beschreibe deine typische Herangehensweise..."
                  />
                </div>

                <ScaleInput
                  name="emotionalExpression"
                  value={userData.emotionalExpression}
                  label="Es fällt mir leicht, über meine Gefühle zu sprechen."
                />

                <div>
                  <label className="block text-sm font-medium text-midnight">Was tust du, wenn du dich durch eine Aussage verletzt fühlst?</label>
                  <select
                    name="hurtResponse"
                    value={userData.hurtResponse}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="listen">Ich höre zu und teile meine Gefühle mit</option>
                    <option value="defensive">Ich werde defensiv und erkläre mich</option>
                    <option value="withdraw">Ich ziehe mich zurück</option>
                    <option value="emotional">Ich reagiere emotional</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">Konfliktverhalten</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-midnight">Erzähl von einem Streit in einer früheren Beziehung. Was war der Auslöser?</label>
                  <textarea
                    name="previousConflict"
                    value={userData.previousConflict}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1 h-20"
                    placeholder="Beschreibe die Situation..."
                  />
                </div>

                <ScaleInput
                  name="emotionalConflicts"
                  value={userData.emotionalConflicts}
                  label="Ich werde schnell emotional oder laut bei Konflikten."
                />

                <div>
                  <label className="block text-sm font-medium text-midnight">Wie reagierst du auf Kritik vom Partner?</label>
                  <select
                    name="criticismResponse"
                    value={userData.criticismResponse}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="explain">Ich erkläre mich sofort</option>
                    <option value="withdraw">Ich ziehe mich zurück</option>
                    <option value="listen">Ich höre erst zu</option>
                    <option value="apologize">Ich entschuldige mich direkt</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">🧠 Persönlichkeit</h2>
              <div className="space-y-2">
                <ScaleInput
                  name="openness"
                  value={userData.openness}
                  label="Ich probiere gerne Neues aus. (Offenheit)"
                />
                <ScaleInput
                  name="extraversion"
                  value={userData.extraversion}
                  label="Ich bin gerne unter Menschen. (Extraversion)"
                />
                <ScaleInput
                  name="conscientiousness"
                  value={userData.conscientiousness}
                  label="Ich halte, was ich verspreche. (Gewissenhaftigkeit)"
                />
                <ScaleInput
                  name="agreeableness"
                  value={userData.agreeableness}
                  label="Mir ist Harmonie wichtiger als Recht zu haben. (Verträglichkeit)"
                />
                <ScaleInput
                  name="neuroticism"
                  value={userData.neuroticism}
                  label="Streitigkeiten beschäftigen mich lange. (Neurotizismus)"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">Werte & Einstellungen</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-midnight">Was sind deine 3 wichtigsten Werte in einer Beziehung?</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {RELATIONSHIP_VALUES.map((value) => (
                      <label key={value} className="flex items-center space-x-2 p-3 border border-lavender/30 rounded-lg hover:bg-lavender/5">
                        <input
                          type="checkbox"
                          checked={userData.relationshipValues.includes(value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleMultiSelect('relationshipValues', [...userData.relationshipValues, value].slice(0, 3) as RelationshipValue[]);
                            } else {
                              handleMultiSelect('relationshipValues', userData.relationshipValues.filter(v => v !== value));
                            }
                          }}
                          className="form-checkbox text-lavender"
                          disabled={!userData.relationshipValues.includes(value) && userData.relationshipValues.length >= 3}
                        />
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight">Was bedeutet Treue für dich?</label>
                  <textarea
                    name="fidelityMeaning"
                    value={userData.fidelityMeaning}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1 h-20"
                    placeholder="Beschreibe deine Vorstellung von Treue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight mb-4">Ordne nach Wichtigkeit (1-5):</label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-midnight/80">Vertrauen</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={userData.valuesPriority.vertrauen}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            valuesPriority: {
                              ...prev.valuesPriority,
                              vertrauen: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full h-2 bg-lavender/20 rounded-lg appearance-none cursor-pointer accent-lavender"
                        />
                        <span className="text-sm font-medium text-navlink">{userData.valuesPriority.vertrauen}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-midnight/80">Leidenschaft</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={userData.valuesPriority.leidenschaft}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            valuesPriority: {
                              ...prev.valuesPriority,
                              leidenschaft: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full h-2 bg-lavender/20 rounded-lg appearance-none cursor-pointer accent-lavender"
                        />
                        <span className="text-sm font-medium text-navlink">{userData.valuesPriority.leidenschaft}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-midnight/80">Unabhängigkeit</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={userData.valuesPriority.unabhaengigkeit}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            valuesPriority: {
                              ...prev.valuesPriority,
                              unabhaengigkeit: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full h-2 bg-lavender/20 rounded-lg appearance-none cursor-pointer accent-lavender"
                        />
                        <span className="text-sm font-medium text-navlink">{userData.valuesPriority.unabhaengigkeit}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-midnight/80">Humor</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={userData.valuesPriority.humor}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            valuesPriority: {
                              ...prev.valuesPriority,
                              humor: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full h-2 bg-lavender/20 rounded-lg appearance-none cursor-pointer accent-lavender"
                        />
                        <span className="text-sm font-medium text-navlink">{userData.valuesPriority.humor}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-midnight/80">Treue</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={userData.valuesPriority.treue}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            valuesPriority: {
                              ...prev.valuesPriority,
                              treue: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full h-2 bg-lavender/20 rounded-lg appearance-none cursor-pointer accent-lavender"
                        />
                        <span className="text-sm font-medium text-navlink">{userData.valuesPriority.treue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">Kindheit & Prägung</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-midnight">Wie haben deine Eltern oder deren Beziehung dich geprägt?</label>
                  <textarea
                    name="parentalInfluence"
                    value={userData.parentalInfluence}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1 h-20"
                    placeholder="Beschreibe den Einfluss deiner Eltern..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight">Gab es ein Erlebnis, das dein Vertrauen in Beziehungen beeinflusst hat?</label>
                  <textarea
                    name="trustExperience"
                    value={userData.trustExperience}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1 h-20"
                    placeholder="Beschreibe das Erlebnis..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight">Erkennst du Muster deiner Eltern in deinem eigenen Verhalten wieder?</label>
                  <textarea
                    name="parentalPatterns"
                    value={userData.parentalPatterns}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1 h-20"
                    placeholder="Beschreibe die Muster..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">Optionale Features</h2>
              <div className="space-y-4">
                <div className="bg-lavender/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">📱</div>
                    <div>
                      <h3 className="text-base font-semibold text-navlink">WhatsApp-Import</h3>
                      <p className="text-xs text-midnight/60 mt-1">
                        Chatverläufe können helfen, Kommunikationsmuster und Konfliktdynamiken objektiv zu analysieren.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-midnight">
                      Möchtest du relevante Chatverläufe mit deinem Partner importieren?
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="whatsappImport"
                          checked={userData.whatsappImport === true}
                          onChange={() => setUserData(prev => ({ ...prev, whatsappImport: true }))}
                          className="form-radio text-lavender"
                        />
                        <span>Ja</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="whatsappImport"
                          checked={userData.whatsappImport === false}
                          onChange={() => setUserData(prev => ({ ...prev, whatsappImport: false }))}
                          className="form-radio text-lavender"
                        />
                        <span>Nein</span>
                      </label>
                    </div>
                  </div>
                  <p className="text-xs italic text-midnight/60">
                    Nur mit Zustimmung deines Partners. Dieser Schritt ist optional.
                  </p>
                </div>
                <div className="bg-lavender/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">🔮</div>
                    <div>
                      <h3 className="text-base font-semibold text-navlink">Astrologie</h3>
                      <p className="text-xs text-midnight/60 mt-1">
                        Astrologische Hinweise können ergänzend genutzt werden, um Beziehungstypen und Timing-Einflüsse intuitiv zu reflektieren.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-midnight">
                      Möchtest du astrologische Informationen in deinem Coaching berücksichtigen lassen?
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="astrology"
                          checked={userData.astrology === true}
                          onChange={() => setUserData(prev => ({ ...prev, astrology: true }))}
                          className="form-radio text-lavender"
                        />
                        <span>Ja</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="astrology"
                          checked={userData.astrology === false}
                          onChange={() => setUserData(prev => ({ ...prev, astrology: false }))}
                          className="form-radio text-lavender"
                        />
                        <span>Nein</span>
                      </label>
                    </div>
                  </div>
                  {userData.astrology && (
                    <div className="space-y-2 mt-4 p-4 bg-white rounded-xl border border-lavender/30">
                      <div>
                        <label className="block text-sm font-medium text-midnight">Geburtsdatum</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={userData.birthDate}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-midnight">Geburtszeit</label>
                        <input
                          type="time"
                          name="birthTime"
                          value={userData.birthTime}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-midnight">Geburtsort</label>
                        <input
                          type="text"
                          name="birthPlace"
                          value={userData.birthPlace}
                          onChange={handleBirthPlaceInput}
                          autoComplete="off"
                          className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                          placeholder="Geburtsort"
                        />
                        {birthPlaceSuggestions.length > 0 && (
                          <ul className="absolute z-10 left-0 right-0 bg-white border border-lavender/30 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg">
                            {birthPlaceSuggestions.map((suggestion, idx) => (
                              <li
                                key={idx}
                                className="px-4 py-2 cursor-pointer hover:bg-lavender/10 text-midnight text-sm"
                                onClick={() => handleBirthPlaceSelect(suggestion)}
                              >
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">Fast geschafft! 🎉</h2>
              <p className="text-sm text-midnight/80">
                Erstelle dein Konto, um deine Fortschritte zu speichern und mit dem Coaching zu beginnen.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight">E-Mail Adresse</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                    placeholder="deine@email.de"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight">Passwort</label>
                  <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-lavender/30 rounded-xl bg-white focus:outline-none focus:border-transparent focus:z-30 text-sm mt-1"
                    placeholder="Mindestens 8 Zeichen"
                    minLength={8}
                  />
                  <p className="text-xs text-midnight/60 mt-1">
                    Mindestens 8 Zeichen
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">Partner einladen 👫</h2>
              <div className="bg-lavender/5 p-4 rounded-xl space-y-2">
                <label className="block text-sm font-medium text-midnight mb-2">Hast du einen Partnercode? (optional)</label>
                <input
                  type="text"
                  placeholder="Partnercode"
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value)}
                  className="p-2 rounded-lg border border-lavender/30 w-full text-center text-sm"
                  maxLength={20}
                />
                <p className="text-xs text-midnight/60 mt-1">Du kannst den Code auch später im Dashboard eingeben.</p>
              </div>
              <div className="bg-lavender/5 p-4 rounded-xl space-y-2 mt-2">
                <label className="block text-sm font-medium text-midnight">Dein persönlicher Einladungscode:</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={inviteCode}
                    readOnly
                    className="w-full p-2 border border-lavender/30 rounded-l-xl bg-gray-50 text-sm font-mono tracking-wider text-navlink"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteCode);
                      setCodeCopied(true);
                      setTimeout(() => setCodeCopied(false), 2000);
                    }}
                    className="px-4 py-2 bg-lavender text-white rounded-r-xl hover:bg-lavender/80 transition-colors flex items-center justify-center"
                  >
                    {codeCopied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                {codeCopied && (
                  <p className="text-xs text-green-600">Code kopiert!</p>
                )}
                <div className="space-y-2 mt-2">
                  <h3 className="text-sm font-medium text-navlink">So funktioniert's:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-midnight/80 text-xs">
                    <li>Teile diesen Code mit deinem Partner</li>
                    <li>Dein Partner erstellt einen Account bei Lumo</li>
                    <li>Er/sie gibt den Code im Dashboard ein</li>
                    <li>Ihr seid verbunden und könnt alle Lumo-Features nutzen!</li>
                  </ol>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 mt-2">
                  <p className="text-blue-700 text-xs">
                    <span className="font-medium">Hinweis:</span> Bis dein Partner beigetreten ist, sind einige Features nur eingeschränkt verfügbar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === totalSteps && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-navlink">Fertig! 🎉</h2>
              <p className="text-sm text-midnight/80">
                Mega! Mit deinen Antworten kann Lumo jetzt noch gezielter analysieren, Muster erkennen und euch als Paar auf ein neues Level bringen.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white border border-lavender/30 text-navlink rounded-xl hover:bg-lavender/5 transition-colors font-medium flex items-center gap-2"
          >
            {step === 1 ? 'Abbrechen' : 'Zurück'}
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              isNextDisabled()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-navlink to-lavender text-white hover:brightness-105 transform hover:-translate-y-0.5'
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