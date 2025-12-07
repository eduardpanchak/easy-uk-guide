import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ServiceCard } from '@/components/ServiceCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Search, Save, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateDistance, geocodePostcode, RADIUS_OPTIONS } from '@/lib/geocoding';
import { useToast } from '@/hooks/use-toast';
import { LanguageMultiSelect } from '@/components/LanguageMultiSelect';

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
  postcode: string | null;
  city: string | null;
}

interface ServiceWithDistance extends Service {
  distance: number | null;
}

const SAVED_FILTERS_KEY = 'savedFilters';

export default function Services() {
  const { language, t } = useLanguage();
  const { filters, setFilters } = useFilters();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeocodingPostcode, setIsGeocodingPostcode] = useState(false);
  
  // Local state synced with context
  const [searchText, setSearchText] = useState(filters.searchText);
  const [selectedCategory, setSelectedCategory] = useState(filters.selectedCategory);
  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string[]>(filters.selectedLanguages || []);
  const [showNearby, setShowNearby] = useState(filters.showNearby);
  const [searchPostcode, setSearchPostcode] = useState(filters.searchPostcode || '');
  const [searchRadius, setSearchRadius] = useState(filters.searchRadius || 10);
  const [userLat, setUserLat] = useState<number | null>(filters.userLat);
  const [userLng, setUserLng] = useState<number | null>(filters.userLng);

  useEffect(() => {
    fetchServices();
    loadSavedFilters();
  }, []);

  // Sync local state with context on change
  useEffect(() => {
    setFilters({
      searchText,
      selectedCategory,
      sortBy,
      showNearby,
      selectedLanguages: selectedLanguageFilter,
      searchPostcode,
      searchRadius,
      userLat,
      userLng,
    });
  }, [searchText, selectedCategory, sortBy, showNearby, selectedLanguageFilter, searchPostcode, searchRadius, userLat, userLng, setFilters]);

  const loadSavedFilters = () => {
    try {
      const saved = localStorage.getItem(SAVED_FILTERS_KEY);
      if (saved) {
        const savedFilters = JSON.parse(saved);
        setSearchText(savedFilters.searchText || '');
        setSelectedCategory(savedFilters.selectedCategory || 'all');
        setSortBy(savedFilters.sortBy || 'newest');
        setShowNearby(savedFilters.showNearby || false);
        setSelectedLanguageFilter(savedFilters.selectedLanguages || []);
        setSearchPostcode(savedFilters.searchPostcode || '');
        setSearchRadius(savedFilters.searchRadius || 10);
        setUserLat(savedFilters.userLat || null);
        setUserLng(savedFilters.userLng || null);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  };

  const handleSaveFilter = () => {
    try {
      const filterData = {
        searchText,
        selectedCategory,
        sortBy,
        showNearby,
        selectedLanguages: selectedLanguageFilter,
        searchPostcode,
        searchRadius,
        userLat,
        userLng,
      };
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filterData));
      toast({
        title: t('services.filterSaved'),
      });
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  };

  const handleClearSavedFilter = () => {
    try {
      localStorage.removeItem(SAVED_FILTERS_KEY);
      setSearchText('');
      setSelectedCategory('all');
      setSortBy('newest');
      setShowNearby(false);
      setSelectedLanguageFilter([]);
      setSearchPostcode('');
      setSearchRadius(10);
      setUserLat(null);
      setUserLng(null);
      toast({
        title: t('services.filterCleared'),
      });
    } catch (error) {
      console.error('Error clearing saved filter:', error);
    }
  };

  const handleSearchPostcode = async () => {
    if (!searchPostcode.trim()) {
      setUserLat(null);
      setUserLng(null);
      setShowNearby(false);
      return;
    }

    setIsGeocodingPostcode(true);
    try {
      const result = await geocodePostcode(searchPostcode);
      if (result) {
        setUserLat(result.latitude);
        setUserLng(result.longitude);
        setShowNearby(true);
        toast({
          title: t('services.locationFound'),
          description: result.displayName,
        });
      } else {
        toast({
          title: t('services.locationNotFound'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: t('services.locationError'),
        variant: 'destructive',
      });
    } finally {
      setIsGeocodingPostcode(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('id, service_name, description, category, pricing, photos, languages, subscription_tier, latitude, longitude, postcode, city')
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distances and apply filters
  const { servicesWithinRadius, servicesNearby } = useMemo(() => {
    // Calculate distance for each service
    const servicesWithDistance: ServiceWithDistance[] = services.map(service => {
      let distance: number | null = null;
      
      if (showNearby && userLat && userLng && service.latitude && service.longitude) {
        distance = calculateDistance(userLat, userLng, service.latitude, service.longitude);
      }
      
      return { ...service, distance };
    });

    // Apply category and language filters first
    let filtered = servicesWithDistance.filter(service => {
      // Category filter
      if (selectedCategory !== 'all' && service.category !== selectedCategory) {
        return false;
      }
      
      // Language filter
      if (selectedLanguageFilter.length > 0) {
        const hasMatchingLanguage = selectedLanguageFilter.some(lang => 
          service.languages?.includes(lang)
        );
        if (!hasMatchingLanguage) return false;
      }
      
      // Text search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesName = service.service_name?.toLowerCase().includes(searchLower);
        const matchesDescription = service.description?.toLowerCase().includes(searchLower);
        const matchesPostcode = service.postcode?.toLowerCase().includes(searchLower);
        const matchesCity = service.city?.toLowerCase().includes(searchLower);
        return matchesName || matchesDescription || matchesPostcode || matchesCity;
      }
      
      return true;
    });

    // Sort by distance if nearby filter is active
    if (showNearby && userLat && userLng) {
      filtered = filtered.sort((a, b) => {
        // Prioritize services with location data
        if (a.distance === null && b.distance !== null) return 1;
        if (a.distance !== null && b.distance === null) return -1;
        if (a.distance === null && b.distance === null) return 0;
        return (a.distance || 0) - (b.distance || 0);
      });

      const withinRadius = filtered.filter(s => s.distance !== null && s.distance <= searchRadius);
      const nearbyRange = filtered.filter(s => 
        s.distance !== null && s.distance > searchRadius && s.distance <= searchRadius + 20
      );

      // If nothing within radius, show nearest anyway
      if (withinRadius.length === 0 && nearbyRange.length === 0) {
        const withLocation = filtered.filter(s => s.distance !== null);
        return {
          servicesWithinRadius: withLocation.slice(0, 10),
          servicesNearby: [],
        };
      }

      return {
        servicesWithinRadius: withinRadius,
        servicesNearby: nearbyRange,
      };
    }

    // Apply regular sorting
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'price') {
        const priceA = parseFloat(a.pricing?.replace(/[^0-9.]/g, '') || '0');
        const priceB = parseFloat(b.pricing?.replace(/[^0-9.]/g, '') || '0');
        return priceA - priceB;
      }
      // Default: Premium first
      const aIsPremium = a.subscription_tier === 'top' || a.subscription_tier === 'premium';
      const bIsPremium = b.subscription_tier === 'top' || b.subscription_tier === 'premium';
      if (aIsPremium && !bIsPremium) return -1;
      if (!aIsPremium && bIsPremium) return 1;
      return 0;
    });

    return {
      servicesWithinRadius: filtered,
      servicesNearby: [],
    };
  }, [services, showNearby, userLat, userLng, searchRadius, selectedCategory, selectedLanguageFilter, searchText, sortBy]);

  const formatDistance = (distance: number | null) => {
    if (distance === null) return null;
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance.toFixed(1)} km`;
  };

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
              placeholder={t('services.searchPlaceholder')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Location Filter */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {t('services.locationFilter')}
            </label>
            <div className="flex gap-2">
              <Input
                placeholder={t('services.postcodePlaceholder')}
                value={searchPostcode}
                onChange={(e) => setSearchPostcode(e.target.value.toUpperCase())}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPostcode()}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSearchPostcode}
                disabled={isGeocodingPostcode}
              >
                {isGeocodingPostcode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('services.search')
                )}
              </Button>
            </div>
            {showNearby && userLat && userLng && (
              <div className="flex gap-2 items-center">
                <label className="text-sm text-muted-foreground">{t('services.radius')}:</label>
                <Select value={searchRadius.toString()} onValueChange={(val) => setSearchRadius(parseInt(val))}>
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {RADIUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNearby(false);
                    setUserLat(null);
                    setUserLng(null);
                    setSearchPostcode('');
                  }}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Filters Row */}
          <div className="flex gap-2 items-center flex-wrap">
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder={t('services.category')} />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">{t('services.allCategories')}</SelectItem>
                <SelectItem value="repair">{t('addService.categories.repair')}</SelectItem>
                <SelectItem value="beauty">{t('addService.categories.beauty')}</SelectItem>
                <SelectItem value="construction">{t('addService.categories.construction')}</SelectItem>
                <SelectItem value="cleaning">{t('addService.categories.cleaning')}</SelectItem>
                <SelectItem value="delivery">{t('addService.categories.delivery')}</SelectItem>
                <SelectItem value="food">{t('addService.categories.food')}</SelectItem>
                <SelectItem value="transport">{t('addService.categories.transport')}</SelectItem>
                <SelectItem value="legal">{t('addService.categories.legal')}</SelectItem>
                <SelectItem value="accounting">{t('addService.categories.accounting')}</SelectItem>
                <SelectItem value="translation">{t('addService.categories.translation')}</SelectItem>
                <SelectItem value="education">{t('addService.categories.education')}</SelectItem>
                <SelectItem value="healthcare">{t('addService.categories.healthcare')}</SelectItem>
                <SelectItem value="housing">{t('addService.categories.housing')}</SelectItem>
                <SelectItem value="car_services">{t('addService.categories.car_services')}</SelectItem>
                <SelectItem value="other">{t('addService.categories.other')}</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'newest' | 'price' | 'distance')}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="newest">{t('services.newest')}</SelectItem>
                <SelectItem value="price">{t('services.priceLowToHigh')}</SelectItem>
                {showNearby && <SelectItem value="distance">{t('services.sortByDistance')}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          
          {/* Language Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              {t('services.languageFilter')}
            </label>
            <LanguageMultiSelect
              selectedLanguages={selectedLanguageFilter}
              onChange={setSelectedLanguageFilter}
              placeholder={t('services.allLanguages')}
            />
          </div>

          {/* Save/Clear Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveFilter}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {t('services.saveFilter')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSavedFilter}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              {t('services.clearSavedFilter')}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : servicesWithinRadius.length === 0 && servicesNearby.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {showNearby ? t('services.noNearbyServices') : t('services.noServices')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Services within radius */}
            {servicesWithinRadius.length > 0 && (
              <div className="space-y-3">
                {showNearby && userLat && userLng && (
                  <h3 className="text-sm font-medium text-foreground">
                    {t('services.servicesWithinRadius').replace('{radius}', searchRadius.toString())}
                  </h3>
                )}
                {servicesWithinRadius.map((service) => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    name={service.service_name}
                    description={service.description}
                    category={service.category}
                    pricing={service.pricing}
                    photo={service.photos?.[0] || null}
                    subscriptionTier={service.subscription_tier}
                    distance={formatDistance(service.distance)}
                    onClick={() => navigate(`/services/${service.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Services nearby (outside radius) */}
            {servicesNearby.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('services.alsoNearby')}
                </h3>
                {servicesNearby.map((service) => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    name={service.service_name}
                    description={service.description}
                    category={service.category}
                    pricing={service.pricing}
                    photo={service.photos?.[0] || null}
                    subscriptionTier={service.subscription_tier}
                    distance={formatDistance(service.distance)}
                    onClick={() => navigate(`/services/${service.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}