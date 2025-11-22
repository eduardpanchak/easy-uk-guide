import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Service {
  id: string;
  service_name: string;
  category: string;
  pricing: string | null;
  languages: string[];
}

export default function Services() {
  const { language, t } = useLanguage();
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
      <Header title={t('nav.services')} showBack />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('services.noServices')}
            </p>
          </div>
        ) : (
          services.map((service) => (
            <Card
              key={service.id}
              icon={getCategoryIcon(service.category)}
              title={service.service_name}
              description={`${service.category} • ${service.pricing || 'Contact for price'}`}
              onClick={() => navigate(`/services/${service.id}`)}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
