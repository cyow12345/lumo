import React, { useState, useEffect } from 'react';
import MoodTracker from './components/MoodTracker';
import Journal from './components/Journal';
import MoodComparison from './components/MoodComparison';
import Todo from './components/Todo';
import AuthForm from './components/AuthForm';
import { supabase, checkSupabaseConnection } from './lib/supabaseClient';
import SidebarItem from './components/SidebarItem';
import Card from './components/Card';
import Dashboard from './components/Dashboard';
import ThinkingOfYou from './components/ThinkingOfYou';
import LumoCoach from './components/LumoCoach';
import MoodTrends from './components/MoodTrends';
import Achievements from './components/Achievements';
import Settings from './components/Settings';
import RelationshipViewer from './components/RelationshipViewer';
import UserProfile from './components/UserProfile';
import Profile from './components/Profile';
import SurveyContainer from './components/SurveyContainer';
import AssessmentList from './components/AssessmentList';
import OnboardingFlow from './components/OnboardingFlow';
import { Home, MessageCircleHeart, SmilePlus, BarChart, Notebook, CheckSquare, Trophy, Settings as SettingsIcon, LogOut, CheckCircle2, AlertCircle, Heart, Calendar, Clock, Brain, BookOpen, User, Users, ClipboardList } from 'lucide-react';
// Verwende den public-Pfad
const lumoLogo = process.env.PUBLIC_URL + '/lumo_logo.png';

// Definiere Interface für User
interface User {
  id: string;
  email?: string;
}

// Definiere Interface für Session
interface Session {
  user: User;
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Prüfe Verbindung...');
  
  // Assessment-State
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  
  // Onboarding-State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  
  // Separater Zustand für das Login-Onboarding
  const [showLoginOnboarding, setShowLoginOnboarding] = useState(false);

  // Auth Initial Mode
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Auth-related state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [partnerLinked, setPartnerLinked] = useState<boolean>(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [daysTogether, setDaysTogether] = useState<number | null>(null);
  const [relationshipStartDate, setRelationshipStartDate] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    // Test der Supabase-Connection
    const testSupabaseConnection = async () => {
      try {
        setConnectionStatus('Teste Verbindung zu Supabase...');
        console.log('Starte Supabase-Verbindungstest');
        
        // Verwende die verbesserte checkSupabaseConnection-Funktion
        const result = await checkSupabaseConnection();
        
        if (result.status === 'error') {
          console.log('Supabase-Verbindungsfehler:', result.error);
          setConnectionStatus(`❌ ${result.error}`);
          
          // Nicht mehr automatisch in den Gast-Modus wechseln
          console.log('Verbindungsfehler - Gast-Modus muss manuell aktiviert werden');
          return;
        } else if (result.status === 'guest') {
          console.log('Gast-Modus aktiv:', result.message);
          setConnectionStatus('🤖 Gast-Modus aktiv - App läuft ohne Datenbank');
          return;
        }
        
        setConnectionStatus('✅ Verbindung zu Supabase erfolgreich');
        console.log('Supabase Verbindung OK:', result.message);
      } catch (error: any) {
        console.error('Supabase-Verbindungsfehler vollständig:', error);
        
        if (error.message?.includes('Gast-Modus ist aktiv')) {
          setConnectionStatus('🤖 Gast-Modus aktiv - App läuft ohne Datenbank');
          return;
        }
        
        // Nicht mehr automatisch in den Gast-Modus wechseln
        if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
          setConnectionStatus(`❌ Fehler bei Supabase-Verbindung: Bitte manuell in den Gast-Modus wechseln.`);
        } else {
          setConnectionStatus(`❌ Fehler bei Supabase-Verbindung: ${error.message}`);
        }
      }
    };
    
    testSupabaseConnection();
  }, []);

  useEffect(() => {
    // Prüfe, ob ein aktiver Session existiert
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen für Auth-Änderungen
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup Funktion
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      // Partnerstatus aus Supabase laden
      supabase
        .from('user_profiles')
        .select('partner_id')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setPartnerLinked(!!data.partner_id);
          }
        });
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      // Lade Startdatum und Partner-ID
      supabase
        .from('user_profiles')
        .select('relationship_start_date, partner_id')
        .eq('id', session.user.id)
        .single()
        .then(async ({ data, error }) => {
          if (!error && data) {
            setRelationshipStartDate(data.relationship_start_date);
            setPartnerId(data.partner_id);
            // Tage berechnen
            if (data.relationship_start_date) {
              const start = new Date(data.relationship_start_date);
              const today = new Date();
              const diffTime = Math.abs(today.getTime() - start.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setDaysTogether(diffDays);
            }
            // Partnername laden
            if (data.partner_id) {
              const { data: partnerData, error: partnerError } = await supabase
                .from('user_profiles')
                .select('name')
                .eq('id', data.partner_id)
                .single();
              if (!partnerError && partnerData) {
                setPartnerName(partnerData.name);
              }
            }
          }
        });
    }
  }, [session]);

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      console.log('Login-Versuch mit:', email);
      
      // Debug: Überprüfe, ob die Supabase-Verbindung funktioniert
      const { data: healthData, error: healthError } = await supabase.from('todos').select('count', { count: 'exact', head: true });
      
      if (healthError) {
        console.error('Supabase Verbindungsfehler vor Login:', healthError);
        throw new Error(`Verbindungsfehler: ${healthError.message}`);
      }
      
      // Eigentlicher Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('Login erfolgreich:', data);
      setSession(data.session);
      setShowAuthForm(false);
    } catch (error: any) {
      console.error('Fehler beim Login:', error.message);
      if (error.message === 'Invalid login credentials') {
        setAuthError('Ungültige Anmeldedaten. Bitte überprüfe E-Mail und Passwort.');
      } else {
        setAuthError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Aktiviere Gast-Modus als Fallback
  const enableGuestMode = () => {
    // Erstelle eine simulierte Session für den Gast
    const guestSession: Session = {
      user: {
        id: 'guest-user',
        email: 'gast@example.com'
      }
    };
    
    setSession(guestSession);
    setShowAuthForm(false);
    
    // Prüfe, ob Onboarding bereits abgeschlossen wurde
    const hasCompletedOnboarding = localStorage.getItem('onboardingData');
    
    // Wenn nicht, starte Onboarding-Flow
    if (!hasCompletedOnboarding) {
      setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
    }
  };

  const handleSignup = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
        },
      });

      if (error) throw error;
      
      if (data.user && !data.session) {
        // Email bestätigung erforderlich
        setAuthError("Bitte bestätige deine E-Mail-Adresse, um die Registrierung abzuschließen.");
      } else {
        setSession(data.session);
        setShowAuthForm(false);
        
        // Starte automatisch den Onboarding-Flow nach erfolgreicher Registrierung
        setTimeout(() => {
          setShowOnboarding(true);
        }, 500);
      }
    } catch (error: any) {
      console.error('Fehler bei Registrierung:', error.message);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = (user: { name?: string; email: string }, password: string, isLogin: boolean) => {
    if (isLogin) {
      handleLogin(user.email, password);
    } else {
      handleSignup(user.email, password, user.name);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  };
  
  // Onboarding handlers
  const handleLoginOnboardingComplete = (userData: any) => {
    setShowLoginOnboarding(false);
    setAuthInitialMode('register');
    setShowAuthForm(true);
    localStorage.setItem('onboardingData', JSON.stringify(userData));
  };

  const handleOnboardingComplete = (userData: any) => {
    setShowOnboarding(false);
    setAuthInitialMode('register');
    setShowAuthForm(true);
    localStorage.setItem('onboardingData', JSON.stringify(userData));
  };

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
    setShowAuthForm(false);
  };

  const handleOnboardingCancel = () => {
    setShowOnboarding(false);
  };

  // Relevante Komponente basierend auf dem aktiven Tab rendern
  const renderComponent = () => {
    if (!session) return null;
    switch (activeTab) {
      case 'home':
        return <Dashboard userId={session.user.id} />;
      case 'mood':
        return <MoodTracker user={session.user} />;
      case 'journal':
        return <Journal user={session.user} />;
      case 'compare':
        return <MoodComparison user={session.user} />;
      case 'todos':
        return <Todo user={session.user} isGuest={session.user.id === 'guest-user'} />;
      case 'thinking':
        return <ThinkingOfYou userId={session.user.id} />;
      case 'coach':
        return <LumoCoach userId={session.user.id} partnerLinked={partnerLinked} partnerName={partnerName || undefined} />;
      case 'trends':
        return <MoodTrends user={session.user} />;
      case 'achievements':
        return <Achievements user={session.user} />;
      case 'settings':
        return <Settings user={session.user} onLogout={handleLogout} />;
      case 'relationship':
        return <RelationshipViewer userId={session.user.id} />;
      case 'profile':
        return <Profile userId={session.user.id} />;
      case 'assessments':
        if (showSurvey && selectedAssessment) {
          return <SurveyContainer 
            assessment={selectedAssessment} 
            onComplete={() => setShowSurvey(false)} 
            onCancel={() => setShowSurvey(false)}
          />;
        }
        return <AssessmentList onSelectAssessment={(assessment) => {
          setSelectedAssessment(assessment);
          setShowSurvey(true);
        }} />;
      default:
        return <Dashboard userId={session.user.id} />;
    }
  };

  // Render für Anmelde-Bildschirm
  if (!session) {
    return (
      <div className="flex flex-col font-sans items-center justify-center min-h-screen bg-gradient-to-br from-navlink/20 to-lavender/30 py-12">
        {/* Onboarding Overlay */}
        {(showOnboarding || showLoginOnboarding) && (
          <div className="fixed inset-0 bg-gradient-to-br from-navlink/50 to-lavender/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 shadow-lg animate-fadeIn">
            <div className="relative max-w-4xl w-full mx-auto">
              <OnboardingFlow 
                onComplete={(userData) => {
                  if (showLoginOnboarding) {
                    handleLoginOnboardingComplete(userData);
                  } else {
                    handleOnboardingComplete(userData);
                  }
                }}
                onCancel={() => {
                  setShowOnboarding(false);
                  setShowLoginOnboarding(false);
                }}
              />
            </div>
          </div>
        )}
        
        <div className="bg-[#f7f2ff] p-10 rounded-3xl shadow-lg border border-lavender/10 max-w-md w-full mb-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-6">
              <img src={lumoLogo} alt="Lumo Logo" className="w-24 h-24 mx-auto" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-navlink bg-clip-text text-transparent bg-gradient-to-r from-navlink to-lavender">Lumo</h1>
            <p className="text-midnight/70 font-medium mb-1">liest zwischen den Zeilen,</p>
            <p className="text-midnight/70 font-medium">damit ihr euch wirklich hört</p>
          </div>
          
          {/* Verbindungsstatus anzeigen */}
          <div className={`mb-6 p-4 rounded-xl text-sm ${connectionStatus.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : connectionStatus.includes('❌') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
            {connectionStatus.includes('✅') ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verbindung zu Supabase erfolgreich</span>
              </div>
            ) : connectionStatus.includes('❌') ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{connectionStatus.replace('❌ ', '')}</span>
              </div>
            ) : (
              connectionStatus
            )}
          </div>
          
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5">
              {authError}
            </div>
          )}
          
          <div className="space-y-3">
            <button
              className="w-full bg-gradient-to-r from-navlink to-lavender text-white py-3 px-4 rounded-xl hover:brightness-105 transition duration-200 font-medium shadow-md shadow-lavender/30 transform hover:-translate-y-0.5"
              onClick={() => {
                setShowOnboarding(true);
              }}
            >
              Jetzt starten
            </button>
            
            {/* Login-Formular direkt eingebaut statt Button */}
            <div className="mt-5 bg-white/70 p-4 rounded-xl border border-lavender/30">
              <h3 className="text-navlink font-medium text-center mb-4">Bereits registriert?</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium text-midnight/70">E-Mail</label>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 border border-lavender/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/50"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm font-medium text-midnight/70">Passwort</label>
                  <input
                    id="password"
                    type="password"
                    className="w-full p-2 border border-lavender/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/50"
                    placeholder="Dein Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <button
                  className="w-full bg-white text-navlink border-2 border-navlink py-2 px-4 rounded-lg hover:bg-navlink/5 transition duration-200 font-medium"
                  onClick={() => handleLogin(email, password)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Bitte warten...' : 'Anmelden'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info-Karten */}
        <div className="max-w-4xl w-full flex flex-col md:flex-row gap-6 px-4">
          <div className="flex-1 bg-[#f7f2ff] p-6 rounded-2xl shadow-md border border-lavender/10 transform hover:-translate-y-1 transition-transform">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-lavender to-navlink rounded-full flex items-center justify-center text-white">
                <Brain className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-center font-bold text-lg mb-2 text-navlink">KI-gestützte Analyse</h3>
            <p className="text-center text-midnight font-medium mb-1">Lumos Köpfchen denkt mit</p>
            <p className="text-center text-sm text-midnight/70">Mit seiner feinen KI-Nase erkennt Lumo eure Gefühle und Muster.</p>
          </div>
          
          <div className="flex-1 bg-[#f7f2ff] p-6 rounded-2xl shadow-md border border-lavender/10 transform hover:-translate-y-1 transition-transform">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-lavender to-navlink rounded-full flex items-center justify-center text-white">
                <Heart className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-center font-bold text-lg mb-2 text-navlink">Lumo kennt euch</h3>
            <p className="text-center text-midnight font-medium mb-1 whitespace-nowrap">Personalisierte Beziehungstipps</p>
            <p className="text-center text-sm text-midnight/70">Er gibt euch liebevolle Tipps, die genau zu eurer Beziehung passen.</p>
          </div>
          
          <div className="flex-1 bg-[#f7f2ff] p-6 rounded-2xl shadow-md border border-lavender/10 transform hover:-translate-y-1 transition-transform">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-lavender to-navlink rounded-full flex items-center justify-center text-white">
                <MessageCircleHeart className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-center font-bold text-lg mb-2 text-navlink">Präventiver Ansatz</h3>
            <p className="text-center text-midnight font-medium mb-1">Kuschelig statt kritisch</p>
            <p className="text-center text-sm text-midnight/70">Sanft und mit viel Herz zeigt Lumo euch, wo's hakt.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render für Hauptansicht nach Anmeldung
  return (
    <div className="flex font-sans text-midnight bg-[#f7f2ff] min-h-screen">
      {/* Sidebar nur auf Desktop sichtbar */}
      <aside className="hidden sm:flex w-60 bg-navlink text-white flex-col p-4 space-y-6 fixed h-full shadow-lg z-10">
        <div className="flex items-center gap-3 mt-2 text-2xl font-bold">
          <div className="w-9 h-9 flex items-center justify-center">
            <img src={lumoLogo} alt="Lumo Logo" className="w-9 h-9" />
          </div>
          Lumo
        </div>
        <nav className="flex flex-col space-y-1.5 mt-8 text-sm">
          <div onClick={() => setActiveTab('home')} className="cursor-pointer">
            <SidebarItem lucideIcon={Home} label="Dashboard" active={activeTab === 'home'} />
          </div>
          <div onClick={() => setActiveTab('coach')} className="cursor-pointer">
            <SidebarItem lucideIcon={MessageCircleHeart} label="Coach" active={activeTab === 'coach'} />
          </div>
          {/* <div onClick={() => setActiveTab('mood')} className="cursor-pointer">
            <SidebarItem lucideIcon={SmilePlus} label="Stimmung" active={activeTab === 'mood'} />
          </div> */}
          <div onClick={() => setActiveTab('profile')} className="cursor-pointer">
            <SidebarItem lucideIcon={User} label="Profil" active={activeTab === 'profile'} />
          </div>
        </nav>
        <div className="mt-auto mb-4">
          <div onClick={() => setActiveTab('settings')} className="cursor-pointer">
            <SidebarItem lucideIcon={SettingsIcon} label="Einstellungen" active={activeTab === 'settings'} />
          </div>
          <button 
            onClick={handleLogout} 
            className="mt-4 w-full text-sm text-white/60 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" /> Abmelden
          </button>
        </div>
      </aside>
      {/* Mobiler Header */}
      {/* <header className="flex sm:hidden items-center justify-center gap-2 bg-navlink text-white px-4 py-3 w-full fixed top-0 left-0 z-20 shadow">
        <div className="w-9 h-9 flex items-center justify-center">
          <img src={lumoLogo} alt="Lumo Logo" className="w-9 h-9" />
        </div>
        <span className="text-2xl font-bold">Lumo</span>
      </header> */}
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 space-y-6 sm:ml-60 pt-16 sm:pt-0">
        {/* Onboarding Overlay */}
        {(showOnboarding || showLoginOnboarding) && (
          <div className="fixed inset-0 bg-gradient-to-br from-navlink/50 to-lavender/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 shadow-lg animate-fadeIn">
            <div className="relative max-w-4xl w-full mx-auto">
              <OnboardingFlow 
                onComplete={(userData) => {
                  if (showLoginOnboarding) {
                    handleLoginOnboardingComplete(userData);
                  } else {
                    handleOnboardingComplete(userData);
                  }
                }}
                onCancel={() => {
                  setShowOnboarding(false);
                  setShowLoginOnboarding(false);
                }}
              />
            </div>
          </div>
        )}
        
        {/* Survey Overlay */}
        {showSurvey && selectedAssessment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <SurveyContainer
              assessment={selectedAssessment}
              onComplete={() => {
                setShowSurvey(false);
                setSelectedAssessment(null);
              }}
              onCancel={() => {
                setShowSurvey(false);
                setSelectedAssessment(null);
              }}
            />
          </div>
        )}
        
        {/* Hauptinhalt basierend auf aktivem Tab */}
        <div className="mt-6">
          {renderComponent()}
        </div>
      </main>
    </div>
  );
}

export default App; 