"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { MapPin, FileText, DollarSign, TrendingUp, Eye, CheckCircle, XCircle, Clock } from "lucide-react"

// --- Dummy Data ---
const dummyRegions = [
  { id: 1, name: 'Jawa', description: 'Pulau utama dengan populasi terbesar.' },
  { id: 2, name: 'Sumatra', description: 'Pulau di ujung barat Indonesia.' },
  { id: 3, name: 'Kalimantan', description: 'Pulau dengan banyak hutan tropis.' },
  { id: 4, name: 'Sulawesi', description: 'Dikenal dengan bentuknya yang unik.' },
  { id: 5, name: 'Papua', description: 'Wilayah paling timur Indonesia.' },
];

const dummyReports = [
  { id: 1, regionId: 1, title: 'Kerusakan Atap Sekolah', description: 'Atap di SDN 1 Jakarta bocor parah.', status: 0, submittedAt: new Date('2025-07-20T09:00:00Z'), sourceIP: '192.168.1.1' },
  { id: 2, regionId: 3, title: 'Kekurangan Buku Pelajaran', description: 'Siswa di SMP 2 Pontianak kekurangan buku Matematika.', status: 1, submittedAt: new Date('2025-07-18T11:30:00Z'), sourceIP: '10.0.0.5' },
  { id: 3, regionId: 5, title: 'Akses Internet Lambat', description: 'Koneksi internet di SMA 1 Jayapura sangat lambat.', status: 2, submittedAt: new Date('2025-07-15T14:00:00Z'), sourceIP: '172.16.0.10' },
  { id: 4, regionId: 1, title: 'Perbaikan Lapangan Olahraga', description: 'Lapangan basket perlu perbaikan segera.', status: 0, submittedAt: new Date('2025-07-21T08:00:00Z'), sourceIP: '192.168.1.2' },
  { id: 5, regionId: 2, title: 'Butuh Proyektor Baru', description: 'Proyektor di ruang kelas 3 sudah tidak berfungsi.', status: 1, submittedAt: new Date('2025-07-19T16:00:00Z'), sourceIP: '10.0.1.8' },
];

const dummyDonations = [
  { id: 1, regionId: 1, donorName: 'Budi Hartono', amount: 500, message: 'Semoga bermanfaat untuk pendidikan di Jawa.', paymentStatus: 1, createdAt: new Date('2025-07-21T10:00:00Z') },
  { id: 2, regionId: 3, donorName: 'Siti Aminah', amount: 250, message: 'Untuk anak-anak di Kalimantan.', paymentStatus: 1, createdAt: new Date('2025-07-20T12:45:00Z') },
  { id: 3, regionId: 5, donorName: 'Anonymous', amount: 1000, message: 'Maju terus pendidikan Papua!', paymentStatus: 0, createdAt: new Date('2025-07-22T09:30:00Z') },
  { id: 4, regionId: 1, donorName: 'John Doe', amount: 150, message: '', paymentStatus: 2, createdAt: new Date('2025-07-19T15:00:00Z') },
];


// Zustand store for state management
const useDashboardStore = create((set, get) => ({
  regions: [],
  reports: [],
  donations: [],
  loading: true,
  selectedItem: null,
  selectedType: null,

  setLoading: (loading) => set({ loading }),
  setRegions: (regions) => set({ regions }),
  setReports: (reports) => set({ reports }),
  setDonations: (donations) => set({ donations }),
  setSelectedItem: (item, type) => set({ selectedItem: item, selectedType: type }),

  fetchData: async () => {
    set({ loading: true });
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({
      regions: dummyRegions,
      reports: dummyReports,
      donations: dummyDonations,
      loading: false
    });
  },

  updateReportStatus: async (reportId, status) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    const { reports } = get();
    const updatedReports = reports.map((report) => (report.id === reportId ? { ...report, status } : report));
    set({ reports: updatedReports, loading: false, selectedItem: null });
  },
}));

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const getStatusBadge = (status) => {
  const statusMap = {
    0: { label: "Pending", variant: "secondary", icon: Clock },
    1: { label: "Approved", variant: "default", icon: CheckCircle },
    2: { label: "Rejected", variant: "destructive", icon: XCircle },
  };

  const { label, variant, icon: Icon } = statusMap[status] || statusMap[0];

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
};

const getPaymentStatusBadge = (status) => {
  const statusMap = {
    0: { label: "Pending", variant: "secondary" },
    1: { label: "Success", variant: "default" },
    2: { label: "Failed", variant: "destructive" },
  };

  const { label, variant } = statusMap[status] || statusMap[0];
  return <Badge variant={variant}>{label}</Badge>;
};

export default function DashboardPage() {
  const {
    regions,
    reports,
    donations,
    loading,
    selectedItem,
    selectedType,
    fetchData,
    setSelectedItem,
    updateReportStatus,
  } = useDashboardStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate statistics
  const totalRegions = regions.length;
  const totalReports = reports.length;
  const totalDonations = donations.reduce((sum, donation) => donation.paymentStatus === 1 ? sum + donation.amount : sum, 0);
  const pendingReports = reports.filter((report) => report.status === 0).length;

  // Prepare chart data
  const regionReportsData = regions.map((region) => ({
    name: region.name,
    reports: reports.filter((report) => report.regionId === region.id).length,
    donations: donations.filter((donation) => donation.regionId === region.id).length,
  }));

  const reportStatusData = [
    { name: "Pending", value: reports.filter((r) => r.status === 0).length },
    { name: "Approved", value: reports.filter((r) => r.status === 1).length },
    { name: "Rejected", value: reports.filter((r) => r.status === 2).length },
  ].filter(item => item.value > 0);


  if (loading && !selectedItem) { // Show full page loader only on initial load
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of regions, reports, and donations</p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">{pendingReports} pending review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{totalDonations}.000.000</div>
            <p className="text-xs text-muted-foreground">{donations.length} donations received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReports > 0 ? Math.round((reports.filter((r) => r.status === 1).length / totalReports) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Report approval rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Reports & Donations by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionReportsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reports" fill="#8884d8" name="Reports" />
                <Bar dataKey="donations" fill="#82ca9d" name="Donations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Click on any report to view details and manage status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.slice(0, 10).map((report) => {
                    const region = regions.find((r) => r.id === report.regionId);
                    return (
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedItem(report, "report")}
                      >
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>{region?.name || "Unknown"}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>{new Date(report.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(report, "report");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Click on any donation to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.slice(0, 10).map((donation) => {
                    const region = regions.find((r) => r.id === donation.regionId);
                    return (
                      <TableRow
                        key={donation.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedItem(donation, "donation")}
                      >
                        <TableCell>{donation.donorName || "Anonymous"}</TableCell>
                        <TableCell className="font-medium">Rp{donation.amount}.000</TableCell>
                        <TableCell>{region?.name || "Unknown"}</TableCell>
                        <TableCell>{getPaymentStatusBadge(donation.paymentStatus)}</TableCell>
                        <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(donation, "donation");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regions</CardTitle>
              <CardDescription>Click on any region to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Donations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map((region) => {
                    const regionReports = reports.filter((r) => r.regionId === region.id);
                    const regionDonations = donations.filter((d) => d.regionId === region.id);
                    return (
                      <TableRow
                        key={region.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedItem(region, "region")}
                      >
                        <TableCell className="font-medium">{region.name}</TableCell>
                        <TableCell>{region.description || "No description"}</TableCell>
                        <TableCell>{regionReports.length}</TableCell>
                        <TableCell>{regionDonations.length}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(region, "region");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null, null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedType === "report" && "Report Details"}
              {selectedType === "donation" && "Donation Details"}
              {selectedType === "region" && "Region Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedType === "report" && "View and manage report information"}
              {selectedType === "donation" && "View donation information"}
              {selectedType === "region" && "View region information and statistics"}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && selectedType === "report" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <p className="text-sm text-muted-foreground">{selectedItem.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Submitted At</label>
                  <p className="text-sm text-muted-foreground">{new Date(selectedItem.submittedAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Source IP</label>
                  <p className="text-sm text-muted-foreground">{selectedItem.sourceIP || "N/A"}</p>
                </div>
              </div>

              {selectedItem.status === 0 && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => updateReportStatus(selectedItem.id, 1)} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateReportStatus(selectedItem.id, 2)}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}

          {selectedItem && selectedType === "donation" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Donor Name</label>
                  <p className="text-sm text-muted-foreground">{selectedItem.donorName || "Anonymous"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <p className="text-sm text-muted-foreground font-bold">${selectedItem.amount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedItem.message || "No message"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Payment Status</label>
                  <div className="mt-1">{getPaymentStatusBadge(selectedItem.paymentStatus)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Created At</label>
                  <p className="text-sm text-muted-foreground">{new Date(selectedItem.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {selectedItem && selectedType === "region" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm text-muted-foreground">{selectedItem.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">{selectedItem.description || "No description"}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {reports.filter((r) => r.regionId === selectedItem.id).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Reports</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {donations.filter((d) => d.regionId === selectedItem.id).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Donations</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    $
                    {donations
                      .filter((d) => d.regionId === selectedItem.id && d.paymentStatus === 1)
                      .reduce((sum, d) => sum + d.amount, 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Raised</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
