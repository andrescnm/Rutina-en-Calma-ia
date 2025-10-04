import { Info } from "lucide-react";

export default function MedicalDisclaimer() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6" data-testid="medical-disclaimer">
      <div className="flex gap-3">
        <Info className="w-6 h-6 text-amber-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-amber-900 mb-2">Aviso importante</h4>
          <p className="text-sm text-amber-900">
            Este sitio ofrece información de <strong>cuidado personal</strong>, no consejo ni diagnóstico médico. 
            Si tus síntomas empeoran o tienes dudas, <strong>consulta a tu médico</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
