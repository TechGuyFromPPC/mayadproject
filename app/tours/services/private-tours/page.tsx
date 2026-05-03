'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { calculatePrivateRate } from '@/lib/booking-utils';

// 1. CONSTANT PARTNERS LIST
const TOUR_PARTNERS = ["PARTNER A", "PARTNER B", "PARTNER C"];

export default function PrivateToursPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Booking State
  const [pax, setPax] = useState(1);
  const [selectedTour, setSelectedTour] = useState('Tour A');
  const [agencyName, setAgencyName] = useState(''); 
  
  // Guest Details State
  const [guestName, setGuestName] = useState('');
  const [tripDate, setTripDate] = useState('');

  // Always use standard rate for the collected amount
  const price = calculatePrivateRate(selectedTour, pax, false);

  const handleConfirm = async () => {
    if (!guestName || !tripDate) return alert("Please enter Guest Name and Trip Date");

    setLoading(true);
    try {
      const totalAmount = calculatePrivateRate(selectedTour, pax, false);
      
      /**
       * SIMPLIFIED PROFIT LOGIC:
       * For Private Tours, Mayad takes a fixed profit.
       * Let's assume the fixed Mayad profit for Private Tours is ₱500 (or adjust as needed).
       */
      const fixedMayadProfit = 500; 
      const operatorPayout = totalAmount - fixedMayadProfit;

      const { error } = await supabase.from('bookings').insert([{
        guest_name: guestName.toUpperCase(),
        trip_date: tripDate,
        tour_name: selectedTour,
        service_type: 'Private',
        sub_category: 'Island Tour',
        pax: pax,
        total_collected: totalAmount,
        mayad_profit: fixedMayadProfit,
        operator_payout: operatorPayout, 
        agency_partner: agencyName || 'DIRECT',
        is_paid: false,
        notes: `Private Tour: ${selectedTour} | ${pax} Pax`
      }]);

      if (error) throw error;
      alert(`Recorded! Mayad Profit: ₱${fixedMayadProfit.toLocaleString()}`);
      router.push('/reports'); 
    } catch (err: any) {
      console.error("Database Error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 text-black font-sans min-h-screen bg-white">
      <h1 className="text-7xl font-black uppercase italic mb-8 border-b-8 border-black pb-4 tracking-tighter">
        Private Tour
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT: GUEST INFO */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">01. Guest Details</h2>
          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full border-4 border-black p-3 font-bold uppercase outline-none focus:bg-yellow-50 transition-colors"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="ENTER NAME"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Trip Date</label>
            <input 
              type="date" 
              className="w-full border-4 border-black p-3 font-bold outline-none focus:bg-blue-50 transition-colors"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
            />
          </div>
        </div>

        {/* MIDDLE: TOUR CONFIG */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">02. Tour Setup</h2>
          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Select Tour</label>
            <select 
              value={selectedTour} 
              onChange={(e) => setSelectedTour(e.target.value)}
              className="w-full border-4 border-black p-3 font-black uppercase bg-yellow-400 outline-none cursor-pointer"
            >
              {['Tour A', 'Tour B', 'Tour C', 'Tour D'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Number of Pax</label>
            <input 
              type="number" 
              min="1" 
              value={pax} 
              onChange={(e) => setPax(parseInt(e.target.value) || 1)}
              className="w-full border-4 border-black p-3 font-black text-xl outline-none focus:bg-emerald-50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Agency / Partner (Optional)</label>
            <select 
              className="w-full border-4 border-black p-3 font-black uppercase bg-white outline-none cursor-pointer"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
            >
              <option value="">DIRECT BOOKING</option>
              {TOUR_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* RIGHT: PRICING DISPLAY */}
        <div className="bg-black text-white p-8 flex flex-col justify-between shadow-[15px_15px_0px_0px_black] border-4 border-black">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Total Amount Collected</p>
            <p className="text-6xl font-black text-yellow-400 tracking-tighter">
              ₱{price.toLocaleString()}
            </p>
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-[10px] font-bold uppercase italic leading-tight text-slate-400">
                * Includes boat, crew, and lunch. 
                <br />* Standard rate applies to all bookings.
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className={`mt-8 w-full font-black uppercase py-6 transition-all border-4 
              ${loading 
                ? 'bg-slate-800 border-slate-700 text-slate-500' 
                : 'bg-emerald-500 border-emerald-600 text-black hover:bg-emerald-400 hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_black]'}`}
          >
            {loading ? 'RECORDING...' : 'Confirm & Record'}
          </button>
        </div>
      </div>
    </div>
  );
}