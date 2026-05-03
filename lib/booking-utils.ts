export const TOUR_BASE_RATES = {
  'Tour A': 2100,
  'Tour B': 400,
  'Tour C': 400,
  'Tour D': 2100,
};

export function calculateSplit(tour: string, pax: number, isPartner: boolean) {
  const basePrice = TOUR_BASE_RATES[tour as keyof typeof TOUR_BASE_RATES] || 400;
  
  // LOGIC: Direct = ₱400 for Mayad | Partner = ₱100 for Mayad & ₱300 for Partner
  const mayadProfitPerPax = isPartner ? 100 : 400;
  const partnerCommiPerPax = isPartner ? 300 : 0;

  return {
    total: basePrice * pax,
    mayad: mayadProfitPerPax * pax,
    commission: partnerCommiPerPax * pax,
    operator: (basePrice - mayadProfitPerPax - partnerCommiPerPax) * pax 
  };
}