import { useEffect } from "react";
import { calculatePriceFinal } from "../lib/currency";

interface ProductSchemaProps {
  product: {
    id: string;
    name: string;
    description: string;
    priceBase: number;
    vat: number;
    images: string[];
    vendor: {
      businessName: string;
    };
  };
  reviews?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export default function ProductSchema({ product, reviews }: ProductSchemaProps) {
  useEffect(() => {
    const finalPrice = calculatePriceFinal(product.priceBase, product.vat) / 100;
    
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.images,
      "brand": {
        "@type": "Brand",
        "name": product.vendor.businessName
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "COP",
        "price": finalPrice.toString(),
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": finalPrice.toString(),
          "priceCurrency": "COP",
          "valueAddedTaxIncluded": true
        },
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": product.vendor.businessName
        }
      }
    };

    if (reviews) {
      schema["aggregateRating"] = {
        "@type": "AggregateRating",
        "ratingValue": reviews.ratingValue.toString(),
        "reviewCount": reviews.reviewCount.toString()
      };
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [product, reviews]);

  return null;
}
