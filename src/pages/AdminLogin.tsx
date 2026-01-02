import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Simple password protection (for demo - in production use proper auth)
const ADMIN_PASSWORD = "sunroute2024";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("admin_authenticated", "true");
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Senha incorreta",
          description: "Por favor, verifique a senha e tente novamente.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Sun Route Hotel
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <Button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
