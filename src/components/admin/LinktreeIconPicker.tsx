import { useState } from "react";
import {
  Link2,
  Instagram,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  MessageCircle,
  Send,
  Music,
  Camera,
  Video,
  ShoppingBag,
  CreditCard,
  Heart,
  Home,
  Info,
  FileText,
  Clock,
  Bed,
  Coffee,
  Utensils,
  Wifi,
  Car,
  Plane,
  Ship,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IconOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

export const iconOptions: IconOption[] = [
  // Social Media
  { value: "instagram", label: "Instagram", icon: Instagram, category: "Redes Sociais" },
  { value: "facebook", label: "Facebook", icon: Facebook, category: "Redes Sociais" },
  { value: "twitter", label: "Twitter/X", icon: Twitter, category: "Redes Sociais" },
  { value: "youtube", label: "YouTube", icon: Youtube, category: "Redes Sociais" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, category: "Redes Sociais" },
  { value: "tiktok", label: "TikTok", icon: Music, category: "Redes Sociais" },
  
  // Communication
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, category: "Comunicação" },
  { value: "telegram", label: "Telegram", icon: Send, category: "Comunicação" },
  { value: "mail", label: "Email", icon: Mail, category: "Comunicação" },
  { value: "phone", label: "Telefone", icon: Phone, category: "Comunicação" },
  
  // Location & Travel
  { value: "location", label: "Localização", icon: MapPin, category: "Localização" },
  { value: "home", label: "Endereço", icon: Home, category: "Localização" },
  { value: "car", label: "Transporte", icon: Car, category: "Localização" },
  { value: "plane", label: "Aeroporto", icon: Plane, category: "Localização" },
  { value: "ship", label: "Porto", icon: Ship, category: "Localização" },
  
  // Hotel & Services
  { value: "bed", label: "Quartos", icon: Bed, category: "Hotel" },
  { value: "calendar", label: "Reservas", icon: Calendar, category: "Hotel" },
  { value: "clock", label: "Horários", icon: Clock, category: "Hotel" },
  { value: "coffee", label: "Café", icon: Coffee, category: "Hotel" },
  { value: "utensils", label: "Restaurante", icon: Utensils, category: "Hotel" },
  { value: "wifi", label: "Wi-Fi", icon: Wifi, category: "Hotel" },
  
  // General
  { value: "link", label: "Link", icon: Link2, category: "Geral" },
  { value: "globe", label: "Website", icon: Globe, category: "Geral" },
  { value: "star", label: "Destaque", icon: Star, category: "Geral" },
  { value: "heart", label: "Favorito", icon: Heart, category: "Geral" },
  { value: "info", label: "Informação", icon: Info, category: "Geral" },
  { value: "file", label: "Documento", icon: FileText, category: "Geral" },
  
  // Media & Shopping
  { value: "camera", label: "Fotos", icon: Camera, category: "Mídia" },
  { value: "video", label: "Vídeo", icon: Video, category: "Mídia" },
  { value: "music", label: "Música", icon: Music, category: "Mídia" },
  { value: "shopping", label: "Loja", icon: ShoppingBag, category: "Compras" },
  { value: "payment", label: "Pagamento", icon: CreditCard, category: "Compras" },
];

export const getIconComponent = (iconName: string) => {
  const option = iconOptions.find((o) => o.value === iconName);
  return option?.icon || Link2;
};

interface LinktreeIconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const LinktreeIconPicker = ({ value, onChange }: LinktreeIconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const SelectedIcon = getIconComponent(value);
  const selectedOption = iconOptions.find((o) => o.value === value);

  const filteredIcons = iconOptions.filter(
    (icon) =>
      icon.label.toLowerCase().includes(search.toLowerCase()) ||
      icon.category.toLowerCase().includes(search.toLowerCase())
  );

  const groupedIcons = filteredIcons.reduce((acc, icon) => {
    if (!acc[icon.category]) acc[icon.category] = [];
    acc[icon.category].push(icon);
    return acc;
  }, {} as Record<string, IconOption[]>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start gap-2"
        >
          <SelectedIcon className="h-4 w-4" />
          <span>{selectedOption?.label || "Selecione um ícone"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ícone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {Object.entries(groupedIcons).map(([category, icons]) => (
              <div key={category} className="mb-4">
                <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                  {category}
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {icons.map((icon) => {
                    const IconComp = icon.icon;
                    const isSelected = value === icon.value;
                    return (
                      <button
                        key={icon.value}
                        onClick={() => {
                          onChange(icon.value);
                          setOpen(false);
                          setSearch("");
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        title={icon.label}
                      >
                        <IconComp className="h-5 w-5" />
                        <span className="text-[10px] truncate max-w-full">
                          {icon.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {Object.keys(groupedIcons).length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">
                Nenhum ícone encontrado
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default LinktreeIconPicker;
