import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/translations';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Start() {
  const navigate = useNavigate();
  const { completeOnboarding } = useUserPreferences();
  const { setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | ''>('');

  const availableLanguages = [
    { value: 'en', label: 'English 🇬🇧' },
    { value: 'uk', label: 'Українська 🇺🇦' },
    { value: 'ru', label: 'Русский 🇷🇺' },
    { value: 'pl', label: 'Polski 🇵🇱' },
    { value: 'lt', label: 'Lietuvių 🇱🇹' },
  ];

  const handleContinue = () => {
    if (selectedLanguage) {
      setLanguage(selectedLanguage as Language);
      completeOnboarding();
      navigate('/');
    }
  };

  const canContinue = selectedLanguage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white animate-[fade-in_0.8s_ease-out,slide-up_0.8s_ease-out]">
            Easy UK
          </h1>
          <p className="text-white/90 text-lg animate-[fade-in_0.6s_ease-out_0.8s_both]">
            Your assistant for life in the UK
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 space-y-6 shadow-2xl animate-[fade-in_0.6s_ease-out_1.4s_both,scale-in_0.6s_ease-out_1.4s_both]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select your language</label>
            <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleContinue} 
            disabled={!canContinue}
            className="w-full"
          >
            Continue
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You can change this later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
