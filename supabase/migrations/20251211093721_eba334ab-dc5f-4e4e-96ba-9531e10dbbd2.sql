-- Add paid tracking fields to advertisements
ALTER TABLE public.advertisements 
ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS paid_until timestamp with time zone;