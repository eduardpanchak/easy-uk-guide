import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SavedItem {
  id: string;
  type: 'document' | 'nhs' | 'checklist' | 'service';
  title: string;
}

interface ChecklistProgress {
  [key: string]: boolean;
}

interface AppContextType {
  savedItems: SavedItem[];
  toggleSaved: (item: SavedItem) => void;
  isSaved: (id: string) => boolean;
  checklistProgress: ChecklistProgress;
  toggleChecklistItem: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>({});

  const toggleSaved = (item: SavedItem) => {
    setSavedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isSaved = (id: string) => {
    return savedItems.some(item => item.id === id);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistProgress(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <AppContext.Provider value={{ savedItems, toggleSaved, isSaved, checklistProgress, toggleChecklistItem }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
