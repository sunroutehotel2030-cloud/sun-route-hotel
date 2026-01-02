import { useState, useEffect } from "react";
import {
  Link2,
  Plus,
  ExternalLink,
  BarChart3,
  MousePointerClick,
  Save,
  X,
  Loader2,
  Copy,
  QrCode,
  Palette,
  Upload,
  Check,
  Download,
  Smartphone,
} from "lucide-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { validateUrl } from "@/lib/urlValidation";
import LinktreeLinkItem from "./LinktreeLinkItem";
import LinktreeIconPicker from "./LinktreeIconPicker";
import LinktreeProfileEditor from "./LinktreeProfileEditor";
import LinktreePreview from "./LinktreePreview";

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
  logo_url: string | null;
  profile_title: string;
  profile_description: string | null;
  shadow_style: string;
  animation_style: string;
}

interface DailyClick {
  day: string;
  clicks: number;
}

const COLORS = ["hsl(35, 55%, 52%)", "hsl(35, 45%, 62%)", "hsl(35, 35%, 72%)", "hsl(35, 25%, 82%)"];

const LinktreeManager = () => {
  const [links, setLinks] = useState<LinktreeLink[]>([]);
  const [settings, setSettings] = useState<LinktreeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [todayClicks, setTodayClicks] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Drag state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
  const [shadowStyle, setShadowStyle] = useState("medium");
  const [animationStyle, setAnimationStyle] = useState("fade");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [profileTitle, setProfileTitle] = useState("Meu Linktree");
  const [profileDescription, setProfileDescription] = useState("");
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
        setSettings(settingsData as LinktreeSettings);
        setBgColor(settingsData.background_color || "#f5f0e8");
        setPrimaryColor(settingsData.primary_color || "#b8860b");
        setTextColor(settingsData.text_color || "#1a1a1a");
        setButtonStyle(settingsData.button_style || "rounded");
        setShadowStyle(settingsData.shadow_style || "medium");
        setAnimationStyle(settingsData.animation_style || "fade");
        setLogoUrl(settingsData.logo_url || null);
        setProfileTitle(settingsData.profile_title || "Meu Linktree");
        setProfileDescription(settingsData.profile_description || "");
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
    if (!formTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Preencha o título do link.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    const urlValidation = validateUrl(formUrl);
    if (!urlValidation.valid) {
      toast({
        title: "URL inválida",
        description: urlValidation.error || "Use uma URL válida começando com http:// ou https://",
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

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex !== null && draggingIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = async () => {
    if (draggingIndex === null || dragOverIndex === null || draggingIndex === dragOverIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newLinks = [...links];
    const [draggedItem] = newLinks.splice(draggingIndex, 1);
    newLinks.splice(dragOverIndex, 0, draggedItem);

    // Update positions locally first for immediate feedback
    setLinks(newLinks);
    setDraggingIndex(null);
    setDragOverIndex(null);

    // Update positions in database
    try {
      await Promise.all(
        newLinks.map((link, index) =>
          supabase
            .from("linktree_links")
            .update({ position: index })
            .eq("id", link.id)
        )
      );

      toast({
        title: "Ordem atualizada",
        description: "A ordem dos links foi alterada.",
      });
    } catch (error) {
      console.error("Error reordering links:", error);
      fetchData(); // Revert on error
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
          shadow_style: shadowStyle,
          animation_style: animationStyle,
          logo_url: logoUrl,
          profile_title: profileTitle,
          profile_description: profileDescription || null,
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
        shadow_style: shadowStyle,
        animation_style: animationStyle,
        logo_url: logoUrl,
        profile_title: profileTitle,
        profile_description: profileDescription,
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

  const pieData = links
    .filter((l) => l.clicks > 0)
    .slice(0, 4)
    .map((link) => ({
      name: link.title,
      value: link.clicks,
    }));

  // Build preview settings object
  const previewSettings = {
    background_color: bgColor,
    primary_color: primaryColor,
    text_color: textColor,
    button_style: buttonStyle,
    background_image_url: settings?.background_image_url || null,
    logo_url: logoUrl,
    profile_title: profileTitle,
    profile_description: profileDescription,
    shadow_style: shadowStyle,
    animation_style: animationStyle,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Tabs defaultValue="links" className="space-y-6">
          <div className="flex items-center justify-between">
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

            <Button
              variant="outline"
              size="sm"
              className="gap-2 lg:hidden"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Smartphone className="h-4 w-4" />
              Preview
            </Button>
          </div>

          <TabsContent value="links" className="space-y-6">
            {/* Public Link Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Seu link público</p>
                    <div className="flex items-center gap-2">
                      <Input value={linktreeUrl} readOnly className="bg-background font-mono text-sm" />
                      <Button size="icon" variant="outline" onClick={copyLink} className="shrink-0">
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <QrCode className="h-4 w-4" />
                          QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>QR Code do Linktree</DialogTitle>
                          <DialogDescription>
                            Escaneie para acessar sua página de links
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-4 py-4">
                          <div className="bg-white p-4 rounded-xl shadow-inner">
                            <QRCodeCanvas
                              id="qr-code-canvas"
                              value={linktreeUrl}
                              size={250}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground text-center font-mono">{linktreeUrl}</p>
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
                    <Button size="sm" className="gap-2" asChild>
                      <a href="/links" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Abrir página
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{links.filter((l) => l.is_active).length}</p>
                    <p className="text-xs text-muted-foreground">Links ativos</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{todayClicks}</p>
                    <p className="text-xs text-muted-foreground">Cliques hoje</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{totalClicks}</p>
                    <p className="text-xs text-muted-foreground">Total de cliques</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Links Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg">Gerenciar Links</CardTitle>
                  <CardDescription>Arraste para reordenar</CardDescription>
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
                        <Label>Título</Label>
                        <Input
                          placeholder="Ex: Nosso Instagram"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          placeholder="https://instagram.com/sunroutehotel"
                          value={formUrl}
                          onChange={(e) => setFormUrl(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ícone</Label>
                        <LinktreeIconPicker value={formIcon} onChange={setFormIcon} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="active"
                          checked={formActive}
                          onChange={(e) => setFormActive(e.target.checked)}
                          className="rounded border-border"
                        />
                        <Label htmlFor="active" className="cursor-pointer">
                          Link ativo
                        </Label>
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
                <div className="space-y-2">
                  {links.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum link cadastrado</p>
                      <p className="text-sm">Clique em "Novo Link" para começar</p>
                    </div>
                  ) : (
                    links.map((link, index) => (
                      <LinktreeLinkItem
                        key={link.id}
                        link={link}
                        index={index}
                        onEdit={openEditDialog}
                        onDelete={handleDelete}
                        onToggleActive={toggleActive}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        isDragging={draggingIndex === index}
                        dragOverIndex={dragOverIndex}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Cliques por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dailyClicks}>
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MousePointerClick className="h-5 w-5" />
                    Links Mais Clicados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name }) => name}
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      Sem dados de cliques ainda
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ranking de Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {links
                    .sort((a, b) => b.clicks - a.clicks)
                    .map((link, index) => (
                      <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="flex-1 font-medium truncate">{link.title}</span>
                        <span className="text-sm text-muted-foreground">{link.clicks} cliques</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perfil</CardTitle>
                <CardDescription>Personalize seu perfil e logomarca</CardDescription>
              </CardHeader>
              <CardContent>
                <LinktreeProfileEditor
                  logoUrl={logoUrl}
                  profileTitle={profileTitle}
                  profileDescription={profileDescription}
                  primaryColor={primaryColor}
                  onLogoChange={setLogoUrl}
                  onTitleChange={setProfileTitle}
                  onDescriptionChange={setProfileDescription}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cores</CardTitle>
                <CardDescription>Escolha as cores do seu Linktree</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Principal</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estilo dos Botões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Formato</Label>
                    <Select value={buttonStyle} onValueChange={setButtonStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rounded">Arredondado</SelectItem>
                        <SelectItem value="pill">Pílula</SelectItem>
                        <SelectItem value="square">Quadrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sombra</Label>
                    <Select value={shadowStyle} onValueChange={setShadowStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem sombra</SelectItem>
                        <SelectItem value="light">Leve</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="heavy">Forte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Imagem de Fundo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings?.background_image_url ? (
                  <div className="relative">
                    <img
                      src={settings.background_image_url}
                      alt="Fundo atual"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 gap-2"
                      onClick={removeBackgroundImage}
                    >
                      <X className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Clique para enviar uma imagem</p>
                      </>
                    )}
                  </label>
                )}
              </CardContent>
            </Card>

            <Button onClick={saveSettings} disabled={savingSettings} className="w-full gap-2">
              {savingSettings ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Configurações
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Panel */}
      <div className={`hidden lg:block sticky top-6 h-fit ${showPreview ? "" : "lg:hidden"}`}>
        <LinktreePreview links={links} settings={previewSettings} />
      </div>
    </div>
  );
};

export default LinktreeManager;
