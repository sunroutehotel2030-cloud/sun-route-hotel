import { useState } from "react";
import { Upload, Loader2, ImageIcon, Edit } from "lucide-react";
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
import RoomGalleryManager from "./RoomGalleryManager";

// Static fallbacks
import heroImageFallback from "@/assets/hero-hotel.jpg";
import logoImageFallback from "@/assets/logo-hotel.jpg";
import roomDoubleFallback from "@/assets/room-double.jpg";
import roomTripleFallback from "@/assets/room-triple.jpg";

interface SiteImage {
  id: string;
  image_key: string;
  image_url: string;
  alt_text: string | null;
}

interface ImageCardProps {
  imageKey: string;
  title: string;
  description: string;
  currentUrl: string;
  fallbackUrl: string;
  onEditClick: () => void;
  isUploading: boolean;
  recommendedSize: string;
}

const ImageCard = ({
  imageKey,
  title,
  description,
  currentUrl,
  fallbackUrl,
  onEditClick,
  isUploading,
  recommendedSize,
}: ImageCardProps) => {
  const displayUrl = currentUrl || fallbackUrl;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <p className="text-xs text-primary font-medium mt-1">📐 {recommendedSize}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
            <img
              src={displayUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          <Button
            onClick={onEditClick}
            disabled={isUploading}
            className="w-full gap-2"
            variant="outline"
          >
            <Edit className="h-4 w-4" />
            Editar imagem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PhotoManager = () => {
  const queryClient = useQueryClient();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<{
    key: string;
    title: string;
    recommendedSize: string;
  } | null>(null);

  const { data: siteImages = [], isLoading } = useQuery({
    queryKey: ["site-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_images")
        .select("*");

      if (error) throw error;
      return data as SiteImage[];
    },
  });

  const getImageUrl = (key: string): string => {
    const image = siteImages.find((img) => img.image_key === key);
    return image?.image_url || "";
  };

  const uploadMutation = useMutation({
    mutationFn: async ({ key, blob }: { key: string; blob: Blob }) => {
      setUploadingKey(key);

      // Create file from blob with JPG extension
      const fileName = `${key}-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Check if record exists
      const { data: existing } = await supabase
        .from("site_images")
        .select("id")
        .eq("image_key", key)
        .single();

      if (existing) {
        // Update
        const { error: updateError } = await supabase
          .from("site_images")
          .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
          .eq("image_key", key);

        if (updateError) throw updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from("site_images")
          .insert({ image_key: key, image_url: imageUrl });

        if (insertError) throw insertError;
      }

      return imageUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
      toast({
        title: "Imagem atualizada",
        description: "A imagem foi salva com sucesso em formato JPG.",
      });
      setUploadingKey(null);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Não foi possível salvar a imagem. Tente novamente.",
        variant: "destructive",
      });
      setUploadingKey(null);
    },
  });

  const handleSaveImage = async (blob: Blob) => {
    if (!editingConfig) return;
    await uploadMutation.mutateAsync({ key: editingConfig.key, blob });
  };

  const singleImageConfigs = [
    {
      key: "hero",
      title: "Imagem Hero (Principal)",
      description: "Imagem de fundo da seção principal do site",
      fallback: heroImageFallback,
      recommendedSize: "1920 x 1080 px (16:9)",
    },
    {
      key: "logo",
      title: "Logo do Hotel",
      description: "Logo exibido na seção hero",
      fallback: logoImageFallback,
      recommendedSize: "400 x 400 px (1:1)",
    },
  ];

  const roomGalleryConfigs = [
    {
      roomType: "room_double",
      title: "Quarto Duplo",
      fallback: roomDoubleFallback,
    },
    {
      roomType: "room_triple",
      title: "Quarto Triplo",
      fallback: roomTripleFallback,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Gerenciador de Fotos
          </CardTitle>
          <CardDescription>
            Gerencie as imagens do site. Aceita todos os formatos (PNG, WEBP, HEIC, etc.) e converte automaticamente para JPG.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Single images: Hero and Logo */}
      <div className="grid md:grid-cols-2 gap-6">
        {singleImageConfigs.map((config) => (
          <ImageCard
            key={config.key}
            imageKey={config.key}
            title={config.title}
            description={config.description}
            currentUrl={getImageUrl(config.key)}
            fallbackUrl={config.fallback}
            onEditClick={() =>
              setEditingConfig({
                key: config.key,
                title: config.title,
                recommendedSize: config.recommendedSize,
              })
            }
            isUploading={uploadingKey === config.key}
            recommendedSize={config.recommendedSize}
          />
        ))}
      </div>

      {/* Room galleries with multiple images */}
      <div className="grid md:grid-cols-2 gap-6">
        {roomGalleryConfigs.map((config) => (
          <RoomGalleryManager
            key={config.roomType}
            roomType={config.roomType}
            roomTitle={config.title}
            fallbackImage={config.fallback}
          />
        ))}
      </div>

      {editingConfig && (
        <ImageEditorModal
          isOpen={!!editingConfig}
          onClose={() => setEditingConfig(null)}
          onSave={handleSaveImage}
          title={editingConfig.title}
          recommendedSize={editingConfig.recommendedSize}
        />
      )}
    </div>
  );
};

export default PhotoManager;
