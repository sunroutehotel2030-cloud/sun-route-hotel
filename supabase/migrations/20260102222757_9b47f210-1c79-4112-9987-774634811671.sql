-- Remove the overly permissive public update policy
DROP POLICY IF EXISTS "Anyone can update tracked link clicks" ON public.tracked_links;

-- Create a click logging table for tracked links (similar to linktree_clicks)
CREATE TABLE IF NOT EXISTS public.tracked_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.tracked_links(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  referrer TEXT,
  user_agent TEXT
);

-- Enable RLS on the new table
ALTER TABLE public.tracked_link_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert click records (for tracking)
CREATE POLICY "Anyone can insert tracked link clicks"
ON public.tracked_link_clicks
FOR INSERT
WITH CHECK (true);

-- Only admins can view click records
CREATE POLICY "Admins can view tracked link clicks"
ON public.tracked_link_clicks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger function to auto-increment clicks
CREATE OR REPLACE FUNCTION public.increment_tracked_link_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tracked_links
  SET clicks = clicks + 1
  WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to increment clicks on insert
CREATE TRIGGER on_tracked_link_click
AFTER INSERT ON public.tracked_link_clicks
FOR EACH ROW
EXECUTE FUNCTION public.increment_tracked_link_clicks();