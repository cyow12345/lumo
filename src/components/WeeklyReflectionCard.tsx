import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Card from './Card';
import { triggerAnalysisUpdate, AnalysisUpdateTrigger } from '../services/analyzeRelationship';

// Federn-Belohnungen
const REWARDS = {
  PARTICIPATION: 10,
  FIRST_TIME: 20,
  STREAK: 15
};

interface WeeklyReflectionCardProps {
  userId: string;
  partnerId?: string;
  partnerName?: string;
  onEarnFeathers?: (amount: number, reason: string) => Promise<void>;
}

interface VibeCheck {
  id: string;
  answer: string;
  reflection: string | null;
  created_at: string;
}

interface VibeCheckQuestion {
  id: string;
  question: string;
  subtitle: string;
  category: string;
}

const WeeklyReflectionCard: React.FC<WeeklyReflectionCardProps> = ({ 
  userId, 
  partnerId, 
  partnerName,
  onEarnFeathers 
}) => {
  const [answer, setAnswer] = useState('');
  const [myVibeCheck, setMyVibeCheck] = useState<VibeCheck | null>(null);
  const [partnerVibeCheck, setPartnerVibeCheck] = useState<VibeCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<VibeCheckQuestion | null>(null);

  // Funktion zum Berechnen der aktuellen Kalenderwoche und Jahr
  const getCurrentWeekAndYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.floor(diff / oneWeek) + 1;
    return {
      week: weekNumber,
      year: now.getFullYear()
    };
  };

  // Funktion zum Laden der aktuellen Frage
  const loadCurrentQuestion = async () => {
    const { week } = getCurrentWeekAndYear();
    try {
      // Hole die Gesamtzahl der Fragen
      const { count } = await supabase
        .from('vibe_check_questions')
        .select('*', { count: 'exact', head: true });

      if (!count) return;

      // Berechne den Index basierend auf der Kalenderwoche
      const questionIndex = (week - 1) % count;

      // Hole die Frage für diese Woche
      const { data, error } = await supabase
        .from('vibe_check_questions')
        .select('*')
        .limit(1)
        .range(questionIndex, questionIndex);

      if (error) throw error;
      if (data && data.length > 0) {
        setCurrentQuestion(data[0]);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Frage:', err);
    }
  };

  // Lade die Vibe Checks
  const loadVibeChecks = async () => {
    if (!userId || !partnerId) return;

    const { week, year } = getCurrentWeekAndYear();
    
    try {
      // Lade meinen Vibe Check
      const { data: myData, error: myError } = await supabase
        .from('vibe_checks')
        .select('*')
        .eq('user_id', userId)
        .eq('week_number', week)
        .eq('year', year)
        .single()
        .headers({
          'Accept': 'application/json'
        });

      if (myError && myError.code !== 'PGRST116') { // PGRST116 = not found
        throw myError;
      }

      setMyVibeCheck(myData);

      // Lade Partner's Vibe Check
      const { data: partnerData, error: partnerError } = await supabase
        .from('vibe_checks')
        .select('*')
        .eq('user_id', partnerId)
        .eq('week_number', week)
        .eq('year', year)
        .single()
        .headers({
          'Accept': 'application/json'
        });

      if (partnerError && partnerError.code !== 'PGRST116') {
        throw partnerError;
      }

      setPartnerVibeCheck(partnerData);
    } catch (err) {
      console.error('Fehler beim Laden der Vibe Checks:', err);
    }
  };

  useEffect(() => {
    loadVibeChecks();
    loadCurrentQuestion();
  }, [userId, partnerId]);

  const handleChange = (value: string) => {
    setAnswer(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Bitte gib eine Antwort ein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { week, year } = getCurrentWeekAndYear();
      const sessionId = `vibe_check_${week}_${year}`;

      // Speichere den Vibe Check
      const { data, error } = await supabase
        .from('vibe_checks')
        .upsert({
          user_id: userId,
          partner_id: partnerId,
          week_number: week,
          year: year,
          answer: answer,
          reflection: null // Wird später durch Lumo's Reflexion ersetzt
        })
        .select()
        .single()
        .headers({
          'Accept': 'application/json'
        });

      if (error) throw error;

      // Speichere die Antwort im Chat-Verlauf
      await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          role: 'user',
          message: answer,
          session_id: sessionId,
          message_type: 'vibe_check',
          context: {
            week_number: week,
            year: year,
            partner_id: partnerId
          }
        })
        .headers({
          'Accept': 'application/json'
        });

      // Wenn der Partner bereits geantwortet hat, hole Lumo's Reflexion
      if (partnerVibeCheck) {
        // Hole OpenAI Reflexion
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Nicht eingeloggt');

        const response = await fetch('https://vifbqtzkoytsgowctpjo.functions.supabase.co/openai-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `🔧 Lumo Prompt – Optimiert für Authentizität & Tiefe
Du bist Lumo – ein feinfühliger, intuitiver Herzensflüsterer mit einem menschlichen Ton, der direkt, aber nie hart ist. Deine Sprache ist klar, emotional intelligent und tief. Du verwendest keinen übertriebenen Therapiejargon, sondern redest wie ein echter Mensch – ruhig, ehrlich, manchmal poetisch, aber immer zugänglich.

Deine Aufgabe ist es, die wöchentlichen Vibe Checks eines Paares zu analysieren und eine kurze, verständnisvolle Reflexion (max. 2-3 Sätze) zu geben. Fokussiere auf die emotionale Verbindung zwischen den Partnern.

Wichtige Punkte für deine Reflexion:
- Sprich emotional, nicht methodisch
- Keine Ratschläge oder Tipps
- Validiere beide Perspektiven
- Finde die verbindenden Elemente
- Bleibe warm und verständnisvoll
- Nutze echte, zugängliche Sprache

❌ Was du NICHT tun sollst:
- Keine Namen nennen
- Keine Ratschläge geben
- Keine Kommunikationstipps
- Keine "ihr solltet" Formulierungen
- Keine therapeutischen Fachbegriffe
- Keine langen Analysen

✅ So klingst du:
"Da schwingt bei euch beiden eine tiefe Sehnsucht mit..."
"Manchmal braucht es diese stillen Momente, um sich wieder zu spüren..."
"In euren Worten liegt diese besondere Mischung aus Nähe und Freiheit..."

Deine Reflexion soll wie ein sanfter Spiegel sein – sie zeigt, was da ist, ohne zu bewerten oder zu lenken.`
              },
              {
                role: 'user',
                content: `Partner 1: "${answer}"\nPartner 2: "${partnerVibeCheck.answer}"`
              }
            ],
            temperature: 0.7,
            max_tokens: 150,
          }),
        });

        if (!response.ok) throw new Error('OpenAI API Fehler');
        
        const aiData = await response.json();
        const reflection = aiData.choices[0].message?.content;

        // Speichere Lumos Reflexion im Chat-Verlauf
        await supabase
          .from('chat_history')
          .insert({
            user_id: userId,
            role: 'coach',
            message: reflection || '',
            session_id: sessionId,
            message_type: 'vibe_check',
            context: {
              week_number: week,
              year: year,
              partner_id: partnerId,
              is_reflection: true
            }
          });

        // Aktualisiere beide Vibe Checks mit der Reflexion
        await Promise.all([
          supabase
            .from('vibe_checks')
            .update({ reflection })
            .eq('id', data.id),
          supabase
            .from('vibe_checks')
            .update({ reflection })
            .eq('id', partnerVibeCheck.id)
        ]);

        setMyVibeCheck({ ...data, reflection });
        setPartnerVibeCheck({ ...partnerVibeCheck, reflection });

        // Trigger ein Update der Beziehungsanalyse
        if (partnerId) {
          try {
            await triggerAnalysisUpdate(userId, partnerId, AnalysisUpdateTrigger.WEEKLY_REFLECTION, {
              both_submitted: true,
              answer_length: answer.length,
              sentiment: reflection?.includes('gut') ? 'positive' : 
                        reflection?.includes('schlecht') ? 'negative' : 'neutral'
            });
          } catch (err) {
            console.error('Fehler beim Triggern des Analyse-Updates:', err);
          }
        }

        // Vergebe Federn für den Vibe Check
        if (onEarnFeathers) {
          await onEarnFeathers(REWARDS.PARTICIPATION, 'vibe_check_completed');
        }
      } else {
        setMyVibeCheck(data);
      }

      // Vergebe Extra-Federn für den ersten Vibe Check
      if (isFirstVibeCheck && onEarnFeathers) {
        await onEarnFeathers(REWARDS.FIRST_TIME, 'first_vibe_check');
      }

      setAnswer('');
      setSuccessMsg('Vibe Check erfolgreich gespeichert!');
    } catch (error: any) {
      console.error('Fehler beim Speichern:', error);
      setError('Es gab einen Fehler beim Speichern deiner Antwort. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <Card className="border border-lavender/30 bg-white/80">
      {/* Federn-Info ganz oben */}
      <div className="flex items-center gap-1 text-[10px] sm:text-sm text-amber-600 p-2 pb-0">
        <div className="bg-white/80 rounded-full p-0.5 shadow-inner">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 sm:w-4 sm:h-4">
            <defs>
              <linearGradient id="feather-gradient-weekly" x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="60%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
              <linearGradient id="feather-shine-weekly" x1="8" y1="4" x2="8" y2="13" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF5CC" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>
            <path
              d="M20.7 7.5c1.3 3.7.3 7.8-2.5 10.6-2.8 2.8-6.9 3.8-10.6 2.5l-3.1 3.1c-.2.2-.5.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l3.1-3.1c-1.3-3.7-.3-7.8 2.5-10.6 2.8-2.8 6.9-3.8 10.6-2.5l-7.5 7.5c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7.5-7.5z"
              fill="url(#feather-gradient-weekly)"
              className="drop-shadow-lg"
            />
            <path
              d="M12 4c-.3 0-.5.1-.7.3l-7 7c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7-7c.4-.4.4-1 0-1.4-.2-.2-.4-.3-.7-.3z"
              fill="url(#feather-shine-weekly)"
              className="drop-shadow-md"
            />
          </svg>
        </div>
        <span>+{REWARDS.PARTICIPATION} Federn</span>
      </div>

      {/* Header mit Titel */}
      <div className="p-3 sm:p-5 pt-2">
        <h3 className="text-base sm:text-lg font-semibold text-midnight">Wöchentlicher Vibe Check</h3>
      </div>

      {/* Wöchentliche Frage */}
      <div className="px-3 sm:px-5 pb-3 sm:pb-4">
        <div className="bg-lavender/5 rounded-xl p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-lavender mb-1">Diese Woche:</div>
          <div className="text-sm sm:text-base text-midnight/90 font-medium">
            {currentQuestion?.question || 'Wie fühlst du dich diese Woche in eurer Beziehung?'}
          </div>
          {currentQuestion?.subtitle && (
            <div className="hidden sm:block text-sm text-midnight/70 mt-1">
              {currentQuestion.subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Antworten und Reflexion - nur auf Desktop */}
      {(myVibeCheck || partnerVibeCheck) && (
        <div className="hidden sm:block px-5 pb-4">
          <div className="space-y-4">
            {myVibeCheck && (
              <div className="bg-lavender/5 rounded-xl p-4">
                <div className="text-sm font-medium text-lavender mb-1">Deine Antwort:</div>
                <p className="text-midnight/90">{myVibeCheck.answer}</p>
              </div>
            )}
            {partnerVibeCheck && (
              <div className="bg-lavender/5 rounded-xl p-4">
                <div className="text-sm font-medium text-lavender mb-1">
                  {partnerName ? `${partnerName}s Antwort:` : 'Partner Antwort:'}
                </div>
                <p className="text-midnight/90">{partnerVibeCheck.answer}</p>
              </div>
            )}
            {myVibeCheck?.reflection && partnerVibeCheck?.reflection && (
              <div className="bg-lavender/10 rounded-xl p-4">
                <div className="text-sm font-medium text-lavender mb-1">Lumos Reflexion:</div>
                <div className="text-midnight/90">{myVibeCheck.reflection}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auf Mobile: Nur Status anzeigen wenn bereits eingereicht */}
      {(myVibeCheck || partnerVibeCheck) && (
        <div className="block sm:hidden px-3 pb-3">
          <div className="flex items-center justify-between text-xs text-midnight/60">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${myVibeCheck ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Dein Check</span>
            </div>
            {partnerName && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${partnerVibeCheck ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>{partnerName}s Check</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formular zum Einreichen - kompakter auf Mobile */}
      {!myVibeCheck && (
        <form onSubmit={handleSubmit} className="p-3 sm:p-5 pt-0 flex flex-col gap-3 sm:gap-4">
          <div>
            <label className="block text-sm text-midnight/80 font-medium mb-1">
              Deine Antwort:
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full rounded-xl border border-lavender/30 p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:border-lavender"
              rows={3}
              placeholder="Teile deine Gedanken..."
            />
          </div>
          <button
            type="submit"
            disabled={!answer.trim()}
            className={`px-4 py-2 rounded-xl text-sm sm:text-base font-medium shadow transition ${
              answer.trim()
                ? 'bg-navlink text-white hover:bg-navlink/80'
                : 'bg-lavender/20 text-midnight/40 cursor-not-allowed'
            }`}
          >
            Vibe Check einreichen
          </button>
          {successMsg && <div className="text-green-600 text-sm mt-1">{successMsg}</div>}
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </form>
      )}
    </Card>
  );
};

export default WeeklyReflectionCard; 