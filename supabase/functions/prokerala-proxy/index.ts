import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PROKERALA_API_BASE = "https://api.prokerala.com/v2/astrology";
const CLIENT_ID = Deno.env.get("PROKERALA_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("PROKERALA_CLIENT_SECRET");

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("PROKERALA_CLIENT_ID und PROKERALA_CLIENT_SECRET müssen gesetzt sein");
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { type = 'planets', birthDate, birthTime, latitude, longitude } = await req.json();
    console.log('Eingabedaten:', { type, birthDate, birthTime, latitude, longitude });

    // Validiere Eingabedaten
    if (!birthDate || !birthTime || latitude === undefined || longitude === undefined) {
      throw new Error('Alle Felder (birthDate, birthTime, latitude, longitude) sind erforderlich');
    }

    // OAuth Token holen
    console.log('Hole OAuth Token...');
    const tokenResponse = await fetch("https://api.prokerala.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("Token Error:", tokenError);
      throw new Error(`OAuth Token Fehler: ${tokenError}`);
    }

    const { access_token } = await tokenResponse.json();
    console.log('OAuth Token erhalten');

    // API-Endpunkt basierend auf dem Typ wählen
    let endpoint = type === 'ascendant' 
      ? `${PROKERALA_API_BASE}/ascendant` 
      : `${PROKERALA_API_BASE}/planet-positions`;
    
    console.log('Verwende Endpunkt:', endpoint);

    // Zeitzone für den Geburtsort bestimmen
    const tzResponse = await fetch(`https://api.prokerala.com/v2/timezone?latitude=${latitude}&longitude=${longitude}`, {
      headers: {
        "Authorization": `Bearer ${access_token}`,
      },
    });

    if (!tzResponse.ok) {
      throw new Error(`Fehler beim Abrufen der Zeitzone: ${await tzResponse.text()}`);
    }

    const { timezone } = await tzResponse.json();
    console.log('Zeitzone für Koordinaten:', timezone);

    // Prokerala API aufrufen
    const apiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        datetime: `${birthDate}T${birthTime}`,
        coordinates: {
          latitude: latitude.toString(),
          longitude: longitude.toString()
        },
        timezone: timezone,
        ayanamsa: "lahiri"
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Prokerala API Fehler:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        body: errorText
      });
      throw new Error(`Prokerala API Fehler (${apiResponse.status}): ${errorText}`);
    }

    const data = await apiResponse.json();
    console.log('API Antwort:', JSON.stringify(data, null, 2));

    // Daten basierend auf dem Typ formatieren
    let formattedData;
    if (type === 'ascendant') {
      formattedData = {
        status: 'success',
        data: {
          ascendant: data.data?.ascendant?.sign || data.data?.ascendant || 'Unbekannt'
        }
      };
    } else {
      formattedData = {
        status: 'success',
        data: {
          planets: {
            sun: data.data?.positions?.sun || 'Unbekannt',
            moon: data.data?.positions?.moon || 'Unbekannt',
            mars: data.data?.positions?.mars || 'Unbekannt',
            mercury: data.data?.positions?.mercury || 'Unbekannt',
            jupiter: data.data?.positions?.jupiter || 'Unbekannt',
            venus: data.data?.positions?.venus || 'Unbekannt',
            saturn: data.data?.positions?.saturn || 'Unbekannt'
          }
        }
      };
    }

    console.log('Formatierte Daten:', formattedData);

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("Fehler in Edge Function:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(JSON.stringify({ 
      status: 'error',
      message: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}); 