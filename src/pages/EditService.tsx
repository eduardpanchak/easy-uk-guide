import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';

export default function EditService() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: 'repair',
    address: '',
    price: '',
    website: '',
    phone: '',
    email: '',
  });
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);

  useEffect(() => {
    if (user && id) {
      fetchService();
    }
  }, [user, id]);

  const fetchService = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        const socialLinks = data.social_links as { website?: string } | null;
        setFormData({
          serviceName: data.service_name || '',
          description: data.description || '',
          category: data.category || 'repair',
          address: data.address || '',
          price: data.pricing || '',
          website: socialLinks?.website || '',
          phone: data.phone || '',
          email: data.email || '',
        });
        setExistingPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service');
      navigate('/my-services');
    } finally {
      setLoading(false);
    }
  };

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
      const newPhotosList = Array.from(files);
      setNewPhotos(prev => [...prev, ...newPhotosList]);
      toast.success(`${newPhotosList.length} photo(s) added`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceName || !formData.description) {
      toast.error(t('addService.required'));
      return;
    }

    // Validate that service has at least one photo
    if (existingPhotos.length === 0 && newPhotos.length === 0) {
      toast.error('Please upload at least one image before saving the service.');
      return;
    }

    if (!user || !id) {
      toast.error('You must be logged in to edit a service');
      return;
    }

    setIsSubmitting(true);

    try {
      // Start with existing photos
      const photoUrls: string[] = [...existingPhotos];
      
      // Upload new photos if any
      if (newPhotos.length > 0) {
        console.log(`Uploading ${newPhotos.length} new photos...`);
        for (const photo of newPhotos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `services/${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, photo);

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
            toast.error(`Failed to upload photo: ${photo.name}`);
            setIsSubmitting(false);
            return; // Stop if upload fails
          }

          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          photoUrls.push(urlData.publicUrl);
        }
        console.log(`Successfully uploaded ${newPhotos.length} photos`);
      }
      
      // Verify at least one photo exists
      if (photoUrls.length === 0) {
        toast.error('Service must have at least one image.');
        setIsSubmitting(false);
        return;
      }

      // Update service in database
      const { error: updateError } = await supabase
        .from('services')
        .update({
          service_name: formData.serviceName,
          description: formData.description,
          category: formData.category,
          address: formData.address || null,
          pricing: formData.price || null,
          social_links: formData.website ? { website: formData.website } : {},
          phone: formData.phone || null,
          email: formData.email || null,
          photos: photoUrls.length > 0 ? photoUrls : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success(t('editService.updated'));
      navigate('/my-services');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(t('editService.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold">{t('editService.title')}</h1>
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
            <option value="beauty">{t('addService.categories.beauty')}</option>
            <option value="construction">{t('addService.categories.construction')}</option>
            <option value="cleaning">{t('addService.categories.cleaning')}</option>
            <option value="delivery">{t('addService.categories.delivery')}</option>
            <option value="food">{t('addService.categories.food')}</option>
            <option value="transport">{t('addService.categories.transport')}</option>
            <option value="legal">{t('addService.categories.legal')}</option>
            <option value="accounting">{t('addService.categories.accounting')}</option>
            <option value="translation">{t('addService.categories.translation')}</option>
            <option value="education">{t('addService.categories.education')}</option>
            <option value="healthcare">{t('addService.categories.healthcare')}</option>
            <option value="housing">{t('addService.categories.housing')}</option>
            <option value="car_services">{t('addService.categories.car_services')}</option>
            <option value="other">{t('addService.categories.other')}</option>
          </select>
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

        {/* Existing Photos */}
        {existingPhotos.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('editService.currentPhotos')}</Label>
            <div className="grid grid-cols-3 gap-2">
              {existingPhotos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img src={photo} alt={`Service photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Photos */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('addService.photos')}
          </Label>
          <p className="text-sm text-muted-foreground">{t('editService.addMore')}</p>
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
                {newPhotos.length > 0 ? `${newPhotos.length} ${t('editService.newPhotos')}` : t('editService.uploadNew')}
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
          <Save className="h-5 w-5 mr-2" />
          {isSubmitting ? t('editService.saving') : t('editService.save')}
        </Button>
      </form>

      <BottomNav />
    </div>
  );
}

