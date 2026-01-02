import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface RoomGalleryProps {
  images: string[];
  fallbackImage: string;
  roomName: string;
}

const RoomGallery = ({ images, fallbackImage, roomName }: RoomGalleryProps) => {
  const displayImages = images.length > 0 ? images : [fallbackImage];
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Single image - no carousel needed
  if (displayImages.length === 1) {
    return (
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={displayImages[0]}
          alt={roomName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main carousel */}
      <div className="overflow-hidden aspect-[4/3]" ref={emblaRef}>
        <div className="flex h-full">
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative h-full"
            >
              <img
                src={image}
                alt={`${roomName} - Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-1.5 rounded-full shadow-md transition-colors"
        aria-label="Foto anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-1.5 rounded-full shadow-md transition-colors"
        aria-label="Próxima foto"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Thumbnails */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-background/70 backdrop-blur-sm rounded-full px-2 py-1">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-8 h-6 rounded overflow-hidden border-2 transition-all",
              selectedIndex === index
                ? "border-primary scale-110"
                : "border-transparent opacity-70 hover:opacity-100"
            )}
            aria-label={`Ver foto ${index + 1}`}
          >
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Photo counter */}
      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded">
        {selectedIndex + 1}/{displayImages.length}
      </div>
    </div>
  );
};

export default RoomGallery;