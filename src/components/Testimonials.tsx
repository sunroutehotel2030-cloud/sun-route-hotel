import { Star, Quote, ExternalLink } from "lucide-react";

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

const googleReviews = [
  {
    name: "George Azevedo",
    initial: "G",
    color: "bg-blue-500",
    text: "Melhor Hotel do Cabo, conforto, atendimento e boa localização de frente do Shopping Costa Dourada",
    date: "há 2 dias",
    rating: 5,
  },
  {
    name: "Marcos Paulo",
    initial: "M",
    color: "bg-red-500",
    text: "Muito próximo a praia, piscina muito boa e limpa, quarto limpo e cheiroso. Excelente experiência!",
    date: "há 1 semana",
    rating: 5,
  },
  {
    name: "Fernanda Lima",
    initial: "F",
    color: "bg-green-500",
    text: "Localização excelente. Funcionários bem atenciosos. Ótimo café da manhã. Comida muito gostosa.",
    date: "há 2 semanas",
    rating: 5,
  },
  {
    name: "Ricardo Oliveira",
    initial: "R",
    color: "bg-yellow-500",
    text: "Adoramos o Hotel, cheiro de limpeza, café da manhã bom. Você pode almoçar e jantar no restaurante sem preocupação.",
    date: "há 3 semanas",
    rating: 5,
  },
];

const GoogleLogo = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Testimonials = () => {
  const googleMapsUrl = "https://www.google.com/maps/search/Sun+Route+Hotel+Cabo+de+Santo+Agostinho";

  return (
    <section id="depoimentos" className="section-padding bg-background">
      <div className="container-hotel">
        {/* Seção de depoimentos existente */}
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

        {/* Nova Seção: Avaliações do Google */}
        <div className="mt-20">
          <div className="text-center mb-10">
            {/* Header com selo Google */}
            <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3 shadow-sm mb-6">
              <GoogleLogo />
              <span className="font-semibold text-foreground">5.0</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">14 avaliações</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Avaliações do Google
            </h3>
            <p className="text-muted-foreground">
              Veja o que nossos hóspedes dizem no Google
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {googleReviews.map((review, index) => (
              <div
                key={review.name}
                className="bg-card border border-border rounded-xl p-5 relative hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar com inicial */}
                  <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                    {review.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">
                      {review.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                      <span className="text-muted-foreground text-xs">{review.date}</span>
                    </div>
                  </div>
                  {/* Ícone Google pequeno */}
                  <div className="flex-shrink-0">
                    <GoogleLogo />
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>

          {/* Botão ver todas */}
          <div className="text-center mt-8">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Ver todas as avaliações no Google
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
