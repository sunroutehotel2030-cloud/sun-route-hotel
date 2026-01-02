import { useState } from "react";
import { Plus, Trash2, Loader2, GripVertical, ImageIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImageEditorModal from "./ImageEditorModal";

interface GalleryImage {
  id: string;
  room_type: string;
  image_url: string;
  position: number;
  alt_text: string | null;
}

interface RoomGalleryManagerProps {
  roomType: string;
  roomTitle: string;
  fallbackImage: string;
}

const RoomGalleryManager = ({
  roomType,
  roomTitle,
  fallbackImage,
}: RoomGalleryManagerProps) => {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: galleryImages = [], isLoading } = useQuery({
    queryKey: ["room-gallery", roomType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_gallery")
        .select("*")
        .eq("room_type", roomType)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      setIsUploading(true);
      const fileName = `${roomType}-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Get next position
      const maxPosition = galleryImages.reduce(
        (max, img) => Math.max(max, img.position),
        -1
      );

      const { error: insertError } = await supabase.from("room_gallery").insert({
        room_type: roomType,
        image_url: imageUrl,
        position: maxPosition + 1,
      });

      if (insertError) throw insertError;

      return imageUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-gallery", roomType] });
      toast({
        title: "Foto adicionada",
        description: "A foto foi adicionada à galeria.",
      });
      setIsUploading(false);
      setIsEditorOpen(false);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Erro ao enviar foto",
        description: "Não foi possível salvar a foto. Tente novamente.",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("room_gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-gallery", roomType] });
      toast({
        title: "Foto removida",
        description: "A foto foi removida da galeria.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a foto.",
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      id,
      newPosition,
    }: {
      id: string;
      newPosition: number;
    }) => {
      const { error } = await supabase
        .from("room_gallery")
        .update({ position: newPosition })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-gallery", roomType] });
    },
  });

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= galleryImages.length) return;

    const currentImage = galleryImages[index];
    const swapImage = galleryImages[newIndex];

    // Swap positions
    reorderMutation.mutate({ id: currentImage.id, newPosition: swapImage.position });
    reorderMutation.mutate({ id: swapImage.id, newPosition: currentImage.position });
  };

  const handleSaveImage = async (blob: Blob) => {
    await uploadMutation.mutateAsync(blob);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {roomTitle}
        </CardTitle>
        <CardDescription>
          Galeria de fotos do quarto. Arraste para reordenar.
        </CardDescription>
        <p className="text-xs text-primary font-medium mt-1">
          📐 800 x 600 px (4:3)
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gallery grid */}
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-secondary"
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || `Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* First image indicator */}
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground p-1 rounded" title="Foto principal">
                      <Star className="h-3 w-3" />
                    </div>
                  )}

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-3 w-3 rotate-90" />
                      </Button>
                    </div>

                    {/* Delete button */}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => deleteMutation.mutate(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add photo button */}
              <button
                onClick={() => setIsEditorOpen(true)}
                disabled={isUploading}
                className="aspect-[4/3] rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">Adicionar</span>
              </button>
            </div>

            {/* Fallback info */}
            {galleryImages.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Nenhuma foto na galeria. A imagem padrão será exibida.
                </p>
                <div className="mt-2 mx-auto w-32 aspect-[4/3] rounded-lg overflow-hidden">
                  <img
                    src={fallbackImage}
                    alt="Imagem padrão"
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {isEditorOpen && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveImage}
          title={`Nova foto - ${roomTitle}`}
          recommendedSize="800 x 600 px (4:3)"
        />
      )}
    </Card>
  );
};

export default RoomGalleryManager;