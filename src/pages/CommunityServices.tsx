import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { communityServicesData } from '@/data/communityServicesData';
import { Phone, Instagram, Globe, MapPin } from 'lucide-react';

export default function CommunityServices() {
  const { nationality } = useUserPreferences();

  const services = nationality 
    ? communityServicesData.filter(s => s.nationality === nationality)
    : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Community Services" />
      
      <div className="max-w-md mx-auto px-4 py-6">
        {nationality === 'other' || !nationality ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-muted-foreground">
              No services available for your nationality yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later or change your nationality in Settings.
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-muted-foreground">
              No services available yet for your community.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(service => (
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
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
