import { useState, useRef } from "react";
import { Upload, Loader2, Check, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  onUpload: (key: string, file: File) => Promise<void>;
  isUploading: boolean;
}

const ImageCard = ({
  imageKey,
  title,
  description,
  currentUrl,
  fallbackUrl,
  onUpload,
  isUploading,
}: ImageCardProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(imageKey, selectedFile);
      setPreview(null);
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const displayUrl = preview || currentUrl || fallbackUrl;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
            <img
              src={displayUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            {preview && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                Preview
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`file-${imageKey}`}>Selecionar nova imagem</Label>
            <Input
              ref={inputRef}
              id={`file-${imageKey}`}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {preview && (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PhotoManager = () => {
  const queryClient = useQueryClient();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

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
    mutationFn: async ({ key, file }: { key: string; file: File }) => {
      setUploadingKey(key);

      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${key}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(filePath);

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
        description: "A imagem foi salva com sucesso.",
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

  const handleUpload = async (key: string, file: File) => {
    await uploadMutation.mutateAsync({ key, file });
  };

  const imageConfigs = [
    {
      key: "hero",
      title: "Imagem Hero (Principal)",
      description: "Imagem de fundo da seção principal do site",
      fallback: heroImageFallback,
    },
    {
      key: "logo",
      title: "Logo do Hotel",
      description: "Logo exibido na seção hero",
      fallback: logoImageFallback,
    },
    {
      key: "room_double",
      title: "Quarto Duplo",
      description: "Foto do quarto duplo na galeria de acomodações",
      fallback: roomDoubleFallback,
    },
    {
      key: "room_triple",
      title: "Quarto Triplo",
      description: "Foto do quarto triplo na galeria de acomodações",
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
            Gerencie as imagens do site. As alterações são aplicadas imediatamente.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {imageConfigs.map((config) => (
          <ImageCard
            key={config.key}
            imageKey={config.key}
            title={config.title}
            description={config.description}
            currentUrl={getImageUrl(config.key)}
            fallbackUrl={config.fallback}
            onUpload={handleUpload}
            isUploading={uploadingKey === config.key}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoManager;
