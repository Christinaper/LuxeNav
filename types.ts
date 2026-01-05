
export interface Brand {
  id: string;
  name: string;
  url: string;
  logo: string;
  category: BrandCategory;
  description?: string;
}

export enum BrandCategory {
  ALL = 'All',
  LUXURY = 'Luxury',
  STREETWEAR = 'Streetwear',
  ACCESSORIES = 'Accessories',
  CUSTOM = 'Custom'
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  imageUrl: string;
  brand?: string;
  notes?: string;
}

export type Region = 'USA' | 'China' | 'Europe' | 'Japan';

export type ViewState = 'hub' | 'wardrobe' | 'ai-assistant' | 'settings';
export type HubViewType = 'list' | 'grid';
