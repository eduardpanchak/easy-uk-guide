import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { ChevronRight, User, Briefcase, Info, MessageSquare, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Account() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();

  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Account" />

      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center space-x-4 p-4 bg-card rounded-lg">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{profile?.name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-4">Profile</h3>
          
          <Card
            title="My Profile"
            icon={User}
            onClick={() => navigate('/my-profile')}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-4">Business</h3>
          
          <Card
            title="Business Account"
            description="Manage your business profile"
            icon={Briefcase}
            onClick={() => navigate('/business-registration')}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-4">Support</h3>
          
          <Card
            title="About EasyUK"
            icon={Info}
            onClick={() => navigate('/about')}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>

          <Card
            title="Feedback"
            icon={MessageSquare}
            onClick={() => navigate('/feedback')}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>

          <Card
            title="FAQ"
            icon={HelpCircle}
            onClick={() => navigate('/faq')}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </div>

        <div className="pt-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
