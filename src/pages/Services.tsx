import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { supabase } from '@/integrations/supabase/client';
import { communityServicesData } from '@/data/communityServicesData';
import { Loader2, Phone, Instagram, Globe, MapPin } from 'lucide-react';

interface Service {
  id: string;
  service_name: string;
  category: string;
  pricing: string | null;
  languages: string[];
}

export default function Services() {
  const { language, t } = useLanguage();
  const { nationality } = useUserPreferences();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [language]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, service_name, category, pricing, languages')
        .eq('status', 'active')
        .contains('languages', [language]);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const communityServices = nationality 
    ? communityServicesData.filter(s => s.nationality === nationality)
    : [];

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      Translation: '🌐',
      Legal: '⚖️',
      Community: '🏢',
      Education: '📚',
      Financial: '💼',
      Transport: '🚗',
      Beauty: '💅',
      Construction: '🔨',
      Cleaning: '🧹',
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('nav.services')} />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Community Services Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Community Services</h2>
          {nationality === 'other' || !nationality ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground">
                No services available for your nationality yet.
              </p>
            </div>
          ) : communityServices.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground">
                No services available yet for your community.
              </p>
            </div>
          ) : (
            communityServices.map(service => (
              <div 
                key={service.id}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  <p className="text-sm text-primary">{service.category}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{service.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${service.phone}`} className="hover:text-primary transition-colors">
                      {service.phone}
                    </a>
                  </div>

                  {service.instagram && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Instagram className="w-4 h-4 flex-shrink-0" />
                      <a 
                        href={`https://instagram.com/${service.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {service.instagram}
                      </a>
                    </div>
                  )}

                  {service.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <a 
                        href={service.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        Visit website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Business Services Section */}
        {services.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold px-1">Business Services</h2>
            {services.map((service) => (
              <Card
                key={service.id}
                icon={getCategoryIcon(service.category)}
                title={service.service_name}
                description={`${service.category} • ${service.pricing || 'Contact for price'}`}
                onClick={() => navigate(`/services/${service.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
