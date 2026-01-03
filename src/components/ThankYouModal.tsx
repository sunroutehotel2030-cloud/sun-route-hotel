import { CheckCircle, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ThankYouModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThankYouModal = ({ open, onOpenChange }: ThankYouModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="sr-only">Obrigado</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#25D366]" />
          </div>
          
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Obrigado!
          </h2>
          
          <p className="text-muted-foreground">
            O WhatsApp foi aberto com sua solicitação de reserva. 
            Nossa equipe responderá em breve!
          </p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Aguarde nosso retorno no WhatsApp</span>
          </div>
          
          <Button 
            onClick={() => onOpenChange(false)} 
            className="mt-4"
            variant="outline"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThankYouModal;
