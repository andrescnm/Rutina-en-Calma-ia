const PROHIBITED_CLAIMS = [
  "cura", "curar", "curing", "cure",
  "diagnóstico", "diagnostic", "diagnose",
  "tratamiento médico", "medical treatment",
  "dermatitis", "eczema", "psoriasis",
  "enfermedad", "disease", "illness",
  "medicina", "medicinal", "therapeutic",
  "prescription", "receta médica"
];

const REPLACEMENTS = {
  "cura": "cuidado personal",
  "curar": "cuidar",
  "tratamiento médico": "rutina de cuidado",
  "diagnóstico": "evaluación personal",
  "medicina": "cuidado de la piel",
  "enfermedad": "condición de la piel"
};

export function moderateContent(content: string) {
  const lowerContent = content.toLowerCase();
  
  // Check for prohibited claims
  const foundProhibited = PROHIBITED_CLAIMS.filter(claim => 
    lowerContent.includes(claim.toLowerCase())
  );

  if (foundProhibited.length > 0) {
    // Generate suggestions
    const suggestions = foundProhibited.map(claim => ({
      original: claim,
      suggestion: REPLACEMENTS[claim as keyof typeof REPLACEMENTS] || "cuidado personal"
    }));

    return {
      allowed: false,
      violations: foundProhibited,
      suggestions
    };
  }

  return {
    allowed: true,
    violations: [],
    suggestions: []
  };
}
