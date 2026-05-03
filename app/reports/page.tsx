'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export default function ReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'PENDING' | 'PAID' | 'ALL'>('PENDING');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Date Filter State (Defaults to current month)
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('trip_date', { ascending: false });
    if (data) setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSettle = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ is_paid: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      setBookings(prev => prev.map(b => b.id === id ? { ...b, is_paid: !currentStatus } : b));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handlePrint = () => window.print();

  const partners = Array.from(new Set(bookings.map(b => b.agency_partner))).filter(p => p !== 'DIRECT');

  // Unified Filter Logic: Partner + Status + Date Range
  const filteredBookings = bookings.filter(b => {
    const tripDate = parseISO(b.trip_date);
    const partnerMatch = selectedPartner === 'ALL' || b.agency_partner === selectedPartner;
    const statusMatch = 
      viewMode === 'ALL' ? true : 
      viewMode === 'PAID' ? b.is_paid === true : 
      b.is_paid === false;
    
    const dateMatch = isWithinInterval(tripDate, {
      start: parseISO(startDate),
      end: parseISO(endDate)
    });

    return partnerMatch && statusMatch && dateMatch;
  });

  const pendingPayout = filteredBookings
    .filter(b => !b.is_paid)
    .reduce((sum, b) => sum + (b.operator_payout ?? 0), 0);

  const totalCommissionGenerated = filteredBookings.reduce((sum, b) => sum + (b.mayad_profit ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white text-black min-h-screen font-sans">
      {/* HEADER - Print Hidden */}
      <header className="flex justify-between items-end mb-8 border-b-8 border-black pb-4 print:hidden">
        <div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter">Settlements</h1>
          <p className="font-bold text-slate-500 uppercase">Payout & Commission Tracking</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handlePrint}
            className="bg-white border-4 border-black px-4 py-2 font-black uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_black]"
          >
            Print PDF
          </button>
          <div className="flex bg-black p-1 gap-1">
            {(['PENDING', 'PAID', 'ALL'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1 text-[10px] font-black uppercase transition-all ${viewMode === mode ? 'bg-yellow-400 text-black' : 'text-white hover:bg-slate-800'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block mb-8 border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black uppercase">Settlement Report: {selectedPartner}</h1>
        <p className="font-bold">Period: {format(parseISO(startDate), 'MMM dd')} - {format(parseISO(endDate), 'MMM dd, yyyy')}</p>
      </div>

      {/* FILTERS - Print Hidden */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 print:hidden">
        <div className="border-4 border-black p-4 bg-yellow-400">
           <label className="block text-[10px] font-black uppercase mb-1">Partner / Agency</label>
           <select 
            className="w-full bg-transparent font-black text-xl uppercase outline-none"
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
          >
            <option value="ALL">All Partners</option>
            {partners.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="border-4 border-black p-4 bg-slate-50">
          <label className="block text-[10px] font-black uppercase mb-1">Start Date</label>
          <input 
            type="date" 
            className="w-full bg-transparent font-bold outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="border-4 border-black p-4 bg-slate-50">
          <label className="block text-[10px] font-black uppercase mb-1">End Date</label>
          <input 
            type="date" 
            className="w-full bg-transparent font-bold outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="border-4 border-black p-8 bg-black text-white shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]">
          <span className="text-xs font-black uppercase text-blue-400">Total Unpaid Balance</span>
          <h2 className="text-6xl font-black">₱{pendingPayout.toLocaleString()}</h2>
          <p className="text-[10px] mt-2 italic text-slate-400">* Amount owed to operators</p>
        </div>

        <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
          <span className="text-xs font-black uppercase text-emerald-600">Commission Earned</span>
          <h2 className="text-6xl font-black text-black">₱{totalCommissionGenerated.toLocaleString()}</h2>
          <p className="text-[10px] mt-2 italic text-slate-500">* Mayad Net Profit for selected view</p>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="border-4 border-black overflow-hidden shadow-[12px_12px_0px_0px_black] print:shadow-none print:border-2">
        <table className="w-full text-left">
          <thead className="bg-black text-white text-[10px] uppercase">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Guest / Service</th>
              <th className="p-4 text-right">Collected</th>
              <th className="p-4 text-right text-yellow-400">Profit</th>
              <th className="p-4 text-right text-blue-400">Payout</th>
              <th className="p-4 text-center print:hidden">Status</th>
            </tr>
          </thead>
          <tbody className="font-bold text-xs uppercase">
            {filteredBookings.map((b) => (
              <tr key={b.id} className={`border-b-2 border-black hover:bg-slate-50 transition-colors ${b.is_paid ? 'opacity-50 grayscale print:opacity-100 print:grayscale-0' : ''}`}>
                <td className="p-4 align-top">{format(parseISO(b.trip_date), 'MMM dd')}</td>
                <td className="p-4">
                  <div className="font-black">{b.guest_name}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{b.tour_name}</div>
                  <div className="text-[9px] mt-1 inline-block bg-slate-200 px-1">{b.agency_partner}</div>
                </td>
                <td className="p-4 text-right align-top">₱{(b.total_collected ?? 0).toLocaleString()}</td>
                <td className="p-4 text-right align-top text-emerald-600">₱{(b.mayad_profit ?? 0).toLocaleString()}</td>
                <td className="p-4 text-right align-top bg-blue-50">₱{(b.operator_payout ?? 0).toLocaleString()}</td>
                <td className="p-4 text-center align-top print:hidden">
                  <button
                    onClick={() => handleSettle(b.id, b.is_paid)}
                    disabled={loadingId === b.id}
                    className={`px-4 py-2 border-2 border-black text-[10px] font-black uppercase transition-all shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none
                      ${b.is_paid ? 'bg-slate-400 text-white' : 'bg-emerald-400 hover:bg-emerald-300'}`}
                  >
                    {loadingId === b.id ? '...' : b.is_paid ? 'Paid' : 'Mark Paid'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}