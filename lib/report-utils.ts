export const calculateTotalMetrics = (bookings: any[]) => {
  return bookings.reduce((acc, curr) => ({
    totalRevenue: acc.totalRevenue + curr.total_collected,
    totalProfit: acc.totalProfit + curr.mayad_profit,
    totalPax: acc.totalPax + curr.pax,
    totalPayouts: acc.totalPayouts + curr.operator_payout,
  }), { totalRevenue: 0, totalProfit: 0, totalPax: 0, totalPayouts: 0 });
};