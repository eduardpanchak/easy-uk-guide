import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Heart, ListChecks } from 'lucide-react';

export default function Saved() {
  const { savedItems } = useApp();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'nhs': return '🏥';
      case 'checklist': return '✅';
      default: return '📌';
    }
  };

  const handleItemClick = (item: typeof savedItems[0]) => {
    if (item.type === 'document') {
      navigate(`/documents/${item.id}`);
    } else if (item.type === 'nhs') {
      navigate(`/nhs/${item.id}`);
    } else if (item.type === 'checklist') {
      navigate(`/checklists/${item.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Saved" showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6">
        {savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No saved items yet</h2>
            <p className="text-sm text-muted-foreground">
              Save helpful articles and guides for quick access
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedItems.map(item => (
              <Card
                key={item.id}
                icon={getIcon(item.type)}
                title={item.title}
                description={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
