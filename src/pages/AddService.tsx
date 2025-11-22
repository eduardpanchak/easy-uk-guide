import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, ImagePlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AddService() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: 'repair', // Default category
    address: '',
    price: '',
    website: '',
    phone: '',
    email: '',
    subscriptionTier: 'standard' as 'standard' | 'top', // Default to standard
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files);
      setPhotos(prev => [...prev, ...newPhotos]);
      toast.success(`${newPhotos.length} ${t('addService.photosAdded')}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceName || !formData.description) {
      toast.error(t('addService.required'));
      return;
    }

    if (!user) {
      toast.error('You must be logged in to add a service');
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting service creation for user:', user.id);
      
      // Upload photos to storage if any
      const photoUrls: string[] = [];
      
      if (photos.length > 0) {
        console.log(`Uploading ${photos.length} photos...`);
        for (const photo of photos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `services/${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, photo);

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
            toast.error(`Failed to upload photo: ${photo.name}`);
            continue; // Skip failed uploads
          }

          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          photoUrls.push(urlData.publicUrl);
        }
        console.log(`Successfully uploaded ${photoUrls.length} photos`);
      }

      // Calculate trial dates (14 days from now)
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const serviceData = {
        user_id: user.id,
        service_name: formData.serviceName,
        description: formData.description,
        category: formData.category,
        address: formData.address || null,
        pricing: formData.price || null,
        social_links: formData.website ? { website: formData.website } : {},
        phone: formData.phone || null,
        email: formData.email || null,
        photos: photoUrls.length > 0 ? photoUrls : null,
        status: 'trial',
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        subscription_tier: formData.subscriptionTier,
        languages: ['en'],
      };

      console.log('Inserting service with data:', serviceData);

      // Insert service into database
      const { data: insertedData, error: insertError } = await supabase
        .from('services')
        .insert(serviceData)
        .select();

      if (insertError) {
        console.error('Service insert error:', insertError);
        throw new Error(insertError.message || 'Failed to insert service');
      }

      console.log('Service created successfully:', insertedData);
      const trialEndDate = trialEnd.toLocaleDateString();
      toast.success(`Service added! Trial ends on ${trialEndDate}`);
      navigate('/account');
    } catch (error) {
      console.error('Error adding service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to add service: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('addService.title')}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Service Name */}
        <div className="space-y-2">
          <Label htmlFor="serviceName" className="text-sm font-medium">
            {t('addService.serviceName')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="serviceName"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleInputChange}
            placeholder={t('addService.serviceNamePlaceholder')}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            {t('addService.description')} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={t('addService.descriptionPlaceholder')}
            rows={4}
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            {t('addService.category')} <span className="text-destructive">*</span>
          </Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="repair">{t('addService.categories.repair')}</option>
            <option value="food">{t('addService.categories.food')}</option>
            <option value="transport">{t('addService.categories.transport')}</option>
            <option value="legal">{t('addService.categories.legal')}</option>
            <option value="accounting">{t('addService.categories.accounting')}</option>
            <option value="translation">{t('addService.categories.translation')}</option>
            <option value="education">{t('addService.categories.education')}</option>
            <option value="healthcare">{t('addService.categories.healthcare')}</option>
            <option value="housing">{t('addService.categories.housing')}</option>
            <option value="other">{t('addService.categories.other')}</option>
          </select>
        </div>

        {/* Subscription Tier */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {t('addService.subscriptionTier')} <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">{t('addService.tierDescription')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Standard Tier */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: 'standard' }))}
              className={`p-4 border-2 rounded-lg transition-all ${
                formData.subscriptionTier === 'standard'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold text-lg">{t('addService.standardTier')}</div>
                <div className="text-2xl font-bold text-primary my-2">£1.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <div className="text-sm text-muted-foreground">{t('addService.standardFeatures')}</div>
              </div>
            </button>

            {/* Top Tier */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: 'top' }))}
              className={`p-4 border-2 rounded-lg transition-all ${
                formData.subscriptionTier === 'top'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold text-lg">{t('addService.topTier')}</div>
                <div className="text-2xl font-bold text-primary my-2">£4.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <div className="text-sm text-muted-foreground">{t('addService.topFeatures')}</div>
              </div>
            </button>
          </div>
          <p className="text-xs text-muted-foreground italic">{t('addService.trialNote')}</p>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            {t('addService.address')}
          </Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder={t('addService.addressPlaceholder')}
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">
            {t('addService.price')}
          </Label>
          <Input
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder={t('addService.pricePlaceholder')}
          />
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('addService.photos')}
          </Label>
          <p className="text-sm text-muted-foreground">{t('addService.photosDesc')}</p>
          <div className="relative">
            <input
              type="file"
              id="photos"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="sr-only"
            />
            <label
              htmlFor="photos"
              className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {photos.length > 0 ? `${photos.length} photo(s) selected` : 'Tap to upload photos'}
              </span>
            </label>
          </div>
        </div>

        {/* Website / Social Media */}
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium">
            {t('addService.website')}
          </Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder={t('addService.websitePlaceholder')}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            {t('addService.phone')}
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder={t('addService.phonePlaceholder')}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t('addService.email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t('addService.emailPlaceholder')}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          <Upload className="h-5 w-5 mr-2" />
          {isSubmitting ? 'Submitting...' : t('addService.submit')}
        </Button>
      </form>
    </div>
  );
}
