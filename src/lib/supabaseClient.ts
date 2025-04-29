import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Wichtig: 127.0.0.1 statt localhost verwenden
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

type ConnectionResult = {
  status: 'success' | 'error' | 'guest';
  message?: string;
  error?: string;
};

export const checkSupabaseConnection = async (): Promise<ConnectionResult> => {
  try {
    // Prüfe zuerst, ob wir im Entwicklungsmodus sind
    if (process.env.REACT_APP_GUEST_MODE === 'true') {
      return {
        status: 'guest',
        message: 'App läuft im Gast-Modus'
      };
    }

    // Versuche eine Verbindung zu Supabase herzustellen
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth-Verbindungsfehler:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }

    // Teste den Zugriff auf die Datenbank
    const { data: tableData, error: tableError } = await supabase
      .from('user_profiles')
      .select('count')
      .single();
      
    if (tableError) {
      console.error('Datenbankfehler:', tableError.message);
      
      // Wenn der Fehler auf eine nicht erreichbare Datenbank hinweist
      if (tableError.code === 'PGRST301' || 
          tableError.code === 'PGRST310' || 
          tableError.message.includes('connection') || 
          tableError.message.includes('not found')) {
        return {
          status: 'error',
          error: 'Keine Verbindung zur Datenbank möglich: ' + tableError.message
        };
      }
      
      // Bei anderen Fehlern
      return {
        status: 'error',
        error: tableError.message
      };
    }

    // Erfolgreiche Verbindung
    return {
      status: 'success',
      message: 'Verbindung zur Datenbank hergestellt'
    };

  } catch (error) {
    // Bei unerwarteten Fehlern
    console.error('Unerwarteter Fehler bei Supabase-Verbindung:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return {
      status: 'error',
      error: errorMessage
    };
  }
}; 