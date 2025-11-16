import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useNavigate } from 'react-router-dom';
import { documentsData } from '@/data/documentsData';

export default function Documents() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Documents" showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {documentsData.map(doc => (
          <Card
            key={doc.id}
            icon={doc.icon}
            title={doc.title}
            onClick={() => navigate(`/documents/${doc.id}`)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
