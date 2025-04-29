import { createClient } from '@supabase/supabase-js';
import fetch from 'cross-fetch';

// Lokaler Supabase-Server
console.log('Verbinde mit Supabase: http://127.0.0.1:54321');
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Debug-Logging
console.log('Verbinde mit Supabase:', supabaseUrl);

// Erstelle den Supabase-Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ConnectionResult = {
  status: 'success' | 'error' | 'guest';
  message?: string;
  error?: string;
};

export const checkSupabaseConnection = async () => {
  console.log('Teste Supabase-Verbindung...');
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
      console.error('Auth-Verbindungsfehler:', error);
      return {
        status: 'error',
        error: error.message || 'Auth-Verbindungsfehler'
      };
    }

    // Teste den Zugriff auf die Datenbank
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('user_profiles')
        .select('count')
        .single();
        
      if (tableError) {
        console.error('Datenbankfehler:', tableError);
        return {
          status: 'error',
          error: tableError.message || 'Datenbankfehler'
        };
      }

      console.log('Datenbankzugriff erfolgreich:', tableData);
      
      // Erfolgreiche Verbindung
      return {
        status: 'success',
        message: 'Verbindung zur Datenbank hergestellt'
      };
    } catch (dbError) {
      console.error('Unerwarteter Datenbankfehler:', dbError);
      return {
        status: 'error',
        error: dbError instanceof Error ? dbError.message : 'Unbekannter Datenbankfehler'
      };
    }
  } catch (error) {
    // Bei unerwarteten Fehlern
    console.error('Supabase-Verbindungsfehler:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    };
  }
}; 