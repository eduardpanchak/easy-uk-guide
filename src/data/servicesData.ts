export interface Service {
  id: string;
  name: string;
  category: string;
  languages: string[];
  pricing?: string;
  icon: string;
  businessType: 'normal' | 'top';
}

export const servicesData: Service[] = [
  {
    id: '1',
    name: 'Ukrainian Translation Services',
    category: 'Translation',
    languages: ['uk', 'en'],
    pricing: '£50/hour',
    icon: '🌐',
    businessType: 'normal'
  },
  {
    id: '2',
    name: 'Polish Legal Advice',
    category: 'Legal',
    languages: ['pl', 'en'],
    pricing: '£100/consultation',
    icon: '⚖️',
    businessType: 'top'
  },
  {
    id: '3',
    name: 'Russian Community Center',
    category: 'Community',
    languages: ['ru', 'en'],
    icon: '🏢',
    businessType: 'normal'
  },
  {
    id: '4',
    name: 'Lithuanian Driving Lessons',
    category: 'Education',
    languages: ['lt', 'en'],
    pricing: '£40/lesson',
    icon: '🚗',
    businessType: 'normal'
  },
  {
    id: '5',
    name: 'Romanian Accounting Services',
    category: 'Financial',
    languages: ['ro', 'en'],
    pricing: '£150/month',
    icon: '💼',
    businessType: 'top'
  },
  {
    id: '6',
    name: 'English Language Tutoring',
    category: 'Education',
    languages: ['en', 'uk', 'ru', 'pl'],
    pricing: '£30/hour',
    icon: '📚',
    businessType: 'normal'
  },
];
