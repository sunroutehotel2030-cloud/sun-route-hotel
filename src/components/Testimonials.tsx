import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    text: "Excelente hotel! Atendimento impecável e quartos muito limpos. O café da manhã é maravilhoso. Com certeza voltarei!",
    rating: 5,
  },
  {
    name: "João Santos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    text: "Localização perfeita e preço justo. A equipe é muito atenciosa. Recomendo para famílias!",
    rating: 5,
  },
  {
    name: "Ana Costa",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    text: "Passamos um fim de semana incrível. O hotel tem uma energia muito boa e a praia é pertinho. Amamos!",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="depoimentos" className="section-padding bg-background">
      <div className="container-hotel">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            O que nossos hóspedes dizem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A satisfação dos nossos hóspedes é nossa maior recompensa
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="card-elegant p-6 relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
