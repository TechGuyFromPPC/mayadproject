    'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettlementPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettlements = async () => {
    setLoading(true);
    const { data } = await supabase.from('bookings')
      .select('*')
      .neq('agency_partner', 'DIRECT')
      .order('trip_date', { ascending: false });
    if (data) setBookings(data);
    setLoading(false);
  };

  useEffect(() => { fetchSettlements(); }, []);

  const togglePaidStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('bookings')
      .update({ is_paid: !currentStatus })
      .eq('id', id);
    
    if (!error) fetchSettlements();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white text-black min-h-screen">
      <h1 className="text-5xl font-black uppercase italic mb-8 border-b-8 border-black pb-2">Partner Payouts</h1>
      
      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className={`border-4 border-black p-4 flex justify-between items-center ${b.is_paid ? 'bg-slate-100 opacity-60' : 'bg-white shadow-[6px_6px_0px_0px_black]'}`}>
            <div>
              <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 mr-2">{b.agency_partner}</span>
              <span className="font-bold">{b.guest_name} — {b.trip_date}</span>
              <p className="text-xs italic text-slate-500">{b.tour_name}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] font-black block text-slate-400 uppercase">Payout Due</span>
                <span className="text-2xl font-black text-blue-600">₱{(b.operator_payout ?? 0).toLocaleString()}</span>
              </div>
              
              <button 
                onClick={() => togglePaidStatus(b.id, b.is_paid)}
                className={`px-6 py-2 font-black uppercase border-4 border-black transition-all ${b.is_paid ? 'bg-emerald-500 text-white' : 'bg-yellow-400 hover:bg-black hover:text-white'}`}
              >
                {b.is_paid ? 'PAID ✓' : 'MARK PAID'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}