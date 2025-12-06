-- Add trial tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS premium_trial_used boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS standard_trial_used boolean NOT NULL DEFAULT false;