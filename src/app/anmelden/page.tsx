'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SharedLayout from '../../components/SharedLayout';
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SharedLayout>
      <div className="min-h-[calc(100vh-6rem)] bg-gradient-to-b from-purple-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Anmeldung</h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-Mail-Adresse oder Nutzername
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="E-Mail-Adresse oder Nutzername"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Passwort
                  </label>
                  <Link href="/passwort-vergessen" className="text-sm text-purple-600 hover:text-purple-500">
                    VERGESSEN?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Passwort"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#332d6e] hover:bg-[#2a2558] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center space-y-4">
              <p>
                Durch deine Anmeldung bei Lumo erklärst du dich mit unseren{' '}
                <Link href="/agb" className="text-purple-600 hover:text-purple-500">
                  Geschäftsbedingungen
                </Link>{' '}
                und unserer{' '}
                <Link href="/datenschutz" className="text-purple-600 hover:text-purple-500">
                  Datenschutzerklärung
                </Link>{' '}
                einverstanden.
              </p>
              <p>
                Diese Seite wird durch reCAPTCHA geschützt. Es gelten die{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-500">
                  Datenschutzerklärung
                </a>{' '}
                und die{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-500">
                  Nutzungsbedingungen
                </a>{' '}
                von Google.
              </p>
            </div>
          </form>
        </div>
      </div>
    </SharedLayout>
  );
} 