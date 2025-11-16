import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
}

export const Header = ({ title, showSearch = false }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      {showSearch && (
        <button 
          onClick={() => navigate('/search')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </header>
  );
};
