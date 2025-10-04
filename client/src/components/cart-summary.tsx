import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCOP } from "../lib/currency";

interface CartItem {
  id: string;
  productName: string;
  vendorName: string;
  quantity: number;
  priceBase: number;
  vat: number;
}

interface CartSummaryProps {
  items: CartItem[];
}

export default function CartSummary({ items }: CartSummaryProps) {
  // Group items by vendor
  const itemsByVendor = items.reduce((acc, item) => {
    if (!acc[item.vendorName]) {
      acc[item.vendorName] = [];
    }
    acc[item.vendorName].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const calculateVendorSubtotal = (vendorItems: CartItem[]) => {
    return vendorItems.reduce((sum, item) => {
      const finalPrice = Math.round(item.priceBase * (1 + item.vat));
      return sum + (finalPrice * item.quantity);
    }, 0);
  };

  const subtotal = Object.values(itemsByVendor).reduce((sum, vendorItems) => {
    return sum + calculateVendorSubtotal(vendorItems);
  }, 0);

  const vatAmount = Math.round(subtotal * 0.19 / 1.19); // Extract VAT from total
  const shipping = Object.keys(itemsByVendor).length * 1500; // $15,000 per vendor
  const total = subtotal + shipping;

  return (
    <Card className="p-6 sticky top-20" data-testid="cart-summary">
      <h3 className="text-xl font-bold mb-4">Resumen del pedido</h3>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal productos</span>
          <span data-testid="text-subtotal">{formatCOP(subtotal - vatAmount, false)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">IVA incluido (19%)</span>
          <span data-testid="text-vat">{formatCOP(vatAmount, false)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Envío ({Object.keys(itemsByVendor).length} vendedores)
          </span>
          <span data-testid="text-shipping">{formatCOP(shipping, false)}</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between font-bold text-lg mb-4">
        <span>Total</span>
        <span data-testid="text-total">{formatCOP(total, false)}</span>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
        * La comisión del marketplace ya está contemplada en el precio.
      </p>
      
      <Button 
        className="w-full mb-3"
        size="lg"
        data-testid="button-checkout"
      >
        Proceder al pago
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full"
        size="lg"
        data-testid="button-continue-shopping"
      >
        Seguir comprando
      </Button>
      
      <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
        </svg>
        <span>Pago seguro con Stripe Connect. Tus datos están protegidos.</span>
      </div>
    </Card>
  );
}
