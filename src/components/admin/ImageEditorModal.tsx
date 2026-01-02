import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Loader2, Upload, Crop as CropIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  convertHeicToJpg,
  isHeicFile,
  cropAndConvertToJpg,
  parseAspectRatio,
  parseOutputDimensions,
  loadFileAsDataUrl,
} from "@/utils/imageUtils";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blob: Blob) => void;
  title: string;
  recommendedSize: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageEditorModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  recommendedSize,
}: ImageEditorModalProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFormat, setOriginalFormat] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = parseAspectRatio(recommendedSize);
  const aspect = aspectRatio.width / aspectRatio.height;
  const outputDimensions = parseOutputDimensions(recommendedSize);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setOriginalFormat(file.type || file.name.split(".").pop()?.toUpperCase() || "");

    try {
      let processedFile: Blob = file;

      // Convert HEIC to JPG first
      if (isHeicFile(file)) {
        processedFile = await convertHeicToJpg(file);
      }

      const dataUrl = await loadFileAsDataUrl(processedFile);
      setImageSrc(dataUrl);
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    },
    [aspect]
  );

  const handleSave = async () => {
    if (!imageSrc || !completedCrop || !imgRef.current) return;

    setIsProcessing(true);

    try {
      // Calculate actual pixel values from the image
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      const cropArea = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      const blob = await cropAndConvertToJpg(
        imageSrc,
        cropArea,
        outputDimensions.width,
        outputDimensions.height
      );

      onSave(blob);
      handleClose();
    } catch (error) {
      console.error("Error saving image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setOriginalFormat("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onClose();
  };

  const getFormatLabel = () => {
    if (!originalFormat) return "";
    const format = originalFormat.replace("image/", "").toUpperCase();
    if (format === "JPEG" || format === "JPG") return "";
    return `${format} → JPG`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Editar Imagem - {title}
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-1">
            <span>📐 Tamanho recomendado: {recommendedSize}</span>
            {getFormatLabel() && (
              <span className="text-primary font-medium">
                🔄 {getFormatLabel()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!imageSrc ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Aceita: JPG, PNG, WEBP, GIF, HEIC e outros formatos
                </p>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button asChild disabled={isProcessing}>
                    <span>
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processando...
                        </>
                      ) : (
                        "Escolher arquivo"
                      )}
                    </span>
                  </Button>
                </Label>
                <Input
                  ref={inputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isProcessing}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-h-[400px]"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Imagem para editar"
                    onLoad={onImageLoad}
                    className="max-h-[400px] object-contain"
                  />
                </ReactCrop>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Arraste os cantos para ajustar o recorte. A proporção {aspectRatio.width}:{aspectRatio.height} está travada.
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  setImageSrc(null);
                  setCrop(undefined);
                  setCompletedCrop(undefined);
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Escolher outra imagem
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!imageSrc || !completedCrop || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditorModal;
