import { supabase } from "@/integrations/supabase/client";

export interface Advertisement {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'photo' | 'video';
  target_url: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'payment_required';
  impressions: number;
  clicks: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  category?: string;
  languages?: string[];
  country?: string;
  city?: string;
  postcode?: string;
  address?: string | null;
  is_paid?: boolean;
  paid_until?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_trial?: boolean;
  trial_started_at?: string | null;
  trial_ended_at?: string | null;
}

export interface AdLocationData {
  category: string;
  languages: string[];
  country: string;
  city: string;
  postcode: string;
  address: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

// Validation constants
export const AD_VALIDATION = {
  photo: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    aspectRatio: 16 / 9,
    aspectRatioTolerance: 0.05,
  },
  video: {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxDuration: 5, // seconds
    allowedTypes: ['video/mp4', 'video/webm'],
    aspectRatio: 16 / 9,
    aspectRatioTolerance: 0.05,
  },
};

export const advertisingService = {
  /**
   * Get all active ads for the feed
   */
  async getActiveAds(): Promise<{ data: Advertisement[] | null; error: any }> {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    return { data: data as Advertisement[] | null, error };
  },

  /**
   * Get active ads filtered by category
   */
  async getActiveAdsByCategory(category: string): Promise<{ data: Advertisement[] | null; error: any }> {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    return { data: data as Advertisement[] | null, error };
  },

  /**
   * Get active ads filtered by location (postcode prefix match)
   */
  async getActiveAdsByLocation(postcode: string): Promise<{ data: Advertisement[] | null; error: any }> {
    const postcodePrefix = postcode.split(' ')[0].toUpperCase();
    
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .ilike('postcode', `${postcodePrefix}%`)
      .order('created_at', { ascending: false });

    return { data: data as Advertisement[] | null, error };
  },

  /**
   * Get user's advertisements
   */
  async getUserAds(userId: string): Promise<{ data: Advertisement[] | null; error: any }> {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data as Advertisement[] | null, error };
  },

  /**
   * Check if user can get a free trial for their first ad
   */
  async canGetAdTrial(): Promise<{ canGetTrial: boolean; error: any }> {
    const { data, error } = await supabase.rpc('can_get_ad_trial');
    return { canGetTrial: data === true, error };
  },

  /**
   * Create a new advertisement using secure RPC (enforces trial rules server-side)
   * - First ad: 7-day trial, status='active'
   * - Subsequent ads: status='payment_required', requires payment
   */
  async createAd(
    userId: string,
    mediaUrl: string,
    mediaType: 'photo' | 'video',
    targetUrl: string,
    durationDays: number = 7,
    locationData?: AdLocationData
  ): Promise<{ data: { id: string } | null; error: any; requiresPayment?: boolean }> {
    // Use secure RPC function that enforces trial rules
    const { data: adId, error } = await supabase.rpc('create_advertisement', {
      p_media_url: mediaUrl,
      p_media_type: mediaType,
      p_target_url: targetUrl,
      p_category: locationData?.category || null,
      p_languages: locationData?.languages || ['en'],
      p_country: locationData?.country || null,
      p_city: locationData?.city || null,
      p_postcode: locationData?.postcode || null,
      p_address: locationData?.address || null,
      p_latitude: locationData?.latitude ?? null,
      p_longitude: locationData?.longitude ?? null,
    });

    if (error) {
      return { data: null, error };
    }

    // Fetch the created ad to check its status
    const { data: ad, error: fetchError } = await supabase
      .from('advertisements')
      .select('id, status, is_trial')
      .eq('id', adId)
      .single();

    if (fetchError) {
      return { data: { id: adId }, error: null, requiresPayment: false };
    }

    return { 
      data: { id: adId }, 
      error: null,
      requiresPayment: ad?.status === 'payment_required'
    };
  },

  /**
   * Activate an advertisement (after payment)
   */
  async activateAd(adId: string): Promise<{ data: Advertisement | null; error: any }> {
    const { data, error } = await supabase
      .from('advertisements')
      .update({ status: 'active' })
      .eq('id', adId)
      .select()
      .single();

    return { data: data as Advertisement | null, error };
  },

  /**
   * Renew an advertisement (after payment - 30 days)
   */
  async renewAd(adId: string, durationDays: number = 30): Promise<{ data: Advertisement | null; error: any }> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const { data, error } = await supabase
      .from('advertisements')
      .update({ 
        status: 'active',
        expires_at: expiresAt.toISOString(),
        is_paid: true,
        paid_until: expiresAt.toISOString(),
      })
      .eq('id', adId)
      .select()
      .single();

    return { data: data as Advertisement | null, error };
  },

  /**
   * Mark ad as paid and extend for 30 days using secure RPC
   */
  async markAdAsPaid(adId: string): Promise<{ success: boolean; error: any }> {
    const { data, error } = await supabase.rpc('activate_paid_ad', {
      p_ad_id: adId,
    });

    return { success: data === true, error };
  },

  /**
   * Delete an advertisement
   */
  async deleteAd(adId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', adId);

    return { error };
  },

  /**
   * Upload ad media to storage
   */
  async uploadAdMedia(
    userId: string,
    file: File
  ): Promise<{ url: string | null; error: any }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('advertisements')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data: urlData } = supabase.storage
      .from('advertisements')
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  },

  /**
   * Delete ad media from storage
   */
  async deleteAdMedia(mediaUrl: string): Promise<{ error: any }> {
    const path = mediaUrl.split('/advertisements/')[1];
    if (!path) return { error: null };

    const { error } = await supabase.storage
      .from('advertisements')
      .remove([path]);

    return { error };
  },

  /**
   * Validate image file
   */
  validateImage(file: File): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const { photo } = AD_VALIDATION;

      // Check file type
      if (!photo.allowedTypes.includes(file.type)) {
        resolve({ valid: false, error: 'ads.invalidPhotoType' });
        return;
      }

      // Check file size
      if (file.size > photo.maxSize) {
        resolve({ valid: false, error: 'ads.photoTooLarge' });
        return;
      }

      // Check aspect ratio
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const targetRatio = photo.aspectRatio;
        const tolerance = photo.aspectRatioTolerance;

        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
          resolve({ valid: false, error: 'ads.invalidAspectRatio' });
        } else {
          resolve({ valid: true });
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ valid: false, error: 'ads.invalidImage' });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Validate video file
   */
  validateVideo(file: File): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const { video } = AD_VALIDATION;

      // Check file type
      if (!video.allowedTypes.includes(file.type)) {
        resolve({ valid: false, error: 'ads.invalidVideoType' });
        return;
      }

      // Check file size
      if (file.size > video.maxSize) {
        resolve({ valid: false, error: 'ads.videoTooLarge' });
        return;
      }

      // Check duration and aspect ratio
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
        // Check duration
        if (vid.duration > video.maxDuration) {
          resolve({ valid: false, error: 'ads.videoTooLong' });
          URL.revokeObjectURL(vid.src);
          return;
        }

        // Check aspect ratio
        const aspectRatio = vid.videoWidth / vid.videoHeight;
        const targetRatio = video.aspectRatio;
        const tolerance = video.aspectRatioTolerance;

        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
          resolve({ valid: false, error: 'ads.invalidAspectRatio' });
        } else {
          resolve({ valid: true });
        }
        URL.revokeObjectURL(vid.src);
      };
      vid.onerror = () => {
        resolve({ valid: false, error: 'ads.invalidVideo' });
        URL.revokeObjectURL(vid.src);
      };
      vid.src = URL.createObjectURL(file);
    });
  },
};