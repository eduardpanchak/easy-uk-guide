import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardProps {
  icon?: string;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export const Card = ({ icon, title, description, onClick, className }: CardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-card border border-border rounded-xl p-4 text-left",
        "hover:border-primary transition-all active:scale-95",
        "flex items-center gap-3 shadow-sm",
        className
      )}
    >
      {icon && (
        <div className="text-3xl flex-shrink-0">{icon}</div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
};
