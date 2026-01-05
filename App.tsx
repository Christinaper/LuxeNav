
import React, { useState, useEffect } from 'react';
import { Brand, BrandCategory, ViewState, Region, HubViewType, WardrobeItem } from './types';
import { INITIAL_BRANDS } from './constants';
import BrandCard from './components/BrandCard';
import AddBrandModal from './components/AddBrandModal';
import { getFashionAssistantResponse, parseWardrobeItem } from './services/geminiService';

const APP_VERSION = "3.2.0";
const UPDATE_HISTORY = [
  { version: "3.2.0", note: "Iconic management navigation, unified typography, and enhanced brand preview visuals." },
  { version: "3.1.0", note: "Improved wardrobe notes and confirm-before-visit safety toggle." },
  { version: "3.0.0", note: "Introduced Closet management and AI-powered wardrobe assistant." }
];

const App: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('luxe_brands_v4');
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => {
    const saved = localStorage.getItem('luxe_wardrobe_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [region, setRegion] = useState<Region>(() => {
    const saved = localStorage.getItem('luxe_region');
    return (saved as Region) || 'USA';
  });
  const [confirmBeforeVisit, setConfirmBeforeVisit] = useState<boolean>(() => {
    const saved = localStorage.getItem('luxe_confirm_visit');
    return saved === null ? true : saved === 'true';
  });

  const [view, setView] = useState<ViewState>('hub');
  const [activeCategory, setActiveCategory] = useState<BrandCategory>(BrandCategory.ALL);
  const [hubViewType, setHubViewType] = useState<HubViewType>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManagingHub, setIsManagingHub] = useState(false);
  const [isManagingWardrobe, setIsManagingWardrobe] = useState(false);
  const [lastMovedId, setLastMovedId] = useState<string | null>(null);
  const [selectedPreviewBrand, setSelectedPreviewBrand] = useState<Brand | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  // AI Wardrobe State
  const [wardrobeInput, setWardrobeInput] = useState('');
  const [isWardrobeLoading, setIsWardrobeLoading] = useState(false);

  // AI Chat State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('luxe_brands_v4', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('luxe_wardrobe_v2', JSON.stringify(wardrobe));
  }, [wardrobe]);

  useEffect(() => {
    localStorage.setItem('luxe_region', region);
  }, [region]);

  useEffect(() => {
    localStorage.setItem('luxe_confirm_visit', confirmBeforeVisit.toString());
  }, [confirmBeforeVisit]);

  const addBrand = (name: string, url: string, category: BrandCategory) => {
    let hostname = '';
    try { hostname = new URL(url).hostname; } catch(e) { hostname = url; }
    const newBrand: Brand = {
      id: Date.now().toString(),
      name,
      url: url.startsWith('http') ? url : `https://${url}`,
      category,
      logo: `https://logo.clearbit.com/${hostname}`
    };
    setBrands([...brands, newBrand]);
  };

  const removeBrand = (id: string) => {
    const brand = brands.find(b => b.id === id);
    if (window.confirm(`Are you sure you want to remove ${brand?.name || 'this brand'} from your hub?`)) {
      setBrands(prev => prev.filter(b => b.id !== id));
    }
  };

  const removeWardrobeItem = (id: string) => {
    if (window.confirm(`Remove this item from your wardrobe?`)) {
      setWardrobe(prev => prev.filter(w => w.id !== id));
    }
  };

  const updateWardrobeNote = (id: string, note: string) => {
    setWardrobe(prev => prev.map(item => item.id === id ? { ...item, notes: note } : item));
  };

  const moveBrand = (id: string, direction: 'up' | 'down') => {
    const index = brands.findIndex(b => b.id === id);
    if (index === -1) return;
    const newBrands = [...brands];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= brands.length) return;
    [newBrands[index], newBrands[targetIndex]] = [newBrands[targetIndex], newBrands[index]];
    setBrands(newBrands);
    setLastMovedId(id);
    setTimeout(() => setLastMovedId(null), 1000);
  };

  const filteredBrands = activeCategory === BrandCategory.ALL 
    ? brands 
    : brands.filter(b => b.category === activeCategory);

  const handleBrandSelection = (brand: Brand) => {
    if (isManagingHub) return;
    if (confirmBeforeVisit) {
      setSelectedPreviewBrand(brand);
    } else {
      window.open(brand.url, '_blank');
    }
  };

  const handleAiWardrobeAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardrobeInput.trim()) return;
    setIsWardrobeLoading(true);
    try {
      const parsed = await parseWardrobeItem(wardrobeInput);
      if (parsed) {
        const newItem: WardrobeItem = {
          id: Date.now().toString(),
          name: parsed.name,
          category: parsed.category,
          color: parsed.color,
          brand: parsed.brand,
          imageUrl: `https://loremflickr.com/320/320/${parsed.color},clothing,${parsed.category.toLowerCase().replace(/\s/g, '')}`
        };
        setWardrobe([newItem, ...wardrobe]);
        setWardrobeInput('');
      }
    } catch (err) {
      alert("Failed to parse wardrobe item. Try simpler terms.");
    } finally {
      setIsWardrobeLoading(false);
    }
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await getFashionAssistantResponse(`Context: Region is ${region}. Wardrobe has ${wardrobe.length} items. Query: ${aiQuery}`);
      setAiResponse(response);
    } catch (err) {
      setAiResponse("I apologize, but I'm unable to provide fashion advice right now.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-[#FAFAFA] overflow-hidden relative border-x border-gray-100 shadow-xl">
      
      {/* Dynamic Header */}
      <header className="pt-12 pb-4 px-6 ios-blur bg-white/80 sticky top-0 z-40 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-[0.15em] text-gray-900 uppercase">
              {view === 'hub' ? 'Curation' : view === 'wardrobe' ? 'Wardrobe' : view === 'ai-assistant' ? 'Concierge' : 'Settings'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className={`w-1.5 h-1.5 rounded-full ${(isManagingHub || isManagingWardrobe) ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></span>
               <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em]">{(isManagingHub || isManagingWardrobe) ? 'Editor' : region}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(view === 'hub' || view === 'wardrobe') && (
              <>
                <button 
                  onClick={() => view === 'hub' ? setIsManagingHub(!isManagingHub) : setIsManagingWardrobe(!isManagingWardrobe)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${((view === 'hub' && isManagingHub) || (view === 'wardrobe' && isManagingWardrobe)) ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'}`}
                >
                  {((view === 'hub' && isManagingHub) || (view === 'wardrobe' && isManagingWardrobe)) ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                  )}
                </button>
              </>
            )}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>

        {view === 'hub' && (
          <div className="flex gap-2 items-center overflow-hidden">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 flex-1">
              {Object.values(BrandCategory).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeCategory === cat 
                      ? 'bg-black text-white shadow-md' 
                      : 'bg-white border border-gray-100 text-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex bg-gray-100 p-1 rounded-full ml-2">
              <button onClick={() => setHubViewType('list')} className={`p-1.5 rounded-full transition-all ${hubViewType === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>
              <button onClick={() => setHubViewType('grid')} className={`p-1.5 rounded-full transition-all ${hubViewType === 'grid' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg></button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pt-4 pb-32 hide-scrollbar">
        
        {/* Hub View */}
        {view === 'hub' && (
          hubViewType === 'grid' ? (
            <div className="grid grid-cols-3 gap-4 pb-12">
              {filteredBrands.map(brand => (
                <BrandCard 
                  key={brand.id} 
                  brand={brand} 
                  onClick={() => handleBrandSelection(brand)}
                  onRemove={isManagingHub ? () => removeBrand(brand.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3 pb-12">
              {filteredBrands.map((brand) => (
                <div 
                  key={brand.id} 
                  className={`bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-4 transition-all duration-300 ${lastMovedId === brand.id ? 'animate-highlight ring-1 ring-black/10' : ''}`}
                >
                  <div 
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 border border-gray-50 overflow-hidden shrink-0 shadow-sm"
                    onClick={() => handleBrandSelection(brand)}
                  >
                    <img 
                      src={brand.logo} 
                      className="max-w-full max-h-full object-contain" 
                      alt="" 
                      onError={(e) => {
                        try {
                          (e.target as any).src = `https://www.google.com/s2/favicons?sz=128&domain=${new URL(brand.url).hostname}`;
                        } catch {
                           (e.target as any).src = `https://ui-avatars.com/api/?name=${brand.name}`;
                        }
                      }} 
                    />
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => handleBrandSelection(brand)}>
                    <h3 className="text-xs font-bold uppercase tracking-wider truncate text-gray-900">{brand.name}</h3>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">{brand.category}</p>
                  </div>
                  {isManagingHub && (
                    <div className="flex gap-1 shrink-0 animate-in fade-in slide-in-from-right-2 duration-300">
                      <button onClick={() => moveBrand(brand.id, 'up')} className="p-1.5 text-gray-300 hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg></button>
                      <button onClick={() => moveBrand(brand.id, 'down')} className="p-1.5 text-gray-300 hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg></button>
                      <button onClick={() => removeBrand(brand.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Wardrobe View */}
        {view === 'wardrobe' && (
          <div className="space-y-6 pb-12">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Inventory Assistant</h2>
              <form onSubmit={handleAiWardrobeAdd} className="flex gap-2">
                <input 
                  value={wardrobeInput}
                  onChange={(e) => setWardrobeInput(e.target.value)}
                  placeholder="e.g. 'A grey Loro Piana sweater'"
                  className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none border border-transparent focus:border-black transition-all"
                />
                <button 
                  disabled={isWardrobeLoading}
                  className="bg-black text-white px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                >
                  {isWardrobeLoading ? '...' : 'Add'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {wardrobe.map(item => (
                <div key={item.id} className="bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-sm group animate-in zoom-in duration-300">
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                    {isManagingWardrobe && (
                      <button 
                        onClick={() => removeWardrobeItem(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[10px] shadow-sm active:scale-90 text-red-500"
                      >✕</button>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-tight truncate text-gray-900">{item.name}</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{item.category}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-50">
                      {editingNoteId === item.id ? (
                        <textarea 
                          className="w-full bg-gray-50 rounded-lg p-2 text-[10px] font-medium outline-none border border-gray-100 h-16"
                          value={item.notes || ''}
                          onChange={(e) => updateWardrobeNote(item.id, e.target.value)}
                          onBlur={() => setEditingNoteId(null)}
                          autoFocus
                          placeholder="Add notes about this item..."
                        />
                      ) : (
                        <div 
                          onClick={() => setEditingNoteId(item.id)}
                          className="text-[10px] text-gray-500 italic line-clamp-2 cursor-text min-h-[1.5em]"
                        >
                          {item.notes || 'Tap to add personal notes...'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Assistant View */}
        {view === 'ai-assistant' && (
          <div className="space-y-6 pb-12">
            <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <h2 className="text-2xl font-black mb-1 tracking-tight uppercase">concierge</h2>
              <form onSubmit={handleAiSearch} className="mt-6 flex flex-col gap-3">
                <input 
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="w-full bg-white/10 rounded-[20px] px-5 py-4 text-sm outline-none focus:ring-1 focus:ring-white/30 border border-white/5"
                  placeholder="Inquire about collections..."
                />
                <button 
                  disabled={isAiLoading}
                  className="bg-white text-black px-6 py-4 rounded-[20px] font-bold text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isAiLoading ? 'Consulting...' : 'Request Advice'}
                </button>
              </form>
            </div>
            {aiResponse && (
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm font-medium italic">{aiResponse}</p>
              </div>
            )}
          </div>
        )}

        {/* Settings View */}
        {view === 'settings' && (
          <div className="space-y-6 pb-24">
            <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
               <h3 className="text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-gray-400">Hub Preferences</h3>
               <div className="flex justify-between items-center py-2 px-1">
                 <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase">Confirm before visit</span>
                   <span className="text-[9px] text-gray-400 font-medium">Show brand card before opening website</span>
                 </div>
                 <button 
                   onClick={() => setConfirmBeforeVisit(!confirmBeforeVisit)}
                   className={`w-12 h-6 rounded-full transition-all relative ${confirmBeforeVisit ? 'bg-black' : 'bg-gray-200'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${confirmBeforeVisit ? 'left-7' : 'left-1'}`}></div>
                 </button>
               </div>
            </section>

            <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
               <h3 className="text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-gray-400">Current Region</h3>
               <div className="grid grid-cols-2 gap-2">
                 {(['USA', 'China', 'Europe', 'Japan'] as Region[]).map(r => (
                   <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`p-4 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all ${region === r ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}
                   >
                     {r}
                   </button>
                 ))}
               </div>
            </section>

            <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">App Information</h3>
                 <span className="text-[10px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">v{APP_VERSION}</span>
               </div>
               <div className="space-y-4">
                 {UPDATE_HISTORY.map((hist, i) => (
                   <div key={i} className="flex gap-3">
                     <span className="text-[9px] font-bold text-gray-300 shrink-0 w-8">{hist.version}</span>
                     <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{hist.note}</p>
                   </div>
                 ))}
               </div>
            </section>
            
            <div className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
              <button 
                onClick={() => { if(window.confirm('Factory reset your entire digital hub?')) { setBrands(INITIAL_BRANDS); setWardrobe([]); localStorage.clear(); window.location.reload(); } }} 
                className="w-full py-5 flex justify-between items-center px-4 hover:bg-red-50 rounded-[28px] transition-colors"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Reset All Data</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Brand Preview Modal */}
      {selectedPreviewBrand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-400 border border-white/20">
            <div className="w-32 h-32 bg-white rounded-[32px] flex items-center justify-center p-6 border border-gray-50 shadow-sm mb-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-50"></div>
              <img src={selectedPreviewBrand.logo} className="max-w-full max-h-full object-contain relative z-10" alt="" />
            </div>
            
            <div className="text-center mb-8 w-full">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase mb-1">{selectedPreviewBrand.name}</h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                 <span className="px-2 py-0.5 bg-gray-100 rounded text-[8px] font-black uppercase tracking-widest text-gray-500">{selectedPreviewBrand.category}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-gray-400 bg-gray-50 rounded-full py-2 px-4 inline-flex max-w-[80%] mx-auto">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18"></path></svg>
                <span className="text-[9px] font-bold truncate tracking-wide">
                  {new URL(selectedPreviewBrand.url).hostname.replace('www.', '')}
                </span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <button 
                onClick={() => { window.open(selectedPreviewBrand.url, '_blank'); setSelectedPreviewBrand(null); }}
                className="w-full py-5 bg-black text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] active:scale-95 transition-all"
              >
                Enter Boutique
              </button>
              <button 
                onClick={() => setSelectedPreviewBrand(null)}
                className="w-full py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto ios-blur bg-white/80 border-t border-gray-100 px-6 pt-4 pb-10 z-50 flex justify-between items-center">
        {[
          { id: 'hub', label: 'Hub', icon: 'M4 6h16M4 12h16m-7 6h7' },
          { id: 'wardrobe', label: 'Closet', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          { id: 'ai-assistant', label: 'Advice', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
          { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
        ].map(nav => (
          <button 
            key={nav.id}
            onClick={() => { setView(nav.id as ViewState); setIsManagingHub(false); setIsManagingWardrobe(false); }}
            className={`flex flex-col items-center gap-1.5 transition-all ${view === nav.id ? 'text-black scale-105' : 'text-gray-300'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={nav.icon}></path></svg>
            <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>
          </button>
        ))}
      </nav>

      {isModalOpen && (
        <AddBrandModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={addBrand}
        />
      )}
    </div>
  );
};

export default App;
