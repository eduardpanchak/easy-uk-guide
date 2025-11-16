import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'uk' as const, name: 'Українська', flag: '🇺🇦' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' }
  ];

  const currentLanguage = languages.find(l => l.code === language);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('settings.title')} />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full">
              <Card
                icon="🌐"
                title={t('settings.language')}
                description={`${currentLanguage?.flag} ${currentLanguage?.name}`}
              />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{t('settings.language')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-4">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    toast.success(`${t('settings.language')}: ${lang.name}`);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium text-foreground">{lang.name}</span>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        <Card
          icon="ℹ️"
          title={t('settings.about')}
          description={t('settings.aboutDesc')}
          onClick={() => toast.info(t('messages.aboutInfo'))}
        />
        
        <Card
          icon="💬"
          title={t('settings.feedback')}
          description={t('settings.feedbackDesc')}
          onClick={() => toast.success(t('messages.feedbackInfo'))}
        />
      </div>

      <BottomNav />
    </div>
  );
}
