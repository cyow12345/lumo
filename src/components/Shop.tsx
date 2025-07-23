import React from 'react';
import { ShoppingBag, Timer, Gift } from 'lucide-react';

interface ShopProps {
  featherBalance: number;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ featherBalance, onClose }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-3 sm:p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-3 sm:mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-navlink" />
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Shop</h2>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-4 flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-2 rounded-lg">
        <div className="bg-white/80 rounded-full p-1 shadow-inner">
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 filter drop-shadow">
            <defs>
              <linearGradient id="feather-gradient-shop" x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="60%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
              <linearGradient id="feather-shine-shop" x1="8" y1="4" x2="8" y2="13" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF5CC" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>
            <path
              d="M20.7 7.5c1.3 3.7.3 7.8-2.5 10.6-2.8 2.8-6.9 3.8-10.6 2.5l-3.1 3.1c-.2.2-.5.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l3.1-3.1c-1.3-3.7-.3-7.8 2.5-10.6 2.8-2.8 6.9-3.8 10.6-2.5l-7.5 7.5c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7.5-7.5z"
              fill="url(#feather-gradient-shop)"
              className="drop-shadow-lg"
            />
            <path
              d="M12 4c-.3 0-.5.1-.7.3l-7 7c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3l7-7c.4-.4.4-1 0-1.4-.2-.2-.4-.3-.7-.3z"
              fill="url(#feather-shine-shop)"
              className="drop-shadow-md"
            />
          </svg>
        </div>
        <span className="text-sm sm:text-lg text-gray-700 font-medium">Deine Federn: {featherBalance}</span>
      </div>

      {/* Info Box */}
      <div className="bg-lavender/5 border border-lavender/20 rounded-lg p-4">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-white/80 rounded-full p-3 shadow-md">
            <Gift className="w-8 h-8 text-navlink" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-navlink mb-2">Bald verfügbar!</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Sammle fleißig Federn durch tägliche "Ich denk an dich" Nachrichten und wöchentliche Vibe-Checks. 
              Bald kannst du deine gesammelten Federn gegen exklusive Lumo-Merchandise eintauschen!
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-navlink/60">
            <Timer className="w-4 h-4" />
            <span>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop; 