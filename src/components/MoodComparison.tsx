import React, { useState, useEffect } from 'react';
import { MoodComparison as MoodComparisonModel, DailyMoodSummary, MoodType } from '../models/Mood';
import { moodService } from '../services/moodService';
import './MoodComparison.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Card from './Card';
import { BarChart2, Calendar, CalendarDays, Clock } from 'lucide-react';

// Interface für den User-Typ
interface User {
  id: string;
  email?: string;
}

interface MoodComparisonProps {
  user?: User;
  relationshipId?: string;
  partnerName?: string;
}

const MoodComparison: React.FC<MoodComparisonProps> = ({ user, relationshipId = 'default', partnerName = 'Partner' }) => {
  const userId = user?.id || 'guest';
  const [comparisonData, setComparisonData] = useState<MoodComparisonModel | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('Du');

  useEffect(() => {
    fetchComparisonData();
  }, [userId, relationshipId, period]);

  const fetchComparisonData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await moodService.getMoodComparison(relationshipId, period);
      setComparisonData(data);
    } catch (err) {
      console.error('Fehler beim Laden der Stimmungsvergleichsdaten:', err);
      setError('Die Stimmungsvergleichsdaten konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month') => {
    setPeriod(newPeriod);
  };

  const getEmoji = (mood: MoodType): string => {
    const emojiMap: Record<string, string> = {
      very_happy: '😄',
      happy: '🙂',
      neutral: '😐',
      sad: '🙁',
      very_sad: '😢',
      angry: '😠',
      anxious: '😰',
      excited: '🤩',
      tired: '😴',
      stressed: '😫',
      calm: '😌',
      thankful: '🙏',
      loved: '🥰'
    };

    return emojiMap[mood] || '❓';
  };

  // Daten für das Liniendiagramm vorbereiten
  const prepareChartData = () => {
    if (!comparisonData || !comparisonData.user1.moodData || !comparisonData.user2.moodData) {
      return [];
    }

    // Alle Datumsangaben sammeln und sortieren
    const allDates = Array.from(new Set([
      ...comparisonData.user1.moodData.map(entry => entry.date),
      ...comparisonData.user2.moodData.map(entry => entry.date)
    ])).sort();

    // Daten für das Diagramm aufbereiten
    return allDates.map(date => {
      const user1Entry = comparisonData.user1.moodData.find(entry => entry.date === date);
      const user2Entry = comparisonData.user2.moodData.find(entry => entry.date === date);

      return {
        date: formatDate(date),
        [username]: user1Entry ? user1Entry.averageIntensity : undefined,
        [partnerName]: user2Entry ? user2Entry.averageIntensity : undefined,
        user1Mood: user1Entry ? user1Entry.dominantMood : undefined,
        user2Mood: user2Entry ? user2Entry.dominantMood : undefined,
        isSynchronized: comparisonData.synchronizedDays.includes(date),
        isDivergent: comparisonData.divergentDays.includes(date)
      };
    });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };

  // Daten für die Übereinstimmung vorbereiten
  const prepareSyncData = () => {
    if (!comparisonData) return [];

    return [
      { 
        name: 'Übereinstimmend', 
        value: comparisonData.synchronizedDays.length,
        fill: '#4ade80'
      },
      { 
        name: 'Unterschiedlich', 
        value: comparisonData.divergentDays.length,
        fill: '#f97316'
      },
      { 
        name: 'Neutral', 
        value: comparisonData.user1.moodData.length - 
               comparisonData.synchronizedDays.length - 
               comparisonData.divergentDays.length,
        fill: '#d4d4d8'
      }
    ];
  };

  const getCorrelationText = (correlation: number): string => {
    if (correlation >= 0.7) return 'Sehr starke positive Übereinstimmung';
    if (correlation >= 0.5) return 'Moderate positive Übereinstimmung';
    if (correlation >= 0.3) return 'Leichte positive Übereinstimmung';
    if (correlation > -0.3) return 'Keine signifikante Übereinstimmung';
    if (correlation >= -0.5) return 'Leichte entgegengesetzte Stimmung';
    if (correlation >= -0.7) return 'Moderate entgegengesetzte Stimmung';
    return 'Starke entgegengesetzte Stimmung';
  };

  const getCorrelationColor = (correlation: number): string => {
    if (correlation >= 0.5) return '#4ade80';
    if (correlation >= 0.3) return '#BFA9F2';
    if (correlation > -0.3) return '#d4d4d8';
    if (correlation >= -0.5) return '#BFA9F2';
    if (correlation >= -0.7) return '#f97316';
    return '#ef4444';
  };

  const renderSynchronizedDays = () => {
    if (!comparisonData || comparisonData.synchronizedDays.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">Keine übereinstimmenden Tage im gewählten Zeitraum.</div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {comparisonData.synchronizedDays.map(date => {
          const user1Data = comparisonData.user1.moodData.find(d => d.date === date);
          const user2Data = comparisonData.user2.moodData.find(d => d.date === date);
          
          if (!user1Data || !user2Data) return null;
          
          return (
            <div key={date} className="bg-green-50 border border-green-100 rounded-xl p-3 flex flex-col">
              <div className="text-sm font-medium text-green-800 mb-2">{formatDate(date)}</div>
              <div className="flex justify-around">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{getEmoji(user1Data.dominantMood)}</span>
                  <span className="text-xs text-gray-600 mt-1">{username}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{getEmoji(user2Data.dominantMood)}</span>
                  <span className="text-xs text-gray-600 mt-1">{partnerName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDivergentDays = () => {
    if (!comparisonData || comparisonData.divergentDays.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">Keine stark unterschiedlichen Tage im gewählten Zeitraum.</div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {comparisonData.divergentDays.map(date => {
          const user1Data = comparisonData.user1.moodData.find(d => d.date === date);
          const user2Data = comparisonData.user2.moodData.find(d => d.date === date);
          
          if (!user1Data || !user2Data) return null;
          
          return (
            <div key={date} className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex flex-col">
              <div className="text-sm font-medium text-orange-800 mb-2">{formatDate(date)}</div>
              <div className="flex justify-around">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{getEmoji(user1Data.dominantMood)}</span>
                  <span className="text-xs text-gray-600 mt-1">{username}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{getEmoji(user2Data.dominantMood)}</span>
                  <span className="text-xs text-gray-600 mt-1">{partnerName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Lade Stimmungsvergleich...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-midnight flex items-center">
          <BarChart2 className="mr-2 text-lavender" /> Stimmungsvergleich
        </h1>
        
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
          <button 
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${period === 'day' ? 'bg-lavender text-white' : 'hover:bg-gray-200'}`}
            onClick={() => handlePeriodChange('day')}
          >
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" /> Tag
            </span>
          </button>
          <button 
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${period === 'week' ? 'bg-lavender text-white' : 'hover:bg-gray-200'}`}
            onClick={() => handlePeriodChange('week')}
          >
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" /> Woche
            </span>
          </button>
          <button 
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${period === 'month' ? 'bg-lavender text-white' : 'hover:bg-gray-200'}`}
            onClick={() => handlePeriodChange('month')}
          >
            <span className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-1" /> Monat
            </span>
          </button>
        </div>
      </div>

      {comparisonData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Übereinstimmungsindex">
              <div className="flex flex-col items-center justify-center p-4">
                <div 
                  className="w-28 h-28 rounded-full flex flex-col items-center justify-center mb-4 shadow-md"
                  style={{ backgroundColor: getCorrelationColor(comparisonData.correlation) }}
                >
                  <div className="text-3xl font-bold text-white">{(comparisonData.correlation * 100).toFixed(0)}%</div>
                </div>
                <div className="text-center text-sm text-gray-600">{getCorrelationText(comparisonData.correlation)}</div>
              </div>
            </Card>

            <Card title="Stimmungsstatus">
              <div className="grid grid-cols-2 gap-2 p-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{comparisonData.synchronizedDays.length}</div>
                  <div className="text-xs text-gray-600">Übereinstimmend</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{comparisonData.divergentDays.length}</div>
                  <div className="text-xs text-gray-600">Unterschiedlich</div>
                </div>
                <div className="col-span-2 bg-lavender/10 rounded-xl p-4 text-center">
                  <div className="text-lg font-medium text-lavender">
                    {comparisonData.synchronizedDays.length > comparisonData.divergentDays.length
                      ? 'Großartige Übereinstimmung!'
                      : 'Unterschiedliche Stimmungen'}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Stimmungsverteilung">
              <div className="h-48 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareSyncData()} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card title="Stimmungsverlauf">
            <div className="h-64 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareChartData()} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={username} stroke="#8884d8" activeDot={{ r: 6 }} strokeWidth={2} />
                  <Line type="monotone" dataKey={partnerName} stroke="#82ca9d" activeDot={{ r: 6 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Übereinstimmende Tage">
              <div className="p-4">
                {renderSynchronizedDays()}
              </div>
            </Card>

            <Card title="Unterschiedliche Tage">
              <div className="p-4">
                {renderDivergentDays()}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodComparison; 