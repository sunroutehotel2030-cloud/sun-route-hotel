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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [trackedLinks, setTrackedLinks] = useState<TrackedLink[]>([]);
  const [dailyClicks, setDailyClicks] = useState<DailyClick[]>([]);
  const [pageViews, setPageViews] = useState(0);
  const [whatsappClicks, setWhatsappClicks] = useState(0);
  const [googleAdsClicks, setGoogleAdsClicks] = useState(0);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch leads
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .order("clicked_at", { ascending: false })
        .limit(100);

      setLeads(leadsData || []);

      // Fetch page views count
      const { count: viewsCount } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true });

      setPageViews(viewsCount || 0);

      // Fetch WhatsApp clicks count
      const { count: clicksCount } = await supabase
        .from("whatsapp_clicks")
        .select("*", { count: "exact", head: true });

      setWhatsappClicks(clicksCount || 0);

      // Fetch Google Ads clicks (with utm_source)
      const { count: adsCount } = await supabase
        .from("whatsapp_clicks")
        .select("*", { count: "exact", head: true })
        .not("utm_source", "is", null);

      setGoogleAdsClicks(adsCount || 0);

      // Fetch tracked links
      const { data: linksData } = await supabase
        .from("tracked_links")
        .select("*")
        .order("created_at", { ascending: false });

      setTrackedLinks(linksData || []);

      // Calculate daily clicks for the last 7 days
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

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container-hotel px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-foreground">
            Painel Admin - Sun Route Hotel
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container-hotel px-4 py-8">
        {/* Stats Cards */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

          {/* Link Tracker */}
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

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {trackedLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{link.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {link.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-primary">{link.clicks}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteLink(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {trackedLinks.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Nenhum link cadastrado
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Table */}
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
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              getSourceLabel(lead.utm_source) === "Google Ads"
                                ? "bg-primary/10 text-primary"
                                : getSourceLabel(lead.utm_source) === "Instagram"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
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
      </main>
    </div>
  );
};

export default AdminDashboard;
