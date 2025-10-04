import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DebugRank from "@/components/debug-rank";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Package, DollarSign, Clock, Settings } from "lucide-react";
import { formatCOP } from "../../lib/currency";

const MOCK_ADMIN_KPIS = {
  gmv: 48200000,
  takeRate: 13.2,
  fillRate: 94,
  p95Dispatch: 52
};

const MOCK_VENDORS = [
  {
    id: "vendor-1",
    businessName: "Estación3",
    ratingAvg: 4.7,
    slaP95DispatchHrs: 36,
    monthlyGmv: 18200000,
    commissionBp: 1200,
    status: "active",
    score: 92.5
  },
  {
    id: "vendor-2", 
    businessName: "ClearBack Labs",
    ratingAvg: 4.5,
    slaP95DispatchHrs: 60,
    monthlyGmv: 22500000,
    commissionBp: 1500,
    status: "active",
    score: 84.2
  },
  {
    id: "vendor-3",
    businessName: "Salón Aliado", 
    ratingAvg: 4.0,
    slaP95DispatchHrs: 84,
    monthlyGmv: 7500000,
    commissionBp: 1200,
    status: "review",
    score: 68.8
  }
];

const MOCK_RANKER_CONFIG = {
  weights: {
    slaP95Dispatch: 0.22,
    deliveryEta: 0.15,
    ratingAvg: 0.18,
    nps: 0.08,
    returnRate: 0.10,
    onTimeShipRate: 0.10,
    supportResponseHrs: 0.05,
    stockHealth: 0.04,
    takeRateBp: 0.02,
    distanceKm: 0.03,
    sensitiveOk: 0.03
  },
  thresholds: {
    minRating: 3.8,
    maxSlaP95Hours: 96,
    maxReturnRate: 0.08
  }
};

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
            <p className="text-muted-foreground">
              Esta sección es solo para administradores.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-2xl mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-white/80">Gestión del marketplace</p>
        </div>

        <Tabs defaultValue="kpis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="vendors">Vendedores</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
          </TabsList>

          <TabsContent value="kpis" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-semibold mb-2">GMV (mes)</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {formatCOP(MOCK_ADMIN_KPIS.gmv * 100, false)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">↑ 18% vs mes anterior</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-semibold mb-2">Take Rate</p>
                      <p className="text-3xl font-bold text-green-900">
                        {MOCK_ADMIN_KPIS.takeRate}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">Promedio ponderado</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-semibold mb-2">Fill Rate</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {MOCK_ADMIN_KPIS.fillRate}%
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-purple-600 mt-2">Órdenes completadas</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700 font-semibold mb-2">P95 Despacho</p>
                      <p className="text-3xl font-bold text-amber-900">
                        {MOCK_ADMIN_KPIS.p95Dispatch}h
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-xs text-amber-600 mt-2">Percentil 95</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional KPI Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Gráfico de GMV, órdenes y vendedores activos por mes
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de comisiones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">12% (Estándar)</span>
                      <span className="text-sm font-semibold">67% vendedores</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">15% (Premium)</span>
                      <span className="text-sm font-semibold">22% vendedores</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">18% (Nuevo)</span>
                      <span className="text-sm font-semibold">11% vendedores</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gestión de vendedores</span>
                  <Button size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Invitar vendedor
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Vendedor</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Score</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">GMV (mes)</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Comisión</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Estado</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {MOCK_VENDORS.map((vendor) => (
                        <tr key={vendor.id} data-testid={`row-vendor-${vendor.id}`}>
                          <td className="py-3">
                            <div>
                              <div className="font-semibold">{vendor.businessName}</div>
                              <div className="text-xs text-muted-foreground">
                                ★ {vendor.ratingAvg} | SLA: {vendor.slaP95DispatchHrs}h
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="font-bold text-primary">{vendor.score}</div>
                          </td>
                          <td className="py-3 text-sm">
                            {formatCOP(vendor.monthlyGmv * 100, false)}
                          </td>
                          <td className="py-3 text-sm">
                            {vendor.commissionBp / 100}%
                          </td>
                          <td className="py-3">
                            <Badge 
                              variant={vendor.status === "active" ? "default" : "secondary"}
                              className={vendor.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
                            >
                              {vendor.status === "active" ? "Activo" : "En revisión"}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-primary hover:underline">
                                Ver detalles
                              </Button>
                              {vendor.status === "review" && (
                                <Button variant="ghost" size="sm" className="text-green-600 hover:underline">
                                  Aprobar
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Moderación de productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Sistema de moderación automática activo. 
                    Se revisan productos con claims médicos prohibidos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            {/* Ranking Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Configuración del Ranking
                  </div>
                  <Button>Editar pesos</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Pesos actuales:</h4>
                    <div className="space-y-2">
                      {Object.entries(MOCK_RANKER_CONFIG.weights).map(([key, weight]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <span className="font-semibold">{Math.round(weight * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Umbrales:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">Rating mínimo</span>
                        <span className="font-semibold">{MOCK_RANKER_CONFIG.thresholds.minRating}/5</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">SLA máximo</span>
                        <span className="font-semibold">{MOCK_RANKER_CONFIG.thresholds.maxSlaP95Hours}h</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">Devoluciones máx.</span>
                        <span className="font-semibold">{MOCK_RANKER_CONFIG.thresholds.maxReturnRate * 100}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <DebugRank />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Registro de auditoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-semibold">RANKER_UPDATE</p>
                      <p className="text-sm text-muted-foreground">
                        Admin actualizó pesos del ranking - hace 2 horas
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">Ver detalles</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-semibold">VENDOR_STATUS</p>
                      <p className="text-sm text-muted-foreground">
                        Vendedor "Salón Aliado" puesto en revisión - hace 1 día
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">Ver detalles</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-semibold">PRODUCT_MOD</p>
                      <p className="text-sm text-muted-foreground">
                        Producto bloqueado por claims prohibidos - hace 3 días
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">Ver detalles</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
