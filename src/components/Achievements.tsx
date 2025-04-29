import React from 'react';

interface User {
  id: string;
  email?: string;
}

interface AchievementsProps {
  user: User | undefined;
}

const Achievements: React.FC<AchievementsProps> = ({ user }) => {
  // Beispiel-Achievements
  const achievements = [
    {
      id: 1,
      title: 'Erster Schritt',
      description: 'Erste Anmeldung bei Lumo',
      icon: '🏆',
      unlocked: true,
      date: '12.04.2024'
    },
    {
      id: 2,
      title: 'Regelmäßiger Nutzer',
      description: '7 Tage in Folge eingeloggt',
      icon: '⭐',
      unlocked: true,
      date: '19.04.2024'
    },
    {
      id: 3,
      title: 'Stimmungsmeister',
      description: '10 Stimmungseinträge erstellt',
      icon: '🎯',
      unlocked: true,
      date: '23.04.2024'
    },
    {
      id: 4,
      title: 'Tiefendenker',
      description: '5 umfangreiche Journaleinträge verfasst',
      icon: '📝',
      unlocked: false,
      date: null
    },
    {
      id: 5,
      title: 'Vollendeter Plan',
      description: '10 Todos abgeschlossen',
      icon: '✅',
      unlocked: false,
      date: null
    }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Überschrift */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-midnight mb-1">
          Errungenschaften
        </h1>
      </div>
      
      {/* Hauptinhalt */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {user ? (
          <>
            {/* Fortschritt */}
            <div className="mb-8 text-center">
              <p className="text-midnight mb-3">
                <span className="font-bold text-lg text-lavender">{achievements.filter(a => a.unlocked).length}</span> von{' '}
                <span className="font-bold text-lg">{achievements.length}</span> Errungenschaften freigeschaltet
              </p>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-lavender to-navlink rounded-full transition-all duration-300"
                  style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }} 
                />
              </div>
            </div>

            {/* Achievements-Liste */}
            <div className="space-y-4">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`flex items-start p-4 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                    achievement.unlocked 
                      ? 'bg-[#f7f2ff] border-l-4 border-lavender' 
                      : 'bg-gray-50 border-l-4 border-gray-200 opacity-70'
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 mr-4 flex items-center justify-center text-2xl">
                    {achievement.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-midnight mb-1">{achievement.title}</h3>
                    <p className="text-sm text-midnight/70 mb-1">{achievement.description}</p>
                    {achievement.unlocked && achievement.date && (
                      <p className="text-xs text-midnight/50">Freigeschaltet am {achievement.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-midnight/50">Bitte melde dich an, um deine Errungenschaften zu sehen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements; 