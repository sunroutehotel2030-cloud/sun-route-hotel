import { Wifi, Tv, Coffee, Refrigerator } from "lucide-react";
import roomDouble from "@/assets/room-double.jpg";
import roomTriple from "@/assets/room-triple.jpg";

const amenities = [
  { icon: Wifi, label: "Wi-Fi Grátis" },
  { icon: Tv, label: "TV" },
  { icon: Refrigerator, label: "Frigobar" },
  { icon: Coffee, label: "Café da manhã" },
];

const rooms = [
  {
    name: "Quarto Duplo",
    description: "Ideal para casais ou viajantes a dois. Conforto e privacidade.",
    image: roomDouble,
    capacity: "2 pessoas",
  },
  {
    name: "Quarto Triplo",
    description: "Espaço amplo para famílias ou grupos de amigos.",
    image: roomTriple,
    capacity: "3 pessoas",
  },
];

const Accommodations = () => {
  return (
    <section id="acomodacoes" className="section-padding bg-secondary">
      <div className="container-hotel">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Nossas Acomodações
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quartos confortáveis e bem equipados para garantir sua melhor estadia
          </p>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12">
          {amenities.map((amenity) => (
            <div
              key={amenity.label}
              className="flex items-center gap-2 text-foreground/80"
            >
              <amenity.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{amenity.label}</span>
            </div>
          ))}
        </div>

        {/* Room Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {rooms.map((room) => (
            <article key={room.name} className="card-elegant group">
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {room.capacity}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {room.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {room.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {amenities.map((amenity) => (
                    <span
                      key={amenity.label}
                      className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground"
                    >
                      <amenity.icon className="h-3 w-3" />
                      {amenity.label}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Accommodations;
