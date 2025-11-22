import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { servicesData } from '@/data/servicesData';

export default function Services() {
  const { language, t } = useLanguage();

  // Filter services by current app language
  const filteredServices = servicesData.filter(
    service => service.languages.includes(language)
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('nav.services')} showBack />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('services.noServices')}
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card
              key={service.id}
              icon={service.icon}
              title={service.name}
              description={`${service.category} • ${service.pricing || 'Contact for price'}`}
              onClick={() => {
                // Future: navigate to service details
                console.log('Service clicked:', service.id);
              }}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
