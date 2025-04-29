import React, { useState, useEffect } from 'react';
import { MoodEntry } from '../models/Mood';
import { moodService } from '../services/moodService';
import MoodInput from './MoodInput';
import MoodTrends from './MoodTrends';
import MoodComparison from './MoodComparison';
import { 
  Smile, History, TrendingUp, ArrowLeftRight, SmilePlus, 
  Frown, Angry, Meh, ThumbsUp, PartyPopper, Loader2, 
  Moon, BrainCircuit, Heart, Star, CloudRain, Coffee, 
  Sparkles, HeartHandshake, Music, Zap, BatteryWarning,
  Sunset, Cloud, Sun, SunDim
} from 'lucide-react';
import './MoodTracker.css';

// Interface für den User-Typ
interface User {
  id: string;
  email?: string;
}

interface MoodTrackerProps {
  user?: User;
  relationshipId?: string;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ user, relationshipId = 'default' }) => {
  const userId = user?.id || 'guest';
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'history' | 'trends' | 'comparison'>('input');
  const [partnerName, setPartnerName] = useState<string>('Partner');

  // Lade die letzten Stimmungseinträge des Benutzers
  useEffect(() => {
    const loadRecentEntries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const entries = await moodService.getMoodEntriesByUser(userId, 5);
        setRecentEntries(entries);
      } catch (err) {
        console.error('Fehler beim Laden der Stimmungseinträge:', err);
        setError('Stimmungseinträge konnten nicht geladen werden');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentEntries();
  }, [userId]);

  // Handler für neu gespeicherte Stimmungen
  const handleMoodSaved = (entry: MoodEntry) => {
    // Füge den neuen Eintrag am Anfang hinzu und behalte nur die neuesten 5
    setRecentEntries(prev => [entry, ...prev].slice(0, 5));
    // Nach dem Speichern zur History wechseln, um den neuen Eintrag zu zeigen
    setActiveTab('history');
  };

  // Formatiere Zeitstempel zu lesbare Zeit
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatiere Stimmungs-Icons
  const getMoodEmoji = (mood: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      very_happy: (
        <div className="relative">
          <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
        </div>
      ),
      happy: <Sun className="w-8 h-8 text-yellow-500 fill-yellow-100" />,
      neutral: <SunDim className="w-8 h-8 text-amber-400" />,
      sad: <Cloud className="w-8 h-8 text-blue-300 fill-blue-50" />,
      very_sad: <CloudRain className="w-8 h-8 text-blue-400 fill-blue-100" />,
      angry: <Zap className="w-8 h-8 text-red-500 fill-red-200" />,
      anxious: <BatteryWarning className="w-8 h-8 text-orange-400 fill-orange-100" />,
      excited: (
        <div className="relative">
          <PartyPopper className="w-8 h-8 text-pink-500 fill-pink-200" />
          <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
        </div>
      ),
      tired: <Coffee className="w-8 h-8 text-amber-800 fill-amber-300" />,
      stressed: <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />,
      calm: <Sunset className="w-8 h-8 text-purple-400 fill-purple-100" />,
      thankful: <HeartHandshake className="w-8 h-8 text-green-500 fill-green-100" />,
      loved: (
        <div className="relative">
          <Heart className="w-8 h-8 text-pink-500 fill-pink-300" />
          <Sparkles className="w-4 h-4 text-pink-300 absolute -top-1 -right-1" />
        </div>
      )
    };

    return iconMap[mood] || <Smile className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="mood-container">
      <div className="mood-header">
        <h2 className="section-title">
          <Smile className="w-5 h-5 mr-2 text-lavendel" /> 
          Stimmungs-Tracker
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
            activeTab === 'input' 
              ? 'bg-lavendel text-white' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('input')}
        >
          <SmilePlus className="w-4 h-4" />
          <span>Neue Stimmung</span>
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
            activeTab === 'history' 
              ? 'bg-lavendel text-white' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('history')}
        >
          <History className="w-4 h-4" />
          <span>Letzte Einträge</span>
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
            activeTab === 'trends' 
              ? 'bg-lavendel text-white' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('trends')}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Stimmungsverlauf</span>
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
            activeTab === 'comparison' 
              ? 'bg-lavendel text-white' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('comparison')}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Partnervergleich</span>
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
        {activeTab === 'input' && (
          <div className="weekly-summary p-4 bg-white rounded shadow">
            <MoodInput 
              user={user} 
              relationshipId={relationshipId} 
              onMoodSaved={handleMoodSaved}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="weekly-summary p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold text-midnight mb-4">Letzte Einträge</h3>
            
            {isLoading ? (
              <div className="py-4 text-center text-gray-500">
                <div className="animate-pulse flex justify-center">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ) : error ? (
              <div className="py-4 text-center text-red-500">{error}</div>
            ) : recentEntries.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                <p className="mb-2">Noch keine Stimmungseinträge vorhanden</p>
                <button 
                  onClick={() => setActiveTab('input')}
                  className="text-sm text-lavendel hover:underline"
                >
                  Neue Stimmung eintragen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEntries.map(entry => (
                  <div key={entry.id} className="flex items-start p-4 bg-[#F9F9F9] rounded-lg border-l-4 border-lavendel">
                    <div className="text-4xl mr-4">
                      {getMoodEmoji(entry.mood)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span className="font-medium">Intensität: {entry.intensity}/5</span>
                        <span>{formatDate(entry.createdAt)}</span>
                      </div>
                      {entry.note && (
                        <div className="text-gray-700 mb-2 p-2 bg-white rounded">{entry.note}</div>
                      )}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-periwinkle text-white rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="weekly-summary p-4 bg-white rounded shadow">
            <MoodTrends user={user} relationshipId={relationshipId} />
          </div>
        )}
        
        {activeTab === 'comparison' && (
          <div className="weekly-summary p-4 bg-white rounded shadow">
            <MoodComparison user={user} relationshipId={relationshipId} partnerName={partnerName} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker; 