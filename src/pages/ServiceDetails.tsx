import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, Phone, MessageCircle, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceDetail {
  id: string;
  service_name: string;
  category: string;
  description: string | null;
  pricing: string | null;
  photos: string[] | null;
  social_links: any;
  user_id: string;
  languages: string[];
}

interface ServiceReview {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_id: string;
}

interface ProfileInfo {
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [providerProfile, setProviderProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    if (id) {
      fetchServiceDetails();
      fetchReviews();
    }
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      
      setService(data);

      // Fetch provider profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, avatar_url, phone')
        .eq('id', data.user_id)
        .single();

      if (profileData) {
        setProviderProfile(profileData);
      }
    } catch (error: any) {
      toast.error('Failed to load service details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select('*')
        .eq('service_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);

      // Check if current user has reviewed
      if (user) {
        const hasReviewed = data?.some(r => r.user_id === user.id);
        setUserHasReviewed(hasReviewed || false);
        
        // Load existing review if any
        const existingReview = data?.find(r => r.user_id === user.id);
        if (existingReview) {
          setUserRating(existingReview.rating);
          setReviewText(existingReview.review_text || '');
        }
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please log in to submit a review');
      navigate('/auth');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const reviewData = {
        service_id: id,
        user_id: user.id,
        rating: userRating,
        review_text: reviewText.trim() || null,
      };

      if (userHasReviewed) {
        // Update existing review
        const { error } = await supabase
          .from('service_reviews')
          .update(reviewData)
          .eq('service_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        const { error } = await supabase
          .from('service_reviews')
          .insert(reviewData);

        if (error) throw error;
        toast.success('Review submitted successfully!');
      }

      await fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallProvider = () => {
    if (providerProfile?.phone) {
      window.location.href = `tel:${providerProfile.phone}`;
    } else {
      toast.error('Phone number not available');
    }
  };

  const handleMessageProvider = () => {
    if (!providerProfile?.phone) {
      toast.error('Phone number not available');
      return;
    }

    // Show options for WhatsApp or Telegram
    const choice = window.confirm(
      'Choose messaging app:\nOK = WhatsApp\nCancel = Telegram'
    );

    if (choice) {
      // WhatsApp
      window.open(`https://wa.me/${providerProfile.phone.replace(/\D/g, '')}`, '_blank');
    } else {
      // Telegram
      window.open(`https://t.me/${providerProfile.phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleSocialLink = (url: string) => {
    window.open(url, '_blank');
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getProviderInitials = () => {
    if (providerProfile?.name) {
      return providerProfile.name.split(' ')[0][0].toUpperCase();
    }
    return 'P';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Service Not Found" showBack />
        <div className="container max-w-4xl mx-auto p-4">
          <p className="text-center text-muted-foreground">
            This service could not be found or is no longer available.
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={service.service_name} showBack />

      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Photo Carousel */}
        {service.photos && service.photos.length > 0 && (
          <Carousel className="w-full">
            <CarouselContent>
              {service.photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <img
                      src={photo}
                      alt={`${service.service_name} - Photo ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {service.photos.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        )}

        {/* Service Info Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{service.service_name}</h1>
              <p className="text-muted-foreground">{service.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold">{getAverageRating()}</span>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {service.pricing && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Price:</span>
              <span className="text-lg text-primary">{service.pricing}</span>
            </div>
          )}

          {service.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">About this service</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          )}

          {service.social_links && Object.keys(service.social_links).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Links</h3>
              <div className="flex gap-2">
                {Object.entries(service.social_links).map(([key, url]: [string, any]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialLink(url)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Provider Info Card */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Service Provider</h3>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={providerProfile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg">{getProviderInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="font-semibold">
                {providerProfile?.name?.split(' ')[0] || 'Service Provider'}
              </p>
              {providerProfile?.phone && (
                <p className="text-sm text-muted-foreground">{providerProfile.phone}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCallProvider}
              variant="default"
              className="flex-1"
              disabled={!providerProfile?.phone}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button
              onClick={handleMessageProvider}
              variant="outline"
              className="flex-1"
              disabled={!providerProfile?.phone}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </Card>

        {/* Rating & Review Section */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">
            {userHasReviewed ? 'Update Your Review' : 'Leave a Review'}
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || userRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium">
              Your Review (Optional)
            </label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this service..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleSubmitReview}
            disabled={submitting || userRating === 0}
            className="w-full"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {userHasReviewed ? 'Update Review' : 'Submit Review'}
          </Button>
        </Card>

        {/* Reviews List */}
        {reviews.length > 0 && (
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Customer Reviews</h3>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
