import rankerConfigData from '../client/src/lib/ranker-config.json';

interface VendorRankingData {
  id: string;
  slaP95DispatchHrs: number;
  deliveryEtaDays: number;
  ratingAvg: number;
  nps: number;
  returnRate: number;
  onTimeShipRate: number;
  responseHrs: number;
  stockHealth: number;
  takeRateBp: number;
  distanceKm: number;
  sensitiveOk: boolean;
  policyStrikes: number;
}

export function rankVendors(vendors: VendorRankingData[], quizData?: any) {
  const { weights, thresholds, boosts, penalties, tieBreakers } = rankerConfigData;
  
  // Filter vendors that don't meet hard thresholds
  const qualifiedVendors = vendors.filter(vendor => 
    vendor.ratingAvg >= thresholds.minRating &&
    vendor.slaP95DispatchHrs <= thresholds.maxSlaP95Hours &&
    vendor.returnRate <= thresholds.maxReturnRate
  );

  // Calculate scores
  const scoredVendors = qualifiedVendors.map(vendor => {
    let score = 0;
    const breakdown: any = {};

    // Normalize and weight each metric
    const metrics = {
      slaP95Dispatch: normalize(vendor.slaP95DispatchHrs, 24, 96, true), // lower is better
      deliveryEta: normalize(vendor.deliveryEtaDays, 1, 7, true),
      ratingAvg: normalize(vendor.ratingAvg, 3, 5, false),
      nps: normalize(vendor.nps, 0, 100, false),
      returnRate: normalize(vendor.returnRate, 0, 0.15, true),
      onTimeShipRate: normalize(vendor.onTimeShipRate, 0.7, 1, false),
      supportResponseHrs: normalize(vendor.responseHrs, 1, 48, true),
      stockHealth: normalize(vendor.stockHealth, 0.5, 1, false),
      takeRateBp: normalize(vendor.takeRateBp, 500, 2000, false),
      distanceKm: normalize(vendor.distanceKm, 5, 100, true)
    };

    // Apply weights
    score += metrics.slaP95Dispatch * weights.slaP95Dispatch;
    score += metrics.deliveryEta * weights.deliveryEta;
    score += metrics.ratingAvg * weights.ratingAvg;
    score += metrics.nps * weights.nps;
    score += metrics.returnRate * weights.returnRate;
    score += metrics.onTimeShipRate * weights.onTimeShipRate;
    score += metrics.supportResponseHrs * weights.supportResponseHrs;
    score += metrics.stockHealth * weights.stockHealth;
    score += metrics.takeRateBp * weights.takeRateBp;
    score += metrics.distanceKm * weights.distanceKm;

    // Apply boosts
    if (vendor.sensitiveOk && quizData?.sensibilidad === "alta") {
      score += boosts.badgeSensitiveOk;
    }
    if (vendor.distanceKm < 30) {
      score += boosts.localVendor;
    }
    if (vendor.deliveryEtaDays <= 2) {
      score += boosts.fastTrack;
    }

    // Apply penalties
    if (vendor.policyStrikes > 0) {
      score -= penalties.policyStrike * vendor.policyStrikes;
    }
    if (vendor.onTimeShipRate < 0.85) {
      score -= penalties.lateShipStrike;
    }

    // Store breakdown for debug mode
    breakdown.metrics = metrics;
    breakdown.baseScore = score;

    const reasons = [];
    if (vendor.deliveryEtaDays <= 2) reasons.push(`Entrega rápida: ${vendor.deliveryEtaDays}d`);
    if (vendor.sensitiveOk) reasons.push("Apto para piel sensible");
    if (vendor.slaP95DispatchHrs <= 48) reasons.push(`SLA: ${vendor.slaP95DispatchHrs}h`);
    if (vendor.ratingAvg >= 4.5) reasons.push(`Rating excelente: ${vendor.ratingAvg}`);

    return {
      vendorId: vendor.id,
      score: Math.round(score * 100) / 100,
      reasons,
      breakdown: process.env.NEXT_PUBLIC_APP_DEBUG_RANK === "1" ? breakdown : undefined
    };
  });

  // Sort by score
  return scoredVendors.sort((a, b) => b.score - a.score);
}

function normalize(value: number, min: number, max: number, reverse: boolean = false): number {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return reverse ? 1 - normalized : normalized;
}
