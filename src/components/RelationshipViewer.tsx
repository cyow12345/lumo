import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Card from './Card';
import { Users, Lock } from 'lucide-react';

interface RelationshipViewerProps {
  userId?: string;
}

const RelationshipViewer: React.FC<RelationshipViewerProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    // Lade Benutzer- und Partnerinformationen
    const loadRelationshipData = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // Lade Benutzerdaten
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('name, invite_code, partner_id')
          .eq('id', userId)
          .single();
        
        if (userError) throw userError;
        
        if (userData) {
          setUserName(userData.name || 'Benutzer');
          setInviteCode(userData.invite_code || '');
          
          // Wenn ein Partner verknüpft ist, lade dessen Daten
          if (userData.partner_id) {
            setPartnerConnected(true);
            
            const { data: partnerData, error: partnerError } = await supabase
              .from('user_profiles')
              .select('name')
              .eq('id', userData.partner_id)
              .single();
              
            if (!partnerError && partnerData) {
              setPartnerName(partnerData.name);
            }
          } else {
            setPartnerConnected(false);
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Beziehungsdaten:', error);
        
        // Fallback auf lokale Daten
        const localData = localStorage.getItem('onboardingData');
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            setUserName(parsedData.name || 'Benutzer');
            // Generiere einen Demo-Code für lokale Entwicklung
            if (!inviteCode) {
              const timestamp = Date.now().toString(36);
              const randomChars = Math.random().toString(36).substring(2, 6);
              setInviteCode(`${timestamp}-${randomChars}`.toUpperCase());
            }
          } catch (e) {
            console.error('Fehler beim Parsen der lokalen Daten:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRelationshipData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lavender"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-navlink mb-6">Eure Beziehung</h2>
      
      {!partnerConnected ? (
        <div className="bg-white rounded-xl shadow-md p-6 border border-lavender/20">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-amber-500" />
            <h3 className="text-xl font-semibold text-navlink">Partner-Verknüpfung erforderlich</h3>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg mb-6">
            <p className="text-amber-700">
              Um eure Beziehungsansicht zu aktivieren, muss dein Partner mit deinem Konto verknüpft sein. Teile deinen Einladungscode, um alle Funktionen freizuschalten.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className="font-medium">Dein Einladungscode:</span>
              <div className="bg-gray-50 p-3 mt-2 rounded-lg border border-gray-200 font-mono text-navlink">
                {inviteCode}
              </div>
            </div>
            
            <div>
              <p className="text-midnight/70">
                Du findest diesen Code auch auf deinem Dashboard unter "Partner-Integration".
              </p>
            </div>
            
            <div className="opacity-40 pointer-events-none">
              <div className="flex items-center justify-between p-4 border-b border-lavender/10">
                <span className="font-medium">Beziehungsbeginn</span>
                <span className="text-navlink">--.--.----</span>
              </div>
              
              <div className="flex items-center justify-between p-4 border-b border-lavender/10">
                <span className="font-medium">Beziehungsdauer</span>
                <span className="text-navlink">-- Tage</span>
              </div>
              
              <div className="flex items-center justify-between p-4 border-b border-lavender/10">
                <span className="font-medium">Gemeinsame Stimmungen</span>
                <span className="text-navlink">--</span>
              </div>
              
              <div className="flex items-center justify-between p-4">
                <span className="font-medium">Synchronität</span>
                <span className="text-navlink">--%</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-semibold text-navlink mb-4">Eure Beziehung</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-lavender/5 rounded-lg">
                <span className="font-medium">Du</span>
                <span className="text-navlink">{userName}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-lavender/5 rounded-lg">
                <span className="font-medium">Dein Partner</span>
                <span className="text-navlink">{partnerName}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-lavender/5 rounded-lg">
                <span className="font-medium">Status</span>
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  Verbunden
                </span>
              </div>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-xl font-semibold text-navlink mb-4">Statistiken</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-b border-lavender/10">
                <span className="font-medium">Gemeinsame Stimmungen</span>
                <span className="text-navlink">23</span>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-lavender/10">
                <span className="font-medium">Synchronität</span>
                <span className="text-navlink">78%</span>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="font-medium">Kommunikationsqualität</span>
                <span className="text-navlink">Gut</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RelationshipViewer; 