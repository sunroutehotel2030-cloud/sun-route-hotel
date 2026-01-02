import { useState, useEffect } from "react";
import { Calendar, Users, MessageCircle, BedDouble, Clock, Eye, Flame, TrendingUp, AlertTriangle, Star } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { trackLead, trackWhatsAppClick } from "@/hooks/useAnalytics";

interface BookingFormProps {
  onBookingAttempt?: (data: { checkIn: Date; checkOut: Date; guests: number }) => void;
}

const roomTypes = {
  double: { label: "Quarto Duplo", maxGuests: 2 },
  triple: { label: "Quarto Triplo", maxGuests: 3 },
  family: { label: "Quarto Família", maxGuests: 6 },
};

const urgencyMessages = [
  { icon: Users, text: "4 pessoas reservando neste momento", type: "social" },
  { icon: Eye, text: "7 pessoas visualizando agora", type: "views" },
  { icon: Clock, text: "Última reserva há 8 minutos", type: "recent" },
  { icon: AlertTriangle, text: "Restam apenas 2 quartos disponíveis", type: "scarcity" },
  { icon: TrendingUp, text: "Alta demanda para estas datas", type: "demand" },
  { icon: Star, text: "9 reservas confirmadas hoje", type: "social" },
  { icon: Flame, text: "Oferta limitada - reserve agora!", type: "urgency" },
  { icon: Users, text: "3 pessoas acabaram de reservar", type: "social" },
];

const getMessageStyles = (type: string) => {
  switch (type) {
    case "scarcity":
      return "text-red-600 bg-red-50 border-red-200";
    case "urgency":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "recent":
      return "text-green-600 bg-green-50 border-green-200";
    case "demand":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "views":
      return "text-purple-600 bg-purple-50 border-purple-200";
    default:
      return "text-blue-600 bg-blue-50 border-blue-200";
  }
};

const BookingForm = ({ onBookingAttempt }: BookingFormProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<string>("2");
  const [roomType, setRoomType] = useState<string>("double");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Rotate urgency messages
  useEffect(() => {
    const randomStart = Math.floor(Math.random() * urgencyMessages.length);
    setCurrentMessageIndex(randomStart);

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % urgencyMessages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = urgencyMessages[currentMessageIndex];
  const IconComponent = currentMessage.icon;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckIn(date);
    setCheckInOpen(false);
    if (date) {
      // Clear check-out if it's before or equal to new check-in
      if (checkOut && checkOut <= date) {
        setCheckOut(undefined);
      }
      // Auto-open check-out picker
      setTimeout(() => setCheckOutOpen(true), 200);
    }
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    setCheckOut(date);
    setCheckOutOpen(false);
  };

  const handleRoomTypeChange = (value: string) => {
    setRoomType(value);
    const maxGuests = roomTypes[value as keyof typeof roomTypes].maxGuests;
    // Adjust guests if current selection exceeds max for new room type
    if (parseInt(guests) > maxGuests) {
      setGuests(maxGuests.toString());
    }
  };

  const handleTrackClick = () => {
    if (!checkIn || !checkOut) return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source") || null;

    // Fire-and-forget tracking so it never blocks the navigation
    void Promise.all([
      trackLead({
        checkIn,
        checkOut,
        guests: parseInt(guests),
        utmSource,
      }),
      trackWhatsAppClick(utmSource),
    ]).catch(() => {});

    if (onBookingAttempt) {
      onBookingAttempt({ checkIn, checkOut, guests: parseInt(guests) });
    }
  };

  const isFormValid = Boolean(checkIn && checkOut);
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const currentRoomType = roomTypes[roomType as keyof typeof roomTypes];

  const phone = "5581984446199";
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const linkTarget = isMobile ? "_self" : "_blank";

  const whatsappMessage = isFormValid
    ? encodeURIComponent(
        `Ola! Gostaria de verificar disponibilidade:\n\n- Check-in: ${format(checkIn!, "dd/MM/yyyy", { locale: ptBR })}\n- Check-out: ${format(checkOut!, "dd/MM/yyyy", { locale: ptBR })}\n- ${nights} noite${nights > 1 ? "s" : ""}\n- ${currentRoomType.label}\n- ${guests} hospede${parseInt(guests) > 1 ? "s" : ""}\n\nVi no site oficial. Aguardo retorno!`
      )
    : "";

  const whatsappHref = isFormValid
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${whatsappMessage}`
    : `https://api.whatsapp.com/send?phone=${phone}`;

  // Generate guest options based on room type
  const guestOptions = Array.from(
    { length: currentRoomType.maxGuests },
    (_, i) => i + 1
  );

  return (
    <div className="glass-card p-6 md:p-8 w-full max-w-md mx-auto">
      <h3 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-4 text-center">
        Faça sua Reserva
      </h3>

      {/* Urgency Message */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 text-sm rounded-lg py-2 px-3 mb-6 border transition-all duration-500",
          getMessageStyles(currentMessage.type)
        )}
      >
        <IconComponent className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">{currentMessage.text}</span>
      </div>

      <div className="space-y-4">
        {/* Room Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Tipo de Quarto
          </label>
          <Select value={roomType} onValueChange={handleRoomTypeChange}>
            <SelectTrigger className="w-full h-12">
              <div className="flex items-center">
                <BedDouble className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Selecione o quarto" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="double">Quarto Duplo (até 2 pessoas)</SelectItem>
              <SelectItem value="triple">Quarto Triplo (até 3 pessoas)</SelectItem>
              <SelectItem value="family">Quarto Família (até 6 pessoas)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Check-in Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Data de Check-in
          </label>
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={checkIn}
                onSelect={handleCheckInSelect}
                disabled={(date) => {
                  const dateOnly = new Date(date);
                  dateOnly.setHours(0, 0, 0, 0);
                  return dateOnly < today;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Data de Check-out
          </label>
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={checkOut}
                onSelect={handleCheckOutSelect}
                disabled={(date) => {
                  const dateOnly = new Date(date);
                  dateOnly.setHours(0, 0, 0, 0);
                  if (checkIn) {
                    const minCheckOut = new Date(checkIn);
                    minCheckOut.setDate(minCheckOut.getDate() + 1);
                    minCheckOut.setHours(0, 0, 0, 0);
                    return dateOnly < minCheckOut;
                  }
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return dateOnly < tomorrow;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Número de Hóspedes
          </label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="w-full h-12">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Selecione" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {guestOptions.map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Hóspede{num > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Booking Summary */}
        {checkIn && checkOut && nights > 0 && (
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Resumo da reserva:</div>
            <div className="font-medium text-foreground">
              {nights} noite{nights > 1 ? "s" : ""} • {currentRoomType.label} • {guests} hóspede{parseInt(guests) > 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* WhatsApp Button */}
        {isFormValid ? (
          <a
            href={whatsappHref}
            target={linkTarget}
            rel="noopener noreferrer"
            onClick={handleTrackClick}
            className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Verificar Disponibilidade no WhatsApp
          </a>
        ) : (
          <Button disabled className="w-full mt-6">
            <MessageCircle className="h-5 w-5" />
            Verificar Disponibilidade no WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingForm;

