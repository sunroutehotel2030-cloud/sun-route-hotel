import { useState, useEffect } from "react";
import { ExternalLink, Instagram, Globe, Mail, Phone, MapPin, Calendar, Star, Loader2, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoHotel from "@/assets/logo-hotel.jpg";

interface LinktreeLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  is_active: boolean;
  position: number;
  clicks: number;
}

interface LinktreeSettings {
  background_color: string;
  primary_color: string;
  text_color: string;
  button_style: string;
  background_image_url: string | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  link: Link2,
  instagram: Instagram,
  globe: Globe,
  mail: Mail,
  phone: Phone,
  location: MapPin,
  calendar: Calendar,
  star: Star,
};

const Linktree = () => {
  const [links, setLinks] = useState<LinktreeLink[]>([]);
  const [settings, setSettings] = useState<LinktreeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch links
      const { data: linksData, error: linksError } = await supabase
        .from("linktree_links")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (linksError) throw linksError;
      setLinks(linksData || []);

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("linktree_settings")
        .select("*")
        .limit(1)
        .single();

      if (!settingsError && settingsData) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId: string, url: string) => {
    try {
      await supabase.from("linktree_clicks").insert({
        link_id: linkId,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
    
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Link2;
  };

  const getButtonRadius = () => {
    switch (settings?.button_style) {
      case "pill":
        return "9999px";
      case "square":
        return "8px";
      default:
        return "16px";
    }
  };

  const bgColor = settings?.background_color || "#f5f0e8";
  const primaryColor = settings?.primary_color || "#b8860b";
  const textColor = settings?.text_color || "#1a1a1a";
  const bgImage = settings?.background_image_url;

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: bgColor,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for background image */}
      {bgImage && (
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{ backgroundColor: `${bgColor}80` }}
        />
      )}
      
      <div className="relative container max-w-md mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <img
              src={logoHotel}
              alt="Sun Route Hotel"
              className="w-24 h-24 rounded-full object-cover shadow-lg mx-auto"
              style={{ border: `4px solid ${primaryColor}` }}
            />
            <div 
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2"
              style={{ 
                backgroundColor: "#22c55e",
                borderColor: bgImage ? "white" : bgColor 
              }}
            />
          </div>
          <h1 
            className="text-2xl font-bold mt-4"
            style={{ color: textColor }}
          >
            Sun Route Hotel
          </h1>
          <p 
            className="mt-2 opacity-80"
            style={{ color: textColor }}
          >
            Sua hospedagem em Boa Vista - RR
          </p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {links.map((link) => {
            const IconComponent = getIcon(link.icon);
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                className="w-full p-4 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: getButtonRadius(),
                  borderLeft: `4px solid ${primaryColor}`,
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <IconComponent 
                    className="h-6 w-6" 
                    style={{ color: primaryColor }} 
                  />
                </div>
                <span 
                  className="flex-1 text-left font-medium transition-colors"
                  style={{ color: textColor }}
                >
                  {link.title}
                </span>
                <ExternalLink 
                  className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                  style={{ color: primaryColor }}
                />
              </button>
            );
          })}

          {links.length === 0 && (
            <div 
              className="text-center py-12 rounded-2xl"
              style={{ 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: textColor 
              }}
            >
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="opacity-70">Nenhum link disponível</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="text-sm transition-colors hover:opacity-100 opacity-70"
            style={{ color: textColor }}
          >
            Visite nosso site →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Linktree;