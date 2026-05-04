'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { calculatePrivateRate } from '@/lib/booking-utils';

const TOUR_PARTNERS = ["PARTNER A", "PARTNER B", "PARTNER C"];

export default function PrivateToursPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Booking & Tour State
  const [pax, setPax] = useState(1);
  const [selectedTour, setSelectedTour] = useState('Tour A');
  const [agencyName, setAgencyName] = useState(''); 
  
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

  const price = calculatePrivateRate(selectedTour, pax, false);

  const handleConfirm = async () => {
    // Basic Validation
    if (!formData.name || !formData.tripDate || !formData.contact) {
      return alert("Please enter Name, Trip Date, and Contact Number.");
    }

    setLoading(true);
    try {
      const totalAmount = calculatePrivateRate(selectedTour, pax, false);
      
      // Profit Logic
      const fixedMayadProfit = 500; 
      const operatorPayout = totalAmount - fixedMayadProfit;

      const { error } = await supabase.from('bookings').insert([{
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
    <div className="max-w-7xl mx-auto p-8 text-black font-sans min-h-screen bg-white">
      <h1 className="text-7xl font-black uppercase italic mb-8 border-b-8 border-black pb-4 tracking-tighter">
        Private Tour
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* 01. GUEST IDENTITY */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">01. Identity</h2>
          
          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Full Name *</label>
            <input 
              type="text" 
              className="w-full border-4 border-black p-3 font-bold uppercase outline-none focus:bg-yellow-50"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="GUEST NAME"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase mb-1">Age</label>
              <input 
                type="number" 
                className="w-full border-b-4 border-black p-2 outline-none font-bold"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase mb-1">Gender</label>
              <select 
                className="w-full border-b-4 border-black p-2 outline-none font-bold"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="NATIONALITY"
              className="w-full border-b-2 border-black p-2 outline-none font-bold uppercase"
              value={formData.nationality}
              onChange={(e) => setFormData({...formData, nationality: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="COUNTRY"
              className="w-full border-b-2 border-black p-2 outline-none font-bold uppercase"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
            />
          </div>
        </div>

        {/* 02. LOGISTICS */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-1 inline-block italic">02. Logistics</h2>
          
          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Contact Number *</label>
            <input 
              type="text" 
              className="w-full border-4 border-black p-3 font-bold outline-none"
              placeholder="WHATSAPP / PHONE"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Hotel / Stay</label>
            <input 
              type="text" 
              className="w-full border-b-4 border-black p-2 outline-none font-bold uppercase"
              placeholder="HOTEL NAME"
              value={formData.hotel}
              onChange={(e) => setFormData({...formData, hotel: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-100">
            <div>
                <label className="block text-[10px] font-black uppercase mb-1">Tour</label>
                <select 
                value={selectedTour} 
                onChange={(e) => setSelectedTour(e.target.value)}
                className="w-full border-b-2 border-black p-2 font-black uppercase bg-yellow-400 outline-none"
                >
                {['Tour A', 'Tour B', 'Tour C', 'Tour D'].map(t => <option key={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase mb-1">Pax</label>
                <input 
                type="number" min="1" 
                value={pax} 
                onChange={(e) => setPax(parseInt(e.target.value) || 1)}
                className="w-full border-b-2 border-black p-2 font-black outline-none"
                />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase mb-1">Trip Date *</label>
            <input 
              type="date" 
              className="w-full border-4 border-black p-3 font-bold outline-none"
              value={formData.tripDate}
              onChange={(e) => setFormData({...formData, tripDate: e.target.value})}
            />
          </div>
        </div>

        {/* 03. PRICING & SUBMIT */}
        <div className="bg-black text-white p-8 flex flex-col justify-between shadow-[15px_15px_0px_0px_#22c55e] border-4 border-black">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Total Private Rate</p>
            <p className="text-6xl font-black text-yellow-400 tracking-tighter">
              ₱{price.toLocaleString()}
            </p>
            
            <div className="mt-8 space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase italic">
                    <span className="text-slate-500">Service:</span>
                    <span>{selectedTour}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase italic">
                    <span className="text-slate-500">Pax:</span>
                    <span>{pax} People</span>
                </div>
            </div>
          </div>
          
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className={`mt-8 w-full font-black uppercase py-6 transition-all border-4 
              ${loading 
                ? 'bg-slate-800 border-slate-700 text-slate-500' 
                : 'bg-emerald-500 border-emerald-600 text-black hover:bg-emerald-400 shadow-[4px_4px_0px_0px_white]'}`}
          >
            {loading ? 'RECORDING...' : 'Confirm Private Tour'}
          </button>
        </div>
      </div>
    </div>
  );
}