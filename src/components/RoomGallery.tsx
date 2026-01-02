import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
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

  // Close zoom on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomedImage(null);
    };
    if (zoomedImage) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [zoomedImage]);

  const handleImageClick = (imageUrl: string) => {
    setZoomedImage(imageUrl);
  };

  // Single image - no carousel needed
  if (displayImages.length === 1) {
    return (
      <>
        <div 
          className="relative overflow-hidden aspect-[4/3] cursor-zoom-in group"
          onClick={() => handleImageClick(displayImages[0])}
        >
          <img
            src={displayImages[0]}
            alt={roomName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-background opacity-0 group-hover:opacity-70 transition-opacity drop-shadow-lg" />
          </div>
        </div>

        {/* Zoom overlay */}
        {zoomedImage && (
          <div 
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
            onClick={() => setZoomedImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              onClick={() => setZoomedImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={zoomedImage}
              alt={roomName}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
            />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Main carousel */}
        <div className="overflow-hidden aspect-[4/3]" ref={emblaRef}>
          <div className="flex h-full">
            {displayImages.map((image, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 relative h-full cursor-zoom-in group"
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image}
                  alt={`${roomName} - Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-background opacity-0 group-hover:opacity-70 transition-opacity drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-1.5 rounded-full shadow-md transition-colors"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); scrollNext(); }}
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
              onClick={(e) => { e.stopPropagation(); scrollTo(index); }}
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

      {/* Zoom overlay */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors z-10"
            onClick={() => setZoomedImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          
          {/* Navigation in zoom mode */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = displayImages.indexOf(zoomedImage);
              const prevIndex = currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
              setZoomedImage(displayImages[prevIndex]);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-secondary/80 hover:bg-secondary text-foreground p-3 rounded-full shadow-md transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = displayImages.indexOf(zoomedImage);
              const nextIndex = currentIndex === displayImages.length - 1 ? 0 : currentIndex + 1;
              setZoomedImage(displayImages[nextIndex]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-secondary/80 hover:bg-secondary text-foreground p-3 rounded-full shadow-md transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <img
            src={zoomedImage}
            alt={roomName}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-secondary/80 backdrop-blur-sm text-foreground text-sm font-medium px-4 py-2 rounded-full">
            {displayImages.indexOf(zoomedImage) + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  );
};

export default RoomGallery;