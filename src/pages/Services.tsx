import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ServiceCard } from '@/components/ServiceCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price'>('newest');

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

  // Apply filters and sorting
  const filteredServices = services
    .filter(service => {
      // Nearby filter
      if (showNearby && userLocation) {
        if (!service.latitude || !service.longitude) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          service.latitude,
          service.longitude
        );
        if (distance > 10) return false;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && service.category !== selectedCategory) {
        return false;
      }
      
      // Text search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesName = service.service_name?.toLowerCase().includes(searchLower);
        const matchesDescription = service.description?.toLowerCase().includes(searchLower);
        return matchesName || matchesDescription;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected option
      if (sortBy === 'price') {
        const priceA = parseFloat(a.pricing?.replace(/[^0-9.]/g, '') || '0');
        const priceB = parseFloat(b.pricing?.replace(/[^0-9.]/g, '') || '0');
        return priceA - priceB;
      }
      // Default: Premium first, then newest
      const aIsPremium = a.subscription_tier === 'top' || a.subscription_tier === 'premium';
      const bIsPremium = b.subscription_tier === 'top' || b.subscription_tier === 'premium';
      if (aIsPremium && !bIsPremium) return -1;
      if (!aIsPremium && bIsPremium) return 1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('nav.services')} showBack />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Filters Section */}
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex gap-2 items-center flex-wrap">
            {userLocation && (
              <Button
                variant={showNearby ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNearby(!showNearby)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Nearby (10 km)
              </Button>
            )}
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="beauty">Beauty</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="accounting">Accounting</SelectItem>
                <SelectItem value="translation">Translation</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="car_services">Car Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'newest' | 'price')}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
