-- Drop existing restrictive policy for viewing active ads
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.advertisements;

-- Create new policy allowing ALL users to view active ads (no user-specific restrictions)
CREATE POLICY "Anyone can view active ads" 
ON public.advertisements 
FOR SELECT 
USING (status = 'active' AND expires_at > now());