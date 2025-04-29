import React, { useState } from 'react';

interface ThinkingOfYouProps {
  userId: string;
}

interface PersonData {
  id: string;
  name: string;
  contactInfo: string;
  lastContactDate: string;
  nextReminder: string;
  notes: string;
}

const ThinkingOfYou: React.FC<ThinkingOfYouProps> = ({ userId }) => {
  const [people, setPeople] = useState<PersonData[]>([
    {
      id: '1',
      name: 'Lisa Meyer',
      contactInfo: 'lisa.meyer@example.com',
      lastContactDate: '2024-04-12',
      nextReminder: '2024-04-26',
      notes: 'Arbeitet an einem neuen Projekt, nachfragen wie es läuft.'
    },
    {
      id: '2',
      name: 'Thomas Schmidt',
      contactInfo: '+49 123 456789',
      lastContactDate: '2024-03-25',
      nextReminder: '2024-04-25',
      notes: 'Geburtstag im Mai, Geschenk überlegen.'
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState<Partial<PersonData>>({
    name: '',
    contactInfo: '',
    notes: '',
    nextReminder: new Date().toISOString().split('T')[0]
  });

  const handleAddPerson = () => {
    const personToAdd: PersonData = {
      id: Date.now().toString(),
      name: newPerson.name || '',
      contactInfo: newPerson.contactInfo || '',
      lastContactDate: new Date().toISOString().split('T')[0],
      nextReminder: newPerson.nextReminder || new Date().toISOString().split('T')[0],
      notes: newPerson.notes || ''
    };
    
    setPeople([...people, personToAdd]);
    setNewPerson({
      name: '',
      contactInfo: '',
      notes: '',
      nextReminder: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPerson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactNow = (id: string) => {
    setPeople(people.map(person => 
      person.id === id ? 
        { ...person, lastContactDate: new Date().toISOString().split('T')[0] } : 
        person
    ));
  };

  return (
    <div className="thinking-of-you-section">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1A2238]">An wen denkst du?</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#BFA9F2] text-white rounded-md hover:bg-[#A78CE4] transition-colors"
        >
          {showAddForm ? 'Abbrechen' : 'Person hinzufügen'}
        </button>
      </div>
      
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Neue Person hinzufügen</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={newPerson.name || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kontakt (Email/Telefon)</label>
              <input
                type="text"
                name="contactInfo"
                value={newPerson.contactInfo || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Erinnerung</label>
              <input
                type="date"
                name="nextReminder"
                value={newPerson.nextReminder || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
              <textarea
                name="notes"
                value={newPerson.notes || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddPerson}
                className="px-4 py-2 bg-[#BFA9F2] text-white rounded-md hover:bg-[#A78CE4] transition-colors"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {people.map(person => (
          <div key={person.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{person.name}</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleContactNow(person.id)}
                  className="px-3 py-1 bg-[#BFA9F2] text-white text-sm rounded-md hover:bg-[#A78CE4] transition-colors"
                >
                  Jetzt kontaktieren
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-1">{person.contactInfo}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Letzter Kontakt:</span>
                <span className="ml-2">{person.lastContactDate}</span>
              </div>
              <div>
                <span className="text-gray-500">Nächste Erinnerung:</span>
                <span className="ml-2">{person.nextReminder}</span>
              </div>
            </div>
            {person.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-700">{person.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {people.length === 0 && !showAddForm && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500">Du hast noch keine Personen hinzugefügt.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-4 py-2 bg-[#BFA9F2] text-white rounded-md hover:bg-[#A78CE4] transition-colors"
          >
            Erste Person hinzufügen
          </button>
        </div>
      )}
    </div>
  );
};

export default ThinkingOfYou; 