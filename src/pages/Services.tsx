import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ServiceCard } from '@/components/ServiceCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Service {
  id: string;
  service_name: string;
  description: string | null;
  category: string;
  pricing: string | null;
  photos: string[] | null;
  languages: string[];
  subscription_tier: string;
}

export default function Services() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Query all published services - visible to ALL users (regular and business)
      // Includes both 'active' (paid) and 'trial' (free trial period) services
      // NO language or nationality filtering - shows ALL services
      const { data, error } = await supabase
        .from('services')
        .select('id, service_name, description, category, pricing, photos, languages, subscription_tier')
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      // Sort: Premium/Top services first, then others
      const sortedData = (data || []).sort((a, b) => {
        const aIsPremium = a.subscription_tier === 'top' || a.subscription_tier === 'premium';
        const bIsPremium = b.subscription_tier === 'top' || b.subscription_tier === 'premium';
        if (aIsPremium && !bIsPremium) return -1;
        if (!aIsPremium && bIsPremium) return 1;
        return 0;
      });

      setServices(sortedData);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('nav.services')} showBack />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('services.noServices')}
            </p>
          </div>
        ) : (
          services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.service_name}
              description={service.description}
              category={service.category}
              pricing={service.pricing}
              photo={service.photos?.[0] || null}
              subscriptionTier={service.subscription_tier}
              onClick={() => navigate(`/services/${service.id}`)}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
