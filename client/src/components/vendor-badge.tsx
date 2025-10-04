import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

interface VendorBadgeProps {
  vendor: {
    deliveryEtaDays: number;
    sensitiveOk: boolean;
    ratingAvg: number;
    onTimeShipRate: number;
    slaP95DispatchHrs: number;
    nps: number;
    stockHealth: number;
  };
}

export default function VendorBadge({ vendor }: VendorBadgeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {vendor.sensitiveOk && (
        <Badge className="vendor-badge bg-green-100 text-green-700">
          <Check className="w-3 h-3 mr-1" />
          Sensitive-OK
        </Badge>
      )}
      
      <Badge className="vendor-badge bg-blue-100 text-blue-700">
        SLA: {vendor.slaP95DispatchHrs}h
      </Badge>
      
      <Badge className="vendor-badge bg-purple-100 text-purple-700">
        NPS: {vendor.nps}
      </Badge>
      
      <Badge className="vendor-badge bg-amber-100 text-amber-700">
        Stock: {Math.round(vendor.stockHealth * 100)}%
      </Badge>
    </div>
  );
}
