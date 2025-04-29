import React, { useState } from 'react';
import { MoodType, MoodEntry } from '../models/Mood';
import { moodService } from '../services/moodService';
import { 
  Smile, SmilePlus, Frown, Angry, Meh, ThumbsUp, 
  PartyPopper, Loader2, Moon, BrainCircuit, Heart, 
  Plus, X, Star, CloudRain, Coffee, Sparkles, 
  HeartHandshake, Music, Zap, BatteryWarning,
  Sunset, Cloud, Sun, SunDim
} from 'lucide-react';

// Interface für den User-Typ
interface User {
  id: string;
  email?: string;
}

interface MoodInputProps {
  user?: User;
  relationshipId: string;
  onMoodSaved?: (entry: MoodEntry) => void;
}

const MoodInput: React.FC<MoodInputProps> = ({ user, relationshipId, onMoodSaved }) => {
  const userId = user?.id || 'guest';
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mapping für Mood-Icons und deutsche Bezeichnungen
  const moodEmojis: Record<MoodType, { icon: React.ReactNode, label: string }> = {
    [MoodType.VERY_HAPPY]: { 
      icon: <div className="relative">
        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
      </div>, 
      label: 'Sehr glücklich' 
    },
    [MoodType.HAPPY]: { 
      icon: <Sun className="w-6 h-6 text-yellow-500 fill-yellow-100" />, 
      label: 'Glücklich' 
    },
    [MoodType.NEUTRAL]: { 
      icon: <SunDim className="w-6 h-6 text-amber-400" />, 
      label: 'Neutral' 
    },
    [MoodType.SAD]: { 
      icon: <Cloud className="w-6 h-6 text-blue-300 fill-blue-50" />, 
      label: 'Traurig' 
    },
    [MoodType.VERY_SAD]: { 
      icon: <CloudRain className="w-6 h-6 text-blue-400 fill-blue-100" />, 
      label: 'Sehr traurig' 
    },
    [MoodType.ANGRY]: { 
      icon: <Zap className="w-6 h-6 text-red-500 fill-red-200" />,
      label: 'Wütend' 
    },
    [MoodType.ANXIOUS]: { 
      icon: <BatteryWarning className="w-6 h-6 text-orange-400 fill-orange-100" />,
      label: 'Ängstlich' 
    },
    [MoodType.EXCITED]: { 
      icon: <div className="relative">
        <PartyPopper className="w-6 h-6 text-pink-500 fill-pink-200" />
        <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
      </div>,
      label: 'Aufgeregt' 
    },
    [MoodType.TIRED]: { 
      icon: <Coffee className="w-6 h-6 text-brown-500 fill-amber-800" />,
      label: 'Müde' 
    },
    [MoodType.STRESSED]: { 
      icon: <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />, 
      label: 'Gestresst' 
    },
    [MoodType.CALM]: { 
      icon: <Sunset className="w-6 h-6 text-purple-400 fill-purple-100" />,
      label: 'Ruhig' 
    },
    [MoodType.THANKFUL]: { 
      icon: <HeartHandshake className="w-6 h-6 text-green-500 fill-green-100" />,
      label: 'Dankbar' 
    },
    [MoodType.LOVED]: { 
      icon: <div className="relative">
        <Heart className="w-6 h-6 text-pink-500 fill-pink-300" />
        <Sparkles className="w-3 h-3 text-pink-300 absolute -top-1 -right-1" />
      </div>,
      label: 'Geliebt' 
    }
  };

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntensity(parseInt(e.target.value));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMood) {
      setError('Bitte wähle eine Stimmung aus');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const newMoodEntry: Omit<MoodEntry, 'id' | 'createdAt'> = {
        userId,
        relationshipId,
        mood: selectedMood,
        intensity,
        note: note.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined
      };

      const entryId = await moodService.saveMoodEntry(newMoodEntry);
      
      // Fügt die ID und den Zeitstempel hinzu, die vom Service zurückgegeben werden
      const completeEntry: MoodEntry = {
        ...newMoodEntry,
        id: entryId,
        createdAt: Date.now()
      };

      // Ruft Callback auf, falls vorhanden
      if (onMoodSaved) {
        onMoodSaved(completeEntry);
      }

      // Zurücksetzen des Formulars
      setSelectedMood(null);
      setIntensity(3);
      setNote('');
      setTags([]);
      
      // Erfolgsmeldung (könnte durch eine Toast-Benachrichtigung ersetzt werden)
      alert('Stimmung erfolgreich gespeichert!');
    } catch (err) {
      setError('Fehler beim Speichern der Stimmung');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Wie fühlst du dich heute?</h2>
      
      {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 mb-6">
          {Object.entries(moodEmojis).map(([mood, { icon, label }]) => (
            <button
              key={mood}
              type="button"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                selectedMood === mood 
                  ? 'bg-[#BFA9F2] text-white shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => handleMoodSelect(mood as MoodType)}
              title={label}
            >
              <span className="text-2xl mb-1">{icon}</span>
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <>
            <div className="mb-6">
              <label htmlFor="intensity" className="block mb-2 text-sm font-medium text-gray-700">
                Intensität: {intensity}
              </label>
              <input
                type="range"
                id="intensity"
                min="1"
                max="5"
                value={intensity}
                onChange={handleIntensityChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Leicht</span>
                <span>Stark</span>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="mood-note" className="block mb-2 text-sm font-medium text-gray-700">
                Notizen (optional):
              </label>
              <textarea
                id="mood-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Wie kam es zu dieser Stimmung? Was hat sie ausgelöst?"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#BFA9F2] focus:border-[#BFA9F2] text-sm"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="tag-input" className="block mb-2 text-sm font-medium text-gray-700">
                Tags hinzufügen (optional):
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  id="tag-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="z.B. Arbeit, Familie, Sport..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-[#BFA9F2] focus:border-[#BFA9F2] text-sm"
                />
                <button 
                  type="button" 
                  onClick={handleAddTag} 
                  className="p-2 bg-[#BFA9F2] text-white rounded-lg hover:bg-[#AB95DC] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!tagInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#F4C6C6] text-[#1A2238]">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-[#1A2238] hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-[#BFA9F2] text-white rounded-lg font-medium hover:bg-[#AB95DC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedMood || isSaving}
          >
            {isSaving ? 'Wird gespeichert...' : 'Stimmung speichern'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MoodInput; 