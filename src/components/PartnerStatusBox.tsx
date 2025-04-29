import React, { useState } from 'react';
import { CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface PartnerStatusBoxProps {
  userId: string;
  userName: string;
  inviteCode: string;
  partnerLinked: boolean;
  partnerName?: string;
  reloadDashboard: () => void;
  onPartnerLinked?: () => void;
}

const PartnerStatusBox: React.FC<PartnerStatusBoxProps> = ({ userId, userName, inviteCode, partnerLinked, partnerName, reloadDashboard, onPartnerLinked }) => {
  if (partnerLinked) return null;

  const [codeInput, setCodeInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setStatusMsg('');
    try {
      // Suche nach User mit diesem Code
      const { data: partner, error } = await supabase
        .from('user_profiles')
        .select('id, name, partner_id')
        .eq('invite_code', codeInput.trim().toUpperCase())
        .single();
      if (error || !partner || typeof partner !== 'object' || !('id' in partner)) {
        setStatus('error');
        setStatusMsg('Kein Nutzer mit diesem Code gefunden.');
        return;
      }
      if (partner.id === userId) {
        setStatus('error');
        setStatusMsg('Du kannst dich nicht mit dir selbst verknüpfen.');
        return;
      }
      if ('partner_id' in partner && partner.partner_id) {
        setStatus('error');
        setStatusMsg('Dieser Code ist bereits mit einem Partner verknüpft.');
        return;
      }
      // Verknüpfe beide User gegenseitig
      const { error: updateError1 } = await supabase
        .from('user_profiles')
        .update({ partner_id: partner.id })
        .eq('id', userId);
      console.log('Update User (mein Profil):', updateError1);
      const { error: updateError2 } = await supabase
        .from('user_profiles')
        .update({ partner_id: userId })
        .eq('id', partner.id);
      console.log('Update Partner (Partner-Profil):', updateError2);
      if (updateError1 || updateError2) {
        setStatus('error');
        setStatusMsg('Fehler beim Verknüpfen. ' + (updateError1?.message || '') + ' ' + (updateError2?.message || ''));
        return;
      }
      setStatus('success');
      setStatusMsg('Partner erfolgreich verknüpft!');
      localStorage.setItem('partnerLinkedOnce', 'true');
      if (typeof onPartnerLinked === 'function') onPartnerLinked();
      setTimeout(() => {
        reloadDashboard();
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setStatusMsg('Unbekannter Fehler: ' + (err?.message || err));
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-6 mb-6 flex flex-col items-center border border-lavender/20">
      <div className="text-lg font-bold text-navlink mb-2">Dein Partner ist noch nicht verknüpft</div>
      <div className="mb-3 text-midnight/80">Teile deinen Einladungscode oder gib den Code deines Partners ein.</div>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={inviteCode}
          readOnly
          className="p-3 rounded-l-lg border border-lavender/30 bg-gray-50 font-mono text-navlink w-44 text-center text-lg tracking-wider"
        />
        <button
          onClick={handleCopy}
          className="px-3 py-3 bg-lavender text-white rounded-r-lg hover:bg-lavender/80 transition-colors"
        >
          {copySuccess ? <CheckCircle2 size={20} /> : <Copy size={20} />}
        </button>
      </div>
      <form onSubmit={handleCodeSubmit} className="flex flex-col items-center gap-2 w-full max-w-xs">
        <input
          type="text"
          placeholder="Partnercode eingeben"
          value={codeInput}
          onChange={e => setCodeInput(e.target.value)}
          className="p-3 rounded-lg border border-lavender/30 w-full text-center"
          maxLength={20}
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-navlink to-lavender text-white font-medium mt-1 hover:brightness-105 transition"
        >
          {status === 'loading' ? 'Verbinde…' : 'Code einlösen'}
        </button>
      </form>
      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-600 mt-2"><CheckCircle2 size={18} /> {statusMsg}</div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 mt-2"><AlertCircle size={18} /> {statusMsg}</div>
      )}
    </div>
  );
};

export default PartnerStatusBox; 