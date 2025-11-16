import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { toast } from 'sonner';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Settings" />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        <Card
          icon="🌐"
          title="Language"
          description="English (UK)"
          onClick={() => toast.info('Language switching coming soon')}
        />
        
        <Card
          icon="ℹ️"
          title="About Easy UK"
          description="Version 1.0.0"
          onClick={() => toast.info('A simple assistant for migrants living in the UK')}
        />
        
        <Card
          icon="💬"
          title="Send Feedback"
          description="Help us improve"
          onClick={() => toast.success('Thank you for your interest! Feedback feature coming soon.')}
        />
      </div>

      <BottomNav />
    </div>
  );
}
