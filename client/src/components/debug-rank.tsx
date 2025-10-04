import { Card } from "@/components/ui/card";

interface VendorMetrics {
  deliveryEtaDays: number;
  sensitiveOk: boolean;
  ratingAvg: number;
  onTimeShipRate: number;
  slaP95DispatchHrs: number;
  nps: number;
  stockHealth: number;
}

interface DebugRankProps {
  vendor: {
    businessName: string;
  };
  metrics: VendorMetrics;
}

export default function DebugRank({ vendor, metrics }: DebugRankProps) {
  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;
  
  return (
    <Card className="p-4 bg-muted/50" data-testid="debug-rank">
      <h4 className="font-semibold text-sm mb-3">Métricas del Vendedor</h4>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Tiempo de entrega:</dt>
          <dd className="font-medium">{metrics.deliveryEtaDays} días</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Envíos a tiempo:</dt>
          <dd className="font-medium">{formatPercent(metrics.onTimeShipRate)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Calificación promedio:</dt>
          <dd className="font-medium">{metrics.ratingAvg.toFixed(1)}/5</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">NPS:</dt>
          <dd className="font-medium">{metrics.nps.toFixed(0)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">SLA Despacho (P95):</dt>
          <dd className="font-medium">{metrics.slaP95DispatchHrs}h</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Salud de inventario:</dt>
          <dd className="font-medium">{formatPercent(metrics.stockHealth)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Piel sensible OK:</dt>
          <dd className="font-medium">{metrics.sensitiveOk ? 'Sí' : 'No'}</dd>
        </div>
      </dl>
    </Card>
  );
}
