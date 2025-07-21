import React from 'react';
import { ShoppingBag, Gift, Star } from 'lucide-react';

interface ShopProps {
  featherBalance: number;
  onClose?: () => void;
}

const Shop: React.FC<ShopProps> = ({ featherBalance, onClose }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-amber-200 to-yellow-400 rounded-xl">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Lumo Shop</h2>
            <p className="text-gray-600">Tausche deine goldenen Federn gegen exklusive Rewards</p>
          </div>
        </div>
        
        {/* Federn-Anzeige */}
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
          </svg>
          <span className="text-amber-600 font-medium">{featherBalance} Federn</span>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-lavender/5 to-lavender/10 rounded-2xl p-8 text-center">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 animate-float-slow">
            <Gift className="w-8 h-8 text-lavender opacity-20" />
          </div>
          <div className="absolute top-12 right-8 animate-float-slower">
            <Star className="w-6 h-6 text-amber-400 opacity-20" />
          </div>
          <div className="absolute bottom-8 left-12 animate-float">
            <Gift className="w-6 h-6 text-amber-300 opacity-20" />
          </div>
          <div className="absolute bottom-12 right-12 animate-float-slow">
            <Star className="w-8 h-8 text-lavender opacity-20" />
          </div>
        </div>

        <div className="relative z-10 py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-amber-200 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Der Lumo Shop öffnet bald!
          </h3>
          
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Sammle weiter fleißig goldene Federn und freue dich auf exklusive Lumo Merchandise, 
            besondere Beziehungs-Features und vieles mehr.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lavender/10 rounded-full text-sm text-lavender">
            <Gift className="w-4 h-4" />
            <span>Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Shop; 