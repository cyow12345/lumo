import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCheckCircle, faChartLine, faBook, faHeart, faCommentDots, faTasks } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabaseClient';
import { analyzeRelationship, PersonData, RelationshipData, AnalysisResult } from '../services/analyzeRelationship';

// Interface für den User-Typ
interface User {
  id: string;
  email?: string;
}

interface LumoCoachProps {
  userId: string;
  userName?: string;
  partnerName?: string;
  onClose?: () => void;
}

const LumoCoach: React.FC<LumoCoachProps> = ({ userId, userName, partnerName, onClose }) => {
  const [userFirstName, setUserFirstName] = useState<string>(userName || 'Gast');
  const [chat, setChat] = useState<{ role: 'coach' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Scroll immer ans Ende
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Lade User-/Partnerdaten und Analyse beim Mounten/bei User-Änderung
  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, partner_id, age, gender, attachment_style, addressing_issues, relationship_values, parental_influence, birth_date, birth_time, birth_place, relationship_start_date, relationship_status')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setUserData(data);
        setUserFirstName(data.name?.split(' ')[0] || 'Gast');
        let partnerId = data.partner_id;
        // Wenn keine Partner-ID gesetzt ist, suche nach einem User, der diesen User als Partner hat
        if (!partnerId) {
          const { data: possiblePartner, error: partnerSearchError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('partner_id', userId)
            .single();
          if (!partnerSearchError && possiblePartner && possiblePartner.id) {
            partnerId = possiblePartner.id;
          }
        }
        if (partnerId) {
          const { data: partnerProfile, error: partnerError } = await supabase
            .from('user_profiles')
            .select('name, age, gender, attachment_style, addressing_issues, relationship_values, parental_influence, birth_date, birth_time, birth_place')
            .eq('id', partnerId)
            .single();
          if (!partnerError && partnerProfile) {
            setPartnerData(partnerProfile);
            // Debug-Ausgabe für Bindungsstil
            console.log('Partnerdaten:', partnerProfile);
            // Optional: Analyse laden/erstellen
            const personA: PersonData = {
              name: data.name,
              age: data.age,
              gender: data.gender,
              attachmentStyle: data.attachment_style,
              communication: data.addressing_issues,
              values: data.relationship_values || [],
              childhood: data.parental_influence,
              birthDate: data.birth_date,
              birthTime: data.birth_time,
              birthPlace: data.birth_place,
            };
            const personB: PersonData = {
              name: partnerProfile.name,
              age: partnerProfile.age,
              gender: partnerProfile.gender,
              attachmentStyle: partnerProfile.attachment_style,
              communication: partnerProfile.addressing_issues,
              values: partnerProfile.relationship_values || [],
              childhood: partnerProfile.parental_influence,
              birthDate: partnerProfile.birth_date,
              birthTime: partnerProfile.birth_time,
              birthPlace: partnerProfile.birth_place,
            };
            const relationship: RelationshipData = {
              relationshipStartDate: data.relationship_start_date,
              relationshipStatus: data.relationship_status,
            };
            const result = await analyzeRelationship(personA, personB, relationship);
            setAnalysis(result);
          }
        }
      }
    };
    fetchUser();
  }, [userId]);

  // Begrüßung nachladen, sobald userFirstName gesetzt ist und noch keine Begrüßung im Chat steht
  useEffect(() => {
    // Nutze bevorzugt userData?.name, dann userName-Prop, dann State
    const name = userData?.name || userName || userFirstName;
    if (name && chat.length === 0) {
      setChat([{ role: 'coach', text: `Hallo ${name}, wie geht es dir mit deiner Beziehung?` }]);
    }
  }, [userData?.name, userName, userFirstName, chat.length]);

  // Hilfsfunktion: System-Prompt dynamisch bauen
  function buildSystemPrompt() {
    let prompt = 'Du bist Lumo, ein empathischer, moderner KI-Coach.';
    if (userData) {
      prompt += `\nDer Nutzer heißt ${userData.name}.`;
      if (userData.age) prompt += ` Alter: ${userData.age}.`;
      if (userData.gender) prompt += ` Geschlecht: ${userData.gender}.`;
      if (userData.attachment_style) prompt += ` Bindungsstil: ${userData.attachment_style}.`;
      if (userData.addressing_issues) prompt += ` Kommunikationsstil: ${userData.addressing_issues}.`;
      if (userData.relationship_values && userData.relationship_values.length > 0) prompt += ` Wichtige Werte: ${userData.relationship_values.join(', ')}.`;
      if (userData.parental_influence) prompt += ` Prägung durch Eltern: ${userData.parental_influence}.`;
      if (userData.birth_date) prompt += ` Geburtsdatum: ${userData.birth_date}.`;
      if (userData.birth_time) prompt += ` Geburtszeit: ${userData.birth_time}.`;
      if (userData.birth_place) prompt += ` Geburtsort: ${userData.birth_place}.`;
      if (userData.relationship_start_date) prompt += ` Beziehung besteht seit: ${userData.relationship_start_date}.`;
      if (userData.relationship_status) prompt += ` Beziehungsstatus: ${userData.relationship_status}.`;
    }
    if (partnerData) {
      prompt += `\nDer/die Partner/in heißt ${partnerData.name}.`;
      if (partnerData.age) prompt += ` Alter: ${partnerData.age}.`;
      if (partnerData.gender) prompt += ` Geschlecht: ${partnerData.gender}.`;
      if (partnerData.attachment_style) prompt += ` Bindungsstil: ${partnerData.attachment_style}.`;
      if (partnerData.addressing_issues) prompt += ` Kommunikationsstil: ${partnerData.addressing_issues}.`;
      if (partnerData.relationship_values && partnerData.relationship_values.length > 0) prompt += ` Wichtige Werte: ${partnerData.relationship_values.join(', ')}.`;
      if (partnerData.parental_influence) prompt += ` Prägung durch Eltern: ${partnerData.parental_influence}.`;
      if (partnerData.birth_date) prompt += ` Geburtsdatum: ${partnerData.birth_date}.`;
      if (partnerData.birth_time) prompt += ` Geburtszeit: ${partnerData.birth_time}.`;
      if (partnerData.birth_place) prompt += ` Geburtsort: ${partnerData.birth_place}.`;
    }
    prompt += '\nNutze diese Informationen, um möglichst individuell und empathisch auf Fragen zu antworten. Sprich den Nutzer mit seinem Namen an und beziehe dich auf die Beziehung.';
    return prompt;
  }

  // WARNUNG: Unsicher! Der OpenAI-API-Key ist im Frontend sichtbar. Nur zu Testzwecken verwenden!
  const askCoach = async (question: string) => {
    setChat(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer REMOVED_SECRET`, // <-- Unsicher!
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...chat.map(m => ({ role: m.role === 'coach' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: question }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });
      const data = await response.json();
      setChat(prev => [...prev, { role: 'coach', text: data.choices?.[0]?.message?.content || 'Es gab ein Problem mit der Antwort von Lumo.' }]);
    } catch (e) {
      setChat(prev => [...prev, { role: 'coach', text: 'Es gab ein Problem mit der Verbindung zu Lumo.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      askCoach(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex justify-center items-start min-h-[70vh] w-full relative">
      <div className="bg-white rounded-2xl shadow-lg p-2 pt-6 sm:p-6 sm:pt-8 w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl flex flex-col gap-3 sm:gap-6 relative">
        {/* X-Button oben rechts im Modal */}
        {onClose && (
          <button
            type="button"
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-midnight/60 hover:text-midnight text-3xl z-20"
            onClick={onClose}
            aria-label="Schließen"
          >
            ✕
          </button>
        )}
        <div className="flex flex-col gap-2 sm:gap-3 h-[60vh] sm:h-[28rem] overflow-y-auto bg-lavender/5 rounded-xl p-3 sm:p-8 pb-1 relative">
          {chat.map((msg, i) => (
            msg.role === 'coach' ? (
              <div key={i} className="flex items-start gap-2 justify-start">
                <img
                  src="/lumo_logo.png"
                  alt="Lumo Coach"
                  className="w-8 h-8 rounded-full shadow bg-white border border-lavender mt-1"
                  style={{ opacity: 0.92 }}
                />
                <div className="px-4 py-2 rounded-2xl max-w-[95%] sm:max-w-[80%] text-sm bg-lavender/10" style={{ color: '#18181B' }}>
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="px-4 py-2 rounded-2xl max-w-[95%] sm:max-w-[80%] text-sm bg-lavender text-white">
                  {msg.text}
                </div>
              </div>
            )
          ))}
          {loading && (
            <div className="flex items-start gap-2 justify-start animate-pulse">
              <img
                src="/lumo_logo.png"
                alt="Lumo Coach"
                className="w-8 h-8 rounded-full shadow bg-white border border-lavender mt-1"
                style={{ opacity: 0.5 }}
              />
              <div className="px-4 py-2 rounded-2xl max-w-[95%] sm:max-w-[80%] text-sm bg-lavender/10 text-midnight/60 italic">
                Lumo denkt nach ...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="text-midnight/70 text-xs text-center mt-1 mb-0">
          Lumo speichert alles, löst eure Beziehungsprobleme schneller, als ihr sie aussprechen könnt<br />– und macht aus jedem Konflikt eine Chance für echtes Wachstum.
        </div>
        <form onSubmit={handleSend} className="flex gap-2 mt-1 pb-1">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-lavender/30 px-2 py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-lavender"
            placeholder="Stelle Lumo eine Frage..."
            style={{ color: '#18181B' }}
          />
          <button type="submit" className="bg-lavender text-white px-3 py-2 sm:px-5 rounded-xl font-medium hover:bg-lavender/80 transition">
            Senden
          </button>
        </form>
      </div>
    </div>
  );
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm">
      <h2 className="font-semibold text-midnight">{title}</h2>
      {children}
    </div>
  );
}

function ActivityCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#f3f0fa] p-4 rounded-xl flex items-start gap-3 hover:bg-[#ebe5f7] transition cursor-pointer">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-medium text-sm text-midnight">{title}</h3>
        <p className="text-xs text-midnight/70 mt-1">{description}</p>
      </div>
    </div>
  );
}

export default LumoCoach; 