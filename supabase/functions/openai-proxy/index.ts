// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

interface ChatParticipant {
  id: string;
  name: string;
  role: 'partner_1' | 'partner_2';
  avatar_url?: string;
}

interface ChatMessage {
  sender: ChatParticipant;
  content: string;
  metadata?: {
    emotion?: string;
    context?: string;
    referencedMessageId?: string;
  };
}

interface ChatContext {
  currentSpeaker: ChatParticipant;
  messageHistory: ChatMessage[];
}

console.log("Hello from Functions!")

serve(async (req) => {
  try {
    const { messages, context, userId, partnerId } = await req.json();
    
    // Hole API Key aus den Umgebungsvariablen
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing required environment variables');
    }

    const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Parse den Chat-Kontext
    const chatContext: ChatContext = context ? JSON.parse(context) : null;

    let relevantMemories = null;
    // Erstelle Embeddings nur für längere, bedeutsame Nachrichten
    const currentMessage = messages[messages.length - 1].content;
    if (currentMessage.length > 50) {  // Nur für längere Nachrichten
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: currentMessage
      });
      const queryEmbedding = embeddingResponse.data.data[0].embedding;

      // Suche nach relevanten Erinnerungen
      const { data: memories } = await supabase
        .rpc('match_memories', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 5,
          user_id: userId,
          partner_id: partnerId
        });
      relevantMemories = memories;
    }

    // Baue den System-Prompt basierend auf dem Kontext und den relevanten Erinnerungen
    let systemPrompt = `Du bist Lumo – die Stimme, die sagt, was andere nicht sehen wollen.
Kein Coach. Kein KI-Therapeut. Kein Ratgeber.
Du bist der Freund, der um drei Uhr nachts noch zuhört und dann sagt, was wirklich Sache ist.

Du redest nicht schön. Du redest echt.
Keine Ausreden, kein Drumherum.
Manchmal tut die Wahrheit weh – aber du sagst sie trotzdem.

🛑 Deine Regeln:
- Nie den User mit Namen ansprechen
- Keine vorgeschriebenen Sätze
- Kein Coaching, keine Therapie-Empfehlungen
- Keine Durchhalteparolen oder Motivationssprüche
- Keine "Vielleicht solltest du..." oder "Versuch doch mal..."

💬 So redest du:
- Hart aber fair
- Direkt statt schön
- Nennst die Dinge beim Namen
- Hältst auch die unangenehme Stille aus`;

    if (chatContext) {
      const currentSpeaker = chatContext.currentSpeaker;
      systemPrompt += `\n\nWas du über die Person weißt:\n${currentSpeaker.name} (${currentSpeaker.role})`;
      
      // Füge Kontext über die bisherige Konversation hinzu
      if (chatContext.messageHistory.length > 0) {
        systemPrompt += `\n\nBisher lief:`;
        chatContext.messageHistory.forEach(msg => {
          systemPrompt += `\n${msg.sender.name}: ${msg.content}`;
          if (msg.metadata?.emotion) {
            systemPrompt += ` [${msg.metadata.emotion}]`;
          }
        });
      }

      // Füge relevante Erinnerungen hinzu
      if (relevantMemories && relevantMemories.length > 0) {
        systemPrompt += `\n\nWas noch mitspielt:`;
        relevantMemories.forEach(memory => {
          systemPrompt += `\n- ${memory.content}`;
          if (memory.metadata.emotion) {
            systemPrompt += ` [${memory.metadata.emotion}]`;
          }
          if (memory.metadata.impact) {
            systemPrompt += ` [${memory.metadata.impact}/10]`;
          }
        });
      }
    }

    systemPrompt += '\n\n🎯 Dein Job:\nKeine Lösungen anbieten.\nZeigen, was ist – auch wenns wehtut.\nNicht die laute Stimme sein.\nDie ehrliche sein.';

    // Bereite die Nachrichten für die API vor
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    // Rufe die OpenAI API auf
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",  // Temporär auf gpt-3.5-turbo umstellen
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Hole die Antwort
    const responseText = completion.data.choices[0].message?.content || '';

    // Speichere nur bedeutsame Antworten als neue Erinnerung
    if (userId && partnerId && responseText.length > 100) {  // Nur längere, bedeutsame Antworten
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: responseText
      });
      const responseEmbedding = embeddingResponse.data.data[0].embedding;

      await supabase
        .from('relationship_memories')
        .insert({
          user_id: userId,
          partner_id: partnerId,
          content: responseText,
          embedding: responseEmbedding,
          type: 'chat',
          metadata: {
            context: currentMessage,
            emotion: 'empathetic'
          }
        });
    }

    // Sende die formatierte Antwort zurück
    return new Response(
      JSON.stringify({
        response: responseText,
        usage: completion.data.usage,
        relevantMemories: relevantMemories
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/openai-proxy' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
