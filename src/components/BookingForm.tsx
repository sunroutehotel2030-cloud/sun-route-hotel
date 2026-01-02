import { useState } from "react";
import { Calendar, Users, MessageCircle } from "lucide-react";
import { format } from "date-fns";
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

interface BookingFormProps {
  onBookingAttempt?: (data: { checkIn: Date; checkOut: Date; guests: number }) => void;
}

const BookingForm = ({ onBookingAttempt }: BookingFormProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<string>("2");

  const handleWhatsAppClick = () => {
    if (!checkIn || !checkOut) {
      return;
    }

    // Track booking attempt
    if (onBookingAttempt) {
      onBookingAttempt({ checkIn, checkOut, guests: parseInt(guests) });
    }

    // Track UTM if present
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source") || "direto";

    const checkInFormatted = format(checkIn, "dd/MM/yyyy", { locale: ptBR });
    const checkOutFormatted = format(checkOut, "dd/MM/yyyy", { locale: ptBR });

    const message = encodeURIComponent(
      `Olá, gostaria de reservar para ${guests} pessoas, de ${checkInFormatted} a ${checkOutFormatted}. Vi no site oficial.`
    );

    window.open(`https://wa.me/5581984446199?text=${message}`, "_blank");
  };

  const isFormValid = checkIn && checkOut;

  return (
    <div className="glass-card p-6 md:p-8 w-full max-w-md mx-auto">
      <h3 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-6 text-center">
        Faça sua Reserva
      </h3>

      <div className="space-y-4">
        {/* Check-in Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Data de Check-in
          </label>
          <Popover>
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
                onSelect={setCheckIn}
                disabled={(date) => date < new Date()}
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
          <Popover>
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
                onSelect={setCheckOut}
                disabled={(date) => date < (checkIn || new Date())}
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
              <SelectItem value="1">1 Hóspede</SelectItem>
              <SelectItem value="2">2 Hóspedes</SelectItem>
              <SelectItem value="3">3 Hóspedes</SelectItem>
              <SelectItem value="4">4 Hóspedes</SelectItem>
              <SelectItem value="5">5 Hóspedes</SelectItem>
              <SelectItem value="6">6 Hóspedes</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
