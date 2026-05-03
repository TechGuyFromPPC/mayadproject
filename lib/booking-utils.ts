export const TOUR_BASE_RATES = {
  'Tour A': 2100,
  'Tour B': 400,
  'Tour C': 400,
  'Tour D': 2100,
};

// Simplified Margin Logic based on your requirements
export function calculateSplit(tour: string, pax: number, isPartner: boolean) {
  const basePrice = TOUR_BASE_RATES[tour as keyof typeof TOUR_BASE_RATES] || 400;
  
  // LOGIC: Direct = ₱400 for Mayad | Partner = ₱100 for Mayad
  const mayadProfitPerPax = isPartner ? 100 : 400; 
  const partnerCommiPerPax = isPartner ? 300 : 0;

  return {
    total: basePrice * pax,
    mayad: mayadProfitPerPax * pax,
    commission: partnerCommiPerPax * pax,
    operator: (basePrice - mayadProfitPerPax - partnerCommiPerPax) * pax 
  };
}

export const PRIVATE_TOUR_RATES: any = {
  'Tour A': {
    published: [13100, 14700, 15700, 16500, 18300, 20700],
    contracted: [11100, 11700, 12700, 14500, 16300, 18100],
    extra: { pub: 2100, con: 1700 }
  },
  'Tour B': {
    published: [13900, 15300, 16700, 17500, 18900, 20200],
    contracted: [11900, 12300, 13300, 15100, 16900, 18100],
    extra: { pub: 2100, con: 1700 }
  },
  'Tour C': {
    published: [13700, 15300, 16500, 18100, 20900, 21500],
    contracted: [13700, 15300, 16500, 18100, 20900, 21500],
    extra: { pub: 2100, con: 1700 }
  },
  'Tour D': {
    published: [13100, 14700, 15700, 16500, 18300, 20700],
    contracted: [11100, 11700, 12700, 14500, 16300, 18100],
    extra: { pub: 2100, con: 1700 }
  }
};

export function calculatePrivateRate(tourName: string, pax: number, isContracted: boolean) {
  const tour = PRIVATE_TOUR_RATES[tourName];
  if (!tour) return 0;
  const rates = isContracted ? tour.contracted : tour.published;
  const extraFee = isContracted ? tour.extra.con : tour.extra.pub;

  if (pax <= 6) {
    return rates[pax - 1];
  } else {
    return rates[5] + ((pax - 6) * extraFee);
  }
}

// Add this to your existing TRANSFER_RENTAL_RATES or update it
export const TRANSFER_RENTAL_RATES = {
  van: { published: 900, contracted: 700, type: 'per_pax' },
  ferry: { published: 3100, contracted: 2800, type: 'per_pax' },
  bikes: {
    beat: { pub: 500, con: 400, type: 'per_day' },
    click: { pub: 700, con: 600, type: 'per_day' },
    xrf: { pub: 1500, con: 1300, type: 'per_day' }
  },
  cars: {
    wigo: { pub: 2300, con: 1800, type: 'per_day' },
    geely: { pub: 2800, con: 2300, type: 'per_day' },
    vios: { pub: 3000, con: 2500, type: 'per_day' },
    sevenSeater: { pub: 4000, con: 3500, type: 'per_day' },
    deposit: 3000
  }
};

export const EXPEDITION_RATES = {
  seatours: { name: 'Seatours (3D2N)', published: 18900, contracted: 14000 },
  keelooma: { name: 'Keelooma (3D2N)', published: 19000, contracted: 16000 }
};

/**
 * NEW: Unified Profit Calculator for Audit Ledger
 * Ensures all pages use the same math before saving to Supabase.
 */
export function calculateMayadProfit(serviceType: string, subCategory: string, pax: number, isContracted: boolean) {
  // 1. Expedition Margins (High Value)
  if (serviceType === 'Expedition') {
    const exp = EXPEDITION_RATES[subCategory as keyof typeof EXPEDITION_RATES];
    const fullMargin = (exp.published - exp.contracted) * pax;
    // If contracted, we typically take a flat fee or reduced margin
    return isContracted ? (pax * 1000) : fullMargin;
  }

  // 2. Logistics Margins
  if (serviceType === 'Logistics') {
    if (subCategory === 'VAN') return isContracted ? (pax * 100) : (pax * 200);
    // Standard margin for rentals is typically the gap between pub and con
    return 0; // Fallback or add custom rental logic
  }

  return 0;

  
}

