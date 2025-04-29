import { supabase } from '../lib/supabaseClient';

export async function fetchReflection(answer: string): Promise<string> {
  const prompt = `Stell dir vor, du bist die beste Freundin – warmherzig, direkt, ehrlich, liebevoll und einfühlsam. Du antwortest locker, wie im echten Chat, niemals wie ein professioneller Coach. Analysiere die folgende Wochenreflexion und gib eine Rückmeldung in 2-3 Sätzen, die sich anfühlt wie von einer besten Freundin: ehrlich, bestärkend, manchmal frech, aber immer herzlich. Keine Floskeln, keine Distanz, sondern echtes Mitgefühl und Nähe. Sprich die Person direkt an, aber verzichte auf künstliche Anreden wie 'Liebe/r [Name]'. Beende deine Rückmeldung immer mit einer wertenden, freundschaftlichen Aussage – stelle keine Fragen und gib keine Aufforderungen. Hier ist die Reflexion: "${answer}"`;

  // Supabase-Session holen
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.access_token) throw new Error('Nicht eingeloggt');

  const response = await fetch("https://vifbqtzkoytsgowctpjo.functions.supabase.co/openai-proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI API Fehler");
  }

  const data = await response.json();
  return data.choices[0].message.content;
} 