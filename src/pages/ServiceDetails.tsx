import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Phone, Mail, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  service_name: string;
  description: string | null;
  category: string;
  pricing: string | null;
  photos: string[] | null;
  phone: string | null;
  email: string | null;
  social_links: any;
  status: string;
}

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toggleSaved, isSaved } = useApp();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchService(id);
    }
  }, [id]);

  const fetchService = async (serviceId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching service:', error);
        toast.error(t('serviceDetails.fetchError'));
        return;
      }

      if (!data) {
        toast.error(t('serviceDetails.notFound'));
        navigate('/services');
        return;
      }

      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error(t('serviceDetails.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleVisitWebsite = () => {
    if (service?.social_links?.website) {
      window.open(service.social_links.website, '_blank');
    }
  };

  const handleCall = () => {
    if (service?.phone) {
      window.location.href = `tel:${service.phone}`;
    }
  };

  const handleEmail = () => {
    if (service?.email) {
      window.location.href = `mailto:${service.email}`;
    }
  };

  const handleSaveToggle = async () => {
    if (service) {
      await toggleSaved({ id: service.id, type: 'service', title: service.service_name });
      toast.success(
        isSaved(service.id) 
          ? t('serviceDetails.removedFromSaved') 
          : t('serviceDetails.addedToSaved')
      );
    }
  };

  const saved = service ? isSaved(service.id) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const websiteUrl = service.social_links?.website;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold line-clamp-1 flex-1">{service.service_name}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveToggle}
            className="shrink-0"
            aria-label={saved ? "Remove from saved" : "Add to saved"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all",
                saved 
                  ? "fill-red-500 text-red-500" 
                  : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Main Photo */}
        <div className="w-full aspect-video bg-muted relative overflow-hidden">
          {service.photos && service.photos.length > 0 ? (
            <img 
              src={service.photos[0]} 
              alt={service.service_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-6xl">📷</span>
            </div>
          )}
        </div>

        {/* Main Info */}
        <div className="p-6 space-y-6">
          {/* Service Name */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {service.service_name}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-block bg-muted px-3 py-1 rounded-full text-sm font-medium text-foreground">
                {service.category}
              </span>
              {service.pricing && (
                <span className="text-2xl font-bold text-primary">
                  £{service.pricing}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('serviceDetails.description')}
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {t('serviceDetails.contactProvider')}
            </h3>

            {websiteUrl && (
              <Button
                onClick={handleVisitWebsite}
                className="w-full"
                size="lg"
                variant="default"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                {t('serviceDetails.visitWebsite')}
              </Button>
            )}

            {service.phone && (
              <Button
                onClick={handleCall}
                className="w-full"
                size="lg"
                variant="outline"
              >
                <Phone className="h-5 w-5 mr-2" />
                {t('serviceDetails.callProvider')}
              </Button>
            )}

            {service.email && (
              <Button
                onClick={handleEmail}
                className="w-full"
                size="lg"
                variant="outline"
              >
                <Mail className="h-5 w-5 mr-2" />
                {t('serviceDetails.emailProvider')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
