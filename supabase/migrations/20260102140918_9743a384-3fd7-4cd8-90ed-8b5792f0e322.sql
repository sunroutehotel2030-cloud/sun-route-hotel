-- Create site_images table for storing image references
CREATE TABLE public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_key text UNIQUE NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view site images (for displaying on the site)
CREATE POLICY "Anyone can view site images"
ON public.site_images
FOR SELECT
USING (true);

-- Admins can manage site images
CREATE POLICY "Admins can manage site images"
ON public.site_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for site images
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true);

-- Storage policies for site-images bucket
CREATE POLICY "Anyone can view site images files"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload site images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site images"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-images' AND has_role(auth.uid(), 'admin'::app_role));