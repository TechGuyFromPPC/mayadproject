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
  
  const [guestName, setGuestName] = useState('');
  const [agencyName, setAgencyName] = useState(''); 
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [pax, setPax] = useState(1);
  const [units, setUnits] = useState(1);
  const [calculatedDays, setCalculatedDays] = useState(1);

  const isVehicle = category === 'bike' || category === 'car';

  useEffect(() => {
    if (dateStart && dateEnd) {
      const start = startOfDay(parseISO(dateStart));
      const end = startOfDay(parseISO(dateEnd));
      const diff = differenceInDays(end, start);
      setCalculatedDays(diff <= 0 ? 1 : diff);
    } else {
      setCalculatedDays(1);
    }
  }, [dateStart, dateEnd]);

  const handleRecordBooking = async (itemName: string, pubRate: number) => {
    if (!guestName || !dateStart) return alert("Please enter Guest Name and Start Date");
    if (isVehicle && !dateEnd) return alert("Please select an End Date");

    setLoading(true);
    try {
      const multiplier = isVehicle ? (units * calculatedDays) : pax;
      const totalAmount = pubRate * multiplier;
      
      // FIXED LOGIC: 500 for cars, 100 for others
      const commiPerUnit = category === 'car' ? 500 : 100;
      const totalMayadProfit = commiPerUnit * multiplier;
      
      // The agency/operator gets the rest (e.g., 2300 - 500 = 1800)
      const operatorPayout = totalAmount - totalMayadProfit;

      const { error } = await supabase.from('bookings').insert([{
        guest_name: guestName.toUpperCase(),
        trip_date: dateStart,
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
    <div className="max-w-6xl mx-auto p-6 bg-white text-black min-h-screen font-sans">
      <header className="mb-10 border-b-8 border-black pb-4">
        <h1 className="text-7xl font-black italic tracking-tighter uppercase">Logistics</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-50 border-4 border-black p-6 shadow-[10px_10px_0px_0px_black]">
        <div className="md:col-span-2 text-left">
          <label className="text-[10px] font-black uppercase">Guest Name</label>
          <input 
            className="w-full p-3 border-2 border-black font-bold uppercase outline-none focus:bg-yellow-50"
            value={guestName} onChange={(e) => setGuestName(e.target.value)}
          />
        </div>
        
        <div className="md:col-span-2 text-left">
          <label className="text-[10px] font-black uppercase">Agency / Partner (Optional)</label>
          <select 
            className="w-full p-3 border-2 border-black font-bold uppercase outline-none bg-white cursor-pointer"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
          >
            <option value="">DIRECT BOOKING</option>
            {LOGISTICS_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="text-left">
          <label className="text-[10px] font-black uppercase">{isVehicle ? 'Qty' : 'Pax'}</label>
          <input 
            type="number" min="1" className="w-full p-3 border-2 border-black font-black text-xl"
            value={isVehicle ? units : pax}
            onChange={(e) => isVehicle ? setUnits(Number(e.target.value)) : setPax(Number(e.target.value))}
          />
        </div>
        
        <div className={`${isVehicle ? "md:col-span-1" : "md:col-span-3"} text-left`}>
          <label className="text-[10px] font-black uppercase">{isVehicle ? 'Start Date' : 'Trip Date'}</label>
          <input 
            type="date" className="w-full p-3 border-2 border-black font-bold"
            value={dateStart} onChange={(e) => setDateStart(e.target.value)}
          />
        </div>

        {isVehicle && (
          <>
            <div className="md:col-span-1 text-left">
              <label className="text-[10px] font-black uppercase">End Date</label>
              <input 
                type="date" className="w-full p-3 border-2 border-black font-bold"
                value={dateEnd} onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-center bg-black text-white p-3">
              <span className="text-xl font-black italic">{calculatedDays} DAYS</span>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2 mb-8">
        {['van', 'ferry', 'bike', 'car'].map((t) => (
          <button 
            key={t} onClick={() => setCategory(t as any)}
            className={`flex-1 py-4 font-black uppercase border-4 border-black transition-all ${category === t ? 'bg-black text-white' : 'bg-white hover:bg-slate-100'}`}
          >
            {t}s
          </button>
        ))}
      </div>

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