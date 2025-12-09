import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { advertisingService, Advertisement } from '@/services/advertisingService';
import { 
  Loader2, 
  Plus, 
  Eye, 
  MousePointerClick, 
  Calendar, 
  Trash2, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MyAds() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAds();
    }
  }, [user]);

  const fetchAds = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await advertisingService.getUserAds(user.id);

      if (error) {
        throw error;
      }

      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast({
        title: t('ads.errorLoading'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (ad: Advertisement) => {
    setAdToDelete(ad);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adToDelete) return;

    setIsDeleting(true);

    try {
      // Delete media from storage
      await advertisingService.deleteAdMedia(adToDelete.media_url);

      // Delete ad from database
      const { error } = await advertisingService.deleteAd(adToDelete.id);

      if (error) {
        throw error;
      }

      toast({
        title: t('ads.adDeleted'),
      });

      // Refresh list
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: t('ads.errorDeleting'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setAdToDelete(null);
    }
  };

  const handleRenew = async (ad: Advertisement) => {
    try {
      const { error } = await advertisingService.renewAd(ad.id, 7);

      if (error) {
        throw error;
      }

      toast({
        title: t('ads.adRenewed'),
      });

      fetchAds();
    } catch (error) {
      console.error('Error renewing ad:', error);
      toast({
        title: t('ads.errorRenewing'),
        variant: 'destructive',
      });
    }
  };

  const getDaysRemaining = (expiresAt: string): number => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getStatusBadge = (ad: Advertisement) => {
    const daysRemaining = getDaysRemaining(ad.expires_at);

    if (ad.status === 'pending') {
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-600">
          {t('ads.statusPending')}
        </span>
      );
    }

    if (ad.status === 'expired' || daysRemaining === 0) {
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive">
          {t('ads.statusExpired')}
        </span>
      );
    }

    if (ad.status === 'cancelled') {
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {t('ads.statusCancelled')}
        </span>
      );
    }

    return (
      <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
        {t('ads.statusActive')}
      </span>
    );
  };

  if (!user) {
    return <Navigate to="/auth" state={{ returnTo: '/advertising/my-ads' }} replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('ads.myAds')} showBack />

      <div className="container mx-auto p-4 space-y-4">
        <Button
          onClick={() => navigate('/advertising/add')}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('ads.addAdvertisement')}
        </Button>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('ads.noAds')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => {
              const daysRemaining = getDaysRemaining(ad.expires_at);
              const isExpired = daysRemaining === 0 || ad.status === 'expired';

              return (
                <div
                  key={ad.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  {/* Media Preview */}
                  <div className="relative aspect-video bg-muted">
                    {ad.media_type === 'photo' ? (
                      <img
                        src={ad.media_url}
                        alt="Ad"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={ad.media_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(ad)}
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="p-4 space-y-3">
                    {/* Target URL */}
                    <a
                      href={ad.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">{ad.target_url}</span>
                    </a>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{ad.impressions}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="h-4 w-4" />
                        <span>{ad.clicks}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {isExpired 
                            ? t('ads.expired')
                            : `${daysRemaining} ${t('ads.daysLeft')}`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isExpired && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRenew(ad)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {t('ads.renew')}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className={isExpired ? 'flex-1' : 'w-full'}
                        onClick={() => handleDeleteClick(ad)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('ads.delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ads.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('ads.deleteConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('lists.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('ads.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
