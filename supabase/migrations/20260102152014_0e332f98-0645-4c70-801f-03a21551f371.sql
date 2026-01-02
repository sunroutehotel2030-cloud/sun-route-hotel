-- Add new fields to linktree_settings table
ALTER TABLE public.linktree_settings 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS profile_title TEXT DEFAULT 'Meu Linktree',
ADD COLUMN IF NOT EXISTS profile_description TEXT,
ADD COLUMN IF NOT EXISTS shadow_style TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS animation_style TEXT DEFAULT 'fade';