import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { PaywallModal } from '@/components/PaywallModal';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Crown } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isPro } = useUserPreferences();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleProClick = (path: string) => {
    if (isPro) {
      navigate(path);
    } else {
      setShowPaywall(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('app.title')} showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Free sections */}
        <div className="space-y-3">
          <Card
            icon="📄"
            title={t('home.documents')}
            description={t('home.documentsDesc')}
            onClick={() => navigate('/documents')}
          />
          
          <Card
            icon="🏥"
            title={t('home.nhs')}
            description={t('home.nhsDesc')}
            onClick={() => navigate('/nhs')}
          />
          
          <Card
            icon="✅"
            title={t('home.checklist')}
            description={t('home.checklistDesc')}
            onClick={() => navigate('/checklists')}
          />

          <Card
            icon="🤝"
            title="Community Services"
            description="Find services from your community"
            onClick={() => navigate('/community-services')}
          />
        </div>

        {/* PRO sections */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pt-2 pb-1">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">Pro Features</span>
          </div>

          <Card
            icon="💼"
            title={t('home.jobs')}
            description={t('home.jobsDesc')}
            onClick={() => handleProClick('/jobs')}
            className="relative"
          >
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
              PRO
            </div>
          </Card>

          <Card
            icon="🏠"
            title={t('home.housing')}
            description={t('home.housingDesc')}
            onClick={() => handleProClick('/housing')}
            className="relative"
          >
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
              PRO
            </div>
          </Card>

          <Card
            icon="💷"
            title={t('home.benefits')}
            description={t('home.benefitsDesc')}
            onClick={() => handleProClick('/benefits')}
            className="relative"
          >
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
              PRO
            </div>
          </Card>

          <Card
            icon="🎓"
            title={t('home.education')}
            description={t('home.educationDesc')}
            onClick={() => handleProClick('/education')}
            className="relative"
          >
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
              PRO
            </div>
          </Card>
        </div>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      <BottomNav />
    </div>
  );
}
