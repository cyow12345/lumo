import React, { useState } from 'react';
import './Profile.css';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
    privacy?: {
      shareProfile?: boolean;
      shareMoodData?: boolean;
      shareActivities?: boolean;
    };
  };
  stats?: {
    journalEntries: number;
    moods: number;
    activities: number;
    relationshipStartDate?: string;
  };
}

interface ProfileProps {
  userId: string;
  initialUser?: User;
  onUpdateProfile?: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  userId, 
  initialUser,
  onUpdateProfile 
}) => {
  // Mock-Benutzerdaten, später durch echte Daten ersetzen
  const mockUser: User = {
    id: userId,
    name: 'Max Mustermann',
    email: 'max@example.com',
    avatar: undefined,
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'de',
      privacy: {
        shareProfile: true,
        shareMoodData: true,
        shareActivities: false
      }
    },
    stats: {
      journalEntries: 12,
      moods: 28,
      activities: 15,
      relationshipStartDate: '2022-06-15'
    }
  };

  const [user, setUser] = useState<User>(initialUser || mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleToggleChange = (field: string, isSubField: boolean = false, parentField?: string) => {
    if (isSubField && parentField && user.preferences) {
      const updatedPrivacy = { 
        ...user.preferences.privacy, 
        [field]: !user.preferences.privacy?.[field as keyof typeof user.preferences.privacy]
      };
      
      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          privacy: updatedPrivacy
        }
      });
    } else if (user.preferences) {
      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          [field]: !user.preferences[field as keyof typeof user.preferences]
        }
      });
    }
  };

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email
    };
    
    setUser(updatedUser);
    setIsEditing(false);
    
    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nicht angegeben';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const calculateRelationshipDuration = (startDate?: string) => {
    if (!startDate) return 'Unbekannt';
    
    const start = new Date(startDate);
    const today = new Date();
    
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = Math.floor((diffDays % 365) % 30);
    
    let duration = '';
    if (years > 0) {
      duration += `${years} Jahr${years > 1 ? 'e' : ''} `;
    }
    if (months > 0) {
      duration += `${months} Monat${months > 1 ? 'e' : ''} `;
    }
    duration += `${days} Tag${days !== 1 ? 'e' : ''}`;
    
    return duration;
  };

  return (
    <div className="max-w-xl mx-auto w-full p-0">
      {/* Profilüberschrift */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-midnight mb-1">
          Benutzerprofil
        </h1>
        {!isEditing && (
          <button 
            className="mt-4 md:mt-0 bg-lavender text-white text-sm px-6 py-2 rounded-full shadow hover:brightness-105 transition"
            onClick={() => setIsEditing(true)}
          >
            Bearbeiten
          </button>
        )}
      </div>
      
      {/* Profil-Avatar und Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-lavender text-white flex items-center justify-center text-4xl font-bold">
            {user.avatar ? 
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : 
              user.name.charAt(0).toUpperCase()
            }
          </div>
          
          {isEditing ? (
            <div className="w-full max-w-md">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-midnight mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-midnight mb-1">E-Mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-midnight hover:bg-gray-50 transition"
                  onClick={() => setIsEditing(false)}
                >
                  Abbrechen
                </button>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-navlink to-lavender text-white rounded-lg hover:brightness-105 transition shadow-sm"
                  onClick={handleSaveProfile}
                >
                  Speichern
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-bold text-midnight">{user.name}</h2>
              {user.email && <p className="text-sm text-midnight/70">{user.email}</p>}
            </div>
          )}
        </div>
        
        {!isEditing && (
          <>
            <h3 className="text-lg font-semibold text-midnight mb-4 border-b pb-2">Beziehungsinformationen</h3>
            
            {/* Beziehungsinfos */}
            <div className="bg-[#f7f2ff] rounded-xl p-4 mb-6">
              <div className="flex justify-between py-2 border-b border-white/50">
                <div className="text-midnight/70 font-medium">Beziehung seit:</div>
                <div className="text-midnight">{formatDate(user.stats?.relationshipStartDate)}</div>
              </div>
              <div className="flex justify-between py-2">
                <div className="text-midnight/70 font-medium">Dauer:</div>
                <div className="text-midnight">{calculateRelationshipDuration(user.stats?.relationshipStartDate)}</div>
              </div>
            </div>
            
            {/* Einstellungen */}
            <h3 className="text-lg font-semibold text-midnight mb-4 border-b pb-2">Einstellungen</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-[#f7f2ff] rounded-xl">
                <span className="text-midnight">Benachrichtigungen</span>
                <button 
                  className={`relative w-12 h-6 rounded-full transition-colors ${user.preferences?.notifications ? 'bg-lavender' : 'bg-gray-300'}`}
                  onClick={() => handleToggleChange('notifications')}
                >
                  <span 
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.preferences?.notifications ? 'translate-x-6' : ''}`}
                  />
                </button>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-[#f7f2ff] rounded-xl">
                <span className="text-midnight">Dunkles Design</span>
                <button 
                  className={`relative w-12 h-6 rounded-full transition-colors ${user.preferences?.theme === 'dark' ? 'bg-lavender' : 'bg-gray-300'}`}
                  onClick={() => handleToggleChange('theme')}
                >
                  <span 
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.preferences?.theme === 'dark' ? 'translate-x-6' : ''}`}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile; 