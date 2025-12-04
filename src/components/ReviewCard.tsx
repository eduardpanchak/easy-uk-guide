import React from 'react';
import { Star, Trash2, Edit, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  rating: number;
  reviewText: string | null;
  createdAt: string;
  reviewerName?: string | null;
  isOwnReview: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ReviewCard = ({
  rating,
  reviewText,
  createdAt,
  reviewerName,
  isOwnReview,
  onEdit,
  onDelete
}: ReviewCardProps) => {
  const { t } = useLanguage();
  const date = new Date(createdAt).toLocaleDateString();
  const displayName = reviewerName || t('reviews.anonymousUser');

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-2">
      {/* Reviewer Name */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">{displayName}</span>
        {isOwnReview && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {t('reviews.you')}
          </span>
        )}
      </div>

      {/* Rating Stars */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= rating 
                  ? "fill-amber-500 text-amber-500" 
                  : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>

      {/* Review Text */}
      {reviewText && (
        <p className="text-sm text-foreground leading-relaxed">{reviewText}</p>
      )}

      {/* Actions for own reviews */}
      {isOwnReview && (
        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            {t('common.edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {t('common.delete')}
          </Button>
        </div>
      )}
    </div>
  );
};
