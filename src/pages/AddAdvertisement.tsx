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
import { LanguageMultiSelect } from '@/components/LanguageMultiSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateUKPostcode, UK_CITIES, LONDON_BOROUGHS, getCityLabel, getBoroughLabel } from '@/lib/ukLocation';
import { geocodePostcode } from '@/lib/geocoding';
import { Loader2, Upload, Image, Video, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'beauty', labelKey: 'categories.beauty' },
  { value: 'construction', labelKey: 'categories.construction' },
  { value: 'cleaning', labelKey: 'categories.cleaning' },
  { value: 'delivery', labelKey: 'categories.delivery' },
  { value: 'health', labelKey: 'categories.health' },
  { value: 'education', labelKey: 'categories.education' },
  { value: 'car', labelKey: 'categories.car' },
  { value: 'repair', labelKey: 'categories.repair' },
  { value: 'food', labelKey: 'categories.food' },
  { value: 'transport', labelKey: 'categories.transport' },
  { value: 'legal', labelKey: 'categories.legal' },
  { value: 'finance', labelKey: 'categories.finance' },
  { value: 'other', labelKey: 'categories.other' },
];

export default function AddAdvertisement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetUrl, setTargetUrl] = useState('');
  const [category, setCategory] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [city, setCity] = useState('london');
  const [borough, setBorough] = useState('');
  const [postcode, setPostcode] = useState('');
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [address, setAddress] = useState('');
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

  const isFormValid = () => {
    return (
      mediaFile &&
      mediaType &&
      targetUrl.trim() &&
      category &&
      selectedLanguages.length > 0 &&
      city &&
      postcode.trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast({
        title: t('ads.fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    // Validate postcode (required and must be valid UK format)
    const postcodeValidation = validateUKPostcode(postcode);
    if (!postcodeValidation.isValid) {
      setPostcodeError(t('validation.postcodeInvalid'));
      toast({
        title: t('validation.postcodeInvalid'),
        variant: 'destructive',
      });
      return;
    }

    const normalizedPostcode = postcodeValidation.normalized;

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
      // Geocode using the validated postcode
      let lat: number | null = null;
      let lng: number | null = null;
      
      const geocodeResult = await geocodePostcode(normalizedPostcode);
      if (geocodeResult) {
        lat = geocodeResult.latitude;
        lng = geocodeResult.longitude;
      } else {
        // If geocoding fails, show error but don't block (postcode is valid format)
        console.warn('Geocoding failed for postcode:', normalizedPostcode);
      }

      // Upload media
      const { url, error: uploadError } = await advertisingService.uploadAdMedia(
        user.id,
        mediaFile!
      );

      if (uploadError || !url) {
        throw new Error('Failed to upload media');
      }

      // Get display value for city/borough
      const cityLabel = getCityLabel(city) || city;
      const boroughLabel = borough ? getBoroughLabel(borough) : null;

      // Create ad via secure RPC (server enforces trial rules)
      const { data: adData, error: createError, requiresPayment } = await advertisingService.createAd(
        user.id,
        url,
        mediaType!,
        targetUrl,
        7, // 7 days duration (only used for trial)
        {
          category,
          languages: selectedLanguages,
          country: 'United Kingdom',
          city: boroughLabel || cityLabel,
          postcode: normalizedPostcode,
          address: address || null,
          latitude: lat,
          longitude: lng,
        }
      );

      if (createError) {
        throw createError;
      }

      if (requiresPayment) {
        // User has already used their trial, redirect to payment
        toast({
          title: t('ads.trialUsed'),
          description: t('ads.trialUsedDesc'),
        });
        // Store the ad ID for payment flow
        localStorage.setItem('pendingAdPayment', adData?.id || '');
        navigate('/advertising/my-ads');
      } else {
        // Trial ad created successfully
        toast({
          title: t('ads.adCreated'),
          description: t('ads.adCreatedDesc'),
        });
        navigate('/advertising/my-ads');
      }
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
            <Label htmlFor="targetUrl">{t('ads.targetUrl')} *</Label>
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

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">{t('ads.category')} *</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
              required
            >
              <option value="">{t('ads.selectCategory')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {t(cat.labelKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label>{t('ads.languages')} *</Label>
            <LanguageMultiSelect
              selectedLanguages={selectedLanguages}
              onChange={setSelectedLanguages}
              placeholder={t('ads.selectLanguages')}
            />
            <p className="text-xs text-muted-foreground">
              {t('ads.languagesHint')}
            </p>
          </div>

          {/* Location Section */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <Label className="text-base font-semibold">{t('ads.locationSection')}</Label>
            <p className="text-sm text-muted-foreground">{t('addService.locationDescription')}</p>
            
            {/* Country (fixed) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {t('ads.country')}
              </Label>
              <div className="px-3 py-2 border border-border rounded-lg bg-muted/50 text-muted-foreground">
                🇬🇧 United Kingdom
              </div>
            </div>
            
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">{t('ads.city')} *</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder={t('addService.selectCity')} />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {UK_CITIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Borough (only for London) */}
            {city === 'london' && (
              <div className="space-y-2">
                <Label htmlFor="borough">
                  {t('addService.borough')}
                  <span className="text-muted-foreground text-xs ml-1">({t('addService.recommended')})</span>
                </Label>
                <Select 
                  value={borough || 'none'} 
                  onValueChange={(val) => setBorough(val === 'none' ? '' : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('addService.selectBorough')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background max-h-[300px]">
                    <SelectItem value="none">{t('addService.noBorough')}</SelectItem>
                    {LONDON_BOROUGHS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Postcode */}
            <div className="space-y-2">
              <Label htmlFor="postcode">{t('ads.postcode')} *</Label>
              <Input
                id="postcode"
                value={postcode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setPostcode(value);
                  setPostcodeError(null);
                }}
                placeholder={t('addService.postcodePlaceholder')}
                className={postcodeError ? 'border-destructive' : ''}
              />
              {postcodeError && (
                <p className="text-sm text-destructive">{postcodeError}</p>
              )}
              <p className="text-xs text-muted-foreground">{t('addService.postcodeHint')}</p>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                {t('ads.address')}
                <span className="text-muted-foreground text-xs ml-1">({t('common.optional')})</span>
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('addService.addressPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">{t('addService.addressHint')}</p>
            </div>
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
            disabled={isUploading || !isFormValid()}
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