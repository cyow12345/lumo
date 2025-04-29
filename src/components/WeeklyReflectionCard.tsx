import React, { useState, useEffect } from 'react';
import Card from './Card';
import { supabase } from '../lib/supabaseClient';
import { fetchReflection } from '../services/openaiReflection';

interface WeeklyReflectionCardProps {
  userId: string;
  partnerId?: string;
}

const QUESTION = 'Wie läuft es aktuell in deiner Beziehung?';

const WeeklyReflectionCard: React.FC<WeeklyReflectionCardProps> = ({ userId, partnerId }) => {
  const [answer, setAnswer] = useState('');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ created_at: string; answer: string; reflection: string }[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lade die letzten Reflexionen für dieses Paar
  useEffect(() => {
    if (!userId || !partnerId) return;
    const fetchReflections = async () => {
      const { data, error } = await supabase
        .from('weekly_reflections')
        .select('created_at, answer, reflection')
        .or(`user_id.eq.${userId},user_id.eq.${partnerId}`)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error && data) {
        setHistory(data);
        if (data.length > 0) setReflection(data[0].reflection);
      }
    };
    fetchReflections();
  }, [userId, partnerId]);

  const handleChange = (value: string) => {
    setAnswer(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const aiReflection = await fetchReflection(`${QUESTION}\n${answer}`);
      setReflection(aiReflection);
      // In Supabase speichern
      const { error: insertError } = await supabase
        .from('weekly_reflections')
        .insert({
          user_id: userId,
          partner_id: partnerId,
          answer,
          reflection: aiReflection,
        });
      if (insertError) throw insertError;
      setHistory(prev => [{ created_at: new Date().toISOString(), answer, reflection: aiReflection }, ...prev]);
      setAnswer('');
      setSuccessMsg('Danke für deine Angabe!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      setError('Fehler bei der Reflexion. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/80 border border-lavender/30 p-0 overflow-hidden">
      <div className="p-5 pb-2 flex items-center gap-3">
        <div>
          <div className="text-lg font-bold text-navlink">Wöchentliche Reflexion</div>
          <div className="text-midnight/70 text-sm">Dein Check-in für mehr Bewusstsein & Verbindung</div>
        </div>
      </div>
      <div className="px-5 pb-2">
        <div className="bg-lavender/10 rounded-xl p-4 flex items-center gap-3 min-h-[56px]">
          <span className="text-xl">💜</span>
          <div className="text-midnight/90 text-base">
            {reflection
              ? reflection
              : <span className="text-midnight/50">Noch keine Reflexion für diese Woche vorhanden.</span>}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-5 pt-0 flex flex-col gap-4">
        <div>
          <label className="block text-midnight/80 font-medium mb-1">{QUESTION}</label>
          <textarea
            className="w-full rounded-xl border border-lavender/20 bg-lavender/5 p-3 text-midnight/90 focus:ring-2 focus:ring-lavender focus:outline-none resize-none min-h-[60px]"
            value={answer}
            onChange={e => handleChange(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="mt-2 px-5 py-2 rounded-xl bg-lavender text-white font-medium shadow hover:bg-lavender/80 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Lumo denkt nach…' : 'Reflexion abschicken'}
        </button>
        {successMsg && <div className="text-green-600 text-sm mt-1">{successMsg}</div>}
        {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      </form>
    </Card>
  );
};

export default WeeklyReflectionCard; 