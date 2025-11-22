import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { FileText, Heart, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Saved() {
  const { savedItems } = useApp();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch(type) {
      case 'document': return '📄';
      case 'nhs': return '🏥';
      case 'checklist': return '✅';
      case 'service': return '🤝';
      default: return '📋';
    }
  };

  const handleItemClick = (item: typeof savedItems[0]) => {
    switch(item.type) {
      case 'document':
        navigate(`/documents/${item.id}`);
        break;
      case 'nhs':
        navigate(`/nhs/${item.id}`);
        break;
      case 'checklist':
        navigate(`/checklists/${item.id}`);
        break;
      case 'service':
        navigate(`/services/${item.id}`);
        break;
    }
  };

  const informationItems = savedItems.filter(item => 
    ['document', 'nhs', 'checklist'].includes(item.type)
  );

  const serviceItems = savedItems.filter(item => 
    item.type === 'service'
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Saved" />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <Tabs defaultValue="information" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="information" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Information
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="information" className="space-y-3 mt-4">
            {informationItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No information items saved yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Save documents, NHS info, and checklists to see them here
                </p>
              </div>
            ) : (
              informationItems.map((item) => (
                <Card
                  key={item.id}
                  icon={getIcon(item.type)}
                  title={item.title}
                  description={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  onClick={() => handleItemClick(item)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-3 mt-4">
            {serviceItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No services saved yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Save services to see them here
                </p>
              </div>
            ) : (
              serviceItems.map((item) => (
                <Card
                  key={item.id}
                  icon={getIcon(item.type)}
                  title={item.title}
                  description="Service"
                  onClick={() => handleItemClick(item)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
