import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAnalytics = () => {
  useEffect(() => {
    const trackPageView = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source") || null;

      await supabase.from("page_views").insert({
        utm_source: utmSource,
        page_path: window.location.pathname,
      });
    };

    trackPageView();
  }, []);
};

export const trackWhatsAppClick = async (utmSource: string | null) => {
  await supabase.from("whatsapp_clicks").insert({
    utm_source: utmSource,
  });
};

export const trackLead = async (data: {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  utmSource: string | null;
}) => {
  await supabase.from("leads").insert({
    check_in: data.checkIn.toISOString().split("T")[0],
    check_out: data.checkOut.toISOString().split("T")[0],
    guests: data.guests,
    utm_source: data.utmSource,
  });
};
