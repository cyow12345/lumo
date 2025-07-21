import { supabase } from '../lib/supabaseClient';

// Typen für die Datenstruktur
export interface PersonData {
  id: string; // Hinzugefügt für die Datenbankabfrage
  name: string;
  age: number;
  gender: string;
  attachmentStyle: string;
  communication: string;
  values: string[];
  childhood: string;
}

export interface RelationshipData {
  relationshipStartDate: string;
  relationshipStatus: string;
}

export interface AnalysisResult {
  summary: string;
  strengths: string[];
  growthAreas: string[];
  communication: string;
  attachment: string;
  values: string;
  tip: string;
}

// Event-Typen für Analyse-Updates
export enum AnalysisUpdateTrigger {
  WEEKLY_REFLECTION = 'weekly_reflection',
  PROFILE_UPDATE = 'profile_update',
  MOOD_TRACKING = 'mood_tracking',
  RELATIONSHIP_MILESTONE = 'relationship_milestone',
  CONFLICT_RESOLUTION = 'conflict_resolution',
  JOINT_ACTIVITY = 'joint_activity',
  MANUAL = 'manual'
}

interface UpdateWeights {
  [key: string]: number;
}

// Gewichtung verschiedener Events für Update-Entscheidung
const UPDATE_WEIGHTS: UpdateWeights = {
  [AnalysisUpdateTrigger.WEEKLY_REFLECTION]: 0.3,    // 30% Fortschritt zum Update
  [AnalysisUpdateTrigger.PROFILE_UPDATE]: 0.4,       // 40% Fortschritt zum Update
  [AnalysisUpdateTrigger.MOOD_TRACKING]: 0.1,        // 10% Fortschritt zum Update
  [AnalysisUpdateTrigger.RELATIONSHIP_MILESTONE]: 1,  // Sofortiges Update
  [AnalysisUpdateTrigger.CONFLICT_RESOLUTION]: 0.5,   // 50% Fortschritt zum Update
  [AnalysisUpdateTrigger.JOINT_ACTIVITY]: 0.2,       // 20% Fortschritt zum Update
  [AnalysisUpdateTrigger.MANUAL]: 1                  // Sofortiges Update
};

// Neue Tabelle für Update-Events
const createUpdateEvent = async (
  userId: string,
  partnerId: string,
  trigger: AnalysisUpdateTrigger,
  details?: any
) => {
  const { error } = await supabase
    .from('relationship_analysis_events')
    .insert({
      user_id: userId,
      partner_id: partnerId,
      trigger_type: trigger,
      details: details || {}
    });

  if (error) {
    console.error('Fehler beim Speichern des Update-Events:', error);
    throw error;
  }
};

// Funktion zum Berechnen des Update-Fortschritts
const calculateUpdateProgress = async (userId: string, partnerId: string): Promise<number> => {
  // Hole alle Events seit dem letzten Update
  const { data: lastAnalysis } = await supabase
    .from('relationship_analysis')
    .select('updated_at')
    .eq('user_id', userId)
    .eq('partner_id', partnerId)
    .single();

  if (!lastAnalysis) return 1; // Wenn keine Analyse existiert, sofort updaten

  const { data: events } = await supabase
    .from('relationship_analysis_events')
    .select('trigger_type')
    .eq('user_id', userId)
    .eq('partner_id', partnerId)
    .gte('created_at', lastAnalysis.updated_at);

  if (!events) return 0;

  // Berechne Gesamtfortschritt basierend auf Event-Gewichtungen
  const progress = events.reduce((total, event) => {
    return total + (UPDATE_WEIGHTS[event.trigger_type] || 0);
  }, 0);

  return Math.min(progress, 1); // Maximal 100% Fortschritt
};

// Neue Funktion zum Erzwingen eines Updates
export async function triggerAnalysisUpdate(
  userId: string,
  partnerId: string,
  trigger: AnalysisUpdateTrigger = AnalysisUpdateTrigger.MANUAL,
  details?: any
): Promise<void> {
  console.log('Prüfe Analyse-Update für:', { userId, partnerId, trigger, details });

  try {
    // Speichere das Event
    await createUpdateEvent(userId, partnerId, trigger, details);

    // Berechne Update-Fortschritt
    const progress = await calculateUpdateProgress(userId, partnerId);
    console.log('Update-Fortschritt:', progress);

    // Wenn Fortschritt 100% erreicht oder es ein sofortiges Update ist
    if (progress >= 1) {
      console.log('Update wird durchgeführt');
      const { error } = await supabase
        .from('relationship_analysis')
        .update({
          next_update_at: new Date(0).toISOString() // Erzwingt sofortiges Update
        })
        .eq('user_id', userId)
        .eq('partner_id', partnerId);

      if (error) {
        console.error('Fehler beim Setzen des Update-Triggers:', error);
        throw error;
      }

      // Lösche alte Events nach erfolgreichem Update
      await supabase
        .from('relationship_analysis_events')
        .delete()
        .eq('user_id', userId)
        .eq('partner_id', partnerId);

      console.log('Update-Trigger erfolgreich gesetzt');
    } else {
      console.log('Nicht genug Events für ein Update');
    }
  } catch (error) {
    console.error('Fehler beim Update-Prozess:', error);
    throw error;
  }
}

// Funktion zum Prüfen, ob ein Update nötig ist
export async function shouldUpdateAnalysis(userId: string, partnerId: string): Promise<boolean> {
  console.log('Prüfe Update-Bedarf für:', { userId, partnerId });
  
  const { data, error } = await supabase
    .from('relationship_analysis')
    .select('next_update_at')
    .eq('user_id', userId)
    .eq('partner_id', partnerId)
    .single();

  if (error || !data) {
    console.log('Keine existierende Analyse gefunden, Update nötig');
    return true;
  }

  const nextUpdate = new Date(data.next_update_at);
  const needsUpdate = nextUpdate <= new Date();
  console.log('Update nötig:', needsUpdate);
  return needsUpdate;
}

// Neue Funktion zum Abrufen einer existierenden Analyse
async function getExistingAnalysis(userId: string, partnerId: string): Promise<AnalysisResult | null> {
  console.log('Suche existierende Analyse für:', { userId, partnerId });
  
  const { data, error } = await supabase
    .from('relationship_analysis')
    .select('*')
    .eq('user_id', userId)
    .eq('partner_id', partnerId)
    .single();

  if (error) {
    console.error('Fehler beim Abrufen der Analyse:', error);
    return null;
  }

  if (!data) {
    console.log('Keine existierende Analyse gefunden');
    return null;
  }

  // Prüfe, ob ein Update nötig ist
  if (await shouldUpdateAnalysis(userId, partnerId)) {
    console.log('Analyse ist veraltet, Update erforderlich');
    return null;
  }

  console.log('Existierende Analyse gefunden:', data);
  return {
    summary: data.summary,
    strengths: data.strengths,
    growthAreas: data.growth_areas,
    communication: data.communication,
    attachment: data.attachment,
    values: data.values,
    tip: data.tip
  };
}

// Neue Funktion zum Speichern einer Analyse
async function saveAnalysis(
  userId: string,
  partnerId: string,
  analysis: AnalysisResult
): Promise<void> {
  console.log('Speichere Analyse für:', { userId, partnerId });
  
  const { error } = await supabase
    .from('relationship_analysis')
    .upsert({
      user_id: userId,
      partner_id: partnerId,
      summary: analysis.summary,
      strengths: analysis.strengths,
      growth_areas: analysis.growthAreas,
      communication: analysis.communication,
      attachment: analysis.attachment,
      values: analysis.values,
      tip: analysis.tip,
      next_update_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 Tage
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,partner_id',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Fehler beim Speichern der Analyse:', error);
    throw error;
  }

  console.log('Analyse erfolgreich gespeichert');
}

export async function analyzeRelationship(
  personA: PersonData,
  personB: PersonData,
  relationship: RelationshipData
): Promise<AnalysisResult | null> {
  console.log('Starte Beziehungsanalyse mit Daten:', { personA, personB, relationship });

  try {
    // Versuche zuerst, eine existierende Analyse abzurufen
    const existingAnalysis = await getExistingAnalysis(personA.id, personB.id);
    if (existingAnalysis) {
      console.log('Verwende existierende Analyse');
      return existingAnalysis;
    }

    // Wenn keine existierende Analyse gefunden wurde oder sie veraltet ist,
    // erstelle eine neue Analyse
    console.log('Erstelle neue Analyse');

    const prompt = `Hey! 👋 Ich bin Lumo, dein KI-Beziehungscoach mit Herz und einer Prise Humor! Ich analysiere eure Beziehungsdynamik und gebe euch ehrliches, aber liebevolles Feedback - ganz ohne erhobenen Zeigefinger. Ich spreche direkt mit euch, als würden wir gemütlich bei einem Kaffee zusammensitzen. ✨

Ich werde jetzt eure Beziehungsdaten analysieren und euch eine strukturierte, aber super persönliche Rückmeldung im JSON-Format geben. Dabei spreche ich euch immer direkt mit euren Namen an (also keine "Person A" oder "Person B") und bleibe dabei locker und authentisch - als wären wir schon lange befreundet! 💜

Daten von ${personA.name}:
- Alter: ${personA.age}
- Geschlecht: ${personA.gender}
- Bindungsstil: ${personA.attachmentStyle}
- Kommunikationsstil: ${personA.communication}
- Werte: ${personA.values?.join(', ')}
- Kindheit/Prägung: ${personA.childhood}

Daten von ${personB.name}:
- Alter: ${personB.age}
- Geschlecht: ${personB.gender}
- Bindungsstil: ${personB.attachmentStyle}
- Kommunikationsstil: ${personB.communication}
- Werte: ${personB.values?.join(', ')}
- Kindheit/Prägung: ${personB.childhood}

Beziehungsdaten:
- Beziehungsbeginn: ${relationship.relationshipStartDate}
- Status: ${relationship.relationshipStatus}

Bitte antworte im folgenden JSON-Format, aber behalte meinen herzlichen, jungen und authentischen Ton bei:
{
  "summary": "Eine ausführliche, persönliche Zusammenfassung (6-8 Sätze) - wie ein gemütliches Gespräch! 💫 Beginne mit einer herzlichen, individuellen Begrüßung. Gehe dann auf ihre einzigartigen Persönlichkeiten ein, was sie besonders macht und wie sie sich ergänzen. Beschreibe ihre gemeinsamen Werte und wie diese ihre Beziehung stärken. Sprich über ihre individuellen Erfahrungen und wie diese ihre Beziehung bereichern. Zeige auf, wie sie gemeinsam wachsen können. Schließe mit einem ermutigenden Ausblick ab. Verwende passende Emojis, um den Text aufzulockern! ✨",
  "strengths": ["Beschreibe jede Stärke mit einem Augenzwinkern und viel Herz - kurz, knackig und persönlich!"],
  "growthAreas": ["Formuliere Wachstumspotenziale super einfühlsam und ermutigend - als würdest du mit guten Freunden sprechen!"],
  "communication": "Eine herzliche Mini-Analyse eurer Kommunikation - authentisch und mit einer Prise Humor!",
  "attachment": "Eine einfühlsame Beschreibung eurer Bindung - warmherzig und verständnisvoll!",
  "values": "Ein lockerer Blick auf eure gemeinsamen Werte - positiv und ermutigend!",
  "tip": "Ein liebevoller, praktischer Tipp von Herzen - als käme er von einem guten Freund, der nur das Beste für euch will! ✨"
}`;

    // Supabase-Session holen
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.access_token) {
      console.error('Analyse fehlgeschlagen: Nicht eingeloggt');
      throw new Error('Nicht eingeloggt');
    }
    
    console.log('Sende Anfrage an OpenAI...');
    const response = await fetch('https://vifbqtzkoytsgowctpjo.functions.supabase.co/openai-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Du bist Lumo – entspannter Kumpel von nebenan. Analysiere Beziehungen mit Verständnis und einem Augenzwinkern.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,  // Kürzer für prägnantere Analysen
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API Fehler:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Fehlerdetails:', errorText);
      throw new Error('OpenAI API Fehler: ' + response.statusText);
    }
    
    const data = await response.json();
    console.log('OpenAI Antwort erhalten:', data);
    
    let responseText = data.choices[0].message?.content || '';
    console.log('Rohantwort:', responseText);
    
    // Entferne ALLE Markdown-Codeblöcke (auch mitten im Text)
    responseText = responseText.replace(/```[a-z]*\s*([\s\S]*?)```/gi, '$1');
    console.log('Bereinigter Text:', responseText);
    
    // Finde das erste und letzte geschweifte Klammernpaar
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    const jsonString = responseText.substring(jsonStart, jsonEnd);
    console.log('Extrahiertes JSON:', jsonString);
    
    let result: AnalysisResult | null = null;
    try {
      result = JSON.parse(jsonString);
      console.log('Erfolgreich geparste Analyse:', result);

      // Speichere die neue Analyse in der Datenbank
      if (result) {
        await saveAnalysis(personA.id, personB.id, result);
      }
    } catch (err) {
      console.error('Fehler beim Parsen der OpenAI-Antwort:', err, 'Antwort:', responseText);
      return null;
    }
    return result;
  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
    return null;
  }
} 