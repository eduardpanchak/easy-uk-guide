import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string | null;
  category: string;
  pricing: string | null;
  photo: string | null;
  onClick?: () => void;
}

export const ServiceCard = ({
  id,
  name,
  description,
  category,
  pricing,
  photo,
  onClick
}: ServiceCardProps) => {
  const { toggleSaved, isSaved } = useApp();
  const saved = isSaved(id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaved({ id, type: 'service', title: name });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-card border border-border rounded-xl p-3 text-left",
        "hover:border-primary transition-all active:scale-95",
        "flex items-start gap-3 shadow-sm relative"
      )}
    >
      {/* Left side - Photo */}
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {photo ? (
          <img 
            src={photo} 
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-3xl">📷</span>
          </div>
        )}
      </div>

      {/* Right side - Content */}
      <div className="flex-1 min-w-0 pr-8">
        <h3 className="font-bold text-base text-foreground mb-1 line-clamp-1">
          {name}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {category}
          </span>
          {pricing && (
            <span className="text-sm font-semibold text-foreground">
              £{pricing}
            </span>
          )}
        </div>
      </div>

      {/* Heart button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors"
        aria-label={saved ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-all",
            saved 
              ? "fill-red-500 text-red-500" 
              : "text-muted-foreground hover:text-foreground"
          )}
        />
      </button>
    </button>
  );
};
