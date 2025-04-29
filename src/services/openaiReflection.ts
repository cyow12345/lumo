export async function fetchReflection(answer: string): Promise<string> {
  const apiKey = "REMOVED_SECRET"; // Achtung: Unsicher im Frontend!
  const prompt = `Du bist ein empathischer, moderner Beziehungscoach. Analysiere die folgende Wochenreflexion. Wenn ein Name genannt wird, kannst du die Person direkt ansprechen, aber verzichte auf Floskeln wie 'Liebe/r [Name]' oder 'Herzliche Grüße'. Gib eine direkte, reflektierende Rückmeldung in 2-3 Sätzen, die die Erfahrung der Person einordnet und auf den Punkt bringt. Vermeide pauschale Formulierungen und konzentriere dich auf das Wesentliche. Beende deine Rückmeldung immer mit einer abschließenden, wertenden Aussage – stelle keine Fragen und gib keine Aufforderungen. Hier ist die Reflexion: "${answer}"`;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
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