'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateSplit, TOUR_BASE_RATES } from '@/lib/booking-utils';

export default function MayadBookingPage() {
  // Customer Inputs
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [pax, setPax] = useState(1);
  const [partner, setPartner] = useState('Mayad Direct');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Service Inputs
  const [tour, setTour] = useState<string>('Tour A');
  
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Partners List
  const TOP_PARTNERS = ["El Nido Boutique", "Island Hoppers Inc", "Beachfront VIP", "Lagoon Tours", "Van Express"];

  // Logic: Calculate totals based on selection
  const isPartnerSale = partner !== 'Mayad Direct';
const result = calculateSplit(tour as any, 'None', 'oneWay', pax, isPartnerSale);

  const handleConfirmSale = async () => {
  setLoading(true);
  
  const { error } = await supabase.from('bookings').insert([{
    guest_name: name,
    country,
    trip_date: tripDate,
    pax,
    agency_partner: partner,
    tour_name: tour,
    notes: notes,
    total_collected: result.total,
    mayad_profit: result.mayad,
    operator_payout: result.operator,
    partner_commission: isPartnerSale ? (pax * 300) : 0
  }]);

  setLoading(false);
  if (error) {
    console.error("Error logging sale:", error.message);
    alert("Failed to log sale.");
  } else {
    setShowModal(false); // Close review modal
    setShowSuccess(true); // Open success modal
    // Form reset happens after closing success
  }
};

  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center items-start">
      {/* GLASSMORPHISM CARD */}
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md border-[4px] border-black p-6 md:p-10 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
        
        <header className="mb-10 border-b-4 border-black pb-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black">New Booking</h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Guest Entrance & Service Selection</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT COLUMN: GUEST INFO */}
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase bg-black text-white px-2 py-1 inline-block">01. Guest Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Guest Name" 
                  className="w-full border-b-2 border-black py-2 bg-transparent text-black font-bold outline-none focus:border-emerald-500 transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1">Country</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Philippines" 
                  className="w-full border-b-2 border-black py-2 bg-transparent text-black font-bold outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">Trip Date</label>
                  <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} 
                    className="w-full border-b-2 border-black py-2 bg-transparent text-black font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">Total Pax</label>
                  <input type="number" min="1" value={pax} onChange={(e) => setPax(Number(e.target.value))} 
                    className="w-full border-b-2 border-black py-2 bg-transparent text-black font-bold outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SERVICE & PARTNER */}
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase bg-black text-white px-2 py-1 inline-block">02. Tour & Partner</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1">Select Island Tour</label>
                <select value={tour} onChange={(e) => setTour(e.target.value)} 
                  className="w-full border-b-2 border-black py-2 bg-transparent text-black font-bold outline-none">
                  {Object.keys(TOUR_BASE_RATES).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1">Agency / Source</label>
                <select value={partner} onChange={(e) => setPartner(e.target.value)} 
                  className="w-full border-b-2 border-black py-2 bg-transparent text-black font-bold outline-none">
                  <option value="Mayad Direct">Mayad Direct</option>
                  {TOP_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
                  <option value="New Partner">+ Register New Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1">
                  Notes {partner === 'New Partner' && "(Enter Partner Name Here)"}
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Special requests or new partner info..."
                  className="w-full border-2 border-black p-3 bg-white/50 text-black font-medium h-24 outline-none focus:bg-white" />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          disabled={!name || !tripDate}
          className="w-full mt-10 bg-black text-white py-5 font-black uppercase tracking-[0.2em] text-lg hover:bg-emerald-600 transition-all disabled:bg-slate-300 shadow-[5px_5px_0px_0px_rgba(16,185,129,1)]"
        >
          Review & Log Sale
        </button>
      </div>

      {/* CONFIRMATION MODAL */}
      {/* CONFIRMATION MODAL - HIGH CONTRAST VERSION */}
{showModal && (
  <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
    <div className="bg-white border-[8px] border-black p-8 max-w-md w-full shadow-[20px_20px_0px_0px_rgba(255,255,255,0.2)]">
      
      <h3 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2 text-black italic">
        Verify Entry
      </h3>
      
      <div className="space-y-4 mb-8">
        {/* Guest Info Section */}
        <div className="border-l-4 border-black pl-4 py-1">
          <p className="text-[10px] font-black uppercase text-slate-400">Guest Name</p>
          <p className="text-lg font-black text-black uppercase">{name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-l-4 border-black pl-4 py-1">
            <p className="text-[10px] font-black uppercase text-slate-400">Tour Selection</p>
            <p className="text-sm font-black text-black uppercase">{tour} ({pax} Pax)</p>
          </div>
          <div className="border-l-4 border-black pl-4 py-1">
            <p className="text-[10px] font-black uppercase text-slate-400">Trip Date</p>
            <p className="text-sm font-black text-black uppercase">{tripDate}</p>
          </div>
        </div>

        <div className="border-l-4 border-black pl-4 py-1">
          <p className="text-[10px] font-black uppercase text-slate-400">Agency / Source</p>
          <p className="text-sm font-black text-black uppercase">{partner}</p>
        </div>

        {/* Financial Summary */}
        <div className="bg-black p-6 mt-6">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total to Collect</p>
          <p className="text-4xl font-black text-white leading-none">₱{result.total.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={handleConfirmSale} 
          disabled={loading} 
          className="w-full bg-emerald-500 text-black py-5 font-black uppercase tracking-widest text-lg hover:bg-emerald-400 transition-all active:scale-95"
        >
          {loading ? 'Processing...' : 'Confirm & Log Sale'}
        </button>
        
        <button 
          onClick={() => setShowModal(false)} 
          className="w-full py-2 text-[10px] font-black uppercase text-black hover:underline tracking-widest"
        >
          Go Back & Edit
        </button>
      </div>
    </div>
  </div>
)}
      {/* SUCCESS MODAL */}
{showSuccess && (
  <div className="fixed inset-0 bg-emerald-500/90 backdrop-blur-xl flex items-center justify-center p-4 z-[110]">
    <div className="bg-white border-[8px] border-black p-10 max-w-sm w-full text-center shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] transform scale-105 transition-all">
      
      {/* Icon Area */}
      <div className="mb-6 flex justify-center">
        <div className="h-20 w-20 bg-black rounded-full flex items-center justify-center border-4 border-emerald-400">
          <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="text-3xl font-black uppercase tracking-tighter text-black mb-2">Sale Recorded</h2>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Cloud Ledger Updated Successfully</p>
      
      <div className="bg-slate-50 border-2 border-black p-4 mb-8">
        <p className="text-xs font-bold text-black italic">"Ready for the next guest!"</p>
      </div>

      <button 
        onClick={() => {
          setShowSuccess(false);
          // Reset the form here
          setName(''); setCountry(''); setTripDate(''); setPax(1); setPartner('Mayad Direct'); setNotes('');
        }} 
        className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
      >
        Dismiss
      </button>
    </div>
  </div>
)}
    </div>
    
  );
}