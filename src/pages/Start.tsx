import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences, Nationality } from '@/contexts/UserPreferencesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/translations';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Start() {
  const navigate = useNavigate();
  const { setNationality, completeOnboarding } = useUserPreferences();
  const { setLanguage } = useLanguage();
  const [selectedNationality, setSelectedNationality] = useState<Nationality | ''>('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | ''>('');

  const nationalities = [
    { value: 'ukrainian', label: 'Ukrainian 🇺🇦' },
    { value: 'russian', label: 'Russian 🇷🇺' },
    { value: 'polish', label: 'Polish 🇵🇱' },
    { value: 'lithuanian', label: 'Lithuanian 🇱🇹' },
    { value: 'latvian', label: 'Latvian 🇱🇻' },
    { value: 'estonian', label: 'Estonian 🇪🇪' },
    { value: 'romanian', label: 'Romanian 🇷🇴' },
    { value: 'bulgarian', label: 'Bulgarian 🇧🇬' },
    { value: 'moldovan', label: 'Moldovan 🇲🇩' },
    { value: 'georgian', label: 'Georgian 🇬🇪' },
    { value: 'armenian', label: 'Armenian 🇦🇲' },
    { value: 'uzbek', label: 'Uzbek 🇺🇿' },
    { value: 'kazakh', label: 'Kazakh 🇰🇿' },
    { value: 'other', label: 'Other 🌍' },
  ];

  // Language mapping based on nationality
  const getAvailableLanguages = (nat: Nationality | ''): Array<{ value: string; label: string }> => {
    if (!nat) {
      return [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'uk', label: 'Українська 🇺🇦' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ];
    }

    const languageMap: Record<Nationality, Array<{ value: string; label: string }>> = {
      'ukrainian': [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'uk', label: 'Українська 🇺🇦' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ],
      'russian': [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ],
      'polish': [
        { value: 'pl', label: 'Polski 🇵🇱' },
        { value: 'en', label: 'English 🇬🇧' },
      ],
      'moldovan': [
        { value: 'ro', label: 'Română 🇷🇴' },
        { value: 'ru', label: 'Русский 🇷🇺' },
        { value: 'en', label: 'English 🇬🇧' },
      ],
      'lithuanian': [
        { value: 'lt', label: 'Lietuvių 🇱🇹' },
        { value: 'en', label: 'English 🇬🇧' },
      ],
      'latvian': [
        { value: 'lv', label: 'Latviešu 🇱🇻' },
        { value: 'ru', label: 'Русский 🇷🇺' },
        { value: 'en', label: 'English 🇬🇧' },
      ],
      'romanian': [
        { value: 'ro', label: 'Română 🇷🇴' },
        { value: 'en', label: 'English 🇬🇧' },
      ],
      // Default for other nationalities
      'estonian': [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'uk', label: 'Українська 🇺🇦' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ],
      'bulgarian': [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'uk', label: 'Українська 🇺🇦' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ],
      'georgian': [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'uk', label: 'Українська 🇺🇦' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ],
      'armenian': [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'uk', label: 'Українська 🇺🇦' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ],
      'uzbek': [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'uk', label: 'Українська 🇺🇦' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ],
      'kazakh': [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'uk', label: 'Українська 🇺🇦' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ],
      'other': [
        { value: 'en', label: 'English 🇬🇧' },
        { value: 'uk', label: 'Українська 🇺🇦' },
        { value: 'ru', label: 'Русский 🇷🇺' },
      ],
    };

    return languageMap[nat] || languageMap['other'];
  };

  const availableLanguages = getAvailableLanguages(selectedNationality);

  const handleContinue = () => {
    if (selectedNationality && selectedLanguage) {
      setNationality(selectedNationality as Nationality);
      setLanguage(selectedLanguage as Language);
      completeOnboarding();
      navigate('/');
    }
  };

  const canContinue = selectedNationality && selectedLanguage;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Easy UK</h1>
          <p className="text-muted-foreground">Your assistant for life in the UK</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select your nationality</label>
            <Select value={selectedNationality} onValueChange={(value) => setSelectedNationality(value as Nationality)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose nationality" />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map(nat => (
                  <SelectItem key={nat.value} value={nat.value}>
                    {nat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            You can change these settings later
          </p>
        </div>
      </div>
    </div>
  );
}
