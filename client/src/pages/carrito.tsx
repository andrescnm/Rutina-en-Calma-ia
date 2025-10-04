import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartSummary from "@/components/cart-summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatCOP, calculatePriceFinal } from "../lib/currency";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function CarritoPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: cartItems = [], isLoading, isError } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  if (!user || isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Inicia sesión para ver tu carrito</h1>
            <p className="text-muted-foreground">Debes estar autenticado para gestionar tu carrito de compras.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Artículo eliminado del carrito" });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(itemId);
      return;
    }
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  // Transform cart data
  const transformedItems = cartItems.map((item: any) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    vendorName: item.vendor.businessName,
    vendorDeliveryDays: item.vendor.deliveryEtaDays,
    priceBase: item.product.priceBase,
    vat: item.product.vat,
    quantity: item.quantity,
    image: item.product.images?.[0] || "",
  }));

  // Group items by vendor
  const itemsByVendor = transformedItems.reduce((acc, item) => {
    if (!acc[item.vendorName]) {
      acc[item.vendorName] = [];
    }
    acc[item.vendorName].push(item);
    return acc;
  }, {} as Record<string, typeof transformedItems>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (transformedItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-6">
              Agrega algunos productos para comenzar tu rutina de cuidado personal
            </p>
            <Button size="lg" data-testid="button-continue-shopping">
              Continuar comprando
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Carrito de compras</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsByVendor).map(([vendorName, items]) => (
              <Card key={vendorName} className="p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold" data-testid={`text-vendor-${vendorName}`}>
                      {vendorName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Entrega estimada: {items[0].vendorDeliveryDays} días
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {items.map(item => {
                    const finalPrice = calculatePriceFinal(item.priceBase, item.vat);
                    const totalPrice = finalPrice * item.quantity;
                    
                    return (
                      <div key={item.id} className="flex gap-4" data-testid={`cart-item-${item.id}`}>
                        <img 
                          src={item.image} 
                          alt={item.productName}
                          className="w-20 h-20 rounded-lg object-cover" 
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatCOP(finalPrice)}
                          </p>
                          <div className="flex items-center gap-3">
                            <select 
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                              className="px-3 py-1 border border-border rounded-md text-sm"
                              data-testid={`select-quantity-${item.id}`}
                            >
                              {Array.from({ length: 10 }, (_, i) => (
                                <option key={i} value={i + 1}>{i + 1}</option>
                              ))}
                            </select>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-remove-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold" data-testid={`text-item-total-${item.id}`}>
                            {formatCOP(totalPrice, false)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subtotal {vendorName}:
                  </span>
                  <span className="font-semibold">
                    {formatCOP(
                      items.reduce((sum, item) => 
                        sum + calculatePriceFinal(item.priceBase, item.vat) * item.quantity, 0
                      ),
                      false
                    )}
                  </span>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Cart Summary */}
          <div>
            <CartSummary 
              items={transformedItems}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
