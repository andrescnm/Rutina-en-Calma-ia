import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Settings, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCOP } from "../lib/currency";

const MOCK_ORDERS = [
  {
    id: "ord-1",
    status: "delivered",
    total: 5990000,
    createdAt: "2024-01-15T10:30:00Z",
    items: [
      {
        productName: "Ducha-Orden™ Rail",
        vendorName: "Estación3",
        quantity: 1,
        priceBase: 5033613,
        vat: 0.19,
      }
    ]
  },
  {
    id: "ord-2", 
    status: "shipped",
    total: 29980000,
    createdAt: "2024-01-10T14:20:00Z",
    items: [
      {
        productName: "Kit Bacne Solo",
        vendorName: "ClearBack Labs", 
        quantity: 2,
        priceBase: 12596639,
        vat: 0.19,
      }
    ]
  }
];

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
  paid: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-green-100 text-green-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700"
};

export default function CuentaPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/account/delete");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido programada para eliminación. Se ha cerrado tu sesión.",
      });
      logoutMutation.mutate();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
            <p className="text-muted-foreground">Debes estar autenticado para ver tu cuenta.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mi cuenta</h1>
            <p className="text-muted-foreground">Hola, {user.username}</p>
          </div>
        </div>
        
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Mis pedidos
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Settings className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="data" className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Mis datos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Historial de pedidos</h2>
              
              {MOCK_ORDERS.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No tienes pedidos aún</h3>
                    <p className="text-muted-foreground mb-4">
                      Comienza tu rutina de cuidado personal explorando nuestros productos
                    </p>
                    <Button data-testid="button-start-shopping">
                      Comenzar a comprar
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {MOCK_ORDERS.map((order: any) => (
                    <Card key={order.id} data-testid={`card-order-${order.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg mb-1">
                              Pedido #{order.id}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('es-CO', {
                                year: 'numeric',
                                month: 'long', 
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <Badge 
                              className={statusColors[order.status as keyof typeof statusColors]}
                              data-testid={`badge-status-${order.id}`}
                            >
                              {statusLabels[order.status as keyof typeof statusLabels]}
                            </Badge>
                            <div className="text-lg font-bold mt-2">
                              {formatCOP(order.total, false)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {item.productName} × {item.quantity}
                                <span className="text-muted-foreground ml-2">
                                  por {item.vendorName}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Ver detalles
                          </Button>
                          
                          {order.status === 'delivered' && (
                            <>
                              <Button variant="outline" size="sm">
                                Dejar reseña
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive">
                                Iniciar devolución
                              </Button>
                            </>
                          )}
                          
                          {order.status === 'shipped' && (
                            <Button variant="outline" size="sm">
                              Rastrear envío
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre de usuario</label>
                  <p className="mt-1 text-muted-foreground">{user.username}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Correo electrónico</label>
                  <p className="mt-1 text-muted-foreground">{user.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tipo de cuenta</label>
                  <Badge variant="outline" className="ml-2">
                    {user.role === 'vendor' ? 'Vendedor' : user.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Miembro desde</label>
                  <p className="mt-1 text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO') : 'N/A'}
                  </p>
                </div>
                
                <Button variant="outline">
                  Editar perfil
                </Button>
              </CardContent>
            </Card>
            
            {user.role === 'user' && (
              <Card>
                <CardHeader>
                  <CardTitle>¿Quieres vender?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Únete a nuestra comunidad de vendedores y comparte tus productos de cuidado personal
                  </p>
                  <Button data-testid="button-become-vendor">
                    Convertirse en vendedor
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Eliminar mi cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    ¿Estás seguro?
                  </h4>
                  <p className="text-sm text-amber-900">
                    Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos,
                    incluyendo historial de pedidos, reseñas y preferencias.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Qué se eliminará:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Tu perfil de usuario y datos personales</li>
                    <li>• Historial de pedidos y transacciones</li>
                    <li>• Reseñas y comentarios publicados</li>
                    <li>• Recomendaciones personalizadas</li>
                    <li>• Preferencias de la cuenta</li>
                  </ul>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      disabled={deleteAccountMutation.isPending}
                      data-testid="button-delete-account"
                    >
                      {deleteAccountMutation.isPending ? "Eliminando..." : "Eliminar mi cuenta"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar cuenta definitivamente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente
                        de nuestros servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAccountMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="button-confirm-delete"
                      >
                        Sí, eliminar mi cuenta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}
