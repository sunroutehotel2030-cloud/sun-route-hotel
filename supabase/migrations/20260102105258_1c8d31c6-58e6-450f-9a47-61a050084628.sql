-- Create linktree_links table
CREATE TABLE public.linktree_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'link',
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.linktree_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active linktree links"
ON public.linktree_links
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage linktree links"
ON public.linktree_links
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create linktree_clicks table for detailed analytics
CREATE TABLE public.linktree_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.linktree_links(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  referrer TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.linktree_clicks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clicks
CREATE POLICY "Anyone can insert linktree clicks"
ON public.linktree_clicks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view linktree clicks"
ON public.linktree_clicks
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update clicks count
CREATE OR REPLACE FUNCTION public.increment_linktree_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.linktree_links
  SET clicks = clicks + 1, updated_at = now()
  WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-increment clicks
CREATE TRIGGER on_linktree_click
AFTER INSERT ON public.linktree_clicks
FOR EACH ROW
EXECUTE FUNCTION public.increment_linktree_clicks();