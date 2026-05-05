'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculatePrivateRate } from '@/lib/booking-utils';

const TOUR_PARTNERS = ["PARTNER A", "PARTNER B", "PARTNER C"];

export default function PrivateToursPage() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Controls the combined UI
  const [isSuccess, setIsSuccess] = useState(false); // Toggles between Confirm and Success
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  
  const [pax, setPax] = useState(1);
  const [selectedTour, setSelectedTour] = useState('Tour A');
  const [agencyName, setAgencyName] = useState('DIRECT'); 
  const [hasETDF, setHasETDF] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'MALE', nationality: '', 
    country: '', contact: '', hotel: '', tripDate: ''
  });

  const baseRate = calculatePrivateRate(selectedTour, pax, false);
  const etdfTotal = hasETDF ? 0 : (pax * 400);
  const totalAmount = baseRate + etdfTotal;

  // STEP 1: Open the Summary UI
  const handleInitialClick = () => {
    if (!formData.name || !formData.tripDate || !formData.contact) {
      return alert("Please fill in Name, Trip Date, and Contact Number.");
    }
    setShowModal(true);
  };

  // STEP 2: Actually save to Supabase
  const handleFinalize = async () => {
    setLoading(true);
    try {
      const fixedMayadProfit = 500; 
      const operatorPayout = baseRate - fixedMayadProfit;
      const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const friendlyId = `PVT-${shortCode}`;

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
        tour_name: selectedTour,
        service_type: 'Private',
        sub_category: 'Island Tour',
        pax: pax,
        has_etdf: hasETDF,
        total_collected: totalAmount,
        mayad_profit: fixedMayadProfit,
        operator_payout: operatorPayout, 
        agency_partner: agencyName,
        is_paid: false
      }]);

      if (error) throw error;
      
      setGeneratedId(friendlyId);
      setIsSuccess(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 text-black font-sans min-h-screen bg-white">
      <h1 className="text-7xl font-black uppercase italic mb-8 border-b-8 border-black pb-4 tracking-tighter">
        Private Tour
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* SECTION 01: IDENTITY */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">01. Identity</h2>
          <div className="space-y-4">
            <input type="text" className="w-full border-4 border-black p-3 font-bold uppercase outline-none focus:bg-yellow-50" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="GUEST NAME *" />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="AGE" className="w-full border-b-4 border-black p-2 outline-none font-bold" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
              <select className="w-full border-b-4 border-black p-2 outline-none font-bold" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <input type="text" placeholder="NATIONALITY" className="w-full border-b-2 border-black p-2 outline-none font-bold uppercase" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} />
              <input type="text" placeholder="COUNTRY" className="w-full border-b-2 border-black p-2 outline-none font-bold uppercase" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 02: LOGISTICS */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">02. Logistics</h2>
          <div onClick={() => setHasETDF(!hasETDF)} className={`border-4 border-black p-4 flex items-center justify-between cursor-pointer transition-all ${hasETDF ? 'bg-emerald-500' : 'bg-rose-500 text-white'}`}>
            <span className="font-black uppercase text-xs">Environmental Fee (ETDF)</span>
            <span className="font-black uppercase">{hasETDF ? 'ALREADY HAS IT' : 'ADD ₱400'}</span>
          </div>
          <div className="space-y-4">
            <input type="text" className="w-full border-4 border-black p-3 font-bold outline-none" placeholder="CONTACT NUMBER *" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
            <input type="text" className="w-full border-b-4 border-black p-2 outline-none font-bold uppercase" placeholder="HOTEL / ACCOMMODATION" value={formData.hotel} onChange={(e) => setFormData({...formData, hotel: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <select value={selectedTour} onChange={(e) => setSelectedTour(e.target.value)} className="w-full border-b-2 border-black p-2 font-black uppercase bg-yellow-400">
                {['Tour A', 'Tour B', 'Tour C', 'Tour D'].map(t => <option key={t}>{t}</option>)}
              </select>
              <input type="number" min="1" value={pax} onChange={(e) => setPax(parseInt(e.target.value) || 1)} className="w-full border-b-2 border-black p-2 font-black" />
            </div>
            <input type="date" className="w-full border-4 border-black p-3 font-bold outline-none" value={formData.tripDate} onChange={(e) => setFormData({...formData, tripDate: e.target.value})} />
          </div>
        </div>

        {/* SECTION 03: PRICING */}
        <div className="bg-black text-white p-8 flex flex-col justify-between shadow-[15px_15px_0px_0px_#22c55e] border-4 border-black">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Total Collected</p>
            <p className="text-6xl font-black text-yellow-400 tracking-tighter leading-none mb-6">₱{totalAmount.toLocaleString()}</p>
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase italic border-b border-white/20 pb-1">
                    <span>Base Rate:</span>
                    <span>₱{baseRate.toLocaleString()}</span>
                </div>
                {!hasETDF && (
                  <div className="flex justify-between text-[10px] font-bold uppercase italic border-b border-white/20 pb-1 text-rose-400">
                      <span>ETDF Fees:</span>
                      <span>+₱{etdfTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="mt-4">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Agency Partner</label>
                  <select className="w-full bg-slate-900 border-b-2 border-white p-2 font-bold uppercase text-white outline-none" value={agencyName} onChange={(e) => setAgencyName(e.target.value)}>
                    <option value="DIRECT">DIRECT BOOKING</option>
                    {TOUR_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
            </div>
          </div>
          <button onClick={handleInitialClick} className="mt-8 w-full font-black uppercase py-6 bg-emerald-500 border-4 border-emerald-600 text-black hover:bg-emerald-400 shadow-[4px_4px_0px_0px_white] active:translate-y-1 transition-all">
            Review Booking
          </button>
        </div>
      </div>

      {/* CONSOLIDATED CONFIRMATION & SUCCESS UI */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className={`bg-white border-[8px] border-black p-8 max-w-lg w-full shadow-[20px_20px_0px_0px_#22c55e] transition-all ${isSuccess ? 'scale-105' : 'scale-100'}`}>
            
            {!isSuccess ? (
              // --- CONFIRMATION VIEW ---
              <>
                <h2 className="text-4xl font-black uppercase italic mb-6 border-b-4 border-black pb-2 leading-none">Review Manifest</h2>
                <div className="grid grid-cols-2 gap-y-4 text-left mb-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Guest Name</p>
                    <p className="font-bold uppercase">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Tour / Pax</p>
                    <p className="font-bold uppercase">{selectedTour} / {pax}P</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Date</p>
                    <p className="font-bold">{formData.tripDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total to Collect</p>
                    <p className="font-black text-emerald-600 uppercase">₱{totalAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 border-4 border-black py-4 font-black uppercase hover:bg-slate-100 transition-all">Go Back</button>
                  <button onClick={handleFinalize} disabled={loading} className="flex-[2] bg-black text-white py-4 font-black uppercase hover:bg-emerald-600 transition-all">
                    {loading ? 'SAVING...' : 'Finalize & Record'}
                  </button>
                </div>
              </>
            ) : (
              // --- SUCCESS VIEW ---
              <div className="text-center py-4">
                <div className="inline-block bg-yellow-400 border-4 border-black px-8 py-3 font-black text-3xl uppercase shadow-[8px_8px_0px_0px_black] mb-8">
                  {generatedId}
                </div>
                <h2 className="text-6xl font-black uppercase italic mb-2 tracking-tighter leading-none">SUCCESS!</h2>
                <p className="font-bold uppercase text-xs mb-10 tracking-widest text-slate-500">Booking stored in database</p>
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