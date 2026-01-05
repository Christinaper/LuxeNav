
import React, { useState } from 'react';
import { BrandCategory } from '../types';

interface AddBrandModalProps {
  onClose: () => void;
  onAdd: (name: string, url: string, category: BrandCategory) => void;
}

const AddBrandModal: React.FC<AddBrandModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState(BrandCategory.CUSTOM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      // Ensure URL has protocol
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      onAdd(name, formattedUrl, category);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add Brand</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Brand Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-[16px] focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
              placeholder="e.g. Celine"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Website URL</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-[16px] focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
              placeholder="brand.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
            <div className="flex gap-2 flex-wrap">
              {Object.values(BrandCategory).filter(c => c !== BrandCategory.ALL).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${category === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button 
            type="submit"
            className="w-full mt-6 bg-black text-white p-4 rounded-[20px] font-bold active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
          >
            Save to Hub
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBrandModal;
