import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuizData {
  zona?: string;
  sensibilidad?: string;
  gym?: string;
  vive_solo?: string;
  cabello_largo?: string;
  presupuesto?: string;
}

export default function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const [quizData, setQuizData] = useState<QuizData>({});
  const { toast } = useToast();

  const recommendationMutation = useMutation({
    mutationFn: async (data: QuizData) => {
      const res = await apiRequest("POST", "/api/recommend", data);
      return await res.json();
    },
    onSuccess: (recommendations) => {
      toast({
        title: "¡Recomendaciones listas!",
        description: `Te recomendamos: ${recommendations.topPick}`,
      });
      onClose();
      // TODO: Show recommendations results
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recommendationMutation.mutate(quizData);
  };

  const updateQuizData = (field: string, value: string) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="quiz-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Quiz personalizado</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Zona */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">¿Qué zona quieres cuidar?</Label>
            <RadioGroup
              value={quizData.zona || ""}
              onValueChange={(value) => updateQuizData("zona", value)}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary">
                <RadioGroupItem value="espalda" id="zona-espalda" data-testid="radio-zona-espalda" />
                <Label htmlFor="zona-espalda" className="cursor-pointer">Espalda</Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary">
                <RadioGroupItem value="rostro" id="zona-rostro" data-testid="radio-zona-rostro" />
                <Label htmlFor="zona-rostro" className="cursor-pointer">Rostro</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sensibilidad */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">¿Cómo describirías tu piel?</Label>
            <Select value={quizData.sensibilidad || ""} onValueChange={(value) => updateQuizData("sensibilidad", value)}>
              <SelectTrigger data-testid="select-sensibilidad">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="sensible">Sensible</SelectItem>
                <SelectItem value="muy_sensible">Muy sensible</SelectItem>
                <SelectItem value="grasa">Grasa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gym */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">¿Vas al gym?</Label>
            <RadioGroup
              value={quizData.gym || ""}
              onValueChange={(value) => updateQuizData("gym", value)}
              className="flex gap-3"
            >
              <div className="flex items-center space-x-2 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary flex-1">
                <RadioGroupItem value="si" id="gym-si" data-testid="radio-gym-si" />
                <Label htmlFor="gym-si" className="cursor-pointer">Sí</Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary flex-1">
                <RadioGroupItem value="no" id="gym-no" data-testid="radio-gym-no" />
                <Label htmlFor="gym-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Vive solo */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">¿Vives solo/a?</Label>
            <RadioGroup
              value={quizData.vive_solo || ""}
              onValueChange={(value) => updateQuizData("vive_solo", value)}
              className="flex gap-3"
            >
              <div className="flex items-center space-x-2 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary flex-1">
                <RadioGroupItem value="si" id="solo-si" data-testid="radio-solo-si" />
                <Label htmlFor="solo-si" className="cursor-pointer">Sí</Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary flex-1">
                <RadioGroupItem value="no" id="solo-no" data-testid="radio-solo-no" />
                <Label htmlFor="solo-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Cabello largo */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">¿Tienes cabello largo?</Label>
            <RadioGroup
              value={quizData.cabello_largo || ""}
              onValueChange={(value) => updateQuizData("cabello_largo", value)}
              className="flex gap-3"
            >
              <div className="flex items-center space-x-2 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary flex-1">
                <RadioGroupItem value="si" id="cabello-si" data-testid="radio-cabello-si" />
                <Label htmlFor="cabello-si" className="cursor-pointer">Sí</Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary flex-1">
                <RadioGroupItem value="no" id="cabello-no" data-testid="radio-cabello-no" />
                <Label htmlFor="cabello-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Presupuesto */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">¿Cuál es tu presupuesto mensual?</Label>
            <Select value={quizData.presupuesto || ""} onValueChange={(value) => updateQuizData("presupuesto", value)}>
              <SelectTrigger data-testid="select-presupuesto">
                <SelectValue placeholder="Selecciona un rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bajo">Menos de $100.000 COP</SelectItem>
                <SelectItem value="medio">$100.000 - $200.000 COP</SelectItem>
                <SelectItem value="alto">Más de $200.000 COP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              data-testid="button-cancel-quiz"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={recommendationMutation.isPending}
              data-testid="button-submit-quiz"
            >
              {recommendationMutation.isPending ? "Procesando..." : "Ver recomendaciones"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
