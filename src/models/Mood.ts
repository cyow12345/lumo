/**
 * Datenmodelle für das Mood-Tracking-Feature
 */

/**
 * Aufzählung der möglichen Stimmungen/Emotionen
 */
export enum MoodType {
  VERY_HAPPY = 'very_happy',
  HAPPY = 'happy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
  VERY_SAD = 'very_sad',
  ANGRY = 'angry',
  ANXIOUS = 'anxious',
  EXCITED = 'excited',
  TIRED = 'tired',
  STRESSED = 'stressed',
  CALM = 'calm',
  THANKFUL = 'thankful',
  LOVED = 'loved'
}

/**
 * Interface für ein einzelnes Stimmungsereignis
 */
export interface MoodEntry {
  id?: string;
  userId: string;
  relationshipId: string;
  mood: MoodType;
  intensity: number; // 1-5 Skala
  note?: string;
  tags?: string[];
  createdAt: number; // Unix-Timestamp
}

/**
 * Interface für die Zusammenfassung von Stimmungen pro Tag
 */
export interface DailyMoodSummary {
  date: string; // YYYY-MM-DD
  averageIntensity: number;
  dominantMood: MoodType;
  entries: MoodEntry[];
}

/**
 * Interface für Stimmungstrends über Zeit
 */
export interface MoodTrend {
  userId: string;
  periodStart: number; // Unix-Timestamp
  periodEnd: number; // Unix-Timestamp
  moodDistribution: Record<MoodType, number>; // Häufigkeit jeder Stimmung
  averageIntensity: number;
  significantChanges: {
    date: number;
    change: number; // Differenz der Intensität
    previousMood: MoodType;
    newMood: MoodType;
  }[];
}

/**
 * Interface für den Stimmungsvergleich zwischen Partnern
 */
export interface MoodComparison {
  relationshipId: string;
  period: 'day' | 'week' | 'month';
  user1: {
    userId: string;
    moodData: DailyMoodSummary[];
  };
  user2: {
    userId: string;
    moodData: DailyMoodSummary[];
  };
  correlation: number; // -1 bis 1, Korrelation der Stimmungen
  synchronizedDays: string[]; // Tage mit ähnlichen Stimmungen
  divergentDays: string[]; // Tage mit unterschiedlichen Stimmungen
}

/**
 * Interface für Stimmungsbenachrichtigungen
 */
export interface MoodNotification {
  id: string;
  userId: string;
  type: 'mood_streak' | 'partner_mood_change' | 'your_mood_change' | 'mood_reminder';
  message: string;
  read: boolean;
  createdAt: number;
  relatedMoodId?: string;
}

/**
 * Interface für Einstellungen zum Mood-Tracking
 */
export interface MoodTrackingSettings {
  userId: string;
  reminderEnabled: boolean;
  reminderTime?: string; // HH:MM Format
  notificationsEnabled: boolean;
  privacyLevel: 'private' | 'shared_with_partner' | 'shared_with_coach';
} 