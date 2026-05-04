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
  
  // Manifest / Guest Details State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'MALE',
    nationality: '',
    country: '',
    contact: '',
    hotel: '',
    tripDate: ''
  });

  const trip = EXPEDITION_RATES[selectedExpedition];
  const unitPrice = isContracted ? trip.contracted : trip.published;
  const totalPrice = unitPrice * pax;
  
  const handleConfirm = async (expeditionKey: string) => {
    if (!formData.name || !formData.tripDate || !formData.contact) {
      return alert("Please enter Guest Name, Trip Date, and Contact Number");
    }

    setLoading(true);
    try {
      const exp = EXPEDITION_RATES[expeditionKey as keyof typeof EXPEDITION_RATES];
      const price = isContracted ? exp.contracted : exp.published;
      const totalAmount = price * pax;

      // Profit logic remains for database recording
      const mayadProfit = isContracted ? (pax * 1000) : (exp.published - exp.contracted) * pax;

      const { error } = await supabase.from('bookings').insert([{
        guest_name: formData.name.toUpperCase(),
        age: parseInt(formData.age) || null,
        gender: formData.gender,
        nationality: formData.nationality.toUpperCase(),
        country: formData.country.toUpperCase(),
        contact_number: formData.contact,
        hotel_name: formData.hotel.toUpperCase(),
        trip_date: formData.tripDate,
        service_type: 'Expedition',
        sub_category: expeditionKey.toUpperCase(),
        tour_name: exp.name,
        pax: pax,
        total_collected: totalAmount,
        mayad_profit: mayadProfit,
        is_contracted: isContracted,
        is_partner_sale: isContracted,
        is_paid: false
      }]);

      if (error) throw error;

      alert('Expedition Booking Saved!');
      router.push('/reports'); 
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 text-black bg-white min-h-screen">
      <header className="mb-12 border-b-8 border-black pb-6">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter text-black">Island Expeditions</h1>
        <p className="font-bold text-slate-500 uppercase text-sm mt-2">Multi-Day El Nido ↔ Coron Journeys</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* MANIFEST SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-4 border-black p-6 bg-yellow-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">01. Identity</h2>
              <input 
                placeholder="FULL NAME *"
                className="w-full p-2 border-b-4 border-black bg-transparent font-bold uppercase outline-none"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" placeholder="AGE"
                  className="w-full p-2 border-b-2 border-black bg-transparent font-bold outline-none"
                  value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
                <select 
                  className="w-full p-2 border-b-2 border-black bg-transparent font-bold outline-none cursor-pointer"
                  value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="NATIONALITY"
                  className="w-full p-2 border-b-2 border-black bg-transparent font-bold uppercase outline-none"
                  value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                />
                <input 
                  placeholder="COUNTRY"
                  className="w-full p-2 border-b-2 border-black bg-transparent font-bold uppercase outline-none"
                  value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">02. Logistics</h2>
              <input 
                placeholder="CONTACT NUMBER *"
                className="w-full p-2 border-b-4 border-black bg-transparent font-bold outline-none"
                value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})}
              />
              <input 
                placeholder="HOTEL NAME"
                className="w-full p-2 border-b-2 border-black bg-transparent font-bold uppercase outline-none"
                value={formData.hotel} onChange={(e) => setFormData({...formData, hotel: e.target.value})}
              />
              <div className="pt-2">
                <label className="block text-[10px] font-black uppercase mb-1">Trip Start Date *</label>
                <input 
                  type="date" 
                  className="w-full p-2 border-2 border-black bg-white font-bold outline-none"
                  value={formData.tripDate} onChange={(e) => setFormData({...formData, tripDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* OPERATOR SELECTION */}
          <div className="grid grid-cols-2 gap-4">
            {(Object.entries(EXPEDITION_RATES) as [any, any][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedExpedition(key)}
                className={`p-6 border-4 border-black text-left transition-all ${
                  selectedExpedition === key ? 'bg-black text-white translate-x-2 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <p className="text-[10px] font-black uppercase opacity-60">Operator</p>
                <h3 className="text-2xl font-black uppercase">{value.name}</h3>
              </button>
            ))}
          </div>

          <div className="border-4 border-black p-8 bg-slate-50">
            <label className="block text-xs font-black uppercase mb-4 text-black">Total Travelers (Pax)</label>
            <div className="flex items-center gap-6">
              <input 
                type="range" min="1" max="20" value={pax} 
                onChange={(e) => setPax(parseInt(e.target.value))}
                className="flex-1 h-4 bg-black appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-5xl font-black min-w-[80px] text-center text-black">{pax}</span>
            </div>
          </div>

          <div 
            onClick={() => setIsContracted(!isContracted)}
            className="border-4 border-black p-6 cursor-pointer flex justify-between items-center group hover:bg-yellow-400 transition-colors bg-white shadow-[4px_4px_0px_0px_black]"
          >
            <div>
              <p className="font-black uppercase text-black">Rate Type: {isContracted ? 'Contracted (Partner)' : 'Published (Walk-in)'}</p>
              <p className="text-xs font-bold text-slate-500 italic">Toggle for partner or walk-in pricing</p>
            </div>
            <div className={`w-12 h-6 border-2 border-black relative ${isContracted ? 'bg-black' : 'bg-white'}`}>
              <div className={`w-4 h-4 absolute top-0.5 transition-all ${isContracted ? 'right-1 bg-yellow-400' : 'left-1 bg-black'}`} />
            </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div className="border-8 border-black p-8 flex flex-col justify-between bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] sticky top-6 h-fit">
          <div>
            <p className="text-[10px] font-black uppercase mb-1 text-black">Quote Summary</p>
            <h2 className="text-3xl font-black uppercase leading-none mb-6 text-black">{trip.name}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b-2 border-black pb-2">
                <span className="text-xs font-bold uppercase text-black">Rate per Head</span>
                <span className="font-black text-black">₱{unitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b-2 border-black pb-2">
                <span className="text-xs font-bold uppercase text-black">Total Guests</span>
                <span className="font-black text-black">x {pax}</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-[10px] font-black uppercase text-slate-400">Total Price</p>
            <p className="text-6xl font-black tracking-tighter mb-4 text-black">₱{totalPrice.toLocaleString()}</p>

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
              {loading ? 'Processing...' : 'Create Expedition Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}