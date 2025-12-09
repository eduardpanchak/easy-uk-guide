import React, { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { advertisingService } from '@/services/advertisingService';
import { Loader2, Upload, Image, Video, X } from 'lucide-react';

export default function AddAdvertisement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetUrl, setTargetUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  if (!user) {
    return <Navigate to="/auth" state={{ returnTo: '/advertising/add' }} replace />;
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsValidating(true);

    try {
      const isVideo = file.type.startsWith('video/');
      const type = isVideo ? 'video' : 'photo';

      // Validate the file
      const validation = isVideo
        ? await advertisingService.validateVideo(file)
        : await advertisingService.validateImage(file);

      if (!validation.valid) {
        toast({
          title: t('ads.validationError'),
          description: t(validation.error || 'ads.invalidFile'),
          variant: 'destructive',
        });
        return;
      }

      // Set media
      setMediaFile(file);
      setMediaType(type);
      setMediaPreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Error validating file:', error);
      toast({
        title: t('ads.validationError'),
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const clearMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mediaFile || !mediaType || !targetUrl.trim()) {
      toast({
        title: t('ads.fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    // Validate URL
    try {
      new URL(targetUrl);
    } catch {
      toast({
        title: t('ads.invalidUrl'),
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload media
      const { url, error: uploadError } = await advertisingService.uploadAdMedia(
        user.id,
        mediaFile
      );

      if (uploadError || !url) {
        throw new Error('Failed to upload media');
      }

      // Create ad (pending status - will be activated after payment)
      const { error: createError } = await advertisingService.createAd(
        user.id,
        url,
        mediaType,
        targetUrl,
        7 // 7 days duration
      );

      if (createError) {
        throw createError;
      }

      toast({
        title: t('ads.adCreated'),
        description: t('ads.adCreatedDesc'),
      });

      // Navigate to my ads page
      navigate('/advertising/my-ads');
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({
        title: t('ads.errorCreating'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('ads.addAdvertisement')} showBack />

      <div className="container mx-auto p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Upload */}
          <div className="space-y-2">
            <Label>{t('ads.mediaLabel')}</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {t('ads.mediaRequirements')}
            </p>

            {mediaPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-2 right-2 z-10 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
                {mediaType === 'photo' ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full aspect-video object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {isValidating ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t('ads.clickToUpload')}
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Image className="h-4 w-4" />
                        <span>JPG, PNG, WebP (5MB)</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Video className="h-4 w-4" />
                        <span>MP4, WebM (10MB, 5s)</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Target URL */}
          <div className="space-y-2">
            <Label htmlFor="targetUrl">{t('ads.targetUrl')}</Label>
            <Input
              id="targetUrl"
              type="url"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t('ads.targetUrlHint')}
            </p>
          </div>

          {/* Pricing Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">{t('ads.pricing')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('ads.pricingInfo')}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isUploading || !mediaFile || !targetUrl.trim()}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('ads.createAd')}
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
