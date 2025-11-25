import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ServiceCard } from '@/components/ServiceCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateDistance } from '@/lib/geolocation';

interface Service {
  id: string;
  service_name: string;
  description: string | null;
  category: string;
  pricing: string | null;
  photos: string[] | null;
  languages: string[];
  subscription_tier: string;
  latitude: number | null;
  longitude: number | null;
}

export default function Services() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNearby, setShowNearby] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    fetchServices();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('id, service_name, description, category, pricing, photos, languages, subscription_tier, latitude, longitude')
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

  const filteredServices = showNearby && userLocation
    ? services.filter(service => {
        if (!service.latitude || !service.longitude) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          service.latitude,
          service.longitude
        );
        return distance <= 10; // 10 km radius
      })
    : services;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('nav.services')} showBack />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {userLocation && (
          <Button
            variant={showNearby ? "default" : "outline"}
            size="sm"
            onClick={() => setShowNearby(!showNearby)}
            className="mb-4"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Nearby (10 km)
          </Button>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {showNearby ? 'No services found nearby' : t('services.noServices')}
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
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
