import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import VendorBadge from "./vendor-badge";

interface VendorCardProps {
  vendor: {
    id: string;
    businessName: string;
    ratingAvg: number;
    deliveryEtaDays: number;
    onTimeShipRate: number;
    sensitiveOk: boolean;
    slaP95DispatchHrs: number;
    nps: number;
    stockHealth: number;
  };
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="p-6 shadow-md hover:shadow-xl transition-shadow" data-testid={`card-vendor-${vendor.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1" data-testid={`text-vendor-name-${vendor.id}`}>
            {vendor.businessName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {renderStars(vendor.ratingAvg)}
            </div>
            <span>{vendor.ratingAvg.toFixed(1)}</span>
          </div>
        </div>
        <VendorBadge vendor={vendor} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-primary" data-testid={`text-delivery-days-${vendor.id}`}>
            {vendor.deliveryEtaDays} días
          </div>
          <div className="text-xs text-muted-foreground">Entrega promedio</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-primary" data-testid={`text-ontime-rate-${vendor.id}`}>
            {Math.round(vendor.onTimeShipRate * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Envíos a tiempo</div>
        </div>
      </div>
      
      <Button 
        className="w-full"
        data-testid={`button-view-products-${vendor.id}`}
      >
        Ver productos
      </Button>
    </Card>
  );
}
