import { supabase } from '../lib/supabaseClient';
import OpenAI from 'openai';

export interface ChatParticipant {
  id: string;
  name: string;
  role: 'partner_1' | 'partner_2' | 'user';
  avatar_url?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: ChatParticipant;
  created_at: string;
  role: 'user' | 'assistant';
  metadata?: any;
}

export interface ChatSession {
  id: string;
  participants: ChatParticipant[];
  created_at: string;
  type: 'single' | 'pair';
}

class ChatServiceClass {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async getOrCreateSession(userId: string, partnerId?: string): Promise<ChatSession> {
    try {
      // Suche nach existierender Session
      const { data: existingSession, error: searchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('type', partnerId ? 'pair' : 'single')
        .eq('user_id', userId)
        .eq('partner_id', partnerId || null)
        .single();

      if (!searchError && existingSession) {
        // Hole Benutzerinformationen für die Session
        const { data: users, error: usersError } = await supabase
          .from('user_profiles')
          .select('id, name, avatar_url')
          .in('id', [userId, partnerId].filter(Boolean));

        if (usersError) throw usersError;

        // Erstelle eine Map für schnellen Zugriff auf Benutzerinformationen
        const userMap = new Map(users?.map(user => [user.id, user]) || []);

        // Formatiere die Session mit Teilnehmerinformationen
        return {
          id: existingSession.id,
          type: existingSession.type,
          participants: [
            {
              id: userId,
              name: userMap.get(userId)?.name || 'Unbekannt',
              role: 'partner_1' as const,
              avatar_url: userMap.get(userId)?.avatar_url
            },
            ...(partnerId ? [{
              id: partnerId,
              name: userMap.get(partnerId)?.name || 'Unbekannt',
              role: 'partner_2' as const,
              avatar_url: userMap.get(partnerId)?.avatar_url
            }] : [])
          ],
          created_at: existingSession.created_at
        };
      }

      // Erstelle neue Session
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: userId,
            partner_id: partnerId || null,
            type: partnerId ? 'pair' : 'single'
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      // Hole Benutzerinformationen für die neue Session
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .in('id', [userId, partnerId].filter(Boolean));

      if (usersError) throw usersError;

      // Erstelle eine Map für schnellen Zugriff auf Benutzerinformationen
      const userMap = new Map(users?.map(user => [user.id, user]) || []);

      // Formatiere die neue Session mit Teilnehmerinformationen
      return {
        id: newSession.id,
        type: newSession.type,
        participants: [
          {
            id: userId,
            name: userMap.get(userId)?.name || 'Unbekannt',
            role: 'partner_1' as const,
            avatar_url: userMap.get(userId)?.avatar_url
          },
          ...(partnerId ? [{
            id: partnerId,
            name: userMap.get(partnerId)?.name || 'Unbekannt',
            role: 'partner_2' as const,
            avatar_url: userMap.get(partnerId)?.avatar_url
          }] : [])
        ],
        created_at: newSession.created_at
      };
    } catch (error) {
      console.error('Fehler beim Erstellen/Abrufen der Chat-Session:', error);
      throw error;
    }
  }

  async getMessageHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      // Hole zuerst die Nachrichten
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      if (!messages) return [];

      // Hole alle einzigartigen Benutzer-IDs
      const userIds = [...new Set(messages.map(m => m.sender_id).filter(Boolean))];

      // Hole Benutzerinformationen in einem Batch
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Erstelle eine Map für schnellen Zugriff auf Benutzerinformationen
      const userMap = new Map(users?.map(user => [user.id, user]) || []);

      // Formatiere die Nachrichten mit Benutzerinformationen
      return messages.map(message => ({
        id: message.id,
        content: message.content,
        sender: {
          id: message.sender_id || '',
          name: message.role === 'assistant' ? 'Lumo' : userMap.get(message.sender_id)?.name || 'Unbekannt',
          role: 'partner_1', // Wird später dynamisch basierend auf der Session bestimmt
          avatar_url: userMap.get(message.sender_id)?.avatar_url
        },
        created_at: message.created_at,
        role: message.role,
        metadata: message.metadata
      }));
    } catch (error) {
      console.error('Fehler beim Abrufen der Nachrichtenhistorie:', error);
      throw error;
    }
  }

  async sendMessage(
    sessionId: string,
    userId: string,
    content: string,
    metadata?: any
  ): Promise<ChatMessage> {
    try {
      // Speichere Benutzer-Nachricht
      const { data: userMessage, error: userMessageError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            sender_id: userId,
            content,
            role: 'user',
            metadata
          }
        ])
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // Generiere Lumo's Antwort
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Du bist Lumo, ein empathischer KI-Coach für Beziehungen. Deine Antworten sind einfühlsam, verständnisvoll und konstruktiv."
          },
          {
            role: "user",
            content
          }
        ]
      });

      const aiResponse = completion.choices[0].message.content;

      // Speichere Lumo's Antwort
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            content: aiResponse,
            role: 'assistant',
            metadata: {
              ...metadata,
              model: "gpt-4"
            }
          }
        ])
        .select()
        .single();

      if (aiMessageError) throw aiMessageError;
      return aiMessage;
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      throw error;
    }
  }
}

export const ChatService = new ChatServiceClass(); 