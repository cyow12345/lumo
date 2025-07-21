import { supabase } from '../lib/supabaseClient';
import OpenAI from 'openai';

export interface RelationshipMemory {
  id: string;
  user_id: string;
  partner_id: string | null;
  content: string;
  type: string;
  created_at: string;
  metadata?: any;
}

class MemoryServiceClass {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async storeMemory(
    userId: string,
    partnerId: string | null,
    content: string,
    type: string,
    metadata?: any
  ): Promise<RelationshipMemory> {
    try {
      const { data, error } = await supabase
        .from('relationship_memories')
        .insert([
          {
            user_id: userId,
            partner_id: partnerId,
            content,
            type,
            metadata
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Fehler beim Speichern der Erinnerung:', error);
      throw error;
    }
  }

  async retrieveRelevantMemories(
    userId: string,
    partnerId: string | null,
    query: string,
    limit: number = 5
  ): Promise<RelationshipMemory[]> {
    try {
      // Hole alle Erinnerungen für den Benutzer
      const { data: memories, error } = await supabase
        .from('relationship_memories')
        .select('*')
        .eq('user_id', userId)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!memories || memories.length === 0) return [];

      // Erstelle Embeddings für die Suchanfrage
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: query
      });
      const queryEmbedding = response.data[0].embedding;

      // Hole Embeddings für alle Erinnerungen
      const memoryEmbeddings = await Promise.all(
        memories.map(async (memory) => {
          const response = await this.openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: memory.content
          });
          return {
            memory,
            embedding: response.data[0].embedding
          };
        })
      );

      // Berechne Ähnlichkeiten und sortiere
      const scoredMemories = memoryEmbeddings
        .map(({ memory, embedding }) => ({
          memory,
          score: this.cosineSimilarity(queryEmbedding, embedding)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return scoredMemories.map(({ memory }) => memory);
    } catch (error) {
      console.error('Fehler beim Abrufen relevanter Erinnerungen:', error);
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

export const MemoryService = new MemoryServiceClass(); 