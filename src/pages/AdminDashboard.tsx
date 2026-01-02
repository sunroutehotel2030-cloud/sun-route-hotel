import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  Download,
  LogOut,
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Loader2,
  LayoutDashboard,
  BarChart3,
  Settings,
  Home,
  FileText,
  Bell,
  Share2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import LinktreeManager from "@/components/admin/LinktreeManager";
import PhotoManager from "@/components/admin/PhotoManager";

interface Lead {
  id: string;
  clicked_at: string;
  check_in: string;
  check_out: string;
  guests: number;
  utm_source: string | null;
}

interface TrackedLink {
  id: string;
  name: string;
  url: string;
  clicks: number;
}

interface DailyClick {
  day: string;
  clicks: number;
}

type AdminSection = "dashboard" | "analytics" | "leads" | "links" | "linktree" | "photos" | "settings";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [trackedLinks, setTrackedLinks] = useState<TrackedLink[]>([]);
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([]);
  const [pageViews, setPageViews] = useState(0);
  const [whatsappClicks, setWhatsappClicks] = useState(0);
  const [googleAdsClicks, setGoogleAdsClicks] = useState(0);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { id: "dashboard" as AdminSection, label: "Dashboard", icon: LayoutDashboard },
    { id: "analytics" as AdminSection, label: "Analytics", icon: BarChart3 },
    { id: "leads" as AdminSection, label: "Leads", icon: Users },
    { id: "links" as AdminSection, label: "Links", icon: Link2 },
    { id: "linktree" as AdminSection, label: "Linktree", icon: Share2 },
    { id: "photos" as AdminSection, label: "Fotos", icon: ImageIcon },
    { id: "settings" as AdminSection, label: "Configurações", icon: Settings },
  ];

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/admin");
      } else if (!isAdmin) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
          variant: "destructive",
        });
        navigate("/admin");
      } else {
        fetchData();
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .order("clicked_at", { ascending: false })
        .limit(100);

      setLeads(leadsData || []);

      const { count: viewsCount } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true });

      setPageViews(viewsCount || 0);

      const { count: clicksCount } = await supabase
        .from("whatsapp_clicks")
        .select("*", { count: "exact", head: true });

      setWhatsappClicks(clicksCount || 0);

      const { count: adsCount } = await supabase
        .from("whatsapp_clicks")
        .select("*", { count: "exact", head: true })
        .not("utm_source", "is", null);

      setGoogleAdsClicks(adsCount || 0);

      const { data: linksData } = await supabase
        .from("tracked_links")
        .select("*")
        .order("created_at", { ascending: false });

      setTrackedLinks(linksData || []);

      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const clicksByDay: DailyClick[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayName = days[date.getDay()];

        const { count } = await supabase
          .from("whatsapp_clicks")
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

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  const handleAddLink = async () => {
    if (newLinkName && newLinkUrl) {
      const { error } = await supabase.from("tracked_links").insert({
        name: newLinkName,
        url: newLinkUrl,
      });

      if (!error) {
        setNewLinkName("");
        setNewLinkUrl("");
        fetchData();
        toast({
          title: "Link adicionado",
          description: "O link foi cadastrado com sucesso.",
        });
      }
    }
  };

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase.from("tracked_links").delete().eq("id", id);

    if (!error) {
      fetchData();
      toast({
        title: "Link removido",
        description: "O link foi removido com sucesso.",
      });
    }
  };

  const exportLeads = () => {
    const csv = [
      ["Data", "Check-in", "Check-out", "Hóspedes", "Origem"],
      ...leads.map((lead) => [
        format(new Date(lead.clicked_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        lead.check_in,
        lead.check_out,
        lead.guests.toString(),
        lead.utm_source || "Direto",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-sunroute.csv";
    a.click();
  };

  const getSourceLabel = (source: string | null) => {
    if (!source) return "Direto";
    if (source.toLowerCase().includes("google")) return "Google Ads";
    if (source.toLowerCase().includes("instagram")) return "Instagram";
    return source;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visualizações
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{pageViews}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de visualizações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliques WhatsApp
            </CardTitle>
            <MousePointerClick className="h-4 w-4 text-whatsapp" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{whatsappClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Reservas iniciadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Via Google Ads
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{googleAdsClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Cliques com UTM</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse as principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => setActiveSection("leads")} className="h-24 flex-col gap-2">
              <Users className="h-6 w-6" />
              Ver Leads
            </Button>
            <Button variant="outline" onClick={() => setActiveSection("analytics")} className="h-24 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              Analytics
            </Button>
            <Button variant="outline" onClick={() => setActiveSection("links")} className="h-24 flex-col gap-2">
              <Link2 className="h-6 w-6" />
              Gerenciar Links
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="h-24 flex-col gap-2">
              <Home className="h-6 w-6" />
              Ver Site
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Leads Recentes</CardTitle>
            <CardDescription>Últimas 5 tentativas de reserva</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveSection("leads")}>
            Ver Todos
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium text-foreground">
                    {format(new Date(lead.clicked_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lead.guests} hóspede(s) • {lead.check_in} a {lead.check_out}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getSourceLabel(lead.utm_source) === "Google Ads"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-secondary-foreground"
                }`}>
                  {getSourceLabel(lead.utm_source)}
                </span>
              </div>
            ))}
            {leads.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhum lead ainda</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Cliques por Dia</CardTitle>
          <CardDescription>Cliques no WhatsApp nos últimos 7 dias</CardDescription>
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
          <CardTitle>Resumo de Performance</CardTitle>
          <CardDescription>Métricas do site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Page Views</span>
              </div>
              <span className="font-bold text-foreground">{pageViews}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <MousePointerClick className="h-5 w-5 text-whatsapp" />
                <span className="text-foreground">WhatsApp Clicks</span>
              </div>
              <span className="font-bold text-foreground">{whatsappClicks}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-foreground">Google Ads</span>
              </div>
              <span className="font-bold text-foreground">{googleAdsClicks}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Total Leads</span>
              </div>
              <span className="font-bold text-foreground">{leads.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLeads = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leads Capturados
          </CardTitle>
          <CardDescription>Tentativas de reserva feitas no site</CardDescription>
        </div>
        <Button variant="outline" onClick={exportLeads} className="gap-2" disabled={leads.length === 0}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data do Clique</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Hóspedes</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum lead capturado ainda
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {format(new Date(lead.clicked_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{lead.check_in}</TableCell>
                    <TableCell>{lead.check_out}</TableCell>
                    <TableCell>{lead.guests}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        getSourceLabel(lead.utm_source) === "Google Ads"
                          ? "bg-primary/10 text-primary"
                          : getSourceLabel(lead.utm_source) === "Instagram"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        {getSourceLabel(lead.utm_source)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const renderLinks = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Rastreador de Links
        </CardTitle>
        <CardDescription>Gerencie e acompanhe seus links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome do link"
              value={newLinkName}
              onChange={(e) => setNewLinkName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="URL"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddLink} size="icon" className="flex-shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {trackedLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{link.name}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">{link.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-primary">{link.clicks} cliques</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {trackedLinks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum link cadastrado</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da Conta
          </CardTitle>
          <CardDescription>Gerencie sua conta de administrador</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium text-green-600">Admin Ativo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>Configure alertas e notificações</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Em breve você poderá configurar notificações por email para novos leads.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações do Site
          </CardTitle>
          <CardDescription>Dados gerais do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between p-3 bg-secondary rounded-lg">
              <span className="text-muted-foreground">Total de Leads</span>
              <span className="font-bold text-foreground">{leads.length}</span>
            </div>
            <div className="flex justify-between p-3 bg-secondary rounded-lg">
              <span className="text-muted-foreground">Links Cadastrados</span>
              <span className="font-bold text-foreground">{trackedLinks.length}</span>
            </div>
            <div className="flex justify-between p-3 bg-secondary rounded-lg">
              <span className="text-muted-foreground">Page Views</span>
              <span className="font-bold text-foreground">{pageViews}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "analytics":
        return renderAnalytics();
      case "leads":
        return renderLeads();
      case "links":
        return renderLinks();
      case "linktree":
        return <LinktreeManager />;
      case "photos":
        return <PhotoManager />;
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-lg font-display font-bold text-foreground">Sun Route Hotel</h1>
          <p className="text-sm text-muted-foreground">Painel Admin</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="outline" onClick={() => navigate("/")} className="w-full gap-2 mb-2">
            <Home className="h-4 w-4" />
            Ver Site
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="w-full gap-2 text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground capitalize">
                {sidebarItems.find(item => item.id === activeSection)?.label || "Dashboard"}
              </h2>
              {user && (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <div className="md:hidden">
                <Button variant="outline" onClick={handleLogout} size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden px-4 pb-4 overflow-x-auto">
            <div className="flex gap-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSection(item.id)}
                  className="flex-shrink-0 gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;