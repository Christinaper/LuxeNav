
import { Brand, BrandCategory } from './types';

// Using Clearbit or direct official assets where possible for the "Luxe" feel
export const INITIAL_BRANDS: Brand[] = [
  {
    id: '1',
    name: 'Chanel',
    url: 'https://www.chanel.com',
    logo: 'https://logo.clearbit.com/chanel.com',
    category: BrandCategory.LUXURY,
    description: 'High fashion, accessories, and perfume.'
  },
  {
    id: '2',
    name: 'Armani',
    url: 'https://www.armani.com',
    logo: 'https://logo.clearbit.com/armani.com',
    category: BrandCategory.LUXURY,
    description: 'Italian luxury fashion house.'
  },
  {
    id: '3',
    name: 'Brunello Cucinelli',
    url: 'https://www.brunellocucinelli.com',
    logo: 'https://logo.clearbit.com/brunellocucinelli.com',
    category: BrandCategory.LUXURY,
    description: 'Italian luxury brand known for cashmere.'
  },
  {
    id: '4',
    name: 'Hermès',
    url: 'https://www.hermes.com',
    logo: 'https://logo.clearbit.com/hermes.com',
    category: BrandCategory.LUXURY,
    description: 'French luxury design house.'
  },
  {
    id: '6',
    name: 'Louis Vuitton',
    url: 'https://www.louisvuitton.com',
    logo: 'https://logo.clearbit.com/louisvuitton.com',
    category: BrandCategory.LUXURY
  },
  {
    id: '7',
    name: 'Prada',
    url: 'https://www.prada.com',
    logo: 'https://logo.clearbit.com/prada.com',
    category: BrandCategory.LUXURY
  },
  {
    id: '8',
    name: 'Celine',
    url: 'https://www.celine.com',
    logo: 'https://logo.clearbit.com/celine.com',
    category: BrandCategory.LUXURY
  },
  {
    id: '9',
    name: 'Loro Piana',
    url: 'https://www.loropiana.com',
    logo: 'https://logo.clearbit.com/loropiana.com',
    category: BrandCategory.LUXURY
  }
];
