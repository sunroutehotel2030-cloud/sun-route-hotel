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

// Demo data - in production this would come from Lovable Cloud
const generateDemoData = () => {
  const leads = [
    { id: 1, date: "2026-01-02 14:30", checkIn: "2026-01-15", checkOut: "2026-01-18", guests: 2, source: "Google Ads" },
    { id: 2, date: "2026-01-02 10:15", checkIn: "2026-01-20", checkOut: "2026-01-22", guests: 3, source: "Direto" },
    { id: 3, date: "2026-01-01 18:45", checkIn: "2026-02-01", checkOut: "2026-02-05", guests: 4, source: "Instagram" },
    { id: 4, date: "2026-01-01 09:20", checkIn: "2026-01-25", checkOut: "2026-01-27", guests: 2, source: "Google Ads" },
    { id: 5, date: "2025-12-31 16:00", checkIn: "2026-01-10", checkOut: "2026-01-12", guests: 1, source: "Direto" },
  ];

  const dailyClicks = [
    { day: "Seg", clicks: 12 },
    { day: "Ter", clicks: 19 },
    { day: "Qua", clicks: 15 },
    { day: "Qui", clicks: 22 },
    { day: "Sex", clicks: 28 },
    { day: "Sáb", clicks: 35 },
    { day: "Dom", clicks: 30 },
  ];

  const trackedLinks = [
    { id: 1, name: "Hero CTA", url: "#top", clicks: 145 },
    { id: 2, name: "Acomodações", url: "#acomodacoes", clicks: 89 },
    { id: 3, name: "Instagram", url: "https://instagram.com/hotelsunroute", clicks: 56 },
  ];

  return { leads, dailyClicks, trackedLinks };
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(generateDemoData());
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    navigate("/admin");
  };

  const handleAddLink = () => {
    if (newLinkName && newLinkUrl) {
      setData((prev) => ({
        ...prev,
        trackedLinks: [
          ...prev.trackedLinks,
          { id: Date.now(), name: newLinkName, url: newLinkUrl, clicks: 0 },
        ],
      }));
      setNewLinkName("");
      setNewLinkUrl("");
    }
  };

  const handleDeleteLink = (id: number) => {
    setData((prev) => ({
      ...prev,
      trackedLinks: prev.trackedLinks.filter((link) => link.id !== id),
    }));
  };

  const exportLeads = () => {
    const csv = [
      ["Data", "Check-in", "Check-out", "Hóspedes", "Origem"],
      ...data.leads.map((lead) => [
        lead.date,
        lead.checkIn,
        lead.checkOut,
        lead.guests.toString(),
        lead.source,
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

  const stats = {
    pageViews: 1247,
    whatsappClicks: 89,
    googleAdsClicks: 42,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container-hotel px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-foreground">
            Painel Admin - Sun Route Hotel
          </h1>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
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
              <div className="text-3xl font-bold text-foreground">{stats.pageViews}</div>
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
              <div className="text-3xl font-bold text-foreground">{stats.whatsappClicks}</div>
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
              <div className="text-3xl font-bold text-foreground">{stats.googleAdsClicks}</div>
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
                  <BarChart data={data.dailyClicks}>
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
                  {data.trackedLinks.map((link) => (
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
            <Button variant="outline" onClick={exportLeads} className="gap-2">
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
                  {data.leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.date}</TableCell>
                      <TableCell>{lead.checkIn}</TableCell>
                      <TableCell>{lead.checkOut}</TableCell>
                      <TableCell>{lead.guests}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            lead.source === "Google Ads"
                              ? "bg-primary/10 text-primary"
                              : lead.source === "Instagram"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {lead.source}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
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
