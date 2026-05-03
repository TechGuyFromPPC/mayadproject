'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateSplit, TOUR_BASE_RATES } from '@/lib/booking-utils';

export default function BookingPage() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '', country: '', tripDate: '', pax: 1,
    tour: 'Tour A', partner: 'Mayad Direct', notes: ''
  });

  const isPartner = formData.partner !== 'Mayad Direct';
  const result = calculateSplit(formData.tour, formData.pax, isPartner);

  // VALIDATION: Check if required fields are filled
  const isFormValid = formData.name.trim() !== '' && 
                     formData.country.trim() !== '' && 
                     formData.tripDate !== '' && 
                     formData.pax > 0;

  const handleFinalSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('bookings').insert([{
      guest_name: formData.name,
      country: formData.country,
      trip_date: formData.tripDate,
      pax: formData.pax,
      tour_name: formData.tour,
      agency_partner: formData.partner,
      notes: formData.notes,
      total_collected: result.total,
      mayad_profit: result.mayad,
      partner_commission: result.commission
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
    <div className="min-h-screen p-4 md:p-12 flex justify-center items-start bg-cover bg-center bg-fixed relative" 
         style={{ backgroundImage: "url('/your-background-image.jpg')" }}>
      
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border-[4px] border-black p-10 shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] z-10">
        <header className="mb-10 border-b-8 border-black pb-4">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-black italic">New Booking</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* LEFT: GUEST INFO */}
          {/* GUEST INFO SECTION */}
<div className="space-y-6 text-black">
  <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">
    01. Guest Identification
  </h2>
  
  {/* FULL NAME - Forced Black */}
  <div>
    <label className="block text-xs font-black uppercase mb-1 text-black">
      Full Name *
    </label>
    <input 
      type="text" 
      placeholder="ENTER GUEST NAME" 
      className="w-full border-b-4 border-black py-2 bg-transparent text-black font-black text-xl outline-none placeholder:text-slate-400" 
      value={formData.name} 
      onChange={e => setFormData({...formData, name: e.target.value})} 
    />
  </div>

  {/* COUNTRY - Forced Black */}
  <div>
    <label className="block text-xs font-black uppercase mb-1 text-black">
      Country *
    </label>
    <input 
      type="text" 
      placeholder="PHILIPPINES"
      className="w-full border-b-2 border-black py-2 bg-transparent text-black font-bold outline-none placeholder:text-slate-400" 
      value={formData.country} 
      onChange={e => setFormData({...formData, country: e.target.value})} 
    />
  </div>

  {/* DATE - High Contrast Native Picker */}
  <div>
    <label className="block text-xs font-black uppercase mb-1 text-black">
      Trip Date *
    </label>
    <input 
      type="date" 
      className="w-full border-b-2 border-black py-2 bg-transparent font-bold text-black cursor-pointer appearance-none" 
      value={formData.tripDate} 
      onChange={e => setFormData({...formData, tripDate: e.target.value})} 
    />
  </div>
</div>

          {/* RIGHT: LOGISTICS */}
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block">02. Service Details</h2>
            <select className="w-full border-b-4 border-black py-2 bg-transparent text-black font-black text-xl" 
              value={formData.tour} onChange={e => setFormData({...formData, tour: e.target.value})}>
              {Object.keys(TOUR_BASE_RATES).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="w-full border-b-2 border-black py-2 bg-transparent text-black font-bold bg-yellow-300/30" 
              value={formData.partner} onChange={e => setFormData({...formData, partner: e.target.value})}>
              <option>Mayad Direct</option>
              <option>Hotel ABC</option>
              <option>Island Hoppers</option>
            </select>
            <textarea placeholder="Notes..." className="w-full border-2 border-black p-4 h-24 bg-white/50 text-black font-medium outline-none" 
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
        </div>

        <button 
          onClick={() => isFormValid && setShowConfirm(true)} 
          disabled={!isFormValid}
          className={`w-full mt-12 py-6 font-black uppercase text-2xl transition-all border-4 border-black ${
            isFormValid 
              ? "bg-black text-white hover:bg-emerald-600 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50"
          }`}
        >
          {isFormValid ? "Review Booking Summary" : "Please Complete All Fields"}
        </button>
      </div>

      {/* VERIFICATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95">
          <div className="bg-white border-[8px] border-black p-0 max-w-xl w-full shadow-[20px_20px_0px_0px_rgba(255,255,255,1)]">
            <div className="bg-yellow-400 border-b-4 border-black p-6 font-black uppercase italic text-4xl text-black">Verify Entry</div>
            <div className="p-8 space-y-6">
              <div className="border-b-4 border-slate-100 pb-2">
                <p className="text-[14px] font-black uppercase text-slate-500">Guest Name</p>
                <p className="text-3xl font-black text-black break-words uppercase">{formData.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[14px] font-black uppercase text-slate-500">Expedition</p>
                  <p className="text-xl font-black text-black uppercase">{formData.tour}</p>
                </div>
                <div>
                  <p className="text-[14px] font-black uppercase text-slate-500">Total Pax</p>
                  <p className="text-xl font-black text-black">{formData.pax}</p>
                </div>
              </div>
              <div className="bg-black text-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black uppercase text-yellow-400 tracking-widest">Total to Collect</span>
                  <span className="text-4xl font-black">₱{result.total.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-white/20 flex justify-between text-xs font-bold">
                  <span>Mayad Profit: ₱{result.mayad.toLocaleString()}</span>
                  {isPartner && <span className="text-red-400">Partner Commi: ₱{result.commission.toLocaleString()}</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowConfirm(false)} className="border-4 border-black py-4 font-black uppercase hover:bg-slate-100">Back</button>
                <button onClick={handleFinalSubmit} disabled={loading} className="bg-emerald-500 text-black border-4 border-black py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  {loading ? "Saving..." : "Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-emerald-500/90 backdrop-blur-xl">
          <div className="bg-white border-[8px] border-black p-10 max-w-sm w-full text-center shadow-[30px_30px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 bg-black rounded-full flex items-center justify-center border-4 border-emerald-400 font-black text-emerald-400 text-4xl">✓</div>
            </div>
            <h2 className="text-3xl font-black uppercase text-black mb-2 leading-none">Booking Recorded</h2>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">Cloud Ledger Sync Successful</p>
            <button 
              onClick={() => {
                setShowSuccess(false);
                setFormData({ name: '', country: '', tripDate: '', pax: 1, tour: 'Tour A', partner: 'Mayad Direct', notes: '' });
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