-- Create linktree_settings table for customization
CREATE TABLE public.linktree_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  background_color TEXT DEFAULT '#f5f0e8',
  primary_color TEXT DEFAULT '#b8860b',
  text_color TEXT DEFAULT '#1a1a1a',
  button_style TEXT DEFAULT 'rounded',
  background_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.linktree_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view linktree settings"
ON public.linktree_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage linktree settings"
ON public.linktree_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.linktree_settings (id) VALUES (gen_random_uuid());

-- Create storage bucket for linktree backgrounds
INSERT INTO storage.buckets (id, name, public) VALUES ('linktree', 'linktree', true);

-- Create storage policies
CREATE POLICY "Anyone can view linktree files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'linktree');

CREATE POLICY "Admins can upload linktree files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'linktree' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update linktree files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'linktree' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete linktree files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'linktree' AND public.has_role(auth.uid(), 'admin'));