import { useState, useEffect } from "react";
import { ExternalLink, Instagram, Globe, Mail, Phone, MapPin, Calendar, Star, Loader2, Link2, Facebook, Twitter, Youtube, Linkedin, MessageCircle, Send, Music, Camera, Video, ShoppingBag, CreditCard, Heart, Home, Info, FileText, Clock, Bed, Coffee, Utensils, Wifi, Car, Plane, Ship } from "lucide-react";
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
  logo_url: string | null;
  profile_title: string;
  profile_description: string | null;
  shadow_style: string;
  animation_style: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  link: Link2, instagram: Instagram, globe: Globe, mail: Mail, phone: Phone, location: MapPin,
  calendar: Calendar, star: Star, facebook: Facebook, twitter: Twitter, youtube: Youtube,
  linkedin: Linkedin, whatsapp: MessageCircle, telegram: Send, tiktok: Music, music: Music,
  camera: Camera, video: Video, shopping: ShoppingBag, payment: CreditCard, heart: Heart,
  home: Home, info: Info, file: FileText, clock: Clock, bed: Bed, coffee: Coffee,
  utensils: Utensils, wifi: Wifi, car: Car, plane: Plane, ship: Ship,
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
      const { data: linksData, error: linksError } = await supabase
        .from("linktree_links")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (linksError) throw linksError;
      setLinks(linksData || []);

      const { data: settingsData, error: settingsError } = await supabase
        .from("linktree_settings")
        .select("*")
        .limit(1)
        .single();

      if (!settingsError && settingsData) {
        setSettings(settingsData as LinktreeSettings);
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

  const getIcon = (iconName: string) => iconMap[iconName] || Link2;

  const getButtonRadius = () => {
    switch (settings?.button_style) {
      case "pill": return "9999px";
      case "square": return "8px";
      default: return "16px";
    }
  };

  const getShadow = () => {
    switch (settings?.shadow_style) {
      case "none": return "none";
      case "light": return "0 2px 4px rgba(0,0,0,0.05)";
      case "heavy": return "0 8px 30px rgba(0,0,0,0.15)";
      default: return "0 4px 12px rgba(0,0,0,0.1)";
    }
  };

  const bgColor = settings?.background_color || "#f5f0e8";
  const primaryColor = settings?.primary_color || "#b8860b";
  const textColor = settings?.text_color || "#1a1a1a";
  const bgImage = settings?.background_image_url;
  const logoUrl = settings?.logo_url || logoHotel;
  const profileTitle = settings?.profile_title || "Sun Route Hotel";
  const profileDescription = settings?.profile_description || "Sua hospedagem em Boa Vista - RR";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, backgroundImage: bgImage ? `url(${bgImage})` : undefined, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      {bgImage && <div className="fixed inset-0 pointer-events-none" style={{ backgroundColor: `${bgColor}80` }} />}
      
      <div className="relative container max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative inline-block">
            <img src={logoUrl} alt={profileTitle} className="w-24 h-24 rounded-full object-cover shadow-lg mx-auto transition-transform duration-300 hover:scale-105" style={{ border: `4px solid ${primaryColor}` }} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2" style={{ backgroundColor: "#22c55e", borderColor: bgImage ? "white" : bgColor }} />
          </div>
          <h1 className="text-2xl font-bold mt-4" style={{ color: textColor }}>{profileTitle}</h1>
          {profileDescription && <p className="mt-2 opacity-80" style={{ color: textColor }}>{profileDescription}</p>}
        </div>

        <div className="space-y-4">
          {links.map((link, index) => {
            const IconComponent = getIcon(link.icon);
            return (
              <button key={link.id} onClick={() => handleLinkClick(link.id, link.url)} className="w-full p-4 flex items-center gap-4 group relative overflow-hidden transition-all duration-300 hover:-translate-y-1" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", borderRadius: getButtonRadius(), borderLeft: `4px solid ${primaryColor}`, boxShadow: getShadow(), animationDelay: `${index * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${primaryColor}15` }}>
                  <IconComponent className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <span className="flex-1 text-left font-medium transition-all duration-300 group-hover:translate-x-1" style={{ color: textColor }}>{link.title}</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ color: primaryColor }} />
              </button>
            );
          })}

          {links.length === 0 && (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", color: textColor }}>
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="opacity-70">Nenhum link disponível</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="text-sm transition-all duration-300 hover:opacity-100 opacity-70 inline-flex items-center gap-1 group" style={{ color: textColor }}>
            Visite nosso site <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Linktree;
