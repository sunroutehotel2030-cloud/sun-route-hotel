import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LinktreeProfileEditorProps {
  logoUrl: string | null;
  profileTitle: string;
  profileDescription: string;
  primaryColor: string;
  onLogoChange: (url: string | null) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

const LinktreeProfileEditor = ({
  logoUrl,
  profileTitle,
  profileDescription,
  primaryColor,
  onLogoChange,
  onTitleChange,
  onDescriptionChange,
}: LinktreeProfileEditorProps) => {
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("linktree")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("linktree")
        .getPublicUrl(fileName);

      onLogoChange(urlData.publicUrl);
      toast({
        title: "Logo enviado",
        description: "A imagem foi atualizada.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    onLogoChange(null);
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-3">
        <Label>Logomarca</Label>
        <div className="flex items-center gap-4">
          <div
            className="relative w-24 h-24 rounded-full border-4 overflow-hidden flex items-center justify-center bg-muted"
            style={{ borderColor: primaryColor }}
          >
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={removeLogo}
                  className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <label htmlFor="logo-upload">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button variant="outline" asChild disabled={uploading}>
                <span className="cursor-pointer gap-2">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Enviando..." : "Enviar logo"}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              Recomendado: 200x200px, formato quadrado
            </p>
          </div>
        </div>
      </div>

      {/* Profile Title */}
      <div className="space-y-2">
        <Label htmlFor="profile-title">Título do Perfil</Label>
        <Input
          id="profile-title"
          placeholder="Nome do seu negócio"
          value={profileTitle}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      {/* Profile Description */}
      <div className="space-y-2">
        <Label htmlFor="profile-description">Descrição</Label>
        <Textarea
          id="profile-description"
          placeholder="Uma breve descrição sobre você ou seu negócio"
          value={profileDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {profileDescription.length}/150 caracteres
        </p>
      </div>
    </div>
  );
};

export default LinktreeProfileEditor;
