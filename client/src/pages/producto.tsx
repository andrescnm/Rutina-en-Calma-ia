import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VendorBadge from "@/components/vendor-badge";
import ReviewList from "@/components/review-list";
import ReviewForm from "@/components/review-form";
import ReturnPolicy from "@/components/return-policy";
import ProductSchema from "@/components/product-schema";
import MedicalDisclaimer from "@/components/medical-disclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatCOP, calculatePriceFinal } from "../lib/currency";
import { useState } from "react";

export default function ProductoPage() {
  const [, params] = useRoute("/producto/:slug");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", params?.slug],
    enabled: !!params?.slug,
  });

  const { data: vendor } = useQuery({
    queryKey: ["/api/vendors", product?.vendorId],
    enabled: !!product?.vendorId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews", product?.id],
    enabled: !!product?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-muted h-96 rounded-xl"></div>
              <div className="space-y-4">
                <div className="bg-muted h-8 rounded w-3/4"></div>
                <div className="bg-muted h-4 rounded w-1/2"></div>
                <div className="bg-muted h-20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
            <p className="text-muted-foreground">El producto que buscas no existe o no está disponible.</p>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = calculatePriceFinal(product.priceBase, product.vat);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0;

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <ProductSchema 
        product={{ ...product, vendor: vendor || { businessName: "" } }}
        reviews={{ ratingValue: averageRating, reviewCount: reviews.length }}
      />
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <img 
                src={product.images[selectedImage] || "https://via.placeholder.com/600x600?text=Sin+imagen"} 
                alt={product.name}
                className="w-full rounded-xl"
                data-testid="img-product-main"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image: string, index: number) => (
                  <img 
                    key={index}
                    src={image}
                    alt={`${product.name} vista ${index + 1}`}
                    className={`rounded-lg cursor-pointer hover:opacity-75 transition-opacity ${
                      selectedImage === index ? 'border-2 border-primary' : ''
                    }`}
                    onClick={() => setSelectedImage(index)}
                    data-testid={`img-product-thumb-${index}`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2" data-testid="text-product-name">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(averageRating)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({reviews.length} reseñas)
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">|</span>
                <span className="text-sm text-muted-foreground">
                  Vendido por {vendor?.businessName || "Cargando..."}
                </span>
              </div>
              
              {vendor && (
                <div className="mb-4">
                  <VendorBadge vendor={vendor} />
                </div>
              )}
            </div>
            
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-4xl font-bold" data-testid="text-product-price">
                  {formatCOP(finalPrice)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.stock} unidades disponibles
              </p>
            </div>
            
            {product.whatIncludes && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Qué incluye:</h3>
                <div className="text-sm text-muted-foreground" data-testid="text-what-includes">
                  {product.whatIncludes}
                </div>
              </div>
            )}
            
            {product.howToUse && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Cómo se usa:</h3>
                <div className="text-sm text-muted-foreground" data-testid="text-how-to-use">
                  {product.howToUse}
                </div>
              </div>
            )}
            
            <div className="flex gap-4 mb-6">
              <select 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="px-3 py-2 border border-border rounded-lg"
                data-testid="select-quantity"
              >
                {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              
              <Button 
                className="flex-1"
                disabled={product.stock === 0}
                data-testid="button-add-to-cart"
              >
                {product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
              </Button>
            </div>
            
            {vendor?.returnPolicy && (
              <ReturnPolicy policy={vendor.returnPolicy} />
            )}
          </div>
        </div>
        
        {/* Medical Disclaimer */}
        <MedicalDisclaimer />
        
        {/* Reviews Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Reseñas de clientes</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ReviewList reviews={reviews} />
            </div>
            <div>
              <ReviewForm productId={product.id} vendorId={product.vendorId} />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
