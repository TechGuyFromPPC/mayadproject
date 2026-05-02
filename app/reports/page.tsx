'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SalesHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('All');

  useEffect(() => {
    const fetchSales = async () => {
      // Fetching all columns to ensure agency_partner and partner_commission are included
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('trip_date', { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error.message);
        return;
      }

      if (data) {
        setHistory(data);
        setFilteredData(data);
      }
    };
    fetchSales();
  }, []);

  // Combined Filter Logic: Handles Partner and Date simultaneously
  useEffect(() => {
    let result = [...history];

    // 1. Partner Filter
    if (selectedPartner !== 'All') {
      result = result.filter(sale => sale.agency_partner === selectedPartner);
    }

    // 2. Date Range Filter
    if (startDate) {
      result = result.filter(sale => new Date(sale.trip_date) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter(sale => new Date(sale.trip_date) <= new Date(endDate));
    }
    
    setFilteredData(result);
  }, [startDate, endDate, selectedPartner, history]);

  // Reset Function
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedPartner('All');
  };

  // Calculate Totals for the current filtered view
  const totals = filteredData.reduce((acc, curr) => ({
    revenue: acc.revenue + (Number(curr.total_collected) || 0),
    commissions: acc.commissions + (Number(curr.partner_commission) || 0)
  }), { revenue: 0, commissions: 0 });

  // Dynamically get unique partners from the history
  const uniquePartners = Array.from(new Set(history.map(s => s.agency_partner))).filter(Boolean);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 text-black min-h-screen">
      
      {/* PRINT HEADER: Only visible on paper */}
      <div className="hidden print:block mb-8 text-center border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black uppercase">MAYAD EL NIDO</h1>
        <p className="text-sm font-bold uppercase">Partner Commission Statement</p>
        <p className="text-xs font-bold mt-2 italic">
          Generated for: {selectedPartner} | Range: {startDate || 'All Time'} to {endDate || 'Present'}
        </p>
      </div>

      <header className="flex flex-col gap-6 mb-8 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-8 border-black pb-6 gap-4">
           <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter">Audit Ledger</h1>
            <p className="text-black font-bold uppercase tracking-widest mt-2 bg-yellow-400 inline-block px-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Partner Tracking
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {/* RESET BUTTON */}
            <button 
              onClick={resetFilters}
              className="flex-1 md:flex-none bg-white border-4 border-black text-black px-6 py-4 font-black uppercase hover:bg-slate-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              Reset
            </button>
            
            <button 
              onClick={handlePrint}
              className="flex-[2] md:flex-none bg-black text-white px-8 py-4 font-black uppercase hover:bg-emerald-600 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none"
            >
              Print Statement
            </button>
          </div>
        </div>

        {/* FILTERS AREA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white uppercase mb-1">Select Partner</span>
            <select 
              value={selectedPartner} 
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="bg-white border-2 border-white px-2 py-2 font-bold text-sm text-black outline-none"
            >
              <option value="All">All Partners / Direct</option>
              {uniquePartners.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white uppercase mb-1">From Date</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white border-2 border-white px-2 py-1 font-bold text-sm text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white uppercase mb-1">To Date</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white border-2 border-white px-2 py-1 font-bold text-sm text-black" />
          </div>
        </div>
      </header>

      {/* DASHBOARD SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:mb-12">
        <div className="border-4 border-black p-6 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] print:shadow-none">
          <p className="text-xs font-black uppercase text-slate-400">Total Bookings Value</p>
          <p className="text-4xl font-black">₱{totals.revenue.toLocaleString()}</p>
        </div>
        <div className="border-4 border-black p-6 bg-yellow-400 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] print:shadow-none">
          <p className="text-xs font-black uppercase text-black italic">Commissions Owed</p>
          <p className="text-4xl font-black text-black">₱{totals.commissions.toLocaleString()}</p>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border-4 border-black overflow-hidden shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)] print:shadow-none print:border-none">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black text-white print:bg-white print:text-black print:border-b-2 print:border-black">
            <tr>
              <th className="p-4 text-[10px] font-black uppercase">Date</th>
              <th className="p-4 text-[10px] font-black uppercase">Guest / Tour</th>
              <th className="p-4 text-[10px] font-black uppercase text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {filteredData.length > 0 ? (
              filteredData.map((sale) => (
                <tr key={sale.id} className="font-bold print:text-sm">
                  <td className="p-4 text-xs">{new Date(sale.trip_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="text-sm font-black uppercase">{sale.guest_name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{sale.tour_name}</div>
                  </td>
                  <td className="p-4 text-right">₱{(sale.partner_commission || 0).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-10 text-center font-black uppercase text-slate-300">No data found for this selection</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}