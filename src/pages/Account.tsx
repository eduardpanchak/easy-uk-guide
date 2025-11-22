import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { ChevronRight, User, Briefcase, Info, MessageSquare, HelpCircle, LogOut, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function Account() {
  const navigate = useNavigate();
  const { profile, user, subscription, checkSubscription, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    // Check for success/cancel params
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Subscription activated successfully!');
      checkSubscription();
      // Clean up URL
      window.history.replaceState({}, '', '/account');
    } else if (params.get('canceled') === 'true') {
      toast.info('Checkout canceled');
      // Clean up URL
      window.history.replaceState({}, '', '/account');
    }
  }, [checkSubscription]);

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

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" state={{ returnTo: '/account' }} replace />;
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
          <h3 className="text-sm font-medium text-muted-foreground px-4">Subscription</h3>
          
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Crown className={`w-5 h-5 ${subscription?.subscribed ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <span className="font-medium block">Subscription Status</span>
                  <span className={`text-sm ${subscription?.subscribed ? 'text-primary' : 'text-muted-foreground'}`}>
                    {subscription?.subscribed ? 'Pro' : 'Free'}
                  </span>
                </div>
              </div>
            </div>
            
            {subscription?.subscribed ? (
              <div className="space-y-3">
                {subscription.subscription_end && (
                  <p className="text-sm text-muted-foreground">
                    Renews on {new Date(subscription.subscription_end).toLocaleDateString()}
                  </p>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Manage Subscription
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upgrade to Pro - £9.99/year
              </Button>
            )}
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
