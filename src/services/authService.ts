import { supabase } from '../lib/supabaseClient';

export const authService = {
  async signUp(email: string, password: string, name: string) {
    try {
      // 1. Registriere den Benutzer bei Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('Keine Benutzerdaten erhalten');

      // 2. Erstelle das Benutzerprofil
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          name: name,
        });

      if (profileError) throw profileError;

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Fehler bei der Registrierung:', error);
      return { user: null, error };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user, error: null };
    } catch (error) {
      console.error('Fehler beim Login:', error);
      return { user: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Fehler beim Logout:', error);
      return { error };
    }
  }
}; 