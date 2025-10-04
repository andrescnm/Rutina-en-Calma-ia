import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCOP, calculatePriceFinal } from "../lib/currency";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const MOCK_CART_ITEMS = [
  {
    id: "1",
    productId: "prod-1",
    productName: "Ducha-Orden™ Rail",
    vendorId: "vendor-1",
    vendorName: "Estación3",
    priceBase: 5033613,
    vat: 0.19,
    quantity: 1,
  },
  {
    id: "2",
    productId: "prod-2",
    productName: "Kit Bacne Solo",
    vendorId: "vendor-2",
    vendorName: "ClearBack Labs",
    priceBase: 12596639,
    vat: 0.19,
    quantity: 2,
  },
];

function CheckoutForm({ items, total }: { items: any[], total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/cuenta`,
      },
    });

    if (error) {
      toast({
        title: "Error en el pago",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? "Procesando..." : `Pagar ${formatCOP(total, false)}`}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    department: "",
    zipCode: "",
    phone: "",
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (items: any[]) => {
      const res = await apiRequest("POST", "/api/checkout", { items });
      return await res.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate totals
  const subtotal = MOCK_CART_ITEMS.reduce((sum, item) => {
    return sum + calculatePriceFinal(item.priceBase, item.vat) * item.quantity;
  }, 0);

  const vatAmount = Math.round(subtotal * 0.19 / 1.19);
  const shipping = 15000 * 2; // 2 vendors
  const total = subtotal + shipping;

  // Group items by vendor
  const itemsByVendor = MOCK_CART_ITEMS.reduce((acc, item) => {
    if (!acc[item.vendorName]) {
      acc[item.vendorName] = [];
    }
    acc[item.vendorName].push(item);
    return acc;
  }, {} as Record<string, typeof MOCK_CART_ITEMS>);

  React.useEffect(() => {
    if (MOCK_CART_ITEMS.length > 0 && !clientSecret) {
      createPaymentIntentMutation.mutate(MOCK_CART_ITEMS);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Inicia sesión para continuar</h1>
            <p className="text-muted-foreground">Debes estar autenticado para realizar una compra.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Preparando el pago...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finalizar compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping and Payment */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Dirección de envío</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                    data-testid="input-full-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                    data-testid="input-address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      data-testid="input-city"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={shippingAddress.department}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, department: e.target.value }))}
                      data-testid="input-department"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">Código postal</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      data-testid="input-zip-code"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                      data-testid="input-phone"
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Payment */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Método de pago</h3>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm items={MOCK_CART_ITEMS} total={total} />
              </Elements>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h3 className="text-xl font-bold mb-4">Resumen del pedido</h3>
              
              {/* Items by vendor */}
              <div className="space-y-4 mb-6">
                {Object.entries(itemsByVendor).map(([vendorName, items]) => (
                  <div key={vendorName} className="pb-4 border-b border-border last:border-0">
                    <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                      {vendorName}
                    </h4>
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm mb-1">
                        <span>{item.productName} × {item.quantity}</span>
                        <span>{formatCOP(calculatePriceFinal(item.priceBase, item.vat) * item.quantity, false)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span data-testid="text-checkout-subtotal">
                    {formatCOP(subtotal - vatAmount, false)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (19%)</span>
                  <span data-testid="text-checkout-vat">
                    {formatCOP(vatAmount, false)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span data-testid="text-checkout-shipping">
                    {formatCOP(shipping, false)}
                  </span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span data-testid="text-checkout-total">
                  {formatCOP(total, false)}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                * La comisión del marketplace ya está contemplada en el precio.
              </p>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
