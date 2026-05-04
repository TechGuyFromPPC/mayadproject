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
  const [category, setCategory] = useState<'van' | 'bike' | 'car' | 'ferry'>('van');
  
  // Manifest / Guest Details State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'MALE',
    nationality: '',
    country: '',
    contact: '',
    hotel: '',
    dateStart: '',
    dateEnd: ''
  });

  const [agencyName, setAgencyName] = useState(''); 
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

  const handleRecordBooking = async (itemName: string, pubRate: number) => {
    if (!formData.name || !formData.dateStart || !formData.contact) {
        return alert("Please enter Name, Start Date, and Contact Number.");
    }
    if (isVehicle && !formData.dateEnd) return alert("Please select an End Date");

    setLoading(true);
    try {
      const multiplier = isVehicle ? (units * calculatedDays) : pax;
      const totalAmount = pubRate * multiplier;
      
      const commiPerUnit = category === 'car' ? 500 : 100;
      const totalMayadProfit = commiPerUnit * multiplier;
      const operatorPayout = totalAmount - totalMayadProfit;

      const { error } = await supabase.from('bookings').insert([{
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
        tour_name: itemName,
        pax: isVehicle ? units : pax,
        total_collected: totalAmount,
        mayad_profit: totalMayadProfit,
        operator_payout: operatorPayout,
        agency_partner: agencyName || 'DIRECT',
        is_paid: false,
        notes: isVehicle 
          ? `${units} units x ${calculatedDays} days | Commi: ${commiPerUnit}/day` 
          : `${pax} pax | Commi: ${commiPerUnit}/pax`
      }]);

      if (error) throw error;
      alert(`Recorded! Mayad Profit: ₱${totalMayadProfit.toLocaleString()}`);
      router.push('/reports');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderRate = (model: string, pubRate: number) => {
    const mult = isVehicle ? (units * calculatedDays) : pax;
    const total = pubRate * mult;

    return (
      <div className="flex flex-col items-end">
        <div className="text-right mb-2">
          <span className="text-3xl font-black text-black">₱{total.toLocaleString()}</span>
        </div>
        <button 
          onClick={() => handleRecordBooking(model, pubRate)}
          disabled={loading}
          className="bg-black text-white px-8 py-3 font-black uppercase hover:bg-emerald-500 shadow-[4px_4px_0px_0px_black] active:translate-y-1 transition-all"
        >
          {loading ? '...' : 'Confirm'}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white text-black min-h-screen font-sans">
      <header className="mb-10 border-b-8 border-black pb-4">
        <h1 className="text-7xl font-black italic tracking-tighter uppercase text-black">Logistics</h1>
      </header>

      {/* MANIFEST SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 border-4 border-black p-8 bg-slate-50 shadow-[10px_10px_0px_0px_black]">
        
        {/* IDENTITY */}
        <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">01. Guest Identity</h2>
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
                    className="w-full p-2 border-b-2 border-black bg-transparent font-bold outline-none"
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

        {/* CONTACT & STAY */}
        <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">02. Contact & Stay</h2>
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
            <select 
                className="w-full p-2 border-b-2 border-black bg-white font-bold uppercase outline-none mt-2"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
            >
                <option value="">DIRECT BOOKING</option>
                {LOGISTICS_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>

        {/* TRIP INFO */}
        <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 inline-block">03. Schedule</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[8px] font-black block">START DATE *</label>
                    <input 
                        type="date" className="w-full p-2 border-b-2 border-black bg-transparent font-bold"
                        value={formData.dateStart} onChange={(e) => setFormData({...formData, dateStart: e.target.value})}
                    />
                </div>
                {isVehicle && (
                    <div>
                        <label className="text-[8px] font-black block">END DATE *</label>
                        <input 
                            type="date" className="w-full p-2 border-b-2 border-black bg-transparent font-bold"
                            value={formData.dateEnd} onChange={(e) => setFormData({...formData, dateEnd: e.target.value})}
                        />
                    </div>
                )}
            </div>
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="text-[10px] font-black">{isVehicle ? 'UNITS' : 'PAX'}</label>
                    <input 
                        type="number" min="1" className="w-full p-2 border-b-2 border-black font-black text-xl bg-transparent"
                        value={isVehicle ? units : pax}
                        onChange={(e) => isVehicle ? setUnits(Number(e.target.value)) : setPax(Number(e.target.value))}
                    />
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
          <button 
            key={t} onClick={() => setCategory(t as any)}
            className={`flex-1 py-4 font-black uppercase border-4 border-black transition-all ${category === t ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'bg-white hover:bg-slate-100'}`}
          >
            {t}s
          </button>
        ))}
      </div>

      {/* RATES LIST */}
      <div className="space-y-4 mb-20">
        {category === 'van' && (
          <div className="border-4 border-black p-6 flex justify-between items-center bg-emerald-50">
            <h3 className="text-3xl font-black uppercase italic">Shared Van</h3>
            {renderRate("Shared Van", TRANSFER_RENTAL_RATES.van.published)}
          </div>
        )}
        {category === 'bike' && Object.entries(TRANSFER_RENTAL_RATES.bikes).map(([model, rates]) => (
          <div key={model} className="border-4 border-black p-6 flex justify-between items-center bg-yellow-50">
            <h3 className="text-3xl font-black uppercase italic">{model}</h3>
            {renderRate(model, rates.pub)}
          </div>
        ))}
        {category === 'car' && Object.entries(TRANSFER_RENTAL_RATES.cars).filter(([k]) => k !== 'deposit').map(([model, rates]: any) => (
          <div key={model} className="border-4 border-black p-6 flex justify-between items-center bg-blue-50">
            <h3 className="text-3xl font-black uppercase italic">{model}</h3>
            {renderRate(model, rates.pub)}
          </div>
        ))}
        {category === 'ferry' && (
          <div className="border-4 border-black p-6 flex justify-between items-center bg-purple-50">
            <h3 className="text-3xl font-black uppercase italic">Fast Ferry</h3>
            {renderRate("Fast Ferry", TRANSFER_RENTAL_RATES.ferry.published)}
          </div>
        )}
      </div>
    </div>
  );
}