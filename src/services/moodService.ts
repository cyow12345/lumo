import { MoodEntry, MoodType, DailyMoodSummary, MoodTrend, MoodComparison } from '../models/Mood';

/**
 * Service-Klasse für die Verwaltung von Stimmungseinträgen
 */
export class MoodService {
  /**
   * Speichert einen neuen Stimmungseintrag
   * 
   * @param entry Das zu speichernde Stimmungsobjekt
   * @returns Promise mit der ID des erstellten Eintrags
   */
  async saveMoodEntry(entry: Omit<MoodEntry, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Mock-Implementierung - in einer realen App würde hier die Verbindung zu Firestore hergestellt
      console.log('Speichere Stimmungseintrag:', entry);
      
      // Generiere eine zufällige ID als Beispiel
      const randomId = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now();
      
      // Demo-Zwecke: Hier speichern wir die Daten im localStorage
      const savedEntries = this.getLocalStorageEntries();
      const newEntry: MoodEntry = {
        ...entry,
        id: randomId,
        createdAt: timestamp
      };
      
      savedEntries.push(newEntry);
      localStorage.setItem('moodEntries', JSON.stringify(savedEntries));
      
      return randomId;
    } catch (error) {
      console.error('Fehler beim Speichern des Stimmungseintrags:', error);
      throw new Error('Stimmungseintrag konnte nicht gespeichert werden');
    }
  }

  /**
   * Ruft alle Stimmungseinträge für einen Benutzer ab
   * 
   * @param userId ID des Benutzers
   * @param limit Maximale Anzahl der abzurufenden Einträge
   * @returns Promise mit Array von Stimmungseinträgen
   */
  async getMoodEntriesByUser(userId: string, limit = 30): Promise<MoodEntry[]> {
    try {
      // In einer realen App würde hier eine Firestore-Abfrage stehen
      console.log(`Rufe Stimmungseinträge für Benutzer ${userId} ab, Limit: ${limit}`);
      
      // Demo-Zwecke: Aus localStorage lesen
      const entries = this.getLocalStorageEntries();
      return entries
        .filter(entry => entry.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    } catch (error) {
      console.error('Fehler beim Abrufen der Stimmungseinträge:', error);
      throw new Error('Stimmungseinträge konnten nicht abgerufen werden');
    }
  }

  /**
   * Ruft Stimmungseinträge für eine Beziehung ab
   * 
   * @param relationshipId ID der Beziehung
   * @param limit Maximale Anzahl der abzurufenden Einträge
   * @returns Promise mit Array von Stimmungseinträgen
   */
  async getMoodEntriesByRelationship(relationshipId: string, limit = 50): Promise<MoodEntry[]> {
    try {
      // In einer realen App würde hier eine Firestore-Abfrage stehen
      console.log(`Rufe Stimmungseinträge für Beziehung ${relationshipId} ab, Limit: ${limit}`);
      
      // Demo-Zwecke: Aus localStorage lesen
      const entries = this.getLocalStorageEntries();
      return entries
        .filter(entry => entry.relationshipId === relationshipId)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    } catch (error) {
      console.error('Fehler beim Abrufen der Beziehungs-Stimmungseinträge:', error);
      throw new Error('Beziehungs-Stimmungseinträge konnten nicht abgerufen werden');
    }
  }

  /**
   * Berechnet eine tägliche Zusammenfassung der Stimmungen für einen Benutzer
   * 
   * @param userId ID des Benutzers
   * @param days Anzahl der Tage in der Vergangenheit
   * @returns Promise mit einem Array von Tagesstimmungs-Zusammenfassungen
   */
  async getDailyMoodSummary(userId: string, days = 7): Promise<DailyMoodSummary[]> {
    try {
      const entries = await this.getMoodEntriesByUser(userId, days * 5); // Mehrere Einträge pro Tag möglich
      const summaryMap = new Map<string, MoodEntry[]>();
      
      // Wenn keine Einträge vorhanden sind, generiere Demo-Daten für Visualisierung
      if (entries.length === 0 && process.env.NODE_ENV !== 'production') {
        return this.generateDemoMoodData(userId, days);
      }
      
      // Gruppiere nach Tagen
      entries.forEach(entry => {
        const date = new Date(entry.createdAt).toISOString().split('T')[0];
        if (!summaryMap.has(date)) {
          summaryMap.set(date, []);
        }
        summaryMap.get(date)?.push(entry);
      });
      
      // Berechne Zusammenfassung pro Tag
      const summaries: DailyMoodSummary[] = [];
      summaryMap.forEach((dayEntries, date) => {
        const moodCounts = new Map<MoodType, number>();
        let totalIntensity = 0;
        
        dayEntries.forEach(entry => {
          moodCounts.set(entry.mood, (moodCounts.get(entry.mood) || 0) + 1);
          totalIntensity += entry.intensity;
        });
        
        // Dominante Stimmung finden
        let dominantMood = MoodType.NEUTRAL;
        let maxCount = 0;
        
        moodCounts.forEach((count, mood) => {
          if (count > maxCount) {
            maxCount = count;
            dominantMood = mood;
          }
        });
        
        summaries.push({
          date,
          averageIntensity: totalIntensity / dayEntries.length,
          dominantMood,
          entries: dayEntries
        });
      });
      
      // Sortiere nach Datum (neueste zuerst)
      return summaries.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Fehler beim Berechnen der täglichen Stimmungszusammenfassung:', error);
      throw new Error('Tägliche Stimmungszusammenfassung konnte nicht berechnet werden');
    }
  }

  /**
   * Generiert einen Stimmungstrend-Bericht für einen bestimmten Zeitraum
   * 
   * @param userId ID des Benutzers
   * @param days Anzahl der Tage für den Bericht
   * @returns Promise mit einem MoodTrend-Objekt
   */
  async getMoodTrend(userId: string, days = 30): Promise<MoodTrend> {
    try {
      const entries = await this.getMoodEntriesByUser(userId, days * 3);
      
      // Wenn keine Einträge vorhanden sind, generiere Demo-Daten für Visualisierung
      if (entries.length === 0 && process.env.NODE_ENV !== 'production') {
        return this.generateDemoMoodTrend(userId, days);
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const periodStart = startDate.getTime();
      const periodEnd = Date.now();
      
      // Zähle die Häufigkeit jeder Stimmung
      const moodDistribution: Record<MoodType, number> = {} as Record<MoodType, number>;
      let totalIntensity = 0;
      
      entries.forEach(entry => {
        if (!moodDistribution[entry.mood]) {
          moodDistribution[entry.mood] = 0;
        }
        moodDistribution[entry.mood] += 1;
        totalIntensity += entry.intensity;
      });
      
      // Berechne signifikante Änderungen (wo sich die Stimmung oder Intensität stark verändert hat)
      const significantChanges = [];
      
      for (let i = 1; i < entries.length; i++) {
        const curr = entries[i];
        const prev = entries[i-1];
        
        // Wenn Stimmung sich geändert hat oder Intensität um mehr als 2 Punkte
        if (curr.mood !== prev.mood || Math.abs(curr.intensity - prev.intensity) >= 2) {
          significantChanges.push({
            date: curr.createdAt,
            change: curr.intensity - prev.intensity,
            previousMood: prev.mood,
            newMood: curr.mood
          });
        }
      }
      
      return {
        userId,
        periodStart,
        periodEnd,
        moodDistribution,
        averageIntensity: entries.length > 0 ? totalIntensity / entries.length : 0,
        significantChanges
      };
    } catch (error) {
      console.error('Fehler beim Berechnen des Stimmungstrends:', error);
      throw new Error('Stimmungstrend konnte nicht berechnet werden');
    }
  }

  /**
   * Generiert einen Stimmungsvergleich zwischen zwei Partnern
   * 
   * @param relationshipId ID der Beziehung
   * @param period Art des Zeitraums (Tag, Woche, Monat)
   * @returns Promise mit einem MoodComparison-Objekt
   */
  async getMoodComparison(relationshipId: string, period: 'day' | 'week' | 'month' = 'week'): Promise<MoodComparison> {
    try {
      // In einer realen App würden hier Beziehungsdaten abgerufen
      // Hier einfache Mock-Implementierung mit zwei festen Benutzer-IDs
      const user1Id = 'user-1';
      const user2Id = 'user-2';
      
      // Anzahl der Tage je nach Periode bestimmen
      const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
      
      // Stimmungsdaten für beide Benutzer abrufen
      const user1Data = await this.getDailyMoodSummary(user1Id, days);
      const user2Data = await this.getDailyMoodSummary(user2Id, days);
      
      // Tage identifizieren, an denen beide ähnliche / unterschiedliche Stimmungen hatten
      const synchronizedDays: string[] = [];
      const divergentDays: string[] = [];
      
      // Map für schnelleren Zugriff auf user2 Daten
      const user2DataMap = new Map<string, DailyMoodSummary>();
      user2Data.forEach(summary => {
        user2DataMap.set(summary.date, summary);
      });
      
      // Vergleich durchführen
      user1Data.forEach(u1Summary => {
        if (user2DataMap.has(u1Summary.date)) {
          const u2Summary = user2DataMap.get(u1Summary.date)!;
          
          // Wenn gleiche dominante Stimmung oder ähnliche Intensität (Differenz <= 1)
          if (u1Summary.dominantMood === u2Summary.dominantMood || 
              Math.abs(u1Summary.averageIntensity - u2Summary.averageIntensity) <= 1) {
            synchronizedDays.push(u1Summary.date);
          } else {
            divergentDays.push(u1Summary.date);
          }
        }
      });
      
      // Einfache Korrelationsberechnung (-1 bis 1)
      // Positive Korrelation = ähnliche Stimmungen, negative = gegensätzliche
      const totalOverlappingDays = synchronizedDays.length + divergentDays.length;
      const correlation = totalOverlappingDays > 0 
        ? (synchronizedDays.length - divergentDays.length) / totalOverlappingDays 
        : 0;
      
      return {
        relationshipId,
        period,
        user1: {
          userId: user1Id,
          moodData: user1Data
        },
        user2: {
          userId: user2Id,
          moodData: user2Data
        },
        correlation,
        synchronizedDays,
        divergentDays
      };
    } catch (error) {
      console.error('Fehler beim Berechnen des Stimmungsvergleichs:', error);
      throw new Error('Stimmungsvergleich konnte nicht berechnet werden');
    }
  }

  /**
   * Hilfsmethode, um Stimmungseinträge aus dem localStorage zu lesen
   */
  private getLocalStorageEntries(): MoodEntry[] {
    const storedEntries = localStorage.getItem('moodEntries');
    return storedEntries ? JSON.parse(storedEntries) : [];
  }
  
  /**
   * Generiert Demo-Daten für Stimmungstrends wenn keine echten Daten vorhanden sind
   * Nur in Entwicklungsumgebung verwenden
   */
  private generateDemoMoodData(userId: string, days: number): DailyMoodSummary[] {
    const summaries: DailyMoodSummary[] = [];
    const moodTypes: MoodType[] = [
      MoodType.VERY_HAPPY, MoodType.HAPPY, MoodType.NEUTRAL, 
      MoodType.SAD, MoodType.VERY_SAD, MoodType.ANXIOUS,
      MoodType.EXCITED, MoodType.CALM
    ];
    
    const today = new Date();
    
    // Generiere für jeden Tag eine Zusammenfassung
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Zufällige Stimmung und Intensität
      const randomMood = moodTypes[Math.floor(Math.random() * moodTypes.length)];
      const randomIntensity = Math.floor(Math.random() * 5) + 1;
      
      // Ein simulierter Eintrag für diesen Tag
      const entry: MoodEntry = {
        id: `demo-${i}`,
        userId,
        relationshipId: 'demo-relationship',
        mood: randomMood,
        intensity: randomIntensity,
        createdAt: date.getTime()
      };
      
      summaries.push({
        date: dateStr,
        averageIntensity: randomIntensity,
        dominantMood: randomMood,
        entries: [entry]
      });
    }
    
    return summaries.sort((a, b) => b.date.localeCompare(a.date));
  }
  
  /**
   * Generiert Demo-Daten für einen Stimmungstrend
   * Nur in Entwicklungsumgebung verwenden
   */
  private generateDemoMoodTrend(userId: string, days: number): MoodTrend {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Zufällige Verteilung von Stimmungen
    const moodDistribution: Record<MoodType, number> = {
      [MoodType.VERY_HAPPY]: Math.floor(Math.random() * 5) + 1,
      [MoodType.HAPPY]: Math.floor(Math.random() * 8) + 2,
      [MoodType.NEUTRAL]: Math.floor(Math.random() * 10) + 5,
      [MoodType.SAD]: Math.floor(Math.random() * 4),
      [MoodType.VERY_SAD]: Math.floor(Math.random() * 2),
      [MoodType.ANGRY]: Math.floor(Math.random() * 3),
      [MoodType.ANXIOUS]: Math.floor(Math.random() * 4) + 1,
      [MoodType.EXCITED]: Math.floor(Math.random() * 6),
      [MoodType.TIRED]: Math.floor(Math.random() * 4) + 2,
      [MoodType.STRESSED]: Math.floor(Math.random() * 5) + 1,
      [MoodType.CALM]: Math.floor(Math.random() * 7) + 1,
      [MoodType.THANKFUL]: Math.floor(Math.random() * 3),
      [MoodType.LOVED]: Math.floor(Math.random() * 4) + 1
    };
    
    // Einige simulierte signifikante Änderungen
    const significantChanges = [];
    for (let i = 0; i < 3; i++) {
      const daysAgo = Math.floor(Math.random() * days);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      const moodKeys = Object.keys(MoodType) as MoodType[];
      
      significantChanges.push({
        date: date.getTime(),
        change: Math.random() > 0.5 ? 2 : -2,
        previousMood: moodKeys[Math.floor(Math.random() * moodKeys.length)],
        newMood: moodKeys[Math.floor(Math.random() * moodKeys.length)]
      });
    }
    
    return {
      userId,
      periodStart: startDate.getTime(),
      periodEnd: Date.now(),
      moodDistribution,
      averageIntensity: 3.2, // Zufälliger Durchschnitt
      significantChanges
    };
  }
}

// Exportiere eine Singleton-Instanz
export const moodService = new MoodService(); 