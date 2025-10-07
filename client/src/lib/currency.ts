export function calculatePriceFinal(priceBase: number, vat: number): number {
  return Math.round(priceBase * (1 + vat));
}

export function formatCOP(amountInCents: number, includeIVA: boolean = true, showVATPercent: boolean = false): string {
  const amount = amountInCents / 100;
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

  if (includeIVA) {
    return showVATPercent ? `${formatted} IVA incl. (19%)` : `${formatted} IVA incl.`;
  }
  return formatted;
}

export function parseCOPPrice(price: string): number {
  // Remove currency symbols and convert to cents
  return parseInt(price.replace(/[^\d]/g, '')) * 100;
}
