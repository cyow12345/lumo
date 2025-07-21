import React, { useState, useEffect, useRef } from 'react';
import { Users, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { analyzeRelationship, AnalysisResult } from '../services/analyzeRelationship';

// Interface für den User-Typ
interface User {
  id: string;
  email?: string;
}

// Interface für Session-Typen
interface SessionType {
  type: 'single' | 'pair';
  sessionId?: string;
}

interface PairSessionStatus {
  sessionId: string;
  initiatorId: string;
  partnerId: string;
  initiatorPresent: boolean;
  partnerPresent: boolean;
  lastActive: Date;
}

interface LumoHerzensfluestererProps {
  userId: string;
  userName?: string;
  partnerName?: string;
  partnerLinked: boolean;
  onClose?: () => void;
}

const LumoHerzensfluesterer: React.FC<LumoHerzensfluestererProps> = ({ userId, userName, partnerName, partnerLinked, onClose }) => {
  const [userFirstName, setUserFirstName] = useState<string>(userName || 'Gast');
  const [chat, setChat] = useState<{ role: 'coach' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [showTypeSelector, setShowTypeSelector] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Zurücksetzen des Chats und der Session
  const resetChat = () => {
    setChat([]);
    setSessionId(crypto.randomUUID());
    setSessionType(null);
    setShowTypeSelector(true);
  };

  // Effekt für das Zurücksetzen beim Öffnen oder Neu-Rendern
  useEffect(() => {
    resetChat();
    setShowTypeSelector(true);
  }, []); // Leere Dependency Array bedeutet, dass dies nur beim ersten Rendern ausgeführt wird

  // Lade die letzte Session-ID oder erstelle eine neue
  useEffect(() => {
    const loadLastSession = async () => {
      if (!userId || !sessionId || !sessionType) return;

      // Hole die letzte Chat-Session des Users für den ausgewählten Typ
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Fehler beim Laden der Session:', error);
        return;
      }

      if (data && data.length > 0) {
        setChat(data.map(msg => ({
          role: msg.role as 'coach' | 'user',
          text: msg.message
        })));
      }
    };

    if (sessionType) {
      loadLastSession();
    }
  }, [userId, sessionId, sessionType]);

  // Scroll immer ans Ende wenn neue Nachrichten kommen oder Input fokussiert wird
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: isInputFocused ? 'auto' : 'smooth' });
      }
    };
    scrollToBottom();
  }, [chat, isInputFocused]); // Scrollt wenn sich chat ändert oder Input fokussiert wird

  // Lade User-/Partnerdaten und Analyse beim Mounten/bei User-Änderung
  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        console.log('Lade Benutzerdaten für:', userId);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, name, partner_id, age, gender, attachment_style, addressing_issues, relationship_values, parental_influence, relationship_start_date, relationship_status, avatar_url')
          .eq('id', userId)
          .single();

        if (!error && data && typeof data === 'object' && 'name' in data) {
          console.log('Benutzerdaten geladen:', data);
          setUserData(data);
          setUserFirstName('name' in data && typeof data.name === 'string' ? data.name.split(' ')[0] : 'Gast');
          let partnerId = 'partner_id' in data ? data.partner_id : undefined;
          
          // Wenn keine Partner-ID gesetzt ist, suche nach einem User, der diesen User als Partner hat
          if (!partnerId) {
            console.log('Suche nach Partner, der diesen User als Partner hat');
            const { data: possiblePartner, error: partnerSearchError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('partner_id', userId)
              .single();
            if (!partnerSearchError && possiblePartner && typeof possiblePartner === 'object' && 'id' in possiblePartner) {
              partnerId = possiblePartner.id;
              console.log('Partner gefunden:', partnerId);
            }
          }
          
          if (partnerId) {
            console.log('Lade Partnerdaten für:', partnerId);
            const { data: partnerProfile, error: partnerError } = await supabase
              .from('user_profiles')
              .select('id, name, age, gender, attachment_style, addressing_issues, relationship_values, parental_influence')
              .eq('id', partnerId)
              .single();
            
            if (!partnerError && partnerProfile && typeof partnerProfile === 'object' && 'name' in partnerProfile) {
              console.log('Partnerdaten geladen:', partnerProfile);
              setPartnerData(partnerProfile);
              
              // Optional: Analyse laden/erstellen
              try {
                console.log('Starte Beziehungsanalyse');
                const personA: any = {
                  id: data.id, // ID hinzufügen
                  name: data.name,
                  age: data.age,
                  gender: data.gender,
                  attachmentStyle: data.attachment_style,
                  communication: data.addressing_issues,
                  values: data.relationship_values || [],
                  childhood: data.parental_influence
                };
                
                const personB: any = {
                  id: partnerProfile.id, // ID hinzufügen
                  name: partnerProfile.name,
                  age: partnerProfile.age,
                  gender: partnerProfile.gender,
                  attachmentStyle: partnerProfile.attachment_style,
                  communication: partnerProfile.addressing_issues,
                  values: partnerProfile.relationship_values || [],
                  childhood: partnerProfile.parental_influence
                };
                
                const relationship: any = {
                  relationshipStartDate: data.relationship_start_date,
                  relationshipStatus: data.relationship_status,
                };
                
                console.log('Analysedaten vorbereitet:', { personA, personB, relationship });
                const result = await analyzeRelationship(personA, personB, relationship);
                console.log('Analyseergebnis erhalten:', result);
                if (result) {
                  console.log('Setze Analyseergebnis:', result);
                  setAnalysis(result);
                }
              } catch (analysisError) {
                console.error('Fehler bei der Beziehungsanalyse:', analysisError);
              }
            } else {
              console.error('Fehler beim Laden der Partnerdaten:', partnerError);
            }
          } else {
            console.log('Kein Partner gefunden');
          }
        } else {
          console.error('Fehler beim Laden der Benutzerdaten:', error);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
      }
    };
    fetchUser();
  }, [userId]);

  // Begrüßung nachladen, sobald userFirstName gesetzt ist
  useEffect(() => {
    const name = userData?.name || userName || userFirstName;
    if (name && chat.length === 0) {
      if (sessionType?.type === 'pair' && partnerName) {
        setChat([{ role: 'coach', text: `Hallo ${name} und ${partnerName}, wie geht es euch mit eurer Beziehung?` }]);
      } else {
        setChat([{ role: 'coach', text: `Hallo ${name}, wie geht es dir mit deiner Beziehung?` }]);
      }
    }
  }, [userData?.name, userName, userFirstName, chat.length, sessionType?.type, partnerName]);

  // Speichere neue Chat-Nachricht
  const saveChatMessage = async (role: 'user' | 'coach', message: string) => {
    if (!userId || !sessionId) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          role,
          message,
          session_id: sessionId,
          message_type: 'chat',
          context: {
            session_type: sessionType?.type,
            partner_id: partnerData?.id,
            analysis_summary: analysis?.summary
          }
        });

      if (error) throw error;
    } catch (err) {
      console.error('Fehler beim Speichern der Chat-Nachricht:', err);
    }
  };

  // Hilfsfunktion: System-Prompt dynamisch bauen
  function buildSystemPrompt() {
    let prompt = `Du bist Lumo – entspannter Kumpel von nebenan. Direkt, aber mit Augenzwinkern.
Regeln:
- Kurze, lockere Antworten
- Keine Vorwürfe oder Belehrungen
- Humor ja, aber sanft
- Verständnisvoll bleiben

${sessionType?.type === 'pair' ? `Bei Paaren:
- Bleib neutral
- Keine Parteinahme
- Entspannt vermitteln
` : ''}`;

    // Nur die wichtigsten Infos mitschicken
    if (userData) {
      prompt += `\nPerson:`;
      if (userData.attachment_style) prompt += ` ${userData.attachment_style} Bindung.`;
      if (userData.addressing_issues) prompt += ` ${userData.addressing_issues} bei Problemen.`;
      if (userData.relationship_status) prompt += ` ${userData.relationship_status}.`;
    }

    if (partnerData) {
      prompt += `\nPartner:`;
      if (partnerData.attachment_style) prompt += ` ${partnerData.attachment_style} Bindung.`;
      if (partnerData.addressing_issues) prompt += ` ${partnerData.addressing_issues} bei Problemen.`;
    }

    return prompt;
  }

  const askCoach = async (question: string) => {
    setChat(prev => [...prev, { role: 'user', text: question }]);
    await saveChatMessage('user', question);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.access_token) {
        setChat(prev => [...prev, { role: 'coach', text: 'Du bist nicht eingeloggt. Bitte melde dich an, um Lumo zu nutzen.' }]);
        setLoading(false);
        return;
      }

      // Nur die letzten 6 Nachrichten mitschicken
      const recentMessages = chat.slice(-6);

      const response = await fetch('https://vifbqtzkoytsgowctpjo.functions.supabase.co/openai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...recentMessages.map(m => ({ role: m.role === 'coach' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: question }
          ],
          temperature: 0.7,
          max_tokens: 300, // Noch kürzer für prägnantere Antworten
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API Error:', errorData);
        throw new Error(`OpenAI API returned ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Ungültige Antwort vom OpenAI API');
      }
      
      const coachResponse = data.choices[0].message.content;
      setChat(prev => [...prev, { role: 'coach', text: coachResponse }]);
      await saveChatMessage('coach', coachResponse);
    } catch (e) {
      console.error('Fehler beim Chat:', e);
      setChat(prev => [...prev, { role: 'coach', text: 'Es gab ein Problem mit der Verbindung zu Lumo. Bitte versuche es später noch einmal.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && !loading) {
      askCoach(input.trim());
      setInput('');
    }
  };

  // Modifiziere den SessionTypeSelector
  const SessionTypeSelector = () => {
    console.log('SessionTypeSelector wird gerendert');
    
    const handleSingleSessionClick = async () => {
      console.log('Einzelgespräch wurde geklickt');
      
      // Suche nach der permanenten Session-ID für Einzelgespräche
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_chat_sessions')
        .select('session_id')
        .eq('user_id', userId)
        .eq('session_type', 'single')
        .single();

      let newSessionId;
      
      if (sessionError || !sessionData) {
        // Keine permanente Session gefunden, erstelle eine neue
        newSessionId = crypto.randomUUID();
        
        // Speichere die neue Session-ID
        const { error: insertError } = await supabase
          .from('user_chat_sessions')
          .insert({
            user_id: userId,
            session_id: newSessionId,
            session_type: 'single'
          });
          
        if (insertError) {
          console.error('Fehler beim Speichern der Session:', insertError);
        }
      } else {
        // Verwende die existierende Session-ID
        newSessionId = sessionData.session_id;
      }

      setSessionId(newSessionId);
      setSessionType({ 
        type: 'single',
        sessionId: newSessionId 
      });
      setShowTypeSelector(false);
      
      // Lade Chat-History für die Session
      const { data: chatData, error: chatError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('session_id', newSessionId)
        .order('created_at', { ascending: true });

      if (!chatError && chatData) {
        setChat(chatData.map(msg => ({
          role: msg.role as 'coach' | 'user',
          text: msg.message
        })));
      } else {
        setChat([]);
      }
    };

    const handlePairSessionClick = async () => {
      console.log('Paargespräch wurde geklickt');
      if (!userData?.id || !partnerData?.id) {
        console.log('Fehlende User- oder Partnerdaten:', { userData, partnerData });
        return;
      }

      // Suche nach der permanenten Session-ID für Paargespräche
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_chat_sessions')
        .select('session_id')
        .eq('user_id', userId)
        .eq('session_type', 'pair')
        .single();

      let newSessionId;
      
      if (sessionError || !sessionData) {
        // Keine permanente Session gefunden, erstelle eine neue
        newSessionId = crypto.randomUUID();
        
        // Speichere die neue Session-ID
        const { error: insertError } = await supabase
          .from('user_chat_sessions')
          .insert({
            user_id: userId,
            session_id: newSessionId,
            session_type: 'pair'
          });
          
        if (insertError) {
          console.error('Fehler beim Speichern der Session:', insertError);
        }
      } else {
        // Verwende die existierende Session-ID
        newSessionId = sessionData.session_id;
      }

      setSessionId(newSessionId);
      setSessionType({ 
        type: 'pair',
        sessionId: newSessionId 
      });
      setShowTypeSelector(false);
      
      // Lade Chat-History für die Session
      const { data: chatData, error: chatError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('session_id', newSessionId)
        .order('created_at', { ascending: true });

      if (!chatError && chatData) {
        setChat(chatData.map(msg => ({
          role: msg.role as 'coach' | 'user',
          text: msg.message
        })));
      } else {
        setChat([]);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#332d6e] mb-2">Wähle deine Gesprächsform</h2>
          </div>

          <button
            onClick={handleSingleSessionClick}
            className="w-full bg-white p-6 rounded-2xl shadow-sm border border-lavender/10 hover:border-lavender/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">💭</span>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-[#332d6e] group-hover:text-navlink transition-colors">
                  Einzelgespräch mit Lumo
                </h3>
                <p className="text-gray-600 text-sm">
                  Sprich offen über deine Gedanken und Gefühle
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handlePairSessionClick}
            disabled={!partnerLinked}
            className={`w-full bg-white p-6 rounded-2xl shadow-sm border transition-all group ${
              partnerLinked 
                ? 'border-lavender/10 hover:border-lavender/30' 
                : 'border-gray-100 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">💕</span>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-[#332d6e] group-hover:text-navlink transition-colors">
                  Paargespräch mit Lumo
                </h3>
                <p className="text-gray-600 text-sm">
                  {partnerLinked
                    ? `Sprich gemeinsam mit ${partnerName || 'deinem Partner'} über eure Beziehung`
                    : 'Verbinde dich zuerst mit deinem Partner'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  };

  // Wenn kein Partner verknüpft ist, Hinweis anzeigen und Chat deaktivieren
  if (partnerLinked === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
        <img src="/lumo_logo.png" alt="Lumo" className="w-32 h-32 mb-4" />
        <div className="text-lg font-semibold text-navlink mb-2">
          Hallo {userFirstName || userName || 'Gast'}
        </div>
        <div className="text-midnight/80 text-center">
          Um mit Lumo zu sprechen, verknüpfe bitte zuerst deinen Partner.<br />
          <span className="text-lavender font-medium">Die Partnerverlinkung ist Voraussetzung für das Gespräch.</span>
        </div>
      </div>
    );
  }

  // Show session type selector if requested
  if (showTypeSelector) {
    return <SessionTypeSelector />;
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="w-full sm:max-w-2xl mx-auto h-full flex flex-col">
        {/* Chat-Bereich */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full p-4 sm:p-8 sm:pb-32">
            {chat.map((msg, i) => (
              msg.role === 'coach' ? (
                <div key={i} className="flex items-start gap-3 justify-start mb-4">
                  <img
                    src="/lumo_logo.png"
                    alt="Lumo"
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-full shadow bg-white border border-lavender mt-1"
                    style={{ opacity: 0.92 }}
                  />
                  <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl max-w-[85%] sm:max-w-[80%] text-sm sm:text-base bg-lavender/10" style={{ color: '#18181B' }}>
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-3 justify-end mb-4">
                  <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl max-w-[85%] sm:max-w-[80%] text-sm sm:text-base bg-[#332d6e] text-white">
                    {msg.text}
                  </div>
                  {userData?.avatar_url ? (
                    <img
                      src={userData.avatar_url}
                      alt={userData.name || 'User'}
                      className="w-8 h-8 sm:w-12 sm:h-12 rounded-full shadow mt-1 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#332d6e] text-white flex items-center justify-center text-lg font-semibold mt-1 flex-shrink-0">
                      {(userData?.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
              )
            ))}
            {loading && (
              <div className="flex items-start gap-3 justify-start mb-4">
                <img
                  src="/lumo_logo.png"
                  alt="Lumo"
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full shadow bg-white border border-lavender mt-1"
                  style={{ opacity: 0.5 }}
                />
                <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl max-w-[85%] sm:max-w-[80%] text-sm sm:text-base bg-lavender/10 text-midnight/60 italic">
                  Lumo denkt nach ...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Fixierte Eingabezeile */}
        <div className="sticky bottom-[64px] sm:bottom-8 left-0 right-0 bg-transparent">
          <form onSubmit={handleSend} className="flex gap-2 p-4 sm:p-3 items-center bg-white sm:rounded-xl sm:border sm:shadow-sm">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Automatische Höhenanpassung
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !loading) {
                    handleSend();
                  }
                }
              }}
              placeholder="Schreibe eine Nachricht..."
              className="flex-1 px-4 sm:px-3 py-2 sm:py-1 rounded-xl border border-gray-300 focus:outline-none focus:border-[#332d6e] text-sm leading-normal resize-none min-h-[42px] sm:min-h-[32px] max-h-[200px]"
              rows={1}
            />
            <button
              type="submit"
              className="h-[42px] sm:h-[32px] px-4 sm:px-3 bg-navlink text-white rounded-xl hover:bg-navlink/80 transition-colors disabled:opacity-50 text-sm whitespace-nowrap flex-shrink-0"
              disabled={loading || !input.trim()}
            >
              {loading ? 'Sendet...' : 'Senden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LumoHerzensfluesterer; 