-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Anyone can view service reviews" ON public.service_reviews;

-- Create a new policy that allows viewing reviews for both active AND trial services
CREATE POLICY "Anyone can view service reviews" 
ON public.service_reviews 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM services 
    WHERE services.id = service_reviews.service_id 
    AND (services.status = 'active' OR services.status = 'trial')
  )
);