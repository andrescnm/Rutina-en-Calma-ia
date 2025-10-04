import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [cartCount] = useState(0); // This would come from cart context

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              Rutina Simple
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/tienda" 
                className={`transition-colors ${
                  location === '/tienda' ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                data-testid="link-tienda"
              >
                Tienda
              </Link>
              <Link 
                href="/vendedores" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="link-vendedores"
              >
                Vendedores
              </Link>
              <Link 
                href="/blog" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="link-blog"
              >
                Blog
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              data-testid="button-search"
            >
              <Search className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center"
                  data-testid="badge-cart-count"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Hola, {user.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  data-testid="button-logout"
                >
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm" data-testid="button-login">
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
