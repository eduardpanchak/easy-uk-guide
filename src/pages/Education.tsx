import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useNavigate } from 'react-router-dom';
import { educationData } from '@/data/educationData';

export default function Education() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Education" showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {educationData.map(item => (
          <Card
            key={item.id}
            icon={item.icon}
            title={item.title}
            onClick={() => navigate(`/education/${item.id}`)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
