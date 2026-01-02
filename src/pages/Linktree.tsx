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

// CSS animations inline
const buttonAnimations = `
  @keyframes buttonEntrance {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes iconPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

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
      {/* Inject animations */}
      <style>{buttonAnimations}</style>
      
      {/* Overlay for background image */}
      {bgImage && (
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{ backgroundColor: `${bgColor}80` }}
        />
      )}
      
      <div className="relative container max-w-md mx-auto px-4 py-12">
        {/* Profile Header */}
        <div 
          className="text-center mb-10"
          style={{
            animation: "buttonEntrance 0.6s ease-out forwards",
          }}
        >
          <div className="relative inline-block">
            <img
              src={logoHotel}
              alt="Sun Route Hotel"
              className="w-24 h-24 rounded-full object-cover shadow-lg mx-auto transition-transform duration-300 hover:scale-105"
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
          {links.map((link, index) => {
            const IconComponent = getIcon(link.icon);
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                className="w-full p-4 flex items-center gap-4 group relative overflow-hidden"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: getButtonRadius(),
                  borderLeft: `4px solid ${primaryColor}`,
                  animation: `buttonEntrance 0.5s ease-out ${index * 0.1}s forwards`,
                  opacity: 0,
                  transform: "translateY(20px)",
                  transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                  e.currentTarget.style.boxShadow = `0 20px 40px -10px ${primaryColor}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Shimmer effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${primaryColor}10, transparent)`,
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
                
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 relative z-10"
                  style={{ 
                    backgroundColor: `${primaryColor}15`,
                  }}
                >
                  <IconComponent 
                    className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" 
                    style={{ color: primaryColor }} 
                  />
                </div>
                <span 
                  className="flex-1 text-left font-medium transition-all duration-300 group-hover:translate-x-1 relative z-10"
                  style={{ color: textColor }}
                >
                  {link.title}
                </span>
                <ExternalLink 
                  className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 relative z-10" 
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
                color: textColor,
                animation: "buttonEntrance 0.5s ease-out forwards",
              }}
            >
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="opacity-70">Nenhum link disponível</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="mt-12 text-center"
          style={{
            animation: `buttonEntrance 0.5s ease-out ${links.length * 0.1 + 0.3}s forwards`,
            opacity: 0,
          }}
        >
          <a
            href="/"
            className="text-sm transition-all duration-300 hover:opacity-100 opacity-70 inline-flex items-center gap-1 group"
            style={{ color: textColor }}
          >
            Visite nosso site 
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Linktree;