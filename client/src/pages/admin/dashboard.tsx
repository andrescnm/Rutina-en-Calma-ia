import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, Users, Package, DollarSign, Clock, Settings, 
  CheckCircle, XCircle, AlertCircle 
} from "lucide-react";
import { formatCOP } from "../../lib/currency";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: kpis, isLoading: kpisLoading } = useQuery<any>({
    queryKey: ["/api/admin/kpis"],
    enabled: !!user && user.role === "admin",
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/vendors"],
    enabled: !!user && user.role === "admin",
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/products"],
    enabled: !!user && user.role === "admin",
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
  });

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/audit-logs"],
    enabled: !!user && user.role === "admin",
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, status, kycStatus }: { id: string; status: string; kycStatus?: string }) => {
      return await apiRequest("PATCH", `/api/admin/vendors/${id}/status`, { status, kycStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/audit-logs"] });
      toast({
        title: "Vendedor actualizado",
        description: "El estado del vendedor se ha actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el vendedor",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/products/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/audit-logs"] });
      toast({
        title: "Producto actualizado",
        description: "El estado del producto se ha actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el producto",
        variant: "destructive",
      });
    },
  });

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

  const handleApproveVendor = (vendorId: string) => {
    updateVendorMutation.mutate({ id: vendorId, status: "active", kycStatus: "approved" });
  };

  const handleSuspendVendor = (vendorId: string) => {
    updateVendorMutation.mutate({ id: vendorId, status: "suspended" });
  };

  const handleToggleProduct = (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    updateProductMutation.mutate({ id: productId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-2xl mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-white/80">Gestión del marketplace - Datos en tiempo real</p>
        </div>

        <Tabs defaultValue="kpis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="kpis" data-testid="tab-kpis">KPIs</TabsTrigger>
            <TabsTrigger value="vendors" data-testid="tab-vendors">Vendedores</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">Productos</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Usuarios</TabsTrigger>
            <TabsTrigger value="ranking" data-testid="tab-ranking">Ranking</TabsTrigger>
            <TabsTrigger value="audit" data-testid="tab-audit">Auditoría</TabsTrigger>
          </TabsList>

          <TabsContent value="kpis" className="space-y-6">
            {/* KPI Cards */}
            {kpisLoading ? (
              <div className="text-center py-8">Cargando KPIs...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" data-testid="card-gmv">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-semibold mb-2">GMV (mes)</p>
                        <p className="text-3xl font-bold text-blue-900" data-testid="text-gmv">
                          {formatCOP((kpis?.gmv || 0) * 100, false)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200" data-testid="card-takerate">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-semibold mb-2">Take Rate</p>
                        <p className="text-3xl font-bold text-green-900" data-testid="text-takerate">
                          {kpis?.takeRate || 0}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs text-green-600 mt-2">Promedio ponderado</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200" data-testid="card-fillrate">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700 font-semibold mb-2">Fill Rate</p>
                        <p className="text-3xl font-bold text-purple-900" data-testid="text-fillrate">
                          {kpis?.fillRate || 0}%
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-xs text-purple-600 mt-2">Órdenes completadas</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200" data-testid="card-p95">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700 font-semibold mb-2">P95 Despacho</p>
                        <p className="text-3xl font-bold text-amber-900" data-testid="text-p95">
                          {kpis?.p95Dispatch || 0}h
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                    <p className="text-xs text-amber-600 mt-2">Percentil 95</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Vendedores</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold" data-testid="text-total-vendors">{vendors.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Activos: {vendors.filter((v: any) => v.status === 'active').length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold" data-testid="text-total-products">{products.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Activos: {products.filter((p: any) => p.status === 'active').length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold" data-testid="text-total-users">{users.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vendedores: {users.filter((u: any) => u.role === 'vendor').length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gestión de vendedores</span>
                  <Badge variant="outline" data-testid="badge-vendor-count">{vendors.length} vendedores</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vendorsLoading ? (
                  <div className="text-center py-8">Cargando vendedores...</div>
                ) : vendors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay vendedores registrados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border">
                        <tr className="text-left">
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Vendedor</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Rating</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">SLA</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Comisión</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Estado</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">KYC</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {vendors.map((vendor: any) => (
                          <tr key={vendor.id} data-testid={`row-vendor-${vendor.id}`}>
                            <td className="py-3">
                              <div>
                                <div className="font-semibold" data-testid={`text-vendor-name-${vendor.id}`}>{vendor.businessName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {vendor.description?.substring(0, 40)}...
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="font-bold text-primary">★ {vendor.ratingAvg?.toFixed(1) || 'N/A'}</div>
                            </td>
                            <td className="py-3 text-sm">
                              {vendor.slaP95DispatchHrs}h
                            </td>
                            <td className="py-3 text-sm">
                              {vendor.commissionBp / 100}%
                            </td>
                            <td className="py-3">
                              <Badge 
                                variant={vendor.status === "active" ? "default" : "secondary"}
                                className={
                                  vendor.status === "active" 
                                    ? "bg-green-100 text-green-700" 
                                    : vendor.status === "suspended"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                }
                                data-testid={`badge-vendor-status-${vendor.id}`}
                              >
                                {vendor.status === "active" ? "Activo" : vendor.status === "suspended" ? "Suspendido" : "Pendiente"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge 
                                variant="outline"
                                className={
                                  vendor.kycStatus === "approved" 
                                    ? "border-green-500 text-green-700" 
                                    : vendor.kycStatus === "rejected"
                                    ? "border-red-500 text-red-700"
                                    : "border-amber-500 text-amber-700"
                                }
                              >
                                {vendor.kycStatus === "approved" ? "✓ Aprobado" : vendor.kycStatus === "rejected" ? "✗ Rechazado" : "⏳ Pendiente"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                {vendor.status === "pending" && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-green-600 hover:underline"
                                    onClick={() => handleApproveVendor(vendor.id)}
                                    disabled={updateVendorMutation.isPending}
                                    data-testid={`button-approve-${vendor.id}`}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Aprobar
                                  </Button>
                                )}
                                {vendor.status === "active" && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:underline"
                                    onClick={() => handleSuspendVendor(vendor.id)}
                                    disabled={updateVendorMutation.isPending}
                                    data-testid={`button-suspend-${vendor.id}`}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Suspender
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gestión de productos</span>
                  <Badge variant="outline" data-testid="badge-product-count">{products.length} productos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="text-center py-8">Cargando productos...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay productos registrados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border">
                        <tr className="text-left">
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Producto</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Vendedor</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Categoría</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Precio</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Stock</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Estado</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {products.map((product: any) => (
                          <tr key={product.id} data-testid={`row-product-${product.id}`}>
                            <td className="py-3">
                              <div className="font-semibold" data-testid={`text-product-name-${product.id}`}>{product.name}</div>
                            </td>
                            <td className="py-3 text-sm">
                              {product.vendorName || 'N/A'}
                            </td>
                            <td className="py-3 text-sm">
                              {product.categoryName || 'N/A'}
                            </td>
                            <td className="py-3 text-sm">
                              {formatCOP(product.priceBase, false)}
                            </td>
                            <td className="py-3 text-sm">
                              {product.stock}
                            </td>
                            <td className="py-3">
                              <Badge 
                                variant={product.status === "active" ? "default" : "secondary"}
                                className={
                                  product.status === "active" 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-amber-100 text-amber-700"
                                }
                                data-testid={`badge-product-status-${product.id}`}
                              >
                                {product.status === "active" ? "Activo" : "Pausado"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:underline"
                                onClick={() => handleToggleProduct(product.id, product.status)}
                                disabled={updateProductMutation.isPending}
                                data-testid={`button-toggle-${product.id}`}
                              >
                                {product.status === "active" ? "Pausar" : "Activar"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gestión de usuarios</span>
                  <Badge variant="outline" data-testid="badge-user-count">{users.length} usuarios</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Cargando usuarios...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay usuarios registrados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border">
                        <tr className="text-left">
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Usuario</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Email</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Rol</th>
                          <th className="pb-3 text-sm font-semibold text-muted-foreground">Fecha registro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((user: any) => (
                          <tr key={user.id} data-testid={`row-user-${user.id}`}>
                            <td className="py-3">
                              <div className="font-semibold" data-testid={`text-user-name-${user.id}`}>{user.username}</div>
                            </td>
                            <td className="py-3 text-sm">
                              {user.email}
                            </td>
                            <td className="py-3">
                              <Badge 
                                variant={user.role === "admin" ? "default" : "secondary"}
                                className={
                                  user.role === "admin" 
                                    ? "bg-purple-100 text-purple-700" 
                                    : user.role === "vendor"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }
                              >
                                {user.role === "admin" ? "Admin" : user.role === "vendor" ? "Vendedor" : "Usuario"}
                              </Badge>
                            </td>
                            <td className="py-3 text-sm">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            {/* Ranking Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Sistema de Ranking de Vendedores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    El sistema de ranking utiliza múltiples factores ponderados para ordenar vendedores. 
                    Los factores incluyen: SLA de despacho, tiempo de entrega, calificación promedio, NPS, 
                    tasa de devolución, entregas a tiempo, tiempo de respuesta, salud de inventario, entre otros.
                  </p>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Factores de Ranking</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span>SLA Despacho (P95)</span>
                        <span className="font-semibold">22%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span>Calificación</span>
                        <span className="font-semibold">18%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span>Tiempo de entrega</span>
                        <span className="font-semibold">15%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span>Entregas a tiempo</span>
                        <span className="font-semibold">10%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span>Tasa de devolución</span>
                        <span className="font-semibold">10%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span>NPS</span>
                        <span className="font-semibold">8%</span>
                      </div>
                    </div>
                  </div>

                  {vendors.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Ranking Actual de Vendedores</h4>
                      <div className="space-y-2">
                        {vendors
                          .filter((v: any) => v.status === 'active')
                          .sort((a: any, b: any) => (b.ratingAvg || 0) - (a.ratingAvg || 0))
                          .slice(0, 5)
                          .map((vendor: any, idx: number) => (
                            <div key={vendor.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-lg text-muted-foreground">#{idx + 1}</span>
                                <div>
                                  <p className="font-semibold">{vendor.businessName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Rating: {vendor.ratingAvg?.toFixed(1)} | SLA: {vendor.slaP95DispatchHrs}h
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="border-primary text-primary">
                                Score: {vendor.ratingAvg?.toFixed(1)}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
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
                {logsLoading ? (
                  <div className="text-center py-8">Cargando registros...</div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay registros de auditoría</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 border rounded" data-testid={`log-${idx}`}>
                        <div>
                          <p className="font-semibold">{log.event}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString('es-CO') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
