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
} from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [todayClicks, setTodayClicks] = useState(0);

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinktreeLink | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formIcon, setFormIcon] = useState("link");
  const [formActive, setFormActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        // Update existing
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
        // Create new
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

    // Update positions
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
    <div className="space-y-6">
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
              Link da Página
            </CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <a
              href="/links"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline font-medium"
            >
              /links →
            </a>
            <p className="text-xs text-muted-foreground">página pública</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cliques por Dia
            </CardTitle>
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

      {/* Links Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Gerenciar Links
            </CardTitle>
            <CardDescription>Crie e organize seus links do Linktree</CardDescription>
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
                  {editingLink ? "Atualize as informações do link" : "Adicione um novo link ao seu Linktree"}
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
                    Link ativo (visível na página)
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
    </div>
  );
};

export default LinktreeManager;