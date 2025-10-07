import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import VendorCard from "@/components/vendor-card";
import QuizModal from "@/components/quiz-modal";
import FAQSection from "@/components/faq-section";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";
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
      <section className="relative bg-gradient-to-br from-brand-50 via-cream to-brand-100 dark:from-brand-950 dark:via-slate-900 dark:to-brand-900 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-slate-900 dark:text-slate-100">
              Tu piel necesita rutina, no milagros
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-slate-700 dark:text-slate-300">
              Encuentra productos que acompañan tu rutina sin promesas imposibles
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                onClick={() => setShowQuiz(true)}
                data-testid="button-start-quiz"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Descubre tu rutina personalizada
              </Button>
              <Link href="/tienda">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-brand-600 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 px-8 py-6 text-lg font-semibold transition-all duration-200"
                  data-testid="link-view-products"
                >
                  Ver productos
                </Button>
              </Link>
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
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Productos destacados</h2>
              <p className="text-muted-foreground">Todos los precios incluyen IVA (19%)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/tienda">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3"
                data-testid="button-view-all-products"
              >
                Ver todos los productos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quiz CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-700 dark:to-brand-600">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-white" />
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              ¿No sabes por dónde empezar?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Nuestro quiz personalizado te ayuda a encontrar los productos perfectos para tu tipo de piel en minutos
            </p>
            <Button
              size="lg"
              className="bg-white text-brand-700 hover:bg-cream px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
              onClick={() => setShowQuiz(true)}
              data-testid="button-quiz-cta"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Comenzar mi quiz ahora
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

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
