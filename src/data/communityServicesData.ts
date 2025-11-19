import { Nationality } from '@/contexts/UserPreferencesContext';

export interface CommunityService {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  instagram?: string;
  website?: string;
  nationality: Nationality;
}

export const communityServicesData: CommunityService[] = [
  // Ukrainian services
  {
    id: 'ua-barber-1',
    name: 'Ukrainian Barber Shop',
    category: 'Barber',
    address: '123 High Street, London E1 1AA',
    phone: '+44 20 1234 5678',
    instagram: '@ukrainianbarber',
    nationality: 'ukrainian'
  },
  {
    id: 'ua-nails-1',
    name: 'Kyiv Nails & Beauty',
    category: 'Nails & Beauty',
    address: '45 Oxford Street, London W1D 2DU',
    phone: '+44 20 2345 6789',
    website: 'https://kyivnails.co.uk',
    nationality: 'ukrainian'
  },
  {
    id: 'ua-transport-1',
    name: 'UA Express Transport',
    category: 'Transport',
    address: '78 Victoria Road, London SW1E 5ND',
    phone: '+44 20 3456 7890',
    nationality: 'ukrainian'
  },

  // Russian services
  {
    id: 'ru-barber-1',
    name: 'Moscow Cuts',
    category: 'Barber',
    address: '56 Baker Street, London NW1 6XE',
    phone: '+44 20 4567 8901',
    instagram: '@moscowcuts',
    nationality: 'russian'
  },
  {
    id: 'ru-nails-1',
    name: 'Russian Beauty Salon',
    category: 'Nails & Beauty',
    address: '89 Regent Street, London W1B 4JH',
    phone: '+44 20 5678 9012',
    nationality: 'russian'
  },

  // Polish services
  {
    id: 'pl-barber-1',
    name: 'Polish Barber Studio',
    category: 'Barber',
    address: '12 King Street, London W6 0QA',
    phone: '+44 20 6789 0123',
    nationality: 'polish'
  },
  {
    id: 'pl-transport-1',
    name: 'Polska Transport Services',
    category: 'Transport',
    address: '34 Queen Street, London EC4R 1BR',
    phone: '+44 20 7890 1234',
    website: 'https://polskatransport.co.uk',
    nationality: 'polish'
  },

  // Lithuanian services
  {
    id: 'lt-nails-1',
    name: 'Vilnius Beauty',
    category: 'Nails & Beauty',
    address: '67 Camden Road, London NW1 9ES',
    phone: '+44 20 8901 2345',
    nationality: 'lithuanian'
  },
];
