// Einfaches Testscript für die Supabase-Verbindung
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Teste die Verbindung
async function testConnection() {
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
}

testConnection(); 