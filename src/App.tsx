'use client';

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
import LumoHerzensfluesterer from './components/LumoHerzensfluesterer';
import MoodTrends from './components/MoodTrends';
import Achievements from './components/Achievements';
import Settings from './components/Settings';
import RelationshipViewer from './components/RelationshipViewer';
import UserProfile from './components/UserProfile';
import Profile from './components/Profile';
import SurveyContainer from './components/SurveyContainer';
import AssessmentList from './components/AssessmentList';
import OnboardingFlow from './components/OnboardingFlow';
import { Home, MessageCircleHeart, SmilePlus, BarChart, Notebook, CheckSquare, Trophy, Settings as SettingsIcon, LogOut, Heart, Calendar, Clock, Brain, BookOpen, User, Users, ClipboardList } from 'lucide-react';
import SingleChat from './components/SingleChat';
import PairChat from './components/PairChat';
// Verwende den public-Pfad
const lumoLogo = '/lumo_logo.png';

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
  const [session, setSession] = useState<any>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoginOnboarding, setShowLoginOnboarding] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [showSurvey, setShowSurvey] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [partnerLinked, setPartnerLinked] = useState(false);
  const [relationshipStartDate, setRelationshipStartDate] = useState<string | null>(null);
  const [daysTogether, setDaysTogether] = useState<number>(0);
  const [partnerName, setPartnerName] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [featherBalance, setFeatherBalance] = useState<number>(0);
  const [showShop, setShowShop] = useState(false);
  const [userName, setUserName] = useState<string>('');

  // Funktion zum Laden des Federn-Stands
  const loadFeatherBalance = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('golden_feather_balance')
        .select('balance')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setFeatherBalance(data?.balance || 0);
    } catch (err) {
      console.error('Fehler beim Laden der Federn:', err);
    }
  };

  // Lade den Federn-Stand beim Start und wenn sich die Session ändert
  useEffect(() => {
    loadFeatherBalance();
  }, [session?.user?.id]);

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

  // Lade Benutzerdaten beim Start
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadUserData = async () => {
      try {
        // Lade Benutzerprofil
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('name, partner_id')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profile) {
          setUserName(profile.name || '');
          setPartnerLinked(!!profile.partner_id);

          // Wenn Partner verknüpft ist, lade Partnerdaten
          if (profile.partner_id) {
            const { data: partnerProfile, error: partnerError } = await supabase
              .from('user_profiles')
              .select('name')
              .eq('id', profile.partner_id)
              .single();

            if (!partnerError && partnerProfile) {
              setPartnerName(partnerProfile.name || '');
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
      }
    };

    loadUserData();
  }, [session?.user?.id]);

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
        return <Dashboard userId={session.user.id} featherBalance={featherBalance} onFeatherBalanceChange={loadFeatherBalance} />;
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
        return (
          <div className="fixed inset-0 bg-white sm:relative sm:p-4">
            <div className="h-[calc(100vh-64px)] sm:h-auto sm:bg-white sm:rounded-2xl sm:shadow-sm sm:max-w-2xl sm:mx-auto">
              <LumoHerzensfluesterer 
                userId={session.user.id} 
                userName={userName} 
                partnerName={partnerName} 
                partnerLinked={partnerLinked}
                key={activeTab}
              />
            </div>
          </div>
        );
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
      default:
        return null;
    }
  };

  // Render für Anmelde-Bildschirm
  if (!session) {
    return (
      <div className="flex flex-col font-sans items-center justify-center min-h-screen bg-gradient-to-br from-navlink/20 to-lavender/30 py-12">
        {/* Onboarding Overlay */}
        {(showOnboarding || showLoginOnboarding) && (
          <div className="fixed inset-0 bg-gradient-to-br from-navlink/30 to-lavender/30 backdrop-blur-lg flex items-center justify-center z-50 p-8 animate-fadeIn">
            <div className="relative max-w-6xl w-full mx-auto bg-white/95 rounded-2xl p-8 shadow-lg">
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
            <div className="mx-auto">
              <img src={lumoLogo} alt="Lumo Logo" className="w-64 h-64 mx-auto" />
            </div>
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
              Anfangen
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
      </div>
    );
  }

  // Render für Hauptansicht nach Anmeldung
  return (
    <div className="flex font-sans text-midnight bg-[#f7f2ff] min-h-screen">
      {/* Sidebar nur auf Desktop sichtbar */}
      <aside className="hidden sm:flex w-60 bg-navlink text-white flex-col p-4 fixed h-full shadow-lg z-10">
        <div className="flex flex-col">
          <div className="flex -mt-10">
            <div className="w-[120px] h-[120px] flex items-center">
              <img src="/logo_dash1.png" alt="Lumo Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <nav className="flex flex-col space-y-1.5 -mt-2 text-sm">
            <div onClick={() => setActiveTab('home')} className="cursor-pointer">
              <SidebarItem lucideIcon={Home} label="Dashboard" active={activeTab === 'home'} />
            </div>
            <div 
              onClick={() => {
                if (activeTab === 'coach') {
                  // Wenn wir bereits im Chat sind, erzwinge ein Neurendern
                  setActiveTab('home');
                  setTimeout(() => setActiveTab('coach'), 0);
                } else {
                  setActiveTab('coach');
                }
              }} 
              className="cursor-pointer"
            >
              <SidebarItem lucideIcon={MessageCircleHeart} label="Lumo Chat" active={activeTab === 'coach'} />
            </div>
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 space-y-6 sm:ml-60 pb-20 sm:pb-0">
        {/* Onboarding Overlay */}
        {(showOnboarding || showLoginOnboarding) && (
          <div className="fixed inset-0 bg-gradient-to-br from-navlink/30 to-lavender/30 backdrop-blur-lg flex items-center justify-center z-50 p-8 animate-fadeIn">
            <div className="relative max-w-6xl w-full mx-auto bg-white/95 rounded-2xl p-8 shadow-lg">
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

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-lavender/20 sm:hidden z-50">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => {
              setActiveTab('home');
              if (typeof window !== 'undefined') {
                // Sende ein Event an die Dashboard-Komponente
                const event = new CustomEvent('closeAnalysis');
                window.dispatchEvent(event);
              }
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'home' ? 'text-navlink' : 'text-midnight/60'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px]">Home</span>
          </button>
          <button 
            onClick={() => {
              if (activeTab === 'coach') {
                // Wenn wir bereits im Chat sind, erzwinge ein Neurendern
                setActiveTab('home');
                setTimeout(() => setActiveTab('coach'), 0);
              } else {
                setActiveTab('coach');
              }
            }}
            className={`flex flex-col items-center p-2 ${activeTab === 'coach' ? 'text-navlink' : 'text-midnight/60'}`}
          >
            <MessageCircleHeart className="w-6 h-6" />
            <span className="text-xs mt-1">Chat</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex flex-col items-center p-2 ${activeTab === 'profile' ? 'text-navlink' : 'text-midnight/60'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profil</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex flex-col items-center p-2 ${activeTab === 'settings' ? 'text-navlink' : 'text-midnight/60'}`}
          >
            <SettingsIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowShop(false)}>
          <div className="w-full" onClick={e => e.stopPropagation()}>
            <Shop featherBalance={featherBalance} onClose={() => setShowShop(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 