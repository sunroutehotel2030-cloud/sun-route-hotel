import { useState } from "react";
import { Calendar, Users, MessageCircle, BedDouble } from "lucide-react";
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

const BookingForm = ({ onBookingAttempt }: BookingFormProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<string>("2");
  const [roomType, setRoomType] = useState<string>("double");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

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

  const handleWhatsAppClick = async () => {
    if (!checkIn || !checkOut) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source") || null;

    // Track lead and WhatsApp click in the database
    await Promise.all([
      trackLead({
        checkIn,
        checkOut,
        guests: parseInt(guests),
        utmSource,
      }),
      trackWhatsAppClick(utmSource),
    ]);

    // Track booking attempt callback
    if (onBookingAttempt) {
      onBookingAttempt({ checkIn, checkOut, guests: parseInt(guests) });
    }

    const checkInFormatted = format(checkIn, "dd/MM/yyyy", { locale: ptBR });
    const checkOutFormatted = format(checkOut, "dd/MM/yyyy", { locale: ptBR });
    const nights = differenceInDays(checkOut, checkIn);
    const roomLabel = roomTypes[roomType as keyof typeof roomTypes].label;

    const message = encodeURIComponent(
      `Ola! Gostaria de verificar disponibilidade:

- Check-in: ${checkInFormatted}
- Check-out: ${checkOutFormatted}
- ${nights} noite${nights > 1 ? "s" : ""}
- ${roomLabel}
- ${guests} hospede${parseInt(guests) > 1 ? "s" : ""}

Vi no site oficial. Aguardo retorno!`
    );

    const phone = "5581984446199";
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `https://wa.me/${phone}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const isFormValid = checkIn && checkOut;
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const currentRoomType = roomTypes[roomType as keyof typeof roomTypes];

  // Generate guest options based on room type
  const guestOptions = Array.from({ length: currentRoomType.maxGuests }, (_, i) => i + 1);

  return (
    <div className="glass-card p-6 md:p-8 w-full max-w-md mx-auto">
      <h3 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-6 text-center">
        Faça sua Reserva
      </h3>

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
        <Button
          onClick={handleWhatsAppClick}
          disabled={!isFormValid}
          className="btn-whatsapp w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageCircle className="h-5 w-5" />
          Verificar Disponibilidade no WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default BookingForm;
