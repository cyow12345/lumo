import React, { useState, useEffect } from 'react';
import { MoodType, MoodEntry, DailyMoodSummary, MoodTrend } from '../models/Mood';
import { moodService } from '../services/moodService';
import './MoodTrends.css';

// Füge diese Imports hinzu, wenn Chart.js und react-chartjs-2 installiert sind
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
// import { Line, Bar } from 'react-chartjs-2';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Interface für den User-Typ
interface User {
  id: string;
  email?: string;
}

interface MoodTrendsProps {
  user?: User;
  relationshipId?: string;
  days?: number;
}

const MoodTrends: React.FC<MoodTrendsProps> = ({ user, relationshipId, days = 14 }) => {
  const userId = user?.id || 'guest';
  const [dailySummary, setDailySummary] = useState<DailyMoodSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'intensity' | 'moods'>('intensity');
  const [timeRange, setTimeRange] = useState<number>(days);

  useEffect(() => {
    const loadMoodData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const summaries = await moodService.getDailyMoodSummary(userId, timeRange);
        setDailySummary(summaries);
      } catch (err) {
        console.error('Fehler beim Laden der Stimmungsdaten:', err);
        setError('Stimmungsdaten konnten nicht geladen werden');
      } finally {
        setIsLoading(false);
      }
    };

    loadMoodData();
  }, [userId, timeRange]);

  // Emoji-Mapping als Hilfsfunktion
  const getMoodEmoji = (mood: MoodType): string => {
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

  // Daten für die Intensitätsgrafik vorbereiten
  const prepareIntensityData = () => {
    // Sortieren nach Datum (ältestes zuerst für Zeitreihe)
    const sortedData = [...dailySummary].sort((a, b) => a.date.localeCompare(b.date));
    
    // Chart.js-Daten formatieren würde so aussehen:
    /*
    return {
      labels: sortedData.map(day => day.date.split('-').slice(1).reverse().join('.')), // Format: DD.MM
      datasets: [
        {
          label: 'Durchschnittliche Intensität',
          data: sortedData.map(day => day.averageIntensity),
          borderColor: '#0891b2',
          backgroundColor: 'rgba(8, 145, 178, 0.2)',
          tension: 0.3,
        }
      ]
    };
    */
    
    // Nur die Daten zurückgeben, da wir (noch) keine Chart.js-Bibliothek verwenden
    return {
      dates: sortedData.map(day => day.date.split('-').slice(1).reverse().join('.')),
      values: sortedData.map(day => day.averageIntensity)
    };
  };

  // Daten für die Stimmungsverteilungsgrafik vorbereiten
  const prepareMoodDistributionData = () => {
    // Zähle die Häufigkeit jeder Stimmung
    const moodCounts: Record<string, number> = {};
    
    dailySummary.forEach(day => {
      const mood = day.dominantMood;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    // Sortieren nach Häufigkeit (absteigend)
    const sortedMoods = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Nur die Top 5 zeigen
    
    // Chart.js-Daten formatieren würde so aussehen:
    /*
    return {
      labels: sortedMoods.map(([mood]) => `${getMoodEmoji(mood as MoodType)}`),
      datasets: [
        {
          label: 'Stimmungsverteilung',
          data: sortedMoods.map(([_, count]) => count),
          backgroundColor: [
            '#0891b2', '#0e7490', '#0c4a6e', '#0369a1', '#0ea5e9',
          ],
        }
      ]
    };
    */
    
    // Nur die Daten zurückgeben, da wir (noch) keine Chart.js-Bibliothek verwenden
    return {
      moods: sortedMoods.map(([mood]) => mood as MoodType),
      counts: sortedMoods.map(([_, count]) => count)
    };
  };

  // Temporäre visuelle Darstellung ohne Chart.js
  const renderIntensityChart = () => {
    const data = prepareIntensityData();
    
    return (
      <div className="intensity-chart-placeholder">
        <div className="chart-title">Stimmungsintensität im Zeitverlauf</div>
        <div className="chart-info">
          {data.dates.map((date, index) => (
            <div key={date} className="chart-data-point">
              <div className="chart-label">{date}</div>
              <div 
                className="chart-bar" 
                style={{ 
                  height: `${Math.max(5, data.values[index] * 20)}px`,
                  backgroundColor: `rgba(8, 145, 178, ${0.5 + data.values[index] * 0.1})`
                }}
              />
              <div className="chart-value">{data.values[index].toFixed(1)}</div>
            </div>
          ))}
        </div>
        <div className="chart-note">
          Diese Visualisierung zeigt, wie sich die Intensität deiner Stimmungen über Zeit entwickelt hat.
        </div>
      </div>
    );
  };

  const renderMoodDistributionChart = () => {
    const data = prepareMoodDistributionData();
    
    return (
      <div className="mood-distribution-chart-placeholder">
        <div className="chart-title">Häufigste Stimmungen</div>
        <div className="chart-info">
          {data.moods.map((mood, index) => (
            <div key={mood} className="chart-data-point">
              <div className="chart-label">
                <span className="mood-emoji">{getMoodEmoji(mood)}</span>
              </div>
              <div 
                className="chart-horizontal-bar" 
                style={{ 
                  width: `${Math.max(10, data.counts[index] * 30)}px`,
                  backgroundColor: `hsl(${index * 50}, 70%, 60%)`
                }}
              />
              <div className="chart-value">{data.counts[index]}</div>
            </div>
          ))}
        </div>
        <div className="chart-note">
          Diese Visualisierung zeigt, welche Stimmungen in dem Zeitraum am häufigsten aufgetreten sind.
        </div>
      </div>
    );
  };

  return (
    <div className="mood-trends-container">
      <h2 className="mood-trends-title">Stimmungsverlauf</h2>
      
      <div className="trends-controls">
        <div className="view-selector">
          <button 
            className={`view-button ${selectedView === 'intensity' ? 'active' : ''}`}
            onClick={() => setSelectedView('intensity')}
          >
            Intensität
          </button>
          <button 
            className={`view-button ${selectedView === 'moods' ? 'active' : ''}`}
            onClick={() => setSelectedView('moods')}
          >
            Stimmungen
          </button>
        </div>
        
        <div className="time-range-selector">
          <label htmlFor="timeRange">Zeitraum:</label>
          <select 
            id="timeRange" 
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <option value={7}>Letzte Woche</option>
            <option value={14}>Letzte 2 Wochen</option>
            <option value={30}>Letzter Monat</option>
            <option value={90}>Letzte 3 Monate</option>
          </select>
        </div>
      </div>
      
      <div className="trends-content">
        {isLoading ? (
          <div className="trends-loading">Lade Stimmungsdaten...</div>
        ) : error ? (
          <div className="trends-error">{error}</div>
        ) : dailySummary.length === 0 ? (
          <div className="trends-empty">
            Noch nicht genug Stimmungsdaten vorhanden.
            <p>Trage regelmäßig deine Stimmung ein, um hier Trends zu sehen.</p>
          </div>
        ) : (
          <div className="trends-charts">
            {selectedView === 'intensity' ? renderIntensityChart() : renderMoodDistributionChart()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTrends; 