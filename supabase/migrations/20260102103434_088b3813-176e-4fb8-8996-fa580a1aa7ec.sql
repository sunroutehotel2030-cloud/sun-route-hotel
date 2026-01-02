-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Update leads, page_views, whatsapp_clicks policies to be admin-only for reading
DROP POLICY IF EXISTS "Temporary public read for leads" ON public.leads;
DROP POLICY IF EXISTS "Temporary public read for page views" ON public.page_views;
DROP POLICY IF EXISTS "Temporary public read for whatsapp clicks" ON public.whatsapp_clicks;

CREATE POLICY "Admins can read leads"
ON public.leads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read page views"
ON public.page_views
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read whatsapp clicks"
ON public.whatsapp_clicks
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update tracked_links to be admin-only
DROP POLICY IF EXISTS "Anyone can read tracked links" ON public.tracked_links;
DROP POLICY IF EXISTS "Anyone can update tracked link clicks" ON public.tracked_links;
DROP POLICY IF EXISTS "Anyone can insert tracked links" ON public.tracked_links;
DROP POLICY IF EXISTS "Anyone can delete tracked links" ON public.tracked_links;

CREATE POLICY "Admins can manage tracked links"
ON public.tracked_links
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Keep public insert for tracked links clicks (for tracking purposes)
CREATE POLICY "Anyone can read tracked links for redirect"
ON public.tracked_links
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update tracked link clicks"
ON public.tracked_links
FOR UPDATE
USING (true);