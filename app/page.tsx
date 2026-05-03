'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateSplit, TOUR_BASE_RATES } from '@/lib/booking-utils';

const LOGISTICS_PARTNERS = ["PARTNER A", "PARTNER B", "PARTNER C"];

export default function BookingPage() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '', country: '', tripDate: '', pax: 1,
    tour: 'Tour A', partner: 'DIRECT', notes: ''
  });

  const isPartner = formData.partner !== 'DIRECT';
  const result = calculateSplit(formData.tour, formData.pax, isPartner);

  const isFormValid = formData.name.trim() !== '' && 
                      formData.country.trim() !== '' && 
                      formData.tripDate !== '' && 
                      formData.pax > 0;

  const handleFinalSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('bookings').insert([{
      guest_name: formData.name.toUpperCase(),
      country: formData.country.toUpperCase(),
      trip_date: formData.tripDate,
      pax: formData.pax,
      tour_name: formData.tour,
      service_type: 'Shared',
      agency_partner: formData.partner,
      notes: formData.notes,
      total_collected: result.total,
      mayad_profit: result.mayad,
      partner_commission: result.commission,
      is_paid: false
    }]);

    if (!error) {
      setShowConfirm(false);
      setShowSuccess(true);
    } else {
      alert("Error saving: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans">
      {/* BACKGROUND IMAGE LAYER */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/your-background-image.jpg')" }}
      />
      <div className="fixed inset-0 z-10 bg-black/30 backdrop-blur-sm" />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative z-20 flex flex-col items-center pt-10 pb-20 px-4">
        {/* CONTAINER: Solid White with Heavy Shadow */}
        <div className="w-full max-w-5xl bg-white border-[4px] border-black p-10 shadow-[30px_30px_0px_0px_rgba(0,0,0,1)]">
          
          <header className="mb-10 border-b-8 border-black pb-4">
            <h1 className="text-7xl font-black uppercase tracking-tighter italic text-black">Booking Entry</h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* LEFT: GUEST INFO */}
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">01. Guest Details</h2>
              
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-slate-500">Full Name *</label>
                <input 
                  type="text" 
                  placeholder="ENTER GUEST NAME" 
                  className="w-full border-b-4 border-black py-2 bg-white text-black font-black text-2xl outline-none placeholder:text-slate-200" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-500">Country *</label>
                  <input 
                    type="text" 
                    placeholder="PHILIPPINES"
                    className="w-full border-b-2 border-black py-2 bg-white text-black font-bold outline-none uppercase placeholder:text-slate-200" 
                    value={formData.country} 
                    onChange={e => setFormData({...formData, country: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-500">Trip Date *</label>
                  <input 
                    type="date" 
                    className="w-full border-b-2 border-black py-2 bg-white font-bold text-black cursor-pointer" 
                    value={formData.tripDate} 
                    onChange={e => setFormData({...formData, tripDate: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: LOGISTICS */}
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">02. Service Details</h2>
              
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-slate-500">Select Tour</label>
                <select className="w-full border-b-4 border-black py-2 bg-white text-black font-black text-xl cursor-pointer outline-none" 
                  value={formData.tour} onChange={e => setFormData({...formData, tour: e.target.value})}>
                  {Object.keys(TOUR_BASE_RATES).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-500">Total Pax</label>
                  <input 
                    type="number" min="1"
                    className="w-full border-b-2 border-black py-2 bg-white text-black font-black text-xl outline-none" 
                    value={formData.pax} 
                    onChange={e => setFormData({...formData, pax: parseInt(e.target.value) || 1})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-500">Source / Partner</label>
                  <select className="w-full border-b-2 border-black py-2 bg-yellow-400 font-black uppercase text-xs cursor-pointer outline-none text-black px-2" 
                    value={formData.partner} onChange={e => setFormData({...formData, partner: e.target.value})}>
                    <option value="DIRECT">MAYAD DIRECT</option>
                    {LOGISTICS_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <textarea placeholder="ADDITIONAL NOTES..." className="w-full border-4 border-black p-4 h-24 bg-slate-50 text-black font-bold text-xs outline-none focus:bg-white transition-colors" 
                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={() => isFormValid && setShowConfirm(true)} 
            disabled={!isFormValid}
            className={`w-full mt-12 py-6 font-black uppercase text-2xl transition-all border-4 border-black ${
              isFormValid 
                ? "bg-black text-white hover:bg-emerald-500 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300"
            }`}
          >
            {isFormValid ? "Review Summary" : "Complete Fields"}
          </button>
        </div>
      </main>

      {/* VERIFICATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-white border-[8px] border-black p-0 max-w-xl w-full shadow-[20px_20px_0px_0px_rgba(255,255,255,1)]">
            <div className="bg-yellow-400 border-b-4 border-black p-6 font-black uppercase italic text-4xl text-black">Verify Entry</div>
            <div className="p-8 space-y-6">
              <div className="border-b-4 border-slate-100 pb-2">
                <p className="text-[10px] font-black uppercase text-slate-500">Guest Name</p>
                <p className="text-3xl font-black text-black break-words uppercase">{formData.name}</p>
              </div>
              
              <div className="bg-black text-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest italic">Total Collection</span>
                  <span className="text-5xl font-black">₱{result.total.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-white/20 flex justify-between text-[10px] font-black uppercase italic text-slate-400">
                  <span>Your Cut: ₱{result.mayad.toLocaleString()}</span>
                  {isPartner && <span className="text-emerald-400">Partner: ₱{result.commission.toLocaleString()}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowConfirm(false)} className="border-4 border-black py-4 font-black uppercase text-black hover:bg-slate-100">Back</button>
                <button onClick={handleFinalSubmit} disabled={loading} className="bg-emerald-500 text-black border-4 border-black py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  {loading ? "SAVING..." : "CONFIRM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-emerald-500/90 backdrop-blur-xl">
          <div className="bg-white border-[8px] border-black p-10 max-w-sm w-full text-center shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-6 flex justify-center text-6xl text-black">✓</div>
            <h2 className="text-4xl font-black uppercase text-black mb-2 leading-none italic">Recorded</h2>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">Entry added to Ledger</p>
            <button 
              onClick={() => {
                setShowSuccess(false);
                setFormData({ name: '', country: '', tripDate: '', pax: 1, tour: 'Tour A', partner: 'DIRECT', notes: '' });
              }} 
              className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
            >
              Next Guest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}