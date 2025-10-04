import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import TiendaPage from "@/pages/tienda";
import ProductoPage from "@/pages/producto";
import CarritoPage from "@/pages/carrito";
import CheckoutPage from "@/pages/checkout";
import CuentaPage from "@/pages/cuenta";
import VendorDashboard from "@/pages/vendedor/dashboard";
import VendorProductos from "@/pages/vendedor/productos";
import AdminDashboard from "@/pages/admin/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/tienda" component={TiendaPage} />
      <Route path="/producto/:slug" component={ProductoPage} />
      <Route path="/carrito" component={CarritoPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/cuenta" component={CuentaPage} />
      <ProtectedRoute path="/vendedor" component={VendorDashboard} />
      <ProtectedRoute path="/vendedor/productos" component={VendorProductos} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
