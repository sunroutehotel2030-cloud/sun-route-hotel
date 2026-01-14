import { MapPin, Instagram, Phone, Navigation } from "lucide-react";
import logoImage from "@/assets/logo-hotel.jpg";

const Footer = () => {
  const hotelMapLink = "https://maps.app.goo.gl/FnFr7Agssd75SajC8";

  return (
    <footer id="contato" className="bg-foreground text-primary-foreground">
      <div className="container-hotel section-padding">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Logo & About */}
          <div>
            <img
              src={logoImage}
              alt="Sun Route Hotel"
              className="h-24 w-auto rounded-lg mb-4"
            />
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Seu refúgio em Cabo de Santo Agostinho. Conforto, tranquilidade e atendimento de qualidade para sua estadia perfeita. Suítes com ar-condicionado, tv e frigobar.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href={hotelMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-primary-foreground/80 hover:text-golden-light transition-colors text-sm"
              >
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>PE-060, 2891 (Vizinho a Splash Piscinas e em frente ao Shopping Costa Dourada)</span>
              </a>
              <a
                href="https://wa.me/5581984446199"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-golden-light transition-colors text-sm"
              >
                <Phone className="h-5 w-5" />
                <span>(81) 98444-6199</span>
              </a>
              <a
                href="https://instagram.com/hotelsunroute"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-golden-light transition-colors text-sm"
              >
                <Instagram className="h-5 w-5" />
                <span>@hotelsunroute</span>
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-1 md:col-span-2 lg:md-col-span-1">
            <h4 className="font-display font-semibold text-lg mb-4">Localização</h4>
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=-8.3029188,-35.0217549&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização do Sun Route Hotel"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <a
              href={hotelMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 w-full bg-golden hover:bg-golden-dark text-foreground font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Traçar Rota
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center space-y-2">
          <p className="text-primary-foreground text-base font-medium">
            2026 © Sun Route Hotel. Reservas:{" "}
            <a 
              href="https://wa.me/5581984446199" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-primary-foreground/80 transition-colors"
            >
              81 98444-6199
            </a>
          </p>
          <p className="text-primary-foreground/60 text-sm">
            Produzido por{" "}
            <a 
              href="https://wa.me/5581993856099" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-primary-foreground/80 transition-colors"
            >
              Wsmart Digital
            </a>{" "}
            81 99385.6099
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
