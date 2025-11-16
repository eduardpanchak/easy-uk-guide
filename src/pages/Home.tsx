import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Easy UK 🇬🇧" showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <Card
          icon="📄"
          title="Documents"
          description="NIN, Bank, BRP, GP, Council Tax, Driving Licence"
          onClick={() => navigate('/documents')}
        />
        
        <Card
          icon="🏥"
          title="NHS (Healthcare)"
          description="Find GP, Register, Free Services, Emergency Care"
          onClick={() => navigate('/nhs')}
        />
        
        <Card
          icon="✅"
          title="What to Do After Arriving"
          description="Complete checklist for new arrivals"
          onClick={() => navigate('/checklists')}
        />
      </div>

      <BottomNav />
    </div>
  );
}
