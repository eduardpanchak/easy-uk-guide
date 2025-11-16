import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useNavigate } from 'react-router-dom';
import { jobsData } from '@/data/jobsData';

export default function Jobs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Jobs & Work" showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {jobsData.map(item => (
          <Card
            key={item.id}
            icon={item.icon}
            title={item.title}
            onClick={() => navigate(`/jobs/${item.id}`)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
