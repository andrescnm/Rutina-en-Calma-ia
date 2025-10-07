import { Link } from "wouter";
import SafetyNotice from "./safety-notice";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-xl font-bold mb-4 text-primary">Rutina Simple</h4>
            <p className="text-sm text-muted-foreground">
              Marketplace de productos de cuidado personal en Colombia
            </p>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3">Comprar</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/tienda" className="hover:text-foreground transition-colors">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/vendedores" className="hover:text-foreground transition-colors">
                  Vendedores
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3">Vender</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/vendedor" className="hover:text-foreground transition-colors">
                  Crear tienda
                </Link>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Comisiones
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Políticas
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3">Ayuda</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Centro de ayuda
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Devoluciones
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Envíos
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Contacto
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mb-8">
          <SafetyNotice />
        </div>
        
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Rutina Simple. Todos los precios incluyen IVA (19%). Hecho con cuidado desde Colombia 🇨🇴
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">
              Términos
            </button>
            <button className="hover:text-foreground transition-colors">
              Privacidad
            </button>
            <button className="hover:text-foreground transition-colors">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
