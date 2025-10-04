import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReviewFormProps {
  productId: string;
  onSubmit: (review: { rating: number; title?: string; content?: string }) => void;
  isLoading?: boolean;
}

export default function ReviewForm({ productId, onSubmit, isLoading }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    onSubmit({
      rating,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="review-form">
      <div>
        <Label>Calificación *</Label>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoveredRating(i + 1)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
              data-testid={`star-rating-${i + 1}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  i < (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">Título (opcional)</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resuma su experiencia"
          maxLength={100}
          data-testid="input-review-title"
        />
      </div>

      <div>
        <Label htmlFor="review-content">Reseña (opcional)</Label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comparta su opinión sobre el producto"
          rows={4}
          maxLength={500}
          data-testid="input-review-content"
        />
      </div>

      <Button 
        type="submit" 
        disabled={rating === 0 || isLoading}
        data-testid="button-submit-review"
      >
        {isLoading ? "Enviando..." : "Enviar Reseña"}
      </Button>
    </form>
  );
}
