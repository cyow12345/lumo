import React, { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage, ChatSession } from '../services/chatService';
import { MemoryService, RelationshipMemory } from '../services/memoryService';
import { supabase } from '../lib/supabaseClient';

interface SingleChatProps {
  userId: string;
}

const SingleChat: React.FC<SingleChatProps> = ({ userId }) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relevantMemories, setRelevantMemories] = useState<RelationshipMemory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialisiere Chat-Session und hole Nachrichten
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        const chatSession = await ChatService.getOrCreateSession(userId);
        setSession(chatSession);
        
        const history = await ChatService.getMessageHistory(chatSession.id);
        setMessages(history);
      } catch (err) {
        setError('Fehler beim Laden des Chats');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [userId]);

  // Scrolle zum Ende der Nachrichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime Subscription für neue Nachrichten
  useEffect(() => {
    if (!session) return;

    const subscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Hole Sender-Informationen
          const { data: senderData } = await supabase
            .from('user_profiles')
            .select('name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const formattedMessage: ChatMessage = {
            id: newMessage.id,
            content: newMessage.content,
            sender: {
              id: newMessage.sender_id,
              name: senderData?.name || 'Unbekannt',
              role: 'partner_1',
              avatar_url: senderData?.avatar_url
            },
            created_at: newMessage.created_at,
            role: newMessage.role,
            metadata: newMessage.metadata
          };

          setMessages(prev => [...prev, formattedMessage]);

          // Hole relevante Erinnerungen für die neue Nachricht
          if (newMessage.role === 'user') {
            const memories = await MemoryService.retrieveRelevantMemories(
              userId,
              null, // Kein Partner bei Einzelgespräch
              newMessage.content
            );
            setRelevantMemories(memories);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  const handleSendMessage = async () => {
    if (!session || !newMessage.trim()) return;

    try {
      // Hole zuerst relevante Erinnerungen
      const memories = await MemoryService.retrieveRelevantMemories(
        userId,
        null, // Kein Partner bei Einzelgespräch
        newMessage.trim()
      );
      setRelevantMemories(memories);

      // Sende die Nachricht mit Kontext
      const message = await ChatService.sendMessage(
        session.id,
        userId,
        newMessage.trim(),
        {
          emotion: 'neutral',
          context: 'single_chat',
          relevantMemories: memories.map(m => m.id)
        }
      );

      // Speichere die Nachricht als Erinnerung
      await MemoryService.storeMemory(
        userId,
        null, // Kein Partner bei Einzelgespräch
        newMessage.trim(),
        'chat',
        {
          emotion: 'neutral',
          context: 'single_chat'
        }
      );

      setNewMessage('');
    } catch (err) {
      setError('Fehler beim Senden der Nachricht');
      console.error(err);
    }
  };

  return (
    <div className={`${!session ? 'flex justify-center items-center h-full' : ''}`}>
      {isLoading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navlink"></div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <div className="sm:flex sm:flex-col sm:h-full sm:bg-white sm:rounded-2xl sm:shadow-sm fixed sm:relative inset-0 bg-white z-20 overflow-auto">
          {/* Header - nur auf Mobile sticky */}
          <div className="sticky sm:relative top-0 bg-white p-4 border-b border-lavender/10 sm:border-gray-100">
            <div className="flex items-center gap-2 sm:block">
              <span className="text-2xl sm:hidden">💭</span>
              <h2 className="text-xl sm:text-lg font-bold sm:font-semibold text-[#332d6e] sm:text-navlink">
                Gespräch mit Lumo
              </h2>
              <p className="hidden sm:block text-sm text-gray-500">
                Sprich offen über deine Gedanken und Gefühle
              </p>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender.id === userId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.role === 'assistant'
                      ? 'bg-navlink/5 text-navlink rounded-2xl p-4'
                      : 'bg-navlink text-white rounded-2xl p-4'
                  }`}
                >
                  {/* Sender Name (nur bei Lumo) */}
                  {message.role === 'assistant' && (
                    <div className="font-medium text-sm mb-1">
                      Lumo
                    </div>
                  )}
                  
                  {/* Message Content */}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Metadata/Context (optional) */}
                  {message.metadata?.emotion && (
                    <div className="mt-1 text-xs opacity-70">
                      {message.metadata.emotion === 'neutral' ? '😊' : ''}
                    </div>
                  )}

                  {/* Relevante Erinnerungen (nur für Lumo's Antworten) */}
                  {message.role === 'assistant' && relevantMemories.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-navlink/10">
                      <p className="text-xs text-navlink/60 mb-1">Basierend auf:</p>
                      <div className="space-y-1">
                        {relevantMemories.slice(0, 2).map((memory) => (
                          <p key={memory.id} className="text-xs text-navlink/50 italic">
                            "{memory.content.substring(0, 100)}..."
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Schreibe eine Nachricht..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navlink/50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-6 py-2 bg-navlink text-white rounded-xl hover:bg-navlink/90 transition disabled:opacity-50"
              >
                Senden
              </button>
            </div>
          </div>

          {/* Platzhalter für das Menü - nur auf Mobile */}
          <div className="h-24 bg-white sm:hidden" aria-hidden="true"></div>
        </div>
      )}
    </div>
  );
};

export default SingleChat; 