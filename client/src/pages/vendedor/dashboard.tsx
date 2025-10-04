import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VendorBadge from "@/components/vendor-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Package, DollarSign, Star, Eye, Settings } from "lucide-react";
import { formatCOP } from "../../lib/currency";
import { Link } from "wouter";

const MOCK_VENDOR_DATA = {
  id: "vendor-1",
  businessName: "Estación3",
  status: "active",
  commissionBp: 1200,
  kycStatus: "approved",
  ratingAvg: 4.7,
  slaP95DispatchHrs: 36,
  deliveryEtaDays: 2,
  nps: 62,
  returnRate: 0.03,
  onTimeShipRate: 0.95,
  responseHrs: 6,
  stockHealth: 0.9,
  takeRateBp: 1200,
  sensitiveOk: true,
  policyStrikes: 0,
  distanceKm: 15
};

const MOCK_RECENT_ORDERS = [
  {
    id: "ord-1",
    customerName: "María G.",
    productName: "Ducha-Orden™ Rail",
    amount: 5990000,
    status: "paid",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "ord-2", 
    customerName: "Carlos P.",
    productName: "Back Cleanser 200ml",
    amount: 4550000,
    status: "shipped",
    createdAt: "2024-01-14T14:20:00Z"
  },
  {
    id: "ord-3",
    customerName: "Ana L.", 
    productName: "Ducha-Orden™ Rail",
    amount: 5990000,
    status: "delivered",
    createdAt: "2024-01-13T09:15:00Z"
  }
];

const MOCK_KPI_DATA = {
  monthlyRevenue: 12400000,
  totalOrders: 28,
  averageOrderValue: 442857,
  conversionRate: 4.2,
  returnRate: 3.1
};

const statusLabels = {
  pending: "Pendiente",
  paid: "Pagado", 
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700", 
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700"
};

export default function VendorDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "vendor") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
            <p className="text-muted-foreground">
              Esta sección es solo para vendedores verificados.
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
        <div className="hero-gradient text-white p-6 rounded-2xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-vendor-name">
                {MOCK_VENDOR_DATA.businessName}
              </h1>
              <p className="text-white/80">Panel de vendedor</p>
            </div>
            <Badge className="bg-white text-primary">
              <Eye className="w-3 h-3 mr-1" />
              Cuenta verificada
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="products">
              <Link href="/vendedor/productos" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Productos
              </Link>
            </TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card data-testid="card-revenue">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ventas (mes)</p>
                      <p className="text-2xl font-bold">
                        {formatCOP(MOCK_KPI_DATA.monthlyRevenue * 100, false)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    ↑ 23% vs mes anterior
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-nps">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">NPS</p>
                      <p className="text-2xl font-bold">{MOCK_VENDOR_DATA.nps}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">Excelente</p>
                </CardContent>
              </Card>

              <Card data-testid="card-ontime-rate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Envíos a tiempo</p>
                      <p className="text-2xl font-bold">
                        {Math.round(MOCK_VENDOR_DATA.onTimeShipRate * 100)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    ↑ 2% vs mes anterior
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-rating">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rating promedio</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{MOCK_VENDOR_DATA.ratingAvg}</p>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(MOCK_VENDOR_DATA.ratingAvg)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">148 reseñas</p>
                </CardContent>
              </Card>
            </div>

            {/* Ranking Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Métricas de ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">SLA P95 Despacho</span>
                    <span className="font-semibold">{MOCK_VENDOR_DATA.slaP95DispatchHrs}h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">ETA Entrega</span>
                    <span className="font-semibold">{MOCK_VENDOR_DATA.deliveryEtaDays} días</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Tasa devoluciones</span>
                    <span className="font-semibold">{Math.round(MOCK_VENDOR_DATA.returnRate * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Tiempo respuesta</span>
                    <span className="font-semibold">{MOCK_VENDOR_DATA.responseHrs}h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Salud de stock</span>
                    <span className="font-semibold">{Math.round(MOCK_VENDOR_DATA.stockHealth * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Comisión</span>
                    <span className="font-semibold">{MOCK_VENDOR_DATA.commissionBp / 100}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Pedido</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Cliente</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Producto</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Monto</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Estado</th>
                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {MOCK_RECENT_ORDERS.map((order) => (
                        <tr key={order.id} data-testid={`row-order-${order.id}`}>
                          <td className="py-3 text-sm">#{order.id}</td>
                          <td className="py-3 text-sm">{order.customerName}</td>
                          <td className="py-3 text-sm">{order.productName}</td>
                          <td className="py-3 text-sm font-semibold">
                            {formatCOP(order.amount * 100, false)}
                          </td>
                          <td className="py-3">
                            <Badge 
                              className={statusColors[order.status as keyof typeof statusColors]}
                            >
                              {statusLabels[order.status as keyof typeof statusLabels]}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button variant="ghost" size="sm" className="text-primary hover:underline">
                              {order.status === "paid" ? "Procesar" :
                               order.status === "shipped" ? "Seguimiento" : "—"}
                            </Button>
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
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Los productos se gestionan en la sección dedicada.
              </p>
              <Link href="/vendedor/productos">
                <Button className="mt-4">
                  Gestionar productos
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Todos los pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Vista completa de pedidos - implementar filtros y búsqueda avanzada
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de la tienda</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Personaliza tu perfil de vendedor y políticas de venta
                  </p>
                  <Button variant="outline">
                    Editar información
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Políticas de devolución</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Define tus términos y condiciones para devoluciones
                  </p>
                  <Button variant="outline">
                    Configurar políticas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
