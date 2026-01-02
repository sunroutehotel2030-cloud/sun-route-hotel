-- Create table for room gallery images
CREATE TABLE public.room_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_gallery ENABLE ROW LEVEL SECURITY;

-- Anyone can view room gallery images
CREATE POLICY "Anyone can view room gallery"
ON public.room_gallery
FOR SELECT
USING (true);

-- Admins can manage room gallery
CREATE POLICY "Admins can manage room gallery"
ON public.room_gallery
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_room_gallery_room_type ON public.room_gallery(room_type, position);