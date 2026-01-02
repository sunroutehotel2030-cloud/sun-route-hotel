import { useState, useEffect } from "react";
import { ExternalLink, Instagram, Globe, Mail, Phone, MapPin, Calendar, Star, Loader2 } from "lucide-react";
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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  link: ExternalLink,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("linktree_links")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching links:", error);
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
    return iconMap[iconName] || ExternalLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/30">
      <div className="container max-w-md mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <img
              src={logoHotel}
              alt="Sun Route Hotel"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary shadow-lg mx-auto"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mt-4">
            Sun Route Hotel
          </h1>
          <p className="text-muted-foreground mt-2">
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
                className="w-full bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground group-hover:text-primary transition-colors">
                  {link.title}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}

          {links.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum link disponível</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Visite nosso site →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Linktree;