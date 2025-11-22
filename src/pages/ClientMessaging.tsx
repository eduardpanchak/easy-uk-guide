import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ClientMessaging() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('clientMessaging.title')} showBack />
      
      <div className="p-4">
        <div className="bg-card rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            {t('clientMessaging.placeholder')}
          </p>
        </div>
      </div>
    </div>
  );
}
