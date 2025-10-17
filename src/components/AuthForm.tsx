import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';
import './AuthForm.css';

interface AuthFormProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
  isLoading?: boolean;
}

export default function AuthForm({ onSuccess, initialMode = 'login', isLoading = false }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        await handleForgotPassword();
      } else if (mode === 'login') {
        const { user, error } = await authService.signIn(email, password);
        if (error) throw error;
        if (user && onSuccess) onSuccess();
      } else if (mode === 'register') {
        const { user, error } = await authService.signUp(email, password, name);
        if (error) throw error;
        if (user && onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
    } catch (error: any) {
      setError(error.message || 'Fehler beim Zurücksetzen des Passworts');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Willkommen zurück!' : 
             mode === 'register' ? 'Erstelle deinen Account' :
             'Passwort vergessen'}
          </h2>
          <p className="mt-2 text-gray-600">
            {mode === 'login' ? 'Melde dich an, um fortzufahren' : 
             mode === 'register' ? 'Beginne deine Beziehungsreise' :
             'Wir senden dir eine E-Mail mit Anweisungen, wie du dein Passwort zurücksetzen kannst.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-lavender focus:border-transparent"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {mode === 'forgot' ? 'E-Mail-Adresse angeben' : 'E-Mail'}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-lavender focus:border-transparent"
            required
          />
        </div>

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Passwort
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-navlink hover:text-navlink/80 font-medium ml-2"
                >
                  Vergessen?
                </button>
              )}
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-lavender focus:border-transparent"
              required
            />
          </div>
        )}

        {resetEmailSent ? (
          <div className="rounded-xl bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  E-Mail wurde gesendet! Bitte überprüfe deinen Posteingang.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-lavendel to-lavendelHover text-white py-3 px-6 rounded-xl hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-lg"
            disabled={loading}
          >
            {loading ? 'Bitte warten...' : 
             mode === 'login' ? 'Anfangen' :
             mode === 'register' ? 'Account erstellen' :
             'Senden'}
          </button>
        )}

        {mode !== 'forgot' && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-navlink hover:text-navlink/80 font-medium"
            >
              {mode === 'login' ? 'Noch kein Account? Registrieren' : 'Bereits registriert? Anmelden'}
            </button>
          </div>
        )}

        {mode === 'forgot' && !resetEmailSent && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-navlink hover:text-navlink/80 font-medium"
            >
              Zurück zur Anmeldung
            </button>
          </div>
        )}
      </form>
    </div>
  );
} 