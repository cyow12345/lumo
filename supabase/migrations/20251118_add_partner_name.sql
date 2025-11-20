-- Migration: Partner-Name-Feld für Personalisierung hinzufügen
-- Datum: 2025-11-18
-- Beschreibung: Fügt ein partner_name Feld zur user_profiles Tabelle hinzu,
--               um das Onboarding zu personalisieren

-- Füge partner_name Spalte hinzu
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS partner_name TEXT;

-- Kommentar für Dokumentation
COMMENT ON COLUMN user_profiles.partner_name IS 'Vorname des Partners/der Partnerin für personalisierte Onboarding-Experience';

