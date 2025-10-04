import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Review {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  createdAt: string;
  verified: boolean;
  userId: string;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay reseñas aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="review-list">
      {reviews.map((review) => (
        <Card key={review.id} className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(review.rating)}</div>
              {review.verified && (
                <span className="text-xs text-green-600 font-medium">✓ Compra verificada</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString('es-CO')}
            </span>
          </div>
          {review.title && (
            <h4 className="font-semibold mb-1">{review.title}</h4>
          )}
          {review.content && (
            <p className="text-sm text-muted-foreground">{review.content}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
