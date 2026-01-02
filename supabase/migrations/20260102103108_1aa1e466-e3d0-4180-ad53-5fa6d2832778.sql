-- Create leads table for booking attempts
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  utm_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page_views table for analytics
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  utm_source TEXT,
  page_path TEXT DEFAULT '/'
);

-- Create whatsapp_clicks table
CREATE TABLE public.whatsapp_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  utm_source TEXT
);

-- Create tracked_links table for link tracker
CREATE TABLE public.tracked_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_links ENABLE ROW LEVEL SECURITY;

-- Public insert policies (anyone can submit data)
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert whatsapp clicks" ON public.whatsapp_clicks FOR INSERT WITH CHECK (true);

-- Public read policies for tracked links (needed for redirect)
CREATE POLICY "Anyone can read tracked links" ON public.tracked_links FOR SELECT USING (true);
CREATE POLICY "Anyone can update tracked link clicks" ON public.tracked_links FOR UPDATE USING (true);

-- Admin-only policies will be added when authentication is implemented
-- For now, allow public read for dashboard (temporary - should be secured later)
CREATE POLICY "Temporary public read for leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Temporary public read for page views" ON public.page_views FOR SELECT USING (true);
CREATE POLICY "Temporary public read for whatsapp clicks" ON public.whatsapp_clicks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tracked links" ON public.tracked_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete tracked links" ON public.tracked_links FOR DELETE USING (true);