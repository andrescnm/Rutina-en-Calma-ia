import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatCOP, calculatePriceFinal } from "../lib/currency";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    priceBase: number;
    vat: number;
    images: string[];
    badges: string[];
    stock: number;
    vendor?: {
      businessName: string;
      deliveryEtaDays: number;
      sensitiveOk: boolean;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const finalPrice = calculatePriceFinal(product.priceBase, product.vat);
  const imageUrl = product.images[0] || "https://via.placeholder.com/400x300?text=Sin+imagen";
  
  return (
    <Card className="product-card overflow-hidden shadow-md" data-testid={`card-product-${product.id}`}>
      <img 
        src={imageUrl} 
        alt={product.name} 
        className="w-full h-48 object-cover" 
        data-testid={`img-product-${product.id}`}
      />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h3>
            {product.vendor && (
              <p className="text-sm text-muted-foreground">
                por {product.vendor.businessName}
              </p>
            )}
          </div>
          {product.vendor && (
            <Badge 
              variant="secondary"
              className={`vendor-badge ${
                product.vendor.sensitiveOk 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}
              data-testid={`badge-delivery-${product.id}`}
            >
              {product.vendor.deliveryEtaDays} días
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">(24 reseñas)</span>
        </div>
        
        {product.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.badges.map((badge, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="vendor-badge bg-purple-100 text-purple-700"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-foreground" data-testid={`text-price-${product.id}`}>
              {formatCOP(finalPrice)}
            </div>
          </div>
          <div className="text-sm">
            <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? 'En stock' : 'Agotado'}
            </span>
            {product.stock > 0 && (
              <div className="text-xs text-muted-foreground">
                {product.stock} unidades
              </div>
            )}
          </div>
        </div>
        
        <Button 
          className="w-full"
          disabled={product.stock === 0}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
        </Button>
      </div>
    </Card>
  );
}
