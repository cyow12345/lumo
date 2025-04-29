// Einfaches Testscript für die Supabase-Verbindung
import { createClient } from '@supabase/supabase-js';

// Supabase-Verbindungsdaten 
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Teste die Verbindung
const testConnection = async () => {
  console.log('Teste Supabase-Verbindung...');
  try {
    // Teste, ob der Supabase-Server erreichbar ist
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Verbindungsfehler:', error.message);
      return;
    }
    
    console.log('Verbindung erfolgreich!');
    console.log('Session-Daten:', data);
    
    // Teste den Zugriff auf die Datenbank
    const { data: tableData, error: tableError } = await supabase
      .from('user_profiles')
      .select('count')
      .single();
      
    if (tableError) {
      console.error('Datenbankfehler:', tableError.message);
      return;
    }
    
    console.log('Datenbankzugriff erfolgreich!');
    console.log('Ergebnis:', tableData);
  } catch (err) {
    console.error('Unerwarteter Fehler:', err);
  }
};

testConnection(); 