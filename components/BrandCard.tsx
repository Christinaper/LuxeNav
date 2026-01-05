
import React from 'react';
import { Brand } from '../types';

interface BrandCardProps {
  brand: Brand;
  onClick: () => void;
  onRemove?: () => void;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, onClick, onRemove }) => {
  const [imgError, setImgError] = React.useState(false);

  // Attempt to use high-quality logos first, fallback to standard favicon
  let logoUrl = brand.logo;
  if (imgError) {
    try {
      logoUrl = `https://www.google.com/s2/favicons?sz=128&domain=${new URL(brand.url).hostname}`;
    } catch {
      logoUrl = `https://ui-avatars.com/api/?name=${brand.name}&background=f3f3f3&color=000&bold=true`;
    }
  }

  return (
    <div 
      className="group relative flex flex-col items-center justify-center p-4 bg-white rounded-[24px] shadow-sm active:scale-95 transition-all duration-200 border border-gray-100 hover:shadow-md"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="w-16 h-16 mb-3 rounded-[18px] bg-white flex items-center justify-center overflow-hidden border border-gray-50 p-2">
        <img 
          src={logoUrl} 
          alt={brand.name} 
          className="max-w-full max-h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
      <span className="text-[11px] font-bold text-gray-900 text-center truncate w-full uppercase tracking-tight">
        {brand.name}
      </span>
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1 -right-1 bg-white text-gray-400 rounded-full w-7 h-7 flex items-center justify-center text-[10px] hover:bg-red-50 hover:text-white transition-all shadow-sm border border-gray-100 z-10"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default BrandCard;
