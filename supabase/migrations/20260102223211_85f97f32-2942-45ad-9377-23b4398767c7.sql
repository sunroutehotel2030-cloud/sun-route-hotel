-- Fix 1: Ensure user_roles only allows viewing own role (policy already exists, but let's add explicit denial for modifications)
-- Add explicit admin-only management policy for user_roles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Add explicit UPDATE/DELETE denial policies for leads table (only admins should manage leads)
CREATE POLICY "Admins can update leads"
ON public.leads
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));