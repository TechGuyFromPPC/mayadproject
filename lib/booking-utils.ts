// Rates from Mayad reference image and user requirements
export const TOUR_BASE_RATES = {
  'Tour A': 1500,
  'Tour B': 1600,
  'Tour C': 1700,
  'Tour D': 1500,
};

export const VAN_RATES = {
  'PPS': { oneWay: 750, roundTrip: 1500 },
  'Nacpan': { oneWay: 400, roundTrip: 700 },
  'Duli': { oneWay: 700, roundTrip: 700 },
};

export const calculateSplit = (
  tour: keyof typeof TOUR_BASE_RATES | 'None',
  van: keyof typeof VAN_RATES | 'None',
  mode: 'oneWay' | 'roundTrip',
  pax: number,
  isPartner: boolean
) => {
  const published = tour !== 'None' ? TOUR_BASE_RATES[tour] : 0;
  const vanFee = van !== 'None' ? VAN_RATES[van][mode] : 0;
  
  // 400 margin per pax added to tour price
  const tourMargin = tour !== 'None' ? 400 : 0; 
  const operatorOwed = published * pax;
  
  // Logic: 300 to partner, 100 to Mayad if partner sale. Else Mayad keeps 400
  const partnerShare = isPartner ? (300 * pax) : 0;
  const mayadTourShare = isPartner ? (100 * pax) : (400 * pax);

  return {
    total: (published + tourMargin + vanFee) * pax,
    operator: operatorOwed,
    partner: partnerShare,
    mayad: mayadTourShare + (vanFee * pax), // Mayad retains full van fee for now
    vanOnly: vanFee * pax
  };
};