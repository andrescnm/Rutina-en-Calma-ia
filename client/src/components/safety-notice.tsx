import { AlertCircle } from "lucide-react";

export default function SafetyNotice() {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 md:p-6">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700 dark:text-slate-300">
          <p className="font-semibold mb-2">Aviso importante</p>
          <p>
            Este sitio ofrece <strong>información de cuidado personal</strong>, no consejo ni diagnóstico médico. 
            Si tus síntomas empeoran o tienes dudas, <strong>consulta a tu médico o dermatólogo</strong>. 
            Nuestros productos complementan tu rutina de cuidado, no reemplazan tratamiento médico profesional.
          </p>
        </div>
      </div>
    </div>
  );
}
