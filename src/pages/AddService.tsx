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
    address: '',
    price: '',
    website: '',
    phone: '',
    email: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      toast.success(`${newPhotos.length} photo(s) added`);
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
      // Upload photos to storage if any
      const photoUrls: string[] = [];
      
      if (photos.length > 0) {
        for (const photo of photos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars') // Using existing avatars bucket for now
            .upload(fileName, photo);

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
            continue; // Skip failed uploads
          }

          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          photoUrls.push(urlData.publicUrl);
        }
      }

      // Calculate trial dates (14 days from now)
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      // Insert service into database
      const { error: insertError } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          service_name: formData.serviceName,
          description: formData.description,
          address: formData.address || null,
          pricing: formData.price || null,
          social_links: formData.website ? { website: formData.website } : {},
          phone: formData.phone || null,
          email: formData.email || null,
          photos: photoUrls.length > 0 ? photoUrls : null,
          status: 'trial', // Start with 14-day trial
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString(),
          subscription_tier: 'standard', // Default tier
          category: 'general', // Default category
          languages: ['en'], // Default language
        });

      if (insertError) {
        throw insertError;
      }

      const trialEndDate = trialEnd.toLocaleDateString();
      toast.success(`Service added successfully! Your 14-day trial ends on ${trialEndDate}.`);
      navigate('/account');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service. Please try again.');
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
