import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cómo funciona el marketplace?",
    answer: "Conectamos a compradores con vendedores verificados de productos de cuidado personal. Cada vendedor gestiona su inventario y envíos, mientras nosotros facilitamos la transacción de forma segura."
  },
  {
    question: "¿Los precios incluyen IVA?",
    answer: "Sí, todos los precios mostrados incluyen el IVA del 19%. Lo que ves es lo que pagas, sin sorpresas al finalizar tu compra."
  },
  {
    question: "¿Cómo me ayuda el quiz personalizado?",
    answer: "Nuestro quiz analiza tu tipo de piel, preocupaciones y preferencias para recomendarte productos específicos de vendedores con mejor puntuación en nuestro sistema de ranking."
  },
  {
    question: "¿Esto reemplaza a un dermatólogo?",
    answer: "No. Este sitio ofrece información de cuidado personal y productos, pero no brinda consejo ni diagnóstico médico. Si tienes condiciones de piel que requieren atención médica o tus síntomas empeoran, consulta a un dermatólogo profesional."
  },
  {
    question: "¿Cómo se eligen los vendedores destacados?",
    answer: "Usamos un sistema de ranking que evalúa múltiples factores: tiempo de despacho, puntualidad de entrega, calificación promedio, tasa de devolución, disponibilidad de stock y satisfacción del cliente (NPS)."
  },
  {
    question: "¿Cuánto tarda el envío?",
    answer: "El tiempo de envío varía según el vendedor. Cada producto muestra el tiempo estimado de entrega. La mayoría de nuestros vendedores despachan en 2-4 días hábiles."
  }
];

export default function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-slate-100 mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Respuestas a las dudas más comunes sobre nuestro marketplace
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
              <AccordionTrigger className="text-left text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
