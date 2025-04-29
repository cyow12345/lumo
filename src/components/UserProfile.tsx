import React, { useState, useEffect } from 'react';

interface UserProfileProps {
  userId: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  relationshipStatus?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});

  useEffect(() => {
    // Hier würden wir normalerweise Daten von Supabase laden
    // Da wir aber eine Mockversion verwenden, simulieren wir die Daten
    const mockUserData: UserData = {
      id: userId,
      name: 'Max Mustermann',
      email: 'max.mustermann@example.com',
      joinDate: new Date().toISOString().split('T')[0],
      relationshipStatus: 'In einer Beziehung'
    };
    
    // Verzögerung simulieren, um Ladeverhalten zu zeigen
    const timer = setTimeout(() => {
      setUserData(mockUserData);
      setEditedData(mockUserData);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [userId]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Hier würden wir die Daten an Supabase senden
      setUserData({...userData, ...editedData} as UserData);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!userData) {
    return <div className="flex justify-center items-center h-64">Lade Benutzerprofil...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1A2238]">Benutzerprofil</h2>
        <button 
          onClick={handleEditToggle}
          className="px-4 py-2 bg-[#BFA9F2] text-white rounded-md hover:bg-[#A78CE4] transition-colors"
        >
          {isEditing ? 'Speichern' : 'Bearbeiten'}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-[#BFA9F2] flex items-center justify-center text-white text-4xl mb-4">
            {editedData.name?.charAt(0) || 'U'}
          </div>
          {isEditing && (
            <button className="text-[#BFA9F2] text-sm">Foto ändern</button>
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedData.name || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BFA9F2]"
              />
            ) : (
              <p className="text-gray-900">{userData.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editedData.email || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BFA9F2]"
              />
            ) : (
              <p className="text-gray-900">{userData.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beziehungsstatus</label>
            {isEditing ? (
              <select
                name="relationshipStatus"
                value={editedData.relationshipStatus || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#BFA9F2]"
              >
                <option value="">Nicht angegeben</option>
                <option value="Single">Single</option>
                <option value="In einer Beziehung">In einer Beziehung</option>
                <option value="Verheiratet">Verheiratet</option>
                <option value="Es ist kompliziert">Es ist kompliziert</option>
              </select>
            ) : (
              <p className="text-gray-900">{userData.relationshipStatus || 'Nicht angegeben'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mitglied seit</label>
            <p className="text-gray-900">{userData.joinDate}</p>
          </div>
        </div>
      </div>
      
      {!isEditing && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-[#1A2238] mb-4">Statistiken</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Abgeschlossene Assessments</p>
              <p className="text-xl font-bold">12</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Journal-Einträge</p>
              <p className="text-xl font-bold">28</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 