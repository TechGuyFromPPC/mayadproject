'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TRANSFER_RENTAL_RATES } from '@/lib/booking-utils';
import { useRouter } from 'next/navigation';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

const LOGISTICS_PARTNERS = ["PARTNER A", "PARTNER B", "PARTNER C"];

export default function TransfersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [category, setCategory] = useState<'van' | 'bike' | 'car' | 'ferry'>('van');
  
  // Stores the specific item being booked (e.g., "Honda Click" and its rate)
  const [selectedItem, setSelectedItem] = useState<{name: string, rate: number} | null>(null);

  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'MALE', nationality: '', country: '',
    contact: '', hotel: '', dateStart: '', dateEnd: ''
  });

  const [agencyName, setAgencyName] = useState('DIRECT'); 
  const [pax, setPax] = useState(1);
  const [units, setUnits] = useState(1);
  const [calculatedDays, setCalculatedDays] = useState(1);

  const isVehicle = category === 'bike' || category === 'car';

  useEffect(() => {
    if (formData.dateStart && formData.dateEnd) {
      const start = startOfDay(parseISO(formData.dateStart));
      const end = startOfDay(parseISO(formData.dateEnd));
      const diff = differenceInDays(end, start);
      setCalculatedDays(diff <= 0 ? 1 : diff);
    } else {
      setCalculatedDays(1);
    }
  }, [formData.dateStart, formData.dateEnd]);

  const openReview = (name: string, rate: number) => {
    if (!formData.name || !formData.dateStart || !formData.contact) {
        return alert("Please enter Name, Start Date, and Contact Number.");
    }
    if (isVehicle && !formData.dateEnd) return alert("Please select an End Date");
    
    setSelectedItem({ name, rate });
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!selectedItem) return;
    setLoading(true);

    try {
      const multiplier = isVehicle ? (units * calculatedDays) : pax;
      const totalAmount = selectedItem.rate * multiplier;
      const profitPerUnit = category === 'car' ? 500 : 100;
      const totalMayadProfit = profitPerUnit * multiplier;
      const operatorPayout = totalAmount - totalMayadProfit;

      const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const friendlyId = `LOG-${shortCode}`;

      const { error } = await supabase.from('bookings').insert([{
        booking_id: friendlyId,
        guest_name: formData.name.toUpperCase(),
        age: parseInt(formData.age) || null,
        gender: formData.gender,
        nationality: formData.nationality.toUpperCase(),
        country: formData.country.toUpperCase(),
        contact_number: formData.contact,
        hotel_name: formData.hotel.toUpperCase(),
        trip_date: formData.dateStart,
        service_type: 'Logistics',
        sub_category: category.toUpperCase(),
        tour_name: selectedItem.name,
        pax: isVehicle ? units : pax,
        total_collected: totalAmount,
        mayad_profit: totalMayadProfit,
        operator_payout: operatorPayout,
        agency_partner: agencyName,
        is_paid: false,
        notes: isVehicle 
          ? `${units} units x ${calculatedDays} days | Profit: ${profitPerUnit}/day` 
          : `${pax} pax | Profit: ${profitPerUnit}/pax`
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

  const renderRateSection = (model: string, pubRate: number) => {
    const mult = isVehicle ? (units * calculatedDays) : pax;
    const total = pubRate * mult;

    return (
      <div className="flex flex-col items-end">
        <div className="text-right mb-2 leading-none">
          <span className="text-3xl font-black text-black tracking-tight">₱{total.toLocaleString()}</span>
        </div>
        <button 
          onClick={() => openReview(model, pubRate)}
          className="bg-black text-white px-8 py-3 font-black uppercase hover:bg-emerald-500 shadow-[4px_4px_0px_0px_black] active:translate-y-1 transition-all"
        >
          Book Now
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white text-black min-h-screen font-sans relative">
      <header className="mb-10 border-b-8 border-black pb-4">
        <h1 className="text-7xl font-black italic tracking-tighter uppercase text-black">Logistics</h1>
      </header>

      {/* MANIFEST SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 border-4 border-black p-8 bg-slate-50 shadow-[10px_10px_0px_0px_black]">
        {/* IDENTITY */}
        <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">01. Guest Identity</h2>
            <input placeholder="FULL NAME *" className="w-full p-2 border-b-4 border-black bg-transparent font-bold uppercase outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="AGE" className="w-full p-2 border-b-2 border-black bg-transparent font-bold outline-none" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
                <select className="w-full p-2 border-b-2 border-black bg-transparent font-bold outline-none" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <input placeholder="NATIONALITY" className="w-full p-2 border-b-2 border-black bg-transparent font-bold uppercase outline-none" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} />
                <input placeholder="COUNTRY" className="w-full p-2 border-b-2 border-black bg-transparent font-bold uppercase outline-none" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
            </div>
        </div>

        {/* CONTACT & STAY */}
        <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">02. Contact & Stay</h2>
            <input placeholder="CONTACT NUMBER *" className="w-full p-2 border-b-4 border-black bg-transparent font-bold outline-none" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
            <input placeholder="HOTEL NAME" className="w-full p-2 border-b-2 border-black bg-transparent font-bold uppercase outline-none" value={formData.hotel} onChange={(e) => setFormData({...formData, hotel: e.target.value})} />
            <select className="w-full p-2 border-b-2 border-black bg-white font-bold uppercase outline-none mt-2" value={agencyName} onChange={(e) => setAgencyName(e.target.value)}>
                <option value="DIRECT">DIRECT BOOKING</option>
                {LOGISTICS_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>

        {/* TRIP INFO */}
        <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">03. Schedule</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[8px] font-black block text-slate-400">START DATE *</label>
                    <input type="date" className="w-full p-2 border-b-2 border-black bg-transparent font-bold" value={formData.dateStart} onChange={(e) => setFormData({...formData, dateStart: e.target.value})} />
                </div>
                {isVehicle && (
                    <div>
                        <label className="text-[8px] font-black block text-slate-400">END DATE *</label>
                        <input type="date" className="w-full p-2 border-b-2 border-black bg-transparent font-bold" value={formData.dateEnd} onChange={(e) => setFormData({...formData, dateEnd: e.target.value})} />
                    </div>
                )}
            </div>
            <div className="flex gap-4 items-end pt-2">
                <div className="flex-1">
                    <label className="text-[10px] font-black">{isVehicle ? 'UNITS' : 'PAX'}</label>
                    <input type="number" min="1" className="w-full p-2 border-b-2 border-black font-black text-xl bg-transparent" value={isVehicle ? units : pax} onChange={(e) => isVehicle ? setUnits(Number(e.target.value)) : setPax(Number(e.target.value))} />
                </div>
                {isVehicle && (
                    <div className="bg-black text-white px-4 py-2 font-black italic">
                        {calculatedDays} DAYS
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* CATEGORY SELECTOR */}
      <div className="flex gap-2 mb-8">
        {['van', 'ferry', 'bike', 'car'].map((t) => (
          <button key={t} onClick={() => setCategory(t as any)}
            className={`flex-1 py-4 font-black uppercase border-4 border-black transition-all ${category === t ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'bg-white hover:bg-slate-100'}`}
          >
            {t}s
          </button>
        ))}
      </div>

      {/* RATES LISTING */}
      <div className="space-y-4 mb-20">
        {category === 'van' && (
          <div className="border-4 border-black p-6 flex justify-between items-center bg-emerald-50">
            <h3 className="text-3xl font-black uppercase italic">Shared Van</h3>
            {renderRateSection("Shared Van", TRANSFER_RENTAL_RATES.van.published)}
          </div>
        )}
        {category === 'bike' && Object.entries(TRANSFER_RENTAL_RATES.bikes).map(([model, rates]) => (
          <div key={model} className="border-4 border-black p-6 flex justify-between items-center bg-yellow-50">
            <h3 className="text-3xl font-black uppercase italic">{model}</h3>
            {renderRateSection(model, rates.pub)}
          </div>
        ))}
        {category === 'car' && Object.entries(TRANSFER_RENTAL_RATES.cars).filter(([k]) => k !== 'deposit').map(([model, rates]: any) => (
          <div key={model} className="border-4 border-black p-6 flex justify-between items-center bg-blue-50">
            <h3 className="text-3xl font-black uppercase italic">{model}</h3>
            {renderRateSection(model, rates.pub)}
          </div>
        ))}
        {category === 'ferry' && (
          <div className="border-4 border-black p-6 flex justify-between items-center bg-purple-50">
            <h3 className="text-3xl font-black uppercase italic">Fast Ferry</h3>
            {renderRateSection("Fast Ferry", TRANSFER_RENTAL_RATES.ferry.published)}
          </div>
        )}
      </div>

      {/* CONSOLIDATED MODAL (Review + Success) */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className={`bg-white border-[8px] border-black p-8 max-w-lg w-full shadow-[20px_20px_0px_0px_#22c55e] transition-all ${isSuccess ? 'shadow-[#fbbf24]' : ''}`}>
            
            {!isSuccess ? (
              <>
                <h2 className="text-4xl font-black uppercase italic mb-6 border-b-4 border-black pb-2 leading-none">Review Logistics</h2>
                <div className="grid grid-cols-2 gap-y-6 text-left mb-8 uppercase font-bold">
                  <div className="col-span-2 border-b border-slate-200 pb-2">
                    <p className="text-[10px] font-black text-slate-400">Guest</p>
                    <p className="text-xl font-black truncate">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Item / Category</p>
                    <p>{selectedItem?.name} ({category})</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Quantity</p>
                    <p>{isVehicle ? `${units} Units` : `${pax} Pax`}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Start Date</p>
                    <p>{formData.dateStart}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Duration</p>
                    <p>{isVehicle ? `${calculatedDays} Days` : 'One-way'}</p>
                  </div>
                  <div className="col-span-2 pt-4">
                    <p className="text-[10px] font-black text-slate-400">Total Collection</p>
                    <p className="text-4xl font-black text-emerald-600">₱{((selectedItem?.rate || 0) * (isVehicle ? (units * calculatedDays) : pax)).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 border-4 border-black py-4 font-black uppercase hover:bg-slate-100 transition-all">Go Back</button>
                  <button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] bg-black text-white py-4 font-black uppercase hover:bg-emerald-600 transition-all">
                    {loading ? 'STORING...' : 'Confirm & Manifest'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="inline-block bg-yellow-400 border-4 border-black px-8 py-3 font-black text-3xl uppercase shadow-[8px_8px_0px_0px_black] mb-8 animate-bounce">
                  {generatedId}
                </div>
                <h2 className="text-6xl font-black uppercase italic mb-2 tracking-tighter leading-none">MANIFESTED!</h2>
                <p className="font-bold uppercase text-xs mb-10 tracking-widest text-slate-500">The logistics entry has been recorded</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-emerald-500 border-4 border-black py-5 font-black uppercase text-black hover:bg-emerald-400 shadow-[6px_6px_0px_0px_black] transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
