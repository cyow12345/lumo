import React, { useState, useEffect, useRef } from 'react';
import './Profile.css';
import { supabase } from '../lib/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faKey, faEnvelope, faUser, faHeart } from '@fortawesome/free-solid-svg-icons';
import { triggerAnalysisUpdate, AnalysisUpdateTrigger } from '../services/analyzeRelationship';

interface User {
  id: string;
  name: string;
  email?: string;
  age?: number;
  gender?: string;
  attachment_style?: string;
  addressing_issues?: string;
  time_together_pref?: string;
  closeness_style?: string;
  show_understanding?: string;
  resolve_conflicts?: string;
  evening_alone?: string;
  hurt_response?: string;
  previous_conflict?: string;
  criticism_response?: string;
  relationship_values?: string[];
  fidelity_meaning?: string;
  parental_influence?: string;
  trust_experience?: string;
  parental_patterns?: string;
  relationship_status?: string;
  happy_moments?: string;
  growth_description?: string;
  avatar_url?: string;
  partner_id?: string; // Neuer Feld für den Partner
  relationship_start_date?: string; // Neuer Feld für das Startdatum der Beziehung
}

interface ProfileProps {
  userId: string;
  initialUser?: User;
  onUpdateProfile?: (user: User) => void;
  partnerName?: string;  // Neuer Prop für den Partnernamen
  onUnlinkPartner?: () => void;  // Callback für das Auflösen der Verbindung
}

interface PartnershipCardProps {
  user: any;
  partner: any;
  onUnlink: () => void;
}

const PartnershipCard: React.FC<PartnershipCardProps> = ({ user, partner, onUnlink }) => {
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [showLumoConfirm, setShowLumoConfirm] = useState(false);

  // Berechne die Beziehungsdauer
  const calculateDuration = () => {
    if (!user?.relationship_start_date) return 'Keine Angabe';
    const start = new Date(user.relationship_start_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} Tage`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} Monate`;
    return `${Math.floor(diffDays / 365)} Jahre`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mt-4">
      <h3 className="text-lg font-semibold text-navlink mb-4">Eure Verbindung</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Profilbilder */}
          <div className="flex -space-x-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-navlink/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-navlink" />
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
              {partner?.avatar_url ? (
                <img src={partner.avatar_url} alt={partner.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-navlink/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-navlink" />
                </div>
              )}
            </div>
          </div>
          
          {/* Info */}
          <div>
            <p className="text-sm text-gray-600">
              Verbunden seit <span className="font-medium">{calculateDuration()}</span>
            </p>
            <p className="text-sm text-gray-500">mit {partner?.name}</p>
          </div>
        </div>

        {/* Auflösen Button */}
        <button
          onClick={() => setShowLumoConfirm(true)}
          className="text-red-500 text-sm hover:text-red-600 transition"
        >
          Verbindung auflösen
        </button>
      </div>

      {/* Lumo Bestätigungsdialog */}
      {showLumoConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-navlink/10 flex items-center justify-center mr-4">
                <FontAwesomeIcon icon={faHeart} className="text-navlink text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navlink">Lumo fragt</h3>
                <p className="text-gray-600 mt-2">
                  Möchtest du die Verbindung wirklich auflösen?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowLumoConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  setShowLumoConfirm(false);
                  setShowUnlinkConfirm(true);
                }}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
              >
                Ja, ich bin sicher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finaler Bestätigungsdialog */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-500 mb-4">Verbindung auflösen</h3>
            <p className="text-gray-600">
              Dies wird eure Verbindung permanent auflösen. Alle gemeinsamen Daten werden getrennt.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowUnlinkConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  onUnlink();
                  setShowUnlinkConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
              >
                Endgültig auflösen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hauptkomponente
const Profile: React.FC<ProfileProps> = ({ 
  userId, 
  initialUser,
  onUpdateProfile,
  partnerName,
  onUnlinkPartner 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [partnerData, setPartnerData] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State für Passwort-Änderung
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (user?.partner_id) {
      fetchPartnerData(user.partner_id);
    }
  }, [user?.partner_id]);

  const fetchPartnerData = async (partnerId: string) => {
    try {
      const { data: partnerData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (error) throw error;
      setPartnerData(partnerData);
    } catch (error) {
      console.error('Error fetching partner data:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser(userData);
      setFormData(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      setSuccess('Eine Bestätigungs-E-Mail wurde an die neue Adresse gesendet.');
      setShowEmailChange(false);
      setNewEmail('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Funktion zum Ändern des Passworts
  const handlePasswordChange = async () => {
    try {
      setError(null);
      setPasswordError(null);

      if (!oldPassword) {
        setPasswordError('Bitte geben Sie Ihr aktuelles Passwort ein');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('Die neuen Passwörter stimmen nicht überein');
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError('Das neue Passwort muss mindestens 6 Zeichen lang sein');
        return;
      }

      // Überprüfe zuerst das alte Passwort
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: oldPassword
      });

      if (signInError) {
        setPasswordError('Das aktuelle Passwort ist nicht korrekt');
        return;
      }

      // Ändere das Passwort
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Erfolgsmeldung
      setSuccess('Passwort wurde erfolgreich geändert');
      setShowPasswordChange(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError('Fehler beim Ändern des Passworts');
      console.error('Passwort-Änderung fehlgeschlagen:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', userId);

      if (error) throw error;

      const updatedUser = { ...user, ...formData };
      setUser(updatedUser as User);
      setIsEditing(false);
      if (onUpdateProfile && user) {
        onUpdateProfile(updatedUser as User);
      }
      setSuccess('Profil wurde erfolgreich aktualisiert.');

      // Trigger ein Update der Beziehungsanalyse
      if (updatedUser.partner_id) {
        try {
          await triggerAnalysisUpdate(userId, updatedUser.partner_id, AnalysisUpdateTrigger.PROFILE_UPDATE, {
            updated_fields: [
              'attachment_style',
              'addressing_issues',
              'relationship_values',
              'parental_influence',
              'relationship_start_date'
            ]
          });
        } catch (error) {
          console.error('Fehler beim Aktualisieren der Analyse:', error);
        }
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Funktion zum Auflösen der Partnerverbindung
  const handleUnlinkPartner = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          partner_id: undefined,
          relationship_status: 'single'
        })
        .eq('id', userId);

      if (error) throw error;

      // Aktualisiere den lokalen State
      const updatedUser = {
        ...user,
        partner_id: undefined,
        relationship_status: 'single'
      } as User;
      setUser(updatedUser);

      setShowUnlinkConfirm(false);
      setSuccess('Partnerverbindung wurde aufgelöst.');
      
      // Informiere die übergeordnete Komponente
      if (onUnlinkPartner) {
        onUnlinkPartner();
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Funktion zum Hochladen des Profilbilds
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Sie müssen ein Bild auswählen');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Bild in Storage hochladen
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // URL des Bildes generieren
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Profilupdate mit neuer Avatar-URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Lokalen State aktualisieren
      setUser(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      setSuccess('Profilbild wurde erfolgreich aktualisiert');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Funktion zum Öffnen des Datei-Dialogs
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navlink"></div>
    </div>;
  }

  const ONBOARDING_QUESTIONS = {
    // Persönliche Informationen
    name: "Wie lautet dein Name?",
    age: "Wie alt bist du?",
    gender: "Was ist dein Geschlecht?",
    relationship_status: "Wie ist dein Beziehungsstatus?",
    
    // Beziehungsverhalten
    time_together_pref: "Wie viel Zeit möchtest du am liebsten mit deinem Partner verbringen?",
    closeness_style: "Wie gehst du mit Nähe in Beziehungen um?",
    show_understanding: "Wie zeigst du deinem Partner, dass du ihn verstehst?",
    resolve_conflicts: "Wie gehst du mit Konflikten in der Beziehung um?",
    
    // Emotionale Muster
    evening_alone: "Wie fühlst du dich, wenn du einen Abend alleine verbringst?",
    hurt_response: "Wie reagierst du, wenn dich dein Partner verletzt hat?",
    criticism_response: "Wie gehst du mit Kritik von deinem Partner um?",
    
    // Beziehungserfahrungen
    fidelity_meaning: "Was bedeutet Treue für dich in einer Beziehung?",
    parental_influence: "Wie haben deine Eltern dein Beziehungsverhalten beeinflusst?",
    trust_experience: "Welche Erfahrungen hast du mit Vertrauen in Beziehungen gemacht?",
    parental_patterns: "Welche Beziehungsmuster hast du von deiner Familie übernommen?",
    
    // Persönliche Entwicklung
    happy_moments: "Was macht dich in einer Beziehung besonders glücklich?",
    growth_description: "Wie möchtest du dich in Beziehungen weiterentwickeln?"
  };

  // Mapping für die Antworten
  const ANSWER_MAPPINGS: { [key: string]: { [key: string]: string } } = {
    gender: {
      'male': 'Männlich',
      'female': 'Weiblich',
      'diverse': 'Divers'
    },
    relationship_status: {
      'single': 'Single',
      'dating': 'Dating',
      'relationship': 'In einer Beziehung',
      'married': 'Verheiratet'
    },
    attachment_style: {
      'valuesIndependence': 'Ich schätze Unabhängigkeit',
      'needsCloseness': 'Ich brauche viel Nähe',
      'avoidant': 'Ich halte gerne Abstand',
      'secure': 'Ich fühle mich sicher in Beziehungen'
    },
    time_together_pref: {
      'much': 'Ich möchte viel Zeit zusammen verbringen',
      'balanced': 'Ich mag eine ausgewogene Balance',
      'independent': 'Ich brauche auch viel Zeit für mich'
    },
    closeness_style: {
      'physical': 'Durch körperliche Nähe',
      'emotional': 'Durch emotionale Verbindung',
      'activities': 'Durch gemeinsame Aktivitäten',
      'communication': 'Durch tiefe Gespräche'
    },
    evening_alone: {
      'happy': 'Ich genieße die Zeit für mich',
      'mixed': 'Ich habe gemischte Gefühle',
      'uncomfortable': 'Ich fühle mich unwohl',
      'missing': 'Ich vermisse meinen Partner sehr'
    },
    hurt_response: {
      'withdraw': 'Ich ziehe mich zurück',
      'communicate': 'Ich suche das Gespräch',
      'process': 'Ich brauche Zeit zum Verarbeiten',
      'immediate': 'Ich möchte es sofort klären'
    },
    criticism_response: {
      'defensive': 'Ich werde erstmal defensiv',
      'open': 'Ich bin offen für Feedback',
      'emotional': 'Es trifft mich emotional',
      'analytical': 'Ich analysiere es sachlich',
      'withdraw': 'Ich ziehe mich zurück'
    }
  };

  function translateAnswer(key: string, value: any): string {
    if (!value) return 'Keine Angabe';

    switch (key) {
      case 'attachment_style':
        return value;
      case 'addressing_issues':
        return value;
      case 'relationship_values':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'parental_influence':
        return value;
      case 'relationship_start_date':
        return value ? new Date(value).toLocaleDateString() : 'Keine Angabe';
      default:
        return String(value);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Profilüberschrift */}
      <div className="bg-navlink/5 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-navlink mb-1">
          Dein Profil
        </h1>
        <div className="flex gap-2">
          <button 
            className="mt-4 md:mt-0 bg-navlink/10 text-navlink text-sm px-4 py-2 rounded-full hover:bg-navlink/20 transition flex items-center gap-2"
            onClick={() => setShowEmailChange(true)}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            E-Mail ändern
          </button>
          <button 
            className="mt-4 md:mt-0 bg-navlink/10 text-navlink text-sm px-4 py-2 rounded-full hover:bg-navlink/20 transition flex items-center gap-2"
            onClick={() => setShowPasswordChange(true)}
          >
            <FontAwesomeIcon icon={faKey} />
            Passwort ändern
          </button>
          {!isEditing && (
            <button 
              className="mt-4 md:mt-0 bg-navlink text-white text-sm px-6 py-2 rounded-full shadow hover:bg-navlink/80 transition flex items-center gap-2"
              onClick={() => setIsEditing(true)}
            >
              <FontAwesomeIcon icon={faEdit} />
              Bearbeiten
            </button>
          )}
        </div>
      </div>

      {/* Fehlermeldungen und Erfolgsmeldungen */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-xl">
          {success}
        </div>
      )}
      
      {/* Email-Änderung Modal */}
      {showEmailChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-navlink mb-4">E-Mail-Adresse ändern</h2>
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navlink mb-1">
                  Neue E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-navlink/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-navlink"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailChange(false)}
                  className="px-4 py-2 text-navlink hover:bg-navlink/5 rounded-lg transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navlink text-white rounded-lg hover:bg-navlink/80 transition"
                >
                  Bestätigen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Passwort-Ändern Dialog */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-navlink mb-4">Passwort ändern</h3>
            
            <div className="space-y-4">
              {/* Aktuelles Passwort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktuelles Passwort
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navlink/50"
                  placeholder="••••••••"
                />
              </div>

              {/* Neues Passwort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Neues Passwort
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navlink/50"
                  placeholder="••••••••"
                />
              </div>

              {/* Passwort bestätigen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Neues Passwort bestätigen
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navlink/50"
                  placeholder="••••••••"
                />
              </div>

              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError(null);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-navlink text-white text-sm rounded-lg hover:bg-navlink/90"
              >
                Passwort ändern
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Profil-Avatar und Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Profil-Avatar und Partner-Info */}
        <div className="lg:col-span-1">
          <div className="bg-navlink/5 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={uploadAvatar}
                accept="image/*"
                className="hidden"
              />
              <div className="text-center mb-4">
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-navlink text-white flex items-center justify-center text-5xl font-bold cursor-pointer hover:opacity-80 transition relative group mx-auto"
                  onClick={handleAvatarClick}
                >
                  {user?.avatar_url ? (
                    <>
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-sm font-medium">Foto ändern</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {user?.name?.charAt(0).toUpperCase()}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-sm font-medium">Foto hochladen</span>
                      </div>
                    </>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                {!user?.avatar_url && (
                  <button
                    onClick={handleAvatarClick}
                    className="text-navlink text-sm hover:text-navlink/80 transition mt-2 flex items-center justify-center gap-2 mx-auto"
                  >
                    <FontAwesomeIcon icon={faUser} />
                    Profilbild hochladen
                  </button>
                )}
                <h2 className="text-xl font-bold text-navlink mt-4">{user?.name}</h2>
                {user?.email && <p className="text-sm text-navlink/70 mt-1">{user.email}</p>}
              </div>
            </div>
          </div>

          {/* Partner-Bereich */}
          {user?.partner_id && user?.relationship_start_date && (
            <PartnershipCard
              user={user}
              partner={partnerData}
              onUnlink={handleUnlinkPartner}
            />
          )}
        </div>

        {/* Profilinformationen */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-navlink/5 rounded-2xl p-6 shadow-sm">
              <div className="space-y-4">
                {Object.entries(ONBOARDING_QUESTIONS).map(([key, question]) => (
                  <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-navlink mb-1">
                      {question}
                    </label>
                    {key === 'gender' ? (
                      <select
                        id={key}
                        name={key}
                        value={formData[key as keyof User] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-navlink/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-navlink bg-white"
                      >
                        <option value="">Bitte wählen</option>
                        <option value="male">Männlich</option>
                        <option value="female">Weiblich</option>
                        <option value="diverse">Divers</option>
                      </select>
                    ) : key === 'relationship_status' ? (
                      <select
                        id={key}
                        name={key}
                        value={formData[key as keyof User] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-navlink/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-navlink bg-white"
                      >
                        <option value="">Bitte wählen</option>
                        <option value="single">Single</option>
                        <option value="dating">Dating</option>
                        <option value="relationship">In einer Beziehung</option>
                        <option value="married">Verheiratet</option>
                      </select>
                    ) : key === 'age' ? (
                      <input
                        type="number"
                        id={key}
                        name={key}
                        value={formData[key as keyof User] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-navlink/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-navlink bg-white"
                      />
                    ) : (
                      <input
                        type="text"
                        id={key}
                        name={key}
                        value={formData[key as keyof User] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-navlink/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-navlink bg-white"
                      />
                    )}
                  </div>
                ))}
                
                <div className="flex gap-3 justify-end pt-4">
                  <button 
                    className="px-4 py-2 border border-navlink/20 rounded-lg text-navlink hover:bg-navlink/5 transition"
                    onClick={() => setIsEditing(false)}
                  >
                    Abbrechen
                  </button>
                  <button 
                    className="px-4 py-2 bg-navlink text-white rounded-lg hover:bg-navlink/80 transition shadow-sm"
                    onClick={handleSaveProfile}
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(ONBOARDING_QUESTIONS).reduce((acc: JSX.Element[], [key, question], index) => {
                const categories = {
                  0: { title: "Persönliche Informationen", items: ["name", "age", "gender", "relationship_status"] },
                  1: { title: "Beziehungsverhalten", items: ["time_together_pref", "closeness_style", "show_understanding", "resolve_conflicts"] },
                  2: { title: "Emotionale Muster", items: ["evening_alone", "hurt_response", "criticism_response"] },
                  3: { title: "Beziehungserfahrungen", items: ["fidelity_meaning", "parental_influence", "trust_experience", "parental_patterns"] },
                  4: { title: "Persönliche Entwicklung", items: ["happy_moments", "growth_description"] }
                };

                const categoryIndex = Object.values(categories).findIndex(cat => cat.items.includes(key));
                
                if (categories[categoryIndex as keyof typeof categories].items[0] === key) {
                  acc.push(
                    <div key={categories[categoryIndex as keyof typeof categories].title} className="bg-navlink/5 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-navlink mb-4">{categories[categoryIndex as keyof typeof categories].title}</h3>
                      <div className="grid gap-4">
                        {categories[categoryIndex as keyof typeof categories].items.map(itemKey => (
                          <div key={itemKey} className="bg-white rounded-xl p-4">
                            <p className="font-medium text-navlink mb-2">{ONBOARDING_QUESTIONS[itemKey as keyof typeof ONBOARDING_QUESTIONS]}</p>
                            <p className="text-navlink/90">{translateAnswer(itemKey, user?.[itemKey as keyof User])}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return acc;
              }, [])}
            </div>
          )}
        </div>
      </div>

      {/* Bestätigungsdialog für das Auflösen der Verbindung */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-navlink mb-4">Partnerverbindung lösen</h2>
            <p className="text-navlink/70 mb-6">
              Bist du sicher, dass du die Verbindung zu {partnerName} lösen möchtest? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUnlinkConfirm(false)}
                className="px-4 py-2 text-navlink hover:bg-navlink/5 rounded-lg transition"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUnlinkPartner}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Verbindung lösen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 