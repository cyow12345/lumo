import React from 'react';

interface User {
  id: string;
  email?: string;
}

interface SettingsProps {
  user: User | undefined;
  onLogout: () => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  return (
    <div className="max-w-xl mx-auto w-full p-0">
      <div className="p-8 bg-white rounded-2xl shadow-sm">
        <h2 className="text-3xl font-bold text-center text-navlink mb-8">Einstellungen</h2>
        <div className="space-y-8">
          {/* Benutzerkonto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-midnight">Benutzerkonto</h3>
            {user && (
              <div className="text-midnight/80 text-sm space-y-1">
                <p><span className="font-medium">Benutzer-ID:</span> {user.id}</p>
                {user.email && <p><span className="font-medium">E-Mail:</span> {user.email}</p>}
              </div>
            )}
            <button
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-navlink to-lavender text-white font-medium text-base shadow hover:brightness-105 transition"
              onClick={onLogout}
            >
              Abmelden
            </button>
          </div>

          {/* Benachrichtigungen */}
          <div className="space-y-4 bg-lavender/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-midnight mb-2">Benachrichtigungen</h3>
            <div className="flex justify-between items-center py-2">
              <span className="text-midnight">Tägliche Erinnerungen</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:bg-lavender transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-midnight">Partnerbenachrichtigungen</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:bg-lavender transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>

          {/* Datenschutz */}
          <div className="space-y-4 bg-lavender/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-midnight mb-2">Datenschutz</h3>
            <div className="flex justify-between items-center py-2">
              <span className="text-midnight">Profilsichtbarkeit für Partner</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:bg-lavender transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-midnight">Teilen von Stimmungsdaten</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:bg-lavender transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 