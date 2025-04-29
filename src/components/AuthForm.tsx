import React, { useState, useEffect } from 'react';
import './AuthForm.css';

interface AuthFormProps {
  onAuth: (user: { name?: string; email: string }, password: string, isLogin: boolean) => void;
  onClose: () => void;
  isLoading?: boolean;
  initialMode?: 'login' | 'register';
  onStartOnboarding?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuth, onClose, isLoading = false, initialMode = 'login', onStartOnboarding }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Setze isLogin-Zustand wenn sich initialMode ändert
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Einfache Validierung
    if (!email || !password || (!isLogin && !name)) {
      setError('Bitte fülle alle Felder aus.');
      return;
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    try {
      if (!isLogin && onStartOnboarding) {
        onStartOnboarding(); // Starte Onboarding direkt bei Registrierung
        return;
      }
      await onAuth({ name: !isLogin ? name : undefined, email }, password, isLogin);
    } catch (err) {
      setError('Bei der Authentifizierung ist ein Fehler aufgetreten.');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className="auth-form">
      <h2 className="auth-title">{isLogin ? 'Anmelden' : 'Registrieren'}</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full p-2 border rounded"
              placeholder="Dein Name"
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">E-Mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full p-2 border rounded"
            placeholder="deine@email.de"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Passwort</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full p-2 border rounded"
            placeholder="Mindestens 6 Zeichen"
          />
        </div>
        
        <div className="auth-actions flex flex-col space-y-3 mt-6">
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-lavendel to-lavendelHover text-white py-3 px-6 rounded-xl hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Bitte warten...' : 'Jetzt starten'}
          </button>
          <div className="flex space-x-3">
            <button 
              type="button" 
              className="flex-1 border-2 border-gray-200 py-2.5 px-6 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:border-lavendel"
              onClick={onClose}
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button 
              type="button" 
              className="flex-1 bg-white border-2 border-lavendel py-2.5 px-6 rounded-xl hover:bg-lavendel/5 transition-all duration-300 text-lavendel"
              onClick={toggleAuthMode}
              disabled={isLoading}
            >
              {isLogin ? 'Registrieren' : 'Anmelden'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="auth-footer mt-6 text-center text-sm text-gray-500">
        {isLogin ? 'Neu hier? ' : 'Bereits registriert? '}
        <button 
          type="button" 
          className="text-lavendel hover:text-lavendelHover transition-colors duration-200 hover:underline font-medium"
          onClick={toggleAuthMode}
          disabled={isLoading}
        >
          {isLogin ? 'Jetzt kostenlosen Account erstellen' : 'Jetzt anmelden'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm; 