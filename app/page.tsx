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
    name: '', 
    country: '', 
    age: '', 
    nationality: '', 
    gender: 'MALE', 
    contact: '', 
    hotel: '',
    tripDate: '', 
    pax: 1, 
    tour: 'Tour A', 
    partner: 'DIRECT', 
    notes: ''
  });

  const isPartner = formData.partner !== 'DIRECT';
  const result = calculateSplit(formData.tour, formData.pax, isPartner);

  // Validation: Required fields for manifest
  const isFormValid = formData.name.trim() !== '' && 
                      formData.tripDate !== '' && 
                      formData.contact.trim() !== '' &&
                      formData.pax > 0;

  const handleFinalSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('bookings').insert([{
      guest_name: formData.name.toUpperCase(),
      country: formData.country.toUpperCase(),
      age: parseInt(formData.age) || null,
      nationality: formData.nationality.toUpperCase(),
      gender: formData.gender,
      contact_number: formData.contact,
      hotel_name: formData.hotel.toUpperCase(),
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
    <div className="min-h-screen flex flex-col relative font-sans text-black">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/your-background-image.jpg')" }}
      />
      <div className="fixed inset-0 z-10 bg-black/30 backdrop-blur-sm" />

      <main className="flex-1 relative z-20 flex flex-col items-center pt-10 pb-20 px-4">
        <div className="w-full max-w-5xl bg-white border-[4px] border-black p-10 shadow-[30px_30px_0px_0px_rgba(0,0,0,1)]">
          
          <header className="mb-10 border-b-8 border-black pb-4">
            <h1 className="text-7xl font-black uppercase tracking-tighter italic">Manifest Entry</h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* LEFT: GUEST DETAILS */}
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">01. Guest Details</h2>
              
              <input type="text" placeholder="FULL NAME *" className="w-full border-b-4 border-black py-2 bg-white font-black text-2xl outline-none placeholder:text-slate-200 uppercase" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="AGE" className="w-full border-b-2 border-black py-2 bg-white font-bold outline-none" 
                  value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                <select className="w-full border-b-2 border-black py-2 bg-white font-bold outline-none uppercase" 
                  value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="NATIONALITY" className="w-full border-b-2 border-black py-2 bg-white font-bold outline-none uppercase" 
                  value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                <input type="text" placeholder="COUNTRY" className="w-full border-b-2 border-black py-2 bg-white font-bold outline-none uppercase" 
                  value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
              </div>
            </div>

            {/* RIGHT: LOGISTICS & CONTACT */}
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">02. Logistics</h2>
              
              <input type="text" placeholder="CONTACT NUMBER *" className="w-full border-b-4 border-black py-2 bg-white font-black text-2xl outline-none placeholder:text-slate-200" 
                value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />

              <input type="text" placeholder="HOTEL / ACCOMMODATION" className="w-full border-b-2 border-black py-2 bg-white font-bold outline-none uppercase" 
                value={formData.hotel} onChange={e => setFormData({...formData, hotel: e.target.value})} />

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="block text-[10px] font-black uppercase mb-1 text-slate-500">Trip Date *</label>
                   <input type="date" className="w-full border-b-2 border-black py-2 bg-white font-bold cursor-pointer" 
                    value={formData.tripDate} onChange={e => setFormData({...formData, tripDate: e.target.value})} />
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase mb-1 text-slate-500">Select Tour</label>
                   <select className="w-full border-b-2 border-black py-2 bg-white font-black text-sm outline-none" 
                    value={formData.tour} onChange={e => setFormData({...formData, tour: e.target.value})}>
                    {Object.keys(TOUR_BASE_RATES).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-slate-500">Total Pax</label>
                  <input type="number" min="1" className="w-full border-b-2 border-black py-2 font-black text-sm" 
                    value={formData.pax} onChange={e => setFormData({...formData, pax: parseInt(e.target.value) || 1})} />
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => isFormValid && setShowConfirm(true)} disabled={!isFormValid}
            className={`w-full mt-12 py-6 font-black uppercase text-2xl border-4 border-black transition-all ${
              isFormValid ? "bg-black text-white hover:bg-emerald-500 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]" : "bg-slate-200 text-slate-400"
            }`}>
            {isFormValid ? "Review Manifest" : "Incomplete Details"}
          </button>
        </div>
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-white border-[8px] border-black p-8 max-w-xl w-full shadow-[20px_20px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="text-4xl font-black uppercase italic mb-6">Verify Manifest</h2>
            <div className="space-y-3 uppercase font-bold text-sm">
                <p className="text-2xl font-black border-b-4 border-black pb-2">{formData.name}</p>
                <div className="grid grid-cols-2 gap-4">
                    <p>Contact: <span className="text-slate-500">{formData.contact}</span></p>
                    <p>Hotel: <span className="text-slate-500">{formData.hotel || 'N/A'}</span></p>
                </div>
                <div className="bg-black text-white p-4 mt-4">
                    <p className="text-yellow-400">Total Collection: ₱{result.total.toLocaleString()}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
                <button onClick={() => setShowConfirm(false)} className="border-4 border-black py-4 font-black uppercase">Back</button>
                <button onClick={handleFinalSubmit} disabled={loading} className="bg-emerald-500 border-4 border-black py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  {loading ? "SAVING..." : "CONFIRM"}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-emerald-500/90">
          <div className="bg-white border-[8px] border-black p-10 max-w-sm w-full text-center shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-4xl font-black uppercase italic mb-6">Recorded!</h2>
            <button onClick={() => {
                setShowSuccess(false);
                setFormData({ name: '', country: '', age: '', nationality: '', gender: 'MALE', contact: '', hotel: '', tripDate: '', pax: 1, tour: 'Tour A', partner: 'DIRECT', notes: '' });
              }} className="w-full bg-black text-white py-4 font-black uppercase">Next Entry</button>
          </div>
        </div>
      )}
    </div>
  );
}