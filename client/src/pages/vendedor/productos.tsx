import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCOP, calculatePriceFinal } from "../../lib/currency";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  priceBase: z.number().min(1000, "El precio debe ser mayor a $1.000 COP"),
  stock: z.number().min(0, "El stock no puede ser negativo"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  whatIncludes: z.string().optional(),
  howToUse: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "Ducha-Orden™ Rail",
    slug: "ducha-orden-rail",
    description: "Sistema organizador para ducha con múltiples ganchos",
    priceBase: 5033613, // Base price before VAT
    vat: 0.19,
    stock: 12,
    status: "active",
    badges: ["Bestseller"],
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    categoryId: "cat-1",
  },
  {
    id: "prod-2", 
    name: "Back Cleanser 200ml",
    slug: "back-cleanser-200ml",
    description: "Limpiador especializado para espalda, fórmula rinse-off",
    priceBase: 3823529, // Base price before VAT  
    vat: 0.19,
    stock: 15,
    status: "active",
    badges: ["Sensitive-OK"],
    images: ["https://images.unsplash.com/photo-1571875257727-256c39da42af?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
    categoryId: "cat-2",
  }
];

const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Ducha y baño", slug: "ducha-bano" },
  { id: "cat-2", name: "Tratamientos espalda", slug: "tratamientos-espalda" },
  { id: "cat-3", name: "Recargas", slug: "recargas" }
];

export default function VendorProductos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      priceBase: 0,
      stock: 0,
      categoryId: "",
      whatIncludes: "",
      howToUse: "",
    }
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const res = await apiRequest("POST", "/api/products", productData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado exitosamente",
      });
      setIsModalOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      const message = error.message.includes("prohibited claims") 
        ? "El producto contiene términos prohibidos relacionados con diagnósticos médicos"
        : error.message;
      
      toast({
        title: "Error al crear producto",
        description: message,
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== "vendor") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
            <p className="text-muted-foreground">
              Esta sección es solo para vendedores verificados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      priceBase: product.priceBase,
      stock: product.stock,
      categoryId: product.categoryId,
      whatIncludes: product.whatIncludes || "",
      howToUse: product.howToUse || "",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    form.reset();
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis productos</h1>
            <p className="text-muted-foreground">
              Gestiona tu catálogo de productos de cuidado personal
            </p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={resetForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsModalOpen(true)} data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-2" />
                Agregar producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar producto" : "Nuevo producto"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nombre del producto</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    data-testid="input-product-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    {...form.register("description")}
                    data-testid="textarea-product-description"
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priceBase">Precio base (sin IVA)</Label>
                    <Input
                      id="priceBase"
                      type="number"
                      {...form.register("priceBase", { valueAsNumber: true })}
                      data-testid="input-product-price"
                    />
                    {form.formState.errors.priceBase && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.priceBase.message}
                      </p>
                    )}
                    {form.watch("priceBase") > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Precio final con IVA: {formatCOP(calculatePriceFinal(form.watch("priceBase"), 0.19))}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock disponible</Label>
                    <Input
                      id="stock"
                      type="number"
                      {...form.register("stock", { valueAsNumber: true })}
                      data-testid="input-product-stock"
                    />
                    {form.formState.errors.stock && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.stock.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={form.watch("categoryId")}
                    onValueChange={(value) => form.setValue("categoryId", value)}
                  >
                    <SelectTrigger data-testid="select-product-category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="whatIncludes">Qué incluye (opcional)</Label>
                  <Textarea
                    id="whatIncludes"
                    rows={2}
                    {...form.register("whatIncludes")}
                    placeholder="Lista lo que incluye el producto..."
                  />
                </div>

                <div>
                  <Label htmlFor="howToUse">Cómo se usa (opcional)</Label>
                  <Textarea
                    id="howToUse"
                    rows={3}
                    {...form.register("howToUse")}
                    placeholder="Instrucciones de uso paso a paso..."
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    Moderación de contenido
                  </h4>
                  <p className="text-sm text-amber-900">
                    Evita usar términos médicos como "cura", "tratamiento médico" o "diagnóstico". 
                    Usa términos como "cuidado personal", "rutina de cuidado" en su lugar.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createProductMutation.isPending}
                    data-testid="button-save-product"
                  >
                    {createProductMutation.isPending ? "Guardando..." : 
                     editingProduct ? "Actualizar" : "Crear producto"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {MOCK_PRODUCTS.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No tienes productos aún</h3>
              <p className="text-muted-foreground mb-6">
                Comienza agregando tu primer producto para empezar a vender
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear mi primer producto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PRODUCTS.map((product) => {
              const finalPrice = calculatePriceFinal(product.priceBase, product.vat);
              
              return (
                <Card key={product.id} className="overflow-hidden" data-testid={`card-product-${product.id}`}>
                  <div className="relative">
                    <img
                      src={product.images[0] || "https://via.placeholder.com/400x300?text=Sin+imagen"}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {product.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{product.name}</h3>
                      <Badge 
                        variant={product.status === "active" ? "default" : "secondary"}
                      >
                        {product.status === "active" ? "Activo" : "Pausado"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold">
                          {formatCOP(finalPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Base: {formatCOP(product.priceBase, false)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(product)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
