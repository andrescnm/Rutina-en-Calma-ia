import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ExternalLink } from "lucide-react";

interface ReturnPolicyProps {
  policy: string;
}

export default function ReturnPolicy({ policy }: ReturnPolicyProps) {
  return (
    <Card className="border border-border p-4" data-testid="return-policy-card">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Política de devoluciones del vendedor</h4>
          <p className="text-sm text-muted-foreground mb-3">
            {policy || "30 días para devolución sin abrir. Gastos de envío por cuenta del comprador."}
          </p>
          <Button variant="outline" size="sm" className="text-primary">
            <ExternalLink className="w-3 h-3 mr-1" />
            Ver detalles completos
          </Button>
        </div>
      </div>
    </Card>
  );
}
