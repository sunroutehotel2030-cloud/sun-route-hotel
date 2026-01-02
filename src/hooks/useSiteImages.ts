import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Static fallbacks
import heroImageFallback from "@/assets/hero-hotel.jpg";
import logoImageFallback from "@/assets/logo-hotel.jpg";
import roomDoubleFallback from "@/assets/room-double.jpg";
import roomTripleFallback from "@/assets/room-triple.jpg";

interface SiteImage {
  id: string;
  image_key: string;
  image_url: string;
  alt_text: string | null;
}

const fallbacks: Record<string, string> = {
  hero: heroImageFallback,
  logo: logoImageFallback,
  room_double: roomDoubleFallback,
  room_triple: roomTripleFallback,
};

export const useSiteImages = () => {
  const { data: siteImages = [], isLoading } = useQuery({
    queryKey: ["site-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_images")
        .select("*");

      if (error) throw error;
      return data as SiteImage[];
    },
  });

  const getImageUrl = (key: string): string => {
    const image = siteImages.find((img) => img.image_key === key);
    return image?.image_url || fallbacks[key] || "";
  };

  return { getImageUrl, isLoading };
};
