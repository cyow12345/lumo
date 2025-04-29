import React, { useState, useEffect } from 'react';
import './Journal.css';
import Card from './Card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// Interface für den User-Typ
interface User {
  id: string;
  email?: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
}

interface JournalProps {
  user?: User;
}

const Journal: React.FC<JournalProps> = ({ user }) => {
  const userId = user?.id || 'guest';
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    tags: ''
  });

  // Mock-Daten laden oder später von API abrufen
  useEffect(() => {
    // Hier später durch API-Aufruf ersetzen
    const mockEntries: JournalEntry[] = [
      {
        id: '1',
        title: 'Unser erster Kinobesuch',
        content: 'Heute waren wir gemeinsam im Kino. Der Film war großartig und wir hatten eine wundervolle Zeit zusammen.',
        date: '2023-05-15',
        mood: 'glücklich',
        tags: ['Kino', 'Date', 'Erlebnisse']
      },
      {
        id: '2',
        title: 'Gedanken über unsere Beziehung',
        content: 'Ich habe heute viel über unsere Beziehung nachgedacht und bin sehr dankbar für all die schönen Momente.',
        date: '2023-05-10',
        mood: 'dankbar',
        tags: ['Reflexion', 'Gedanken']
      }
    ];
    
    setEntries(mockEntries);
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry: JournalEntry = {
      id: currentEntry ? currentEntry.id : Date.now().toString(),
      title: formData.title,
      content: formData.content,
      date: new Date().toISOString().split('T')[0],
      mood: formData.mood || undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined
    };
    
    if (currentEntry) {
      // Bestehenden Eintrag aktualisieren
      setEntries(entries.map(entry => entry.id === currentEntry.id ? newEntry : entry));
    } else {
      // Neuen Eintrag hinzufügen
      setEntries([newEntry, ...entries]);
    }
    
    // Formular zurücksetzen
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood: '',
      tags: ''
    });
    setCurrentEntry(null);
    setShowForm(false);
  };

  const handleEdit = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || '',
      tags: entry.tags ? entry.tags.join(', ') : ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  return (
    <Card title="Mein Beziehungstagebuch">
      <div className="flex justify-between items-center mb-6">
        <button 
          className="flex items-center gap-2 bg-gradient-to-r from-navlink to-lavender text-white py-2 px-4 rounded-xl hover:brightness-105 transition duration-200 font-medium shadow-md shadow-lavender/30 transform hover:-translate-y-0.5"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle className="w-4 h-4" />
          {showForm ? 'Abbrechen' : 'Neuer Eintrag'}
        </button>
      </div>
      
      {showForm && (
        <div className="bg-[#F5F6FA] p-6 rounded-xl border border-lavender/10 mb-6">
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold text-navlink mb-4">{currentEntry ? 'Eintrag bearbeiten' : 'Neuer Tagebucheintrag'}</h3>
            
            <div className="mb-4">
              <label htmlFor="title" className="block mb-1 text-sm font-medium text-midnight/70">Titel</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Titel des Eintrags"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-lavender"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="content" className="block mb-1 text-sm font-medium text-midnight/70">Inhalt</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Was möchtest du festhalten?"
                rows={6}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-lavender"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="mood" className="block mb-1 text-sm font-medium text-midnight/70">Stimmung (optional)</label>
              <input
                type="text"
                id="mood"
                name="mood"
                value={formData.mood}
                onChange={handleInputChange}
                placeholder="Wie fühlst du dich?"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-lavender"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="tags" className="block mb-1 text-sm font-medium text-midnight/70">Tags (mit Komma getrennt, optional)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="z.B. Liebe, Ausflug, Gespräch"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-lavender"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                className="px-4 py-2 border border-gray-200 text-midnight/70 rounded-lg hover:bg-gray-50 transition font-medium"
                onClick={resetForm}
              >
                Abbrechen
              </button>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-navlink to-lavender text-white py-2 px-4 rounded-lg hover:brightness-105 transition duration-200 font-medium shadow-md shadow-lavender/30"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      )}
      
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-[#F5F6FA] p-5 rounded-xl border border-lavender/10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-navlink">{entry.title}</h3>
                <div className="text-sm text-midnight/50">{new Date(entry.date).toLocaleDateString('de-DE')}</div>
              </div>
              
              <div className="text-midnight/70 mb-3 whitespace-pre-line">{entry.content}</div>
              
              {entry.mood && <div className="text-sm text-midnight/60 italic mb-2">Stimmung: {entry.mood}</div>}
              
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {entry.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-lavender/20 text-navlink rounded-full text-xs font-medium">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-3">
                <button 
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-midnight/70 hover:bg-gray-50 transition font-medium"
                  onClick={() => handleEdit(entry)}
                >
                  <Edit className="w-3.5 h-3.5" />
                  Bearbeiten
                </button>
                <button 
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-midnight/70 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition font-medium"
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-[#F5F6FA] rounded-xl border border-dashed border-lavender/20">
          <p className="text-midnight/60">Noch keine Einträge vorhanden. Erstelle deinen ersten Tagebucheintrag!</p>
        </div>
      )}
    </Card>
  );
};

export default Journal; 