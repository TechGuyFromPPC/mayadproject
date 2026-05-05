'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EXPEDITION_RATES } from '@/lib/booking-utils';
import { useRouter } from 'next/navigation';

export default function ExpeditionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  
  // Selection State
  const [pax, setPax] = useState(1);
  const [selectedExpedition, setSelectedExpedition] = useState<'seatours' | 'keelooma'>('seatours');
  const [isContracted, setIsContracted] = useState(false);
  
  // Manifest / Guest Details State
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'MALE', nationality: '', country: '',
    contact: '', hotel: '', tripDate: '', hasETDF: false,
    dietary: '' // Added for Chef
  });

  const trip = EXPEDITION_RATES[selectedExpedition];
  const baseUnitPrice = isContracted ? trip.contracted : trip.published;
  
  const etdfDeduction = formData.hasETDF ? 400 : 0;
  const finalUnitPrice = baseUnitPrice - etdfDeduction;
  const totalPrice = finalUnitPrice * pax;

  const isFormValid = formData.name.trim() !== '' && formData.tripDate !== '' && formData.contact.trim() !== '' && formData.hotel.trim() !== '';

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const mayadProfit = isContracted ? (pax * 1000) : (trip.published - trip.contracted) * pax;
      const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const friendlyId = `EXP-${shortCode}`;

      const { error } = await supabase.from('bookings').insert([{
        booking_id: friendlyId,
        guest_name: formData.name.toUpperCase(),
        age: parseInt(formData.age) || null,
        gender: formData.gender,
        nationality: formData.nationality.toUpperCase(),
        country: formData.country.toUpperCase(),
        contact_number: formData.contact,
        hotel_name: formData.hotel.toUpperCase(), // Saved to DB
        trip_date: formData.tripDate,
        service_type: 'Expedition',
        sub_category: selectedExpedition.toUpperCase(),
        tour_name: trip.name,
        pax: pax,
        total_collected: totalPrice,
        mayad_profit: mayadProfit,
        is_contracted: isContracted,
        is_partner_sale: isContracted,
        has_etdf: formData.hasETDF,
        dietary_restrictions: formData.dietary.toUpperCase(), // Saved for Chef
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
    <div className="max-w-7xl mx-auto p-8 text-black bg-white min-h-screen relative font-sans">
      <header className="mb-12 border-b-8 border-black pb-6 flex justify-between items-end">
        <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter text-black">Island Expeditions</h1>
            <p className="font-bold text-slate-500 uppercase text-sm mt-2">Multi-Day El Nido ↔ Coron Journeys</p>
        </div>
        <div className="text-right">
            <p className="text-[10px] font-black uppercase opacity-50 text-emerald-600">Price Per Guest</p>
            <p className="text-4xl font-black">₱{finalUnitPrice.toLocaleString()}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* MANIFEST SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-4 border-black p-6 bg-yellow-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block italic">01. Identity & Health</h2>
              <input placeholder="GUEST NAME *" className="w-full p-2 border-b-4 border-black bg-transparent font-bold uppercase outline-none placeholder:text-black/30" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <input type="number" placeholder="AGE" className="w-full p-2 border-b-2 border-black bg-transparent font-bold outline-none" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
                <select className="w-full p-2 border-b-2 border-black bg-transparent font-bold outline-none cursor-pointer" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                </select>
              </div>

              {/* CHEF'S SECTION */}
              <div className="pt-2">
                <label className="text-[9px] font-black uppercase flex items-center gap-1 text-rose-600 mb-1">👨‍🍳 Chef's Notes (Allergies / Diet)</label>
                <input placeholder="E.G. NO PEANUTS, VEGAN, NO SHELLFISH..." className="w-full p-2 border-2 border-rose-200 bg-white/50 text-xs font-bold uppercase outline-none focus:border-black" value={formData.dietary} onChange={(e) => setFormData({...formData, dietary: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block italic">02. Logistics</h2>
              <input placeholder="HOTEL / ACCOMMODATION *" className="w-full p-2 border-b-4 border-black bg-transparent font-bold uppercase outline-none placeholder:text-black/30" value={formData.hotel} onChange={(e) => setFormData({...formData, hotel: e.target.value})} />
              <input placeholder="CONTACT NUMBER *" className="w-full p-2 border-b-4 border-black bg-transparent font-bold outline-none placeholder:text-black/30" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
              <div className="pt-2">
                <label className="block text-[10px] font-black uppercase mb-1 opacity-50">Trip Start Date *</label>
                <input type="date" className="w-full p-2 border-2 border-black bg-white font-bold outline-none" value={formData.tripDate} onChange={(e) => setFormData({...formData, tripDate: e.target.value})} />
              </div>
            </div>
          </div>

          {/* OPERATOR SELECTION */}
          <div className="grid grid-cols-2 gap-4">
            {(Object.entries(EXPEDITION_RATES) as [any, any][]).map(([key, value]) => (
              <button key={key} onClick={() => setSelectedExpedition(key)}
                className={`p-6 border-4 border-black text-left transition-all ${selectedExpedition === key ? 'bg-black text-white translate-x-2 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'bg-white hover:bg-slate-50'}`}
              >
                <p className="text-[10px] font-black uppercase opacity-60 italic">Operator</p>
                <h3 className="text-2xl font-black uppercase leading-tight">{value.name}</h3>
              </button>
            ))}
          </div>

          <div className="border-4 border-black p-8 bg-slate-50">
            <label className="block text-xs font-black uppercase mb-4 text-black italic">Total Travelers (Pax)</label>
            <div className="flex items-center gap-6">
              <input type="range" min="1" max="20" value={pax} onChange={(e) => setPax(parseInt(e.target.value))}
                className="flex-1 h-4 bg-black appearance-none cursor-pointer accent-emerald-500" />
              <span className="text-5xl font-black min-w-[80px] text-center">{pax}</span>
            </div>
          </div>

          {/* TOGGLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div onClick={() => setIsContracted(!isContracted)}
                className="border-4 border-black p-6 cursor-pointer flex justify-between items-center group hover:bg-yellow-400 transition-colors bg-white shadow-[4px_4px_0px_0px_black]"
              >
                <div>
                  <p className="font-black uppercase text-xs">Sale Type</p>
                  <p className="text-[10px] font-bold text-slate-500 italic">{isContracted ? 'Partner / Agent' : 'Walk-in / Direct'}</p>
                </div>
                <div className={`w-10 h-5 border-2 border-black relative ${isContracted ? 'bg-black' : 'bg-white'}`}>
                  <div className={`w-3 h-3 absolute top-0.5 transition-all ${isContracted ? 'right-1 bg-yellow-400' : 'left-1 bg-black'}`} />
                </div>
              </div>

              <div onClick={() => setFormData({...formData, hasETDF: !formData.hasETDF})}
                className={`border-4 border-black p-6 cursor-pointer flex justify-between items-center group transition-colors shadow-[4px_4px_0px_0px_black] ${formData.hasETDF ? 'bg-emerald-400' : 'bg-rose-100'}`}
              >
                <div>
                  <p className="font-black uppercase text-xs">Has ETDF - Yes or No?</p>
                  <p className="text-[10px] font-bold italic">{formData.hasETDF ? 'YES: Subtract ₱400' : 'NO: Full Price'}</p>
                </div>
                <div className="font-black text-2xl">
                    {formData.hasETDF ? '✅' : '❌'}
                </div>
              </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY PANEL */}
        <div className="border-8 border-black p-8 flex flex-col justify-between bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] sticky top-6 h-fit">
          <div>
            <p className="text-[10px] font-black uppercase mb-1">Quote Summary</p>
            <h2 className="text-3xl font-black uppercase leading-none mb-6">{trip.name}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b-2 border-black pb-2 text-xs font-bold uppercase">
                <span>Base Rate ({isContracted ? 'Agent' : 'Direct'})</span>
                <span className="font-black">₱{baseUnitPrice.toLocaleString()}</span>
              </div>
              {formData.hasETDF && (
                <div className="flex justify-between border-b-2 border-black pb-2 text-emerald-600 text-xs font-bold italic">
                    <span>ETDF Discount</span>
                    <span className="font-black">- ₱400</span>
                </div>
              )}
              <div className="flex justify-between border-b-2 border-black pb-2 text-xs font-bold">
                <span>Total Guests</span>
                <span className="font-black">x {pax}</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-[10px] font-black uppercase text-slate-400 leading-none">Total Collection</p>
            <p className="text-6xl font-black tracking-tighter mb-4">₱{totalPrice.toLocaleString()}</p>

            <button onClick={() => isFormValid && setShowModal(true)} disabled={!isFormValid}
              className={`w-full mt-8 py-6 font-black uppercase text-xl border-4 border-black transition-all ${
                isFormValid ? "bg-black text-white hover:bg-emerald-500 shadow-[8px_8px_0px_0px_black]" : "bg-slate-200 text-slate-400"
              }`}>
              {isFormValid ? "Review Booking" : "Fill Required *"}
            </button>
          </div>
        </div>
      </div>

      {/* UNIFIED MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-white border-[8px] border-black p-8 max-w-lg w-full shadow-[20px_20px_0px_0px_#22c55e]">
            {!isSuccess ? (
              <>
                <h2 className="text-4xl font-black uppercase italic mb-6 border-b-4 border-black pb-2 leading-none">Final Check</h2>
                <div className="grid grid-cols-2 gap-y-6 text-left mb-8 uppercase font-bold text-sm">
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-slate-400 italic leading-none mb-1">Guest & Hotel</p>
                    <p className="text-xl font-black leading-tight">{formData.name} @ {formData.hotel}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-rose-500 italic leading-none mb-1">Chef's Notes / Allergies</p>
                    <p className="text-xs">{formData.dietary || 'NONE DECLARED'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 italic mb-1">Total Pax</p>
                    <p>{pax} GUESTS</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 italic mb-1">Total Payable</p>
                    <p className="text-3xl font-black">₱{totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 border-4 border-black py-4 font-black uppercase hover:bg-slate-100">Back</button>
                  <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] bg-black text-white py-4 font-black uppercase hover:bg-emerald-600 shadow-[6px_6px_0px_0px_black]">
                    {loading ? 'Saving...' : 'Confirm & Save'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="inline-block bg-yellow-400 border-4 border-black px-8 py-3 font-black text-3xl uppercase shadow-[8px_8px_0px_0px_black] mb-8 animate-bounce">
                  {generatedId}
                </div>
                <h2 className="text-6xl font-black uppercase italic mb-6 tracking-tighter leading-none">BOOKED!</h2>
                <button onClick={() => window.location.reload()} 
                  className="w-full bg-emerald-500 border-4 border-black py-5 font-black uppercase text-black hover:bg-emerald-400 shadow-[6px_6px_0px_0px_black] transition-all">
                  Next Entry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}