import { useState, useEffect } from "react";
import {
  Link2,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  BarChart3,
  MousePointerClick,
  TrendingUp,
  Instagram,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Save,
  X,
  Loader2,
  Copy,
  QrCode,
  Palette,
  Upload,
  Check,
  Download,
} from "lucide-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LinktreeLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  is_active: boolean;
  position: number;
  clicks: number;
  created_at: string;
}

interface LinktreeSettings {
  id: string;
  background_color: string;
  primary_color: string;
  text_color: string;
  button_style: string;
  background_image_url: string | null;
}

interface DailyClick {
  day: string;
  clicks: number;
}

const iconOptions = [
  { value: "link", label: "Link", icon: Link2 },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "globe", label: "Website", icon: Globe },
  { value: "mail", label: "Email", icon: Mail },
  { value: "phone", label: "Telefone", icon: Phone },
  { value: "location", label: "Localização", icon: MapPin },
  { value: "calendar", label: "Agenda", icon: Calendar },
  { value: "star", label: "Destaque", icon: Star },
];

const COLORS = ["hsl(35, 55%, 52%)", "hsl(35, 45%, 62%)", "hsl(35, 35%, 72%)", "hsl(35, 25%, 82%)"];

const LinktreeManager = () => {
  const [links, setLinks] = useState<LinktreeLink[]>([]);
  const [settings, setSettings] = useState<LinktreeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [todayClicks, setTodayClicks] = useState(0);
  const [copied, setCopied] = useState(false);

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinktreeLink | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formIcon, setFormIcon] = useState("link");
  const [formActive, setFormActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings form
  const [bgColor, setBgColor] = useState("#f5f0e8");
  const [primaryColor, setPrimaryColor] = useState("#b8860b");
  const [textColor, setTextColor] = useState("#1a1a1a");
  const [buttonStyle, setButtonStyle] = useState("rounded");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const linktreeUrl = typeof window !== "undefined" ? `${window.location.origin}/links` : "/links";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch links
      const { data: linksData, error: linksError } = await supabase
        .from("linktree_links")
        .select("*")
        .order("position", { ascending: true });

      if (linksError) throw linksError;
      setLinks(linksData || []);

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("linktree_settings")
        .select("*")
        .limit(1)
        .single();

      if (!settingsError && settingsData) {
        setSettings(settingsData);
        setBgColor(settingsData.background_color || "#f5f0e8");
        setPrimaryColor(settingsData.primary_color || "#b8860b");
        setTextColor(settingsData.text_color || "#1a1a1a");
        setButtonStyle(settingsData.button_style || "rounded");
      }

      // Calculate total clicks
      const total = (linksData || []).reduce((sum, link) => sum + link.clicks, 0);
      setTotalClicks(total);

      // Fetch today's clicks
      const today = new Date();
      const { count: todayCount } = await supabase
        .from("linktree_clicks")
        .select("*", { count: "exact", head: true })
        .gte("clicked_at", startOfDay(today).toISOString())
        .lte("clicked_at", endOfDay(today).toISOString());

      setTodayClicks(todayCount || 0);

      // Fetch daily clicks for chart
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const clicksByDay: DailyClick[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayName = days[date.getDay()];

        const { count } = await supabase
          .from("linktree_clicks")
          .select("*", { count: "exact", head: true })
          .gte("clicked_at", startOfDay(date).toISOString())
          .lte("clicked_at", endOfDay(date).toISOString());

        clicksByDay.push({ day: dayName, clicks: count || 0 });
      }

      setDailyClicks(clicksByDay);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(linktreeUrl);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormUrl("");
    setFormIcon("link");
    setFormActive(true);
    setEditingLink(null);
  };

  const openEditDialog = (link: LinktreeLink) => {
    setEditingLink(link);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormIcon(link.icon);
    setFormActive(link.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formUrl.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e a URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingLink) {
        const { error } = await supabase
          .from("linktree_links")
          .update({
            title: formTitle.trim(),
            url: formUrl.trim(),
            icon: formIcon,
            is_active: formActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingLink.id);

        if (error) throw error;

        toast({
          title: "Link atualizado",
          description: "As alterações foram salvas.",
        });
      } else {
        const maxPosition = Math.max(0, ...links.map((l) => l.position));
        
        const { error } = await supabase.from("linktree_links").insert({
          title: formTitle.trim(),
          url: formUrl.trim(),
          icon: formIcon,
          is_active: formActive,
          position: maxPosition + 1,
        });

        if (error) throw error;

        toast({
          title: "Link criado",
          description: "O novo link foi adicionado.",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving link:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o link.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("linktree_links").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Link removido",
        description: "O link foi excluído com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o link.",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (link: LinktreeLink) => {
    try {
      const { error } = await supabase
        .from("linktree_links")
        .update({ is_active: !link.is_active, updated_at: new Date().toISOString() })
        .eq("id", link.id);

      if (error) throw error;

      toast({
        title: link.is_active ? "Link desativado" : "Link ativado",
        description: `O link "${link.title}" foi ${link.is_active ? "desativado" : "ativado"}.`,
      });

      fetchData();
    } catch (error) {
      console.error("Error toggling link:", error);
    }
  };

  const moveLink = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[newIndex];
    newLinks[newIndex] = temp;

    try {
      await Promise.all([
        supabase
          .from("linktree_links")
          .update({ position: newIndex })
          .eq("id", temp.id),
        supabase
          .from("linktree_links")
          .update({ position: index })
          .eq("id", newLinks[index].id),
      ]);

      fetchData();
    } catch (error) {
      console.error("Error reordering links:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImage(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `background-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("linktree")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("linktree")
        .getPublicUrl(fileName);

      if (settings) {
        const { error: updateError } = await supabase
          .from("linktree_settings")
          .update({ background_image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
          .eq("id", settings.id);

        if (updateError) throw updateError;

        setSettings({ ...settings, background_image_url: urlData.publicUrl });
        toast({
          title: "Imagem enviada",
          description: "A imagem de fundo foi atualizada.",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeBackgroundImage = async () => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from("linktree_settings")
        .update({ background_image_url: null, updated_at: new Date().toISOString() })
        .eq("id", settings.id);

      if (error) throw error;

      setSettings({ ...settings, background_image_url: null });
      toast({
        title: "Imagem removida",
        description: "A imagem de fundo foi removida.",
      });
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSavingSettings(true);

    try {
      const { error } = await supabase
        .from("linktree_settings")
        .update({
          background_color: bgColor,
          primary_color: primaryColor,
          text_color: textColor,
          button_style: buttonStyle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id);

      if (error) throw error;

      setSettings({
        ...settings,
        background_color: bgColor,
        primary_color: primaryColor,
        text_color: textColor,
        button_style: buttonStyle,
      });

      toast({
        title: "Configurações salvas",
        description: "As personalizações foram aplicadas.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find((o) => o.value === iconName);
    return option?.icon || Link2;
  };

  const pieData = links
    .filter((l) => l.clicks > 0)
    .slice(0, 4)
    .map((link) => ({
      name: link.title,
      value: link.clicks,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="links" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
        <TabsTrigger value="links" className="gap-2">
          <Link2 className="h-4 w-4" />
          Links
        </TabsTrigger>
        <TabsTrigger value="analytics" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Métricas
        </TabsTrigger>
        <TabsTrigger value="customize" className="gap-2">
          <Palette className="h-4 w-4" />
          Personalizar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="links" className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Link da Página
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input value={linktreeUrl} readOnly className="text-sm" />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <a
                href="/links"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Abrir página →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer hover:opacity-80 transition-opacity hover:scale-105">
                    <QRCodeSVG value={linktreeUrl} size={80} />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>QR Code do Linktree</DialogTitle>
                    <DialogDescription>
                      Escaneie para acessar sua página de links
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="bg-white p-4 rounded-xl">
                      <QRCodeCanvas 
                        id="qr-code-canvas"
                        value={linktreeUrl} 
                        size={250} 
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">{linktreeUrl}</p>
                    <div className="flex gap-2">
                      <Button onClick={copyLink} variant="outline" className="gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        Copiar Link
                      </Button>
                      <Button 
                        onClick={() => {
                          const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
                          if (canvas) {
                            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                            const downloadLink = document.createElement("a");
                            downloadLink.href = pngUrl;
                            downloadLink.download = "linktree-qrcode.png";
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                            toast({
                              title: "QR Code baixado!",
                              description: "A imagem foi salva no seu dispositivo.",
                            });
                          }
                        }} 
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Baixar PNG
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MousePointerClick className="h-4 w-4" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Links ativos</span>
                  <span className="font-bold">{links.filter((l) => l.is_active).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliques hoje</span>
                  <span className="font-bold">{todayClicks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de cliques</span>
                  <span className="font-bold">{totalClicks}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Gerenciar Links
              </CardTitle>
              <CardDescription>Crie e organize seus links</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingLink ? "Editar Link" : "Novo Link"}</DialogTitle>
                  <DialogDescription>
                    {editingLink ? "Atualize as informações do link" : "Adicione um novo link"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Título</label>
                    <Input
                      placeholder="Ex: Nosso Instagram"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">URL</label>
                    <Input
                      placeholder="https://instagram.com/sunroutehotel"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Ícone</label>
                    <Select value={formIcon} onValueChange={setFormIcon}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="rounded border-border"
                    />
                    <label htmlFor="active" className="text-sm text-foreground">
                      Link ativo
                    </label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1 gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="flex-1 gap-2">
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {links.map((link, index) => {
                const IconComponent = getIconComponent(link.icon);
                return (
                  <div
                    key={link.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      link.is_active ? "bg-card border-border" : "bg-muted/50 border-muted opacity-60"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveLink(index, "up")}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveLink(index, "down")}
                        disabled={index === links.length - 1}
                      >
                        <GripVertical className="h-4 w-4 -rotate-90" />
                      </Button>
                    </div>

                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{link.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MousePointerClick className="h-4 w-4" />
                      <span className="font-medium text-foreground">{link.clicks}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(link)}
                        title={link.is_active ? "Desativar" : "Ativar"}
                      >
                        {link.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(link)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {links.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum link cadastrado</p>
                  <p className="text-sm">Clique em "Novo Link" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Links
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{links.length}</div>
              <p className="text-xs text-muted-foreground">{links.filter((l) => l.is_active).length} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cliques Hoje
              </CardTitle>
              <MousePointerClick className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{todayClicks}</div>
              <p className="text-xs text-muted-foreground">nas últimas 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Cliques
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalClicks}</div>
              <p className="text-xs text-muted-foreground">desde o início</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa Média
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {links.length > 0 ? Math.round(totalClicks / links.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">cliques por link</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliques por Dia</CardTitle>
              <CardDescription>Últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyClicks}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="hsl(35 55% 52%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links Mais Clicados</CardTitle>
              <CardDescription>Distribuição de cliques</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nenhum clique registrado ainda
                </div>
              )}
              <div className="mt-4 space-y-2">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="flex-1 truncate text-foreground">{item.name}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="customize" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Cores
              </CardTitle>
              <CardDescription>Personalize as cores da sua página</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor de Fundo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cor Principal (Botões)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cor do Texto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estilo dos Botões</label>
                <Select value={buttonStyle} onValueChange={setButtonStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded">Arredondado</SelectItem>
                    <SelectItem value="square">Quadrado</SelectItem>
                    <SelectItem value="pill">Pílula</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={saveSettings} disabled={savingSettings} className="w-full gap-2">
                {savingSettings ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Cores
              </Button>
            </CardContent>
          </Card>

          {/* Background Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Imagem de Fundo
              </CardTitle>
              <CardDescription>Adicione uma imagem de fundo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings?.background_image_url ? (
                <div className="relative">
                  <img
                    src={settings.background_image_url}
                    alt="Background"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeBackgroundImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma imagem selecionada</p>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="bg-upload"
                  disabled={uploadingImage}
                />
                <label htmlFor="bg-upload">
                  <Button
                    variant="outline"
                    className="w-full gap-2 cursor-pointer"
                    asChild
                    disabled={uploadingImage}
                  >
                    <span>
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Enviar Imagem
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
            <CardDescription>Veja como sua página ficará</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-lg p-8 min-h-[300px] flex flex-col items-center justify-center"
              style={{
                backgroundColor: bgColor,
                backgroundImage: settings?.background_image_url
                  ? `url(${settings.background_image_url})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-white/80 mx-auto mb-3" />
                <h3 className="font-bold" style={{ color: textColor }}>
                  Sun Route Hotel
                </h3>
                <p className="text-sm opacity-70" style={{ color: textColor }}>
                  Sua hospedagem em Boa Vista
                </p>
              </div>

              <div className="space-y-3 w-full max-w-xs">
                {["Link de Exemplo 1", "Link de Exemplo 2"].map((label, i) => (
                  <div
                    key={i}
                    className="p-3 flex items-center gap-3 bg-white/90"
                    style={{
                      borderRadius:
                        buttonStyle === "pill"
                          ? "9999px"
                          : buttonStyle === "square"
                          ? "4px"
                          : "12px",
                      borderLeft: `4px solid ${primaryColor}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Link2 className="h-4 w-4" style={{ color: primaryColor }} />
                    </div>
                    <span style={{ color: textColor }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default LinktreeManager;