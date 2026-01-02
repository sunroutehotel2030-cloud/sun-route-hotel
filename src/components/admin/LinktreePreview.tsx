import { ExternalLink } from "lucide-react";
import { getIconComponent } from "./LinktreeIconPicker";
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

interface LinktreePreviewProps {
  links: LinktreeLink[];
  settings: {
    background_color: string;
    primary_color: string;
    text_color: string;
    button_style: string;
    background_image_url: string | null;
    logo_url?: string | null;
    profile_title?: string;
    profile_description?: string;
    shadow_style?: string;
    animation_style?: string;
  } | null;
}

const LinktreePreview = ({ links, settings }: LinktreePreviewProps) => {
  const bgColor = settings?.background_color || "#f5f0e8";
  const primaryColor = settings?.primary_color || "#b8860b";
  const textColor = settings?.text_color || "#1a1a1a";
  const bgImage = settings?.background_image_url;
  const logoUrl = settings?.logo_url || logoHotel;
  const profileTitle = settings?.profile_title || "Meu Linktree";
  const profileDescription = settings?.profile_description || "";
  const shadowStyle = settings?.shadow_style || "medium";

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

  const getShadow = () => {
    switch (shadowStyle) {
      case "none":
        return "none";
      case "light":
        return "0 2px 4px rgba(0,0,0,0.05)";
      case "heavy":
        return "0 8px 30px rgba(0,0,0,0.15)";
      default:
        return "0 4px 12px rgba(0,0,0,0.1)";
    }
  };

  const activeLinks = links.filter((l) => l.is_active);

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-muted-foreground mb-3">Preview em tempo real</p>
      
      {/* Phone Frame */}
      <div className="relative">
        {/* Phone Border */}
        <div className="w-[280px] h-[560px] bg-foreground rounded-[40px] p-2 shadow-2xl">
          {/* Phone Screen */}
          <div
            className="w-full h-full rounded-[32px] overflow-hidden relative"
            style={{
              backgroundColor: bgColor,
              backgroundImage: bgImage ? `url(${bgImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay for background image */}
            {bgImage && (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: `${bgColor}80` }}
              />
            )}

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-b-xl z-10" />

            {/* Content */}
            <div className="relative h-full overflow-y-auto pt-10 pb-6 px-4">
              {/* Profile */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-16 h-16 rounded-full object-cover shadow-lg mx-auto"
                    style={{ border: `3px solid ${primaryColor}` }}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                    style={{
                      backgroundColor: "#22c55e",
                      borderColor: bgImage ? "white" : bgColor,
                    }}
                  />
                </div>
                <h1
                  className="text-base font-bold mt-2 truncate"
                  style={{ color: textColor }}
                >
                  {profileTitle}
                </h1>
                {profileDescription && (
                  <p
                    className="text-xs mt-1 opacity-80 line-clamp-2"
                    style={{ color: textColor }}
                  >
                    {profileDescription}
                  </p>
                )}
              </div>

              {/* Links */}
              <div className="space-y-2">
                {activeLinks.map((link) => {
                  const IconComponent = getIconComponent(link.icon);
                  return (
                    <div
                      key={link.id}
                      className="w-full p-3 flex items-center gap-3 group relative overflow-hidden"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: getButtonRadius(),
                        borderLeft: `3px solid ${primaryColor}`,
                        boxShadow: getShadow(),
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        <IconComponent
                          className="h-4 w-4"
                          style={{ color: primaryColor }}
                        />
                      </div>
                      <span
                        className="flex-1 text-left font-medium text-xs truncate"
                        style={{ color: textColor }}
                      >
                        {link.title}
                      </span>
                      <ExternalLink
                        className="h-3 w-3 flex-shrink-0"
                        style={{ color: primaryColor, opacity: 0.5 }}
                      />
                    </div>
                  );
                })}

                {activeLinks.length === 0 && (
                  <div
                    className="text-center py-8 rounded-2xl"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: textColor,
                    }}
                  >
                    <p className="text-xs opacity-70">Nenhum link ativo</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p
                  className="text-[10px] opacity-50"
                  style={{ color: textColor }}
                >
                  Visite nosso site →
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinktreePreview;
