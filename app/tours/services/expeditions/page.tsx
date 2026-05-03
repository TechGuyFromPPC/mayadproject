'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EXPEDITION_RATES } from '@/lib/booking-utils';
import { useRouter } from 'next/navigation';

export default function ExpeditionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Selection State
  const [pax, setPax] = useState(1);
  const [selectedExpedition, setSelectedExpedition] = useState<'seatours' | 'keelooma'>('seatours');
  const [isContracted, setIsContracted] = useState(false);
  
  // Guest Identity State
  const [guestName, setGuestName] = useState('');
  const [tripDate, setTripDate] = useState('');

  const trip = EXPEDITION_RATES[selectedExpedition];
  const unitPrice = isContracted ? trip.contracted : trip.published;
  const totalPrice = unitPrice * pax;
  
  // Margin Logic for Audit Ledger
  const marginPerPax = trip.published - trip.contracted;
  const totalMargin = marginPerPax * pax;
  
const handleConfirm = async (expeditionKey: string) => {
  if (!guestName || !tripDate) return alert("Please enter Guest Name and Trip Date");

  setLoading(true);
  try {
    const exp = EXPEDITION_RATES[expeditionKey as keyof typeof EXPEDITION_RATES];
    const price = isContracted ? exp.contracted : exp.published;
    const totalAmount = price * pax;

    // Use your specific expedition profit logic (e.g., ₱1000 flat for partners)
    const mayadProfit = isContracted ? (pax * 1000) : (exp.published - exp.contracted) * pax;

    // INSERT mapping to your SQL schema
    const { error } = await supabase.from('bookings').insert([{
      guest_name: guestName.toUpperCase(),
      trip_date: tripDate,
      service_type: 'Expedition',
      sub_category: expeditionKey.toUpperCase(), // 'SEATOURS' or 'KEELOOMA'
      tour_name: exp.name,
      pax: pax,
      total_collected: totalAmount, // FIXED: Matches your SQL numeric column
      mayad_profit: mayadProfit,
      is_contracted: isContracted,
      is_partner_sale: isContracted
    }]);

    if (error) throw error;

    alert('Expedition Booking Saved!');
    router.push('/reports'); 
  } catch (err: any) {
    console.error("Database Error:", {
      message: err.message,
      details: err.details,
      hint: err.hint
    });
    alert(`Error: ${err.message || 'Check schema mapping'}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-6xl mx-auto p-8 text-black bg-white min-h-screen">
      <header className="mb-12 border-b-8 border-black pb-6">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter">Island Expeditions</h1>
        <p className="font-bold text-slate-500 uppercase text-sm mt-2">Multi-Day El Nido ↔ Coron Journeys</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* NEW: GUEST DETAILS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-4 border-black p-6 bg-yellow-50">
            <div>
              <label className="block text-xs font-black uppercase mb-1">Guest Full Name</label>
              <input 
                type="text" 
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full border-4 border-black p-3 font-bold uppercase outline-none focus:bg-white"
                placeholder="Ex: John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-1">Trip Start Date</label>
              <input 
                type="date" 
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full border-4 border-black p-3 font-bold outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(Object.entries(EXPEDITION_RATES) as [any, any][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedExpedition(key)}
                className={`p-6 border-4 border-black text-left transition-all ${
                  selectedExpedition === key ? 'bg-black text-white translate-x-2' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <p className="text-[10px] font-black uppercase opacity-60">Operator</p>
                <h3 className="text-2xl font-black uppercase">{value.name}</h3>
              </button>
            ))}
          </div>

          <div className="border-4 border-black p-8 bg-slate-50">
            <label className="block text-xs font-black uppercase mb-4">Total Travelers (Pax)</label>
            <div className="flex items-center gap-6">
              <input 
                type="range" min="1" max="20" value={pax} 
                onChange={(e) => setPax(parseInt(e.target.value))}
                className="flex-1 h-4 bg-black appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-5xl font-black min-w-[80px] text-center">{pax}</span>
            </div>
          </div>

          <div 
            onClick={() => setIsContracted(!isContracted)}
            className="border-4 border-black p-6 cursor-pointer flex justify-between items-center group hover:bg-yellow-400 transition-colors"
          >
            <div>
              <p className="font-black uppercase">Rate Type: {isContracted ? 'Contracted' : 'Published'}</p>
              <p className="text-xs font-bold text-slate-500 italic">Toggle for partner or walk-in pricing</p>
            </div>
            <div className={`w-12 h-6 border-2 border-black relative ${isContracted ? 'bg-black' : 'bg-white'}`}>
              <div className={`w-4 h-4 absolute top-0.5 transition-all ${isContracted ? 'right-1 bg-yellow-400' : 'left-1 bg-black'}`} />
            </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div className="border-8 border-black p-8 flex flex-col justify-between bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <p className="text-[10px] font-black uppercase mb-1">Quote Summary</p>
            <h2 className="text-3xl font-black uppercase leading-none mb-6">{trip.name}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b-2 border-black pb-2">
                <span className="text-xs font-bold uppercase">Rate per Head</span>
                <span className="font-black">₱{unitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b-2 border-black pb-2">
                <span className="text-xs font-bold uppercase">Total Guests</span>
                <span className="font-black">x {pax}</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-[10px] font-black uppercase text-slate-400">Total Price</p>
            <p className="text-6xl font-black tracking-tighter mb-4">₱{totalPrice.toLocaleString()}</p>
            
            <div className="bg-emerald-100 p-3 border-2 border-emerald-500">
              <p className="text-[10px] font-black text-emerald-700 uppercase">Estimated Profit Margin</p>
              <p className="text-xl font-black text-emerald-700">₱{totalMargin.toLocaleString()}</p>
            </div>

           <button 
  onClick={() => handleConfirm(selectedExpedition)}
  disabled={loading}
  className={`
    w-full mt-8 py-6 px-8 
    font-black uppercase text-xl tracking-widest
    border-4 border-black transition-all duration-200
    ${loading 
      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
      : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:-translate-y-1 active:translate-y-0 active:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
    }
  `}
>
  {loading ? (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Processing...
    </span>
  ) : (
    'Create Expedition Booking'
  )}
</button>
          </div>
        </div>
      </div>
    </div>
  );
}