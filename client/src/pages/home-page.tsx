import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import VendorCard from "@/components/vendor-card";
import QuizModal from "@/components/quiz-modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function HomePage() {
  const [showQuiz, setShowQuiz] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["/api/vendors"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Rutina simple, piel en calma
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Encuentra los productos perfectos para tu tipo de piel con nuestro recomendador inteligente
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold"
                onClick={() => setShowQuiz(true)}
                data-testid="button-start-quiz"
              >
                Comenzar quiz personalizado
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                data-testid="link-view-products"
              >
                Ver productos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Section */}
      <section className="py-16 bg-muted">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Vendedores destacados</h2>
            <p className="text-muted-foreground text-lg">
              Conectamos con los mejores proveedores de cuidado personal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.slice(0, 3).map((vendor: any) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Productos destacados</h2>
              <p className="text-muted-foreground">Todos los precios incluyen IVA (19%)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3"
              data-testid="button-view-all-products"
            >
              Ver todos los productos
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal 
          isOpen={showQuiz} 
          onClose={() => setShowQuiz(false)} 
        />
      )}
    </div>
  );
}
