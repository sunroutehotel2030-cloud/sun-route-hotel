import BookingForm from "./BookingForm";
import { useSiteImages } from "@/hooks/useSiteImages";

const Hero = () => {
  const { getImageUrl } = useSiteImages();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl("hero")}
          alt="Sun Route Hotel - Vista do hotel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-hotel w-full px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left - Text Content */}
          <div className="text-center lg:text-left max-w-xl animate-fade-up">
            <img
              src={getImageUrl("logo")}
              alt="Sun Route Hotel Logo"
              className="h-24 md:h-32 w-auto mx-auto lg:mx-0 mb-6 rounded-xl shadow-lg"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-4 leading-tight">
              Hotel conceito com a <span className="text-golden-light">melhor estrutura</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 font-light">
              Descubra o conforto e a tranquilidade no coração de Cabo de Santo Agostinho
            </p>
          </div>

          {/* Right - Booking Form */}
          <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <BookingForm />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
