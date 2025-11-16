import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useNavigate } from 'react-router-dom';
import { housingData } from '@/data/housingData';

export default function Housing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Housing" showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {housingData.map(item => (
          <Card
            key={item.id}
            icon={item.icon}
            title={item.title}
            onClick={() => navigate(`/housing/${item.id}`)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
