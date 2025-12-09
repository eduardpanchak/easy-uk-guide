import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AdCardProps {
  id: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  targetUrl: string;
}

export const AdCard = ({
  id,
  mediaUrl,
  mediaType,
  targetUrl,
}: AdCardProps) => {
  const hasTrackedImpression = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Track impression once when ad is rendered
    if (!hasTrackedImpression.current) {
      hasTrackedImpression.current = true;
      trackImpression();
    }
  }, [id]);

  const trackImpression = async () => {
    try {
      await supabase.rpc('increment_ad_impressions', { ad_id: id });
    } catch (error) {
      console.error('Error tracking ad impression:', error);
    }
  };

  const trackClick = async () => {
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: id });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const handleClick = () => {
    trackClick();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full bg-card rounded-xl overflow-hidden text-left",
        "hover:border-primary transition-all active:scale-95",
        "shadow-sm relative border border-border"
      )}
    >
      {/* Ad indicator badge */}
      <div className="absolute top-2 left-2 z-10 bg-muted/80 backdrop-blur-sm text-xs px-2 py-0.5 rounded text-muted-foreground">
        Ad
      </div>
      
      {/* Media content - 16:9 aspect ratio */}
      <div className="w-full aspect-video bg-muted">
        {mediaType === 'photo' ? (
          <img 
            src={mediaUrl} 
            alt="Advertisement"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        )}
      </div>
    </button>
  );
};
