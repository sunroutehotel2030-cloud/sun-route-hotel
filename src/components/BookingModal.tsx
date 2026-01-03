import { useState, useEffect } from "react";
import { Calendar, Users, MessageCircle, BedDouble, Moon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import ThankYouModal from "@/components/ThankYouModal";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roomTypes = {
  double: { label: "Quarto Duplo", maxGuests: 2 },
  triple: { label: "Quarto Triplo", maxGuests: 3 },
  family: { label: "Quarto Família", maxGuests: 6 },
};

const BookingModal = ({ open, onOpenChange }: BookingModalProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<string>("2");
  const [roomType, setRoomType] = useState<string>("double");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hoveredNights = checkIn && hoveredDate ? differenceInDays(hoveredDate, checkIn) : 0;

  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckIn(date);
    setCheckInOpen(false);
    if (date) {
      if (checkOut && checkOut <= date) {
        setCheckOut(undefined);
      }
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
    if (parseInt(guests) > maxGuests) {
      setGuests(maxGuests.toString());
    }
  };

  const handleTrackClick = () => {
    if (!checkIn || !checkOut) return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source") || null;

    // Fire Google Ads conversion event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        'send_to': 'AW-17845107698/sXC3CJLl5tobEPL3mr1C',
        'value': 1.0,
        'currency': 'BRL'
      });
    }

    void Promise.all([
      trackLead({
        checkIn,
        checkOut,
        guests: parseInt(guests),
        utmSource,
      }),
      trackWhatsAppClick(utmSource),
    ]).catch(() => {});

    // Show thank you modal
    setShowThankYou(true);
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

  const guestOptions = Array.from(
    { length: currentRoomType.maxGuests },
    (_, i) => i + 1
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-semibold text-center">
            Faça sua Reserva
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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
              <PopoverContent className="w-auto p-0 z-[60]" align="start">
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
              <PopoverContent className="w-auto p-0 z-[60]" align="start">
                {checkIn && (
                  <div className="px-4 pt-3 pb-2 border-b bg-primary/10">
                    <p className="text-xs text-muted-foreground">Check-in selecionado:</p>
                    <p className="text-sm font-semibold text-primary">
                      {format(checkIn, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm font-medium min-h-[24px] transition-opacity duration-200">
                      {hoveredNights > 0 ? (
                        <>
                          <Moon className="h-4 w-4 text-primary" />
                          <span className="text-primary">{hoveredNights} noite{hoveredNights > 1 ? "s" : ""}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">Passe o mouse sobre uma data</span>
                      )}
                    </div>
                  </div>
                )}
                <CalendarComponent
                  mode="single"
                  selected={checkOut}
                  onSelect={handleCheckOutSelect}
                  onDayMouseEnter={(date: Date) => {
                    if (checkIn && differenceInDays(date, checkIn) > 0) {
                      setHoveredDate(date);
                    } else {
                      setHoveredDate(null);
                    }
                  }}
                  onDayMouseLeave={() => setHoveredDate(null)}
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
                  modifiers={checkIn ? { checkin: [checkIn] } : {}}
                  modifiersClassNames={{ checkin: "bg-brown/20 text-brown font-semibold ring-1 ring-brown/40 !opacity-100" }}
                  initialFocus={false}
                  className="pointer-events-auto"
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
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Verificar Disponibilidade no WhatsApp
            </a>
          ) : (
            <Button disabled className="w-full mt-2">
              <MessageCircle className="h-5 w-5" />
              Verificar Disponibilidade no WhatsApp
            </Button>
          )}
        </div>
      </DialogContent>

      <ThankYouModal open={showThankYou} onOpenChange={setShowThankYou} />
    </Dialog>
  );
};

export default BookingModal;
