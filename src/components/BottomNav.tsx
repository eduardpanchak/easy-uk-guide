import { Home, CheckSquare, Bookmark } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        <NavLink
          to="/"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </NavLink>
        
        <NavLink
          to="/checklists"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <CheckSquare className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Checklists</span>
        </NavLink>
        
        <NavLink
          to="/saved"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Bookmark className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Saved</span>
        </NavLink>
      </div>
    </nav>
  );
};
