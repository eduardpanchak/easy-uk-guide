import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { ProRegistrationModal } from '@/components/ProRegistrationModal';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, ChevronRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { subscription } = useAuth();
  const [showProModal, setShowProModal] = useState(false);

  const isPro = subscription?.subscribed || false;

  const handleProClick = (path: string) => {
    if (isPro) {
      navigate(path);
    } else {
      setShowProModal(true);
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
        </div>

        {/* PRO sections */}
        <div className="space-y-3">
          {!isPro && (
            <div className="flex items-center gap-2 pt-2 pb-1">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Pro Features</span>
            </div>
          )}

          <div 
            onClick={() => handleProClick('/jobs')}
            className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary transition-all active:scale-95 flex items-center gap-3 shadow-sm relative cursor-pointer"
          >
            <div className="text-3xl flex-shrink-0">💼</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{t('home.jobs')}</h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{t('home.jobsDesc')}</p>
            </div>
            {isPro ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                PRO
              </div>
            )}
          </div>

          <div 
            onClick={() => handleProClick('/housing')}
            className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary transition-all active:scale-95 flex items-center gap-3 shadow-sm relative cursor-pointer"
          >
            <div className="text-3xl flex-shrink-0">🏠</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{t('home.housing')}</h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{t('home.housingDesc')}</p>
            </div>
            {isPro ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                PRO
              </div>
            )}
          </div>

          <div 
            onClick={() => handleProClick('/benefits')}
            className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary transition-all active:scale-95 flex items-center gap-3 shadow-sm relative cursor-pointer"
          >
            <div className="text-3xl flex-shrink-0">💷</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{t('home.benefits')}</h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{t('home.benefitsDesc')}</p>
            </div>
            {isPro ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                PRO
              </div>
            )}
          </div>

          <div 
            onClick={() => handleProClick('/education')}
            className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary transition-all active:scale-95 flex items-center gap-3 shadow-sm relative cursor-pointer"
          >
            <div className="text-3xl flex-shrink-0">🎓</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{t('home.education')}</h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{t('home.educationDesc')}</p>
            </div>
            {isPro ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                PRO
              </div>
            )}
          </div>
        </div>
      </div>

      <ProRegistrationModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
      <BottomNav />
    </div>
  );
}
