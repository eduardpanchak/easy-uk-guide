import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
];

interface LanguageMultiSelectProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function LanguageMultiSelect({
  selectedLanguages,
  onChange,
  placeholder,
  className,
}: LanguageMultiSelectProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      onChange(selectedLanguages.filter(l => l !== code));
    } else {
      onChange([...selectedLanguages, code]);
    }
  };

  const removeLanguage = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedLanguages.filter(l => l !== code));
  };

  const getLanguageByCode = (code: string) => {
    return AVAILABLE_LANGUAGES.find(l => l.code === code);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 border border-border rounded-lg bg-background cursor-pointer hover:border-primary/50 transition-colors"
      >
        {selectedLanguages.length === 0 ? (
          <span className="text-muted-foreground text-sm">
            {placeholder || t('languages.selectLanguages')}
          </span>
        ) : (
          selectedLanguages.map(code => {
            const lang = getLanguageByCode(code);
            if (!lang) return null;
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-2 py-0.5 rounded-full"
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                <button
                  onClick={(e) => removeLanguage(code, e)}
                  className="ml-0.5 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })
        )}
        <ChevronDown className={cn(
          "h-4 w-4 ml-auto text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {AVAILABLE_LANGUAGES.map(lang => (
            <div
              key={lang.code}
              onClick={() => toggleLanguage(lang.code)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors",
                selectedLanguages.includes(lang.code) && "bg-primary/5"
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1 text-sm">{lang.name}</span>
              {selectedLanguages.includes(lang.code) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Badge component for displaying languages
export function LanguageBadge({ code }: { code: string }) {
  const lang = AVAILABLE_LANGUAGES.find(l => l.code === code);
  if (!lang) return null;
  
  return (
    <span className="inline-flex items-center gap-1 bg-muted text-foreground text-xs px-2 py-0.5 rounded-full">
      <span>{lang.flag}</span>
      <span>{lang.name}</span>
    </span>
  );
}
