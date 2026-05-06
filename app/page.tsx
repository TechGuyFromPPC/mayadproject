'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// UPDATED: Base prices now include the +400 ETDF by default
// Tour A/D: 1500 (Base) + 200 (Lagoon) + 400 (ETDF) = 2100
// Tour B: 1600 (Base) + 400 (ETDF) = 2000
// Tour C: 1700 (Base) + 400 (ETDF) = 2100
const TOUR_DATA = {
  'Tour A': { price: 2100, hasLagoon: true },
  'Tour B': { price: 2000, hasLagoon: false },
  'Tour C': { price: 2100, hasLagoon: false },
  'Tour D': { price: 2100, hasLagoon: true },
};

const PARTNERS = ["PARTNER A", "PARTNER B", "PARTNER C"];

export default function BookingPage() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(false); 
  const [generatedId, setGeneratedId] = useState<string | null>(null);  
  
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'MALE', nationality: '', country: '',
    contact: '', hotel: '', tripDate: '', pax: 1,
    tour: 'Tour A', partner: 'DIRECT', hasETDF: false, notes: ''
  });

  const tourInfo = TOUR_DATA[formData.tour as keyof typeof TOUR_DATA];
  const isDirect = formData.partner === 'DIRECT';
  
  // LOGIC UPDATE:
  // We start with the 'New Total' (which includes ETDF).
  // If they HAVE the ETDF card, we deduct 400.
  const newTotalWithEtdf = tourInfo.price;
  const etdfDeduction = formData.hasETDF ? 400 : 0;
  const finalUnitPrice = newTotalWithEtdf - etdfDeduction;
  
  const totalCollected = finalUnitPrice * formData.pax;

  // Profit remains calculated on the adjusted totals
  const totalMayadProfit = isDirect ? (400 * formData.pax) : (100 * formData.pax);
  const totalPartnerCommission = isDirect ? 0 : (300 * formData.pax);

  const isFormValid = formData.name.trim() !== '' && formData.tripDate !== '' && formData.contact.trim() !== '';

  const handleFinalSubmit = async () => {
    setLoading(true);
    const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const friendlyId = `MYD-${shortCode}`;

    const { error } = await supabase.from('bookings').insert([{
      booking_id: friendlyId, 
      guest_name: formData.name.toUpperCase(),
      age: parseInt(formData.age) || null,
      gender: formData.gender,
      nationality: formData.nationality.toUpperCase(),
      country: formData.country.toUpperCase(),
      contact_number: formData.contact,
      hotel_name: formData.hotel.toUpperCase(),
      trip_date: formData.tripDate,
      pax: formData.pax,
      tour_name: formData.tour,
      service_type: 'Daily Tour',
      agency_partner: formData.partner,
      has_etdf: formData.hasETDF,
      total_collected: totalCollected,
      mayad_profit: totalMayadProfit,
      partner_commission: totalPartnerCommission,
      is_paid: false
    }]);

    if (!error) {
      setGeneratedId(friendlyId); 
      setIsSuccess(true);
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans text-black">
      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/your-background-image.jpg')" }} />
      <div className="fixed inset-0 z-10 bg-black/40 backdrop-blur-md" />

      <main className="flex-1 relative z-20 flex flex-col items-center pt-10 pb-20 px-4">
        <div className="w-full max-w-5xl bg-white/90 border-[4px] border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] backdrop-blur-sm">
          
          <header className="mb-10 border-b-8 border-black pb-4 flex justify-between items-end">
            <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">Tour Booking</h1>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase">Unit Price</p>
                <p className="text-3xl font-black">₱{finalUnitPrice.toLocaleString()}</p>
                {formData.hasETDF && <p className="text-[10px] text-emerald-600 font-bold">-₱400 ETDF DISC.</p>}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">01. Guest</h2>
              <input type="text" placeholder="FULL NAME *" className="w-full border-b-4 border-black py-2 font-black text-2xl outline-none uppercase bg-transparent" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="CONTACT *" className="w-full border-b-2 border-black py-2 font-bold outline-none bg-transparent" 
                  value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                <input type="text" placeholder="HOTEL" className="w-full border-b-2 border-black py-2 font-bold outline-none uppercase bg-transparent" 
                  value={formData.hotel} onChange={e => setFormData({...formData, hotel: e.target.value})} />
              </div>

              {/* ETDF TOGGLE: Now clearly shows the discount if they have the card */}
              <div 
                onClick={() => setFormData({...formData, hasETDF: !formData.hasETDF})}
                className={`p-4 border-4 border-black cursor-pointer transition-all flex justify-between items-center ${formData.hasETDF ? 'bg-emerald-400' : 'bg-white/50'}`}
              >
                <div className="flex flex-col">
                    <span className="font-black uppercase text-sm italic">Has ETDF Card?</span>
                    <span className="text-[10px] font-bold">Deduct ₱400 from total</span>
                </div>
                <span className="font-black underline text-xl">{formData.hasETDF ? 'YES' : 'NO'}</span>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">02. Tour Details</h2>
              <div className="grid grid-cols-2 gap-4 text-xs font-black">
                <div>
                    <label className="uppercase opacity-50">Tour Type</label>
                    <select className="w-full border-b-2 border-black py-2 bg-transparent" value={formData.tour} onChange={e => setFormData({...formData, tour: e.target.value})}>
                        {Object.keys(TOUR_DATA).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="uppercase opacity-50">Pax</label>
                    <input type="number" className="w-full border-b-2 border-black py-2 bg-transparent" value={formData.pax} onChange={e => setFormData({...formData, pax: Math.max(1, parseInt(e.target.value) || 1)})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase opacity-50">Partner Agency</label>
                <select className="w-full border-b-2 border-black py-2 font-black bg-transparent" value={formData.partner} onChange={e => setFormData({...formData, partner: e.target.value})}>
                    <option value="DIRECT">DIRECT / MAYAD</option>
                    {PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <input type="date" className="w-full border-b-2 border-black py-2 font-black bg-transparent outline-none" value={formData.tripDate} onChange={e => setFormData({...formData, tripDate: e.target.value})} />
            </div>
          </div>

          <button onClick={() => isFormValid && setShowModal(true)} disabled={!isFormValid}
            className={`w-full mt-12 py-6 font-black uppercase text-2xl border-4 border-black transition-all ${
              isFormValid ? "bg-black text-white hover:bg-emerald-500 shadow-[10px_10px_0px_0px_black]" : "bg-slate-200 text-slate-400"
            }`}>
            {isFormValid ? "Review Manifest" : "Fill Required Fields"}
          </button>
        </div>
      </main>

      {/* CONSOLIDATED MODAL UI */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className={`bg-white border-[8px] border-black p-8 max-w-lg w-full shadow-[20px_20px_0px_0px_#22c55e] transition-all duration-300 ${isSuccess ? 'scale-105 shadow-[#fbbf24]' : 'scale-100'}`}>
            
            {!isSuccess ? (
              <>
                <h2 className="text-4xl font-black uppercase italic mb-6 border-b-4 border-black pb-2 leading-none">Review Booking</h2>
                <div className="grid grid-cols-2 gap-y-6 text-left mb-8 uppercase font-bold">
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Guest Name</p>
                    <p className="truncate pr-2">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Tour & Pax</p>
                    <p>{formData.tour} ({formData.pax}P)</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Date</p>
                    <p>{formData.tripDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Total Collected</p>
                    <p className="text-2xl font-black text-emerald-600">₱{totalCollected.toLocaleString()}</p>
                    {formData.hasETDF && <p className="text-[9px] text-emerald-700 italic">* ETDF Deducted</p>}
                  </div>
                </div>

                <div className="bg-yellow-100 p-4 border-2 border-black mb-8">
                    <p className="text-[10px] font-black uppercase mb-1 underline">Reminders:</p>
                    <p className="text-[11px] font-black leading-tight">Bring Towels, Sunscreen, and Extra Cash for Kayak fees/Water.</p>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 border-4 border-black py-4 font-black uppercase hover:bg-slate-100 transition-all">Go Back</button>
                  <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] bg-black text-white py-4 font-black uppercase hover:bg-emerald-600 transition-all">
                    {loading ? 'STORING...' : 'Confirm & Save'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="inline-block bg-yellow-400 border-4 border-black px-8 py-3 font-black text-3xl uppercase shadow-[8px_8px_0px_0px_black] mb-8 animate-bounce">
                  {generatedId}
                </div>
                <h2 className="text-6xl font-black uppercase italic mb-2 tracking-tighter leading-none">MANIFESTED!</h2>
                <p className="font-bold uppercase text-xs mb-10 tracking-widest text-slate-500">The booking has been successfully recorded</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-emerald-500 border-4 border-black py-5 font-black uppercase text-black hover:bg-emerald-400 shadow-[6px_6px_0px_0px_black] transition-all"
                >
                  Create New Entry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}