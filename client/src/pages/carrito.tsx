import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartSummary from "@/components/cart-summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatCOP, calculatePriceFinal } from "../lib/currency";

// This would normally come from cart context or state management
const MOCK_CART_ITEMS = [
  {
    id: "1",
    productId: "prod-1",
    productName: "Ducha-Orden™ Rail",
    productSlug: "ducha-orden-rail",
    vendorId: "vendor-1",
    vendorName: "Estación3",
    vendorDeliveryDays: 2,
    priceBase: 5033613, // 59900 COP with VAT = 50336.13 base
    vat: 0.19,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  },
  {
    id: "2",
    productId: "prod-2",
    productName: "Kit Bacne Solo",
    productSlug: "kit-bacne-solo",
    vendorId: "vendor-2",
    vendorName: "ClearBack Labs",
    vendorDeliveryDays: 3,
    priceBase: 12596639, // 149900 COP with VAT
    vat: 0.19,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  },
];

export default function CarritoPage() {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(itemId);
      return;
    }
    
    setCartItems(items => items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Group items by vendor
  const itemsByVendor = cartItems.reduce((acc, item) => {
    if (!acc[item.vendorName]) {
      acc[item.vendorName] = [];
    }
    acc[item.vendorName].push(item);
    return acc;
  }, {} as Record<string, typeof cartItems>);

  if (cartItems.length === 0) {
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
              items={cartItems.map(item => ({
                ...item,
                productName: item.productName,
                vendorName: item.vendorName,
              }))}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
