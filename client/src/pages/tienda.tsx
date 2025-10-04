import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function TiendaPage() {
  const [sortBy, setSortBy] = useState("rapidez");
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", { sort: sortBy }],
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["/api/vendors"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Tienda</h1>
            <p className="text-muted-foreground">
              {products.length} productos disponibles con IVA incluido
            </p>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" data-testid="select-sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rapidez">Entrega más rápida</SelectItem>
                <SelectItem value="precio">Menor precio</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="cercania">Más cercanos</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2" data-testid="button-filters">
              <Filter className="w-5 h-5" />
              Filtros
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-4 rounded w-2/3 mb-4"></div>
                <div className="bg-muted h-8 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => {
              const vendor = vendors.find((v: any) => v.id === product.vendorId);
              return (
                <ProductCard 
                  key={product.id} 
                  product={{ ...product, vendor }} 
                />
              );
            })}
          </div>
        )}
        
        {!isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No se encontraron productos que coincidan con tus criterios.
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
