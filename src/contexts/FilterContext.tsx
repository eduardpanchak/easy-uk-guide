import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

const SESSION_SEED_KEY = 'servicesOrderSeed';

const generateNewSeed = (): number => {
  const newSeed = Math.floor(Math.random() * 1000000);
  sessionStorage.setItem(SESSION_SEED_KEY, newSeed.toString());
  return newSeed;
};

const getOrCreateSeed = (): number => {
  const existingSeed = sessionStorage.getItem(SESSION_SEED_KEY);
  if (existingSeed !== null) {
    return parseInt(existingSeed, 10);
  }
  return generateNewSeed();
};

interface ServiceFilters {
  searchText: string;
  selectedCategory: string;
  sortBy: 'newest' | 'price' | 'distance';
  showNearby: boolean;
  selectedLanguages: string[];
  searchPostcode: string;
  searchRadius: number;
  userLat: number | null;
  userLng: number | null;
  selectedCountry: string;
  selectedBorough: string;
}

interface FilterContextType {
  filters: ServiceFilters;
  setFilters: (filters: ServiceFilters) => void;
  orderSeed: number;
  regenerateSeed: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<ServiceFilters>({
    searchText: '',
    selectedCategory: 'all',
    sortBy: 'newest',
    showNearby: false,
    selectedLanguages: [],
    searchPostcode: '',
    searchRadius: 10,
    userLat: null,
    userLng: null,
    selectedCountry: 'all',
    selectedBorough: 'all',
  });

  const [orderSeed, setOrderSeed] = useState<number>(() => getOrCreateSeed());

  const regenerateSeed = useCallback(() => {
    const newSeed = generateNewSeed();
    setOrderSeed(newSeed);
  }, []);

  return (
    <FilterContext.Provider value={{ filters, setFilters, orderSeed, regenerateSeed }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
