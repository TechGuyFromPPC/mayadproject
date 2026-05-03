'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [filterPartner, setFilterPartner] = useState('All');

  useEffect(() => {
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .order('trip_date', { ascending: false });
      if (data) setData(data);
    };
    fetchBookings();
  }, []);

  const filtered = data.filter(s => {
    const matchesDate = (!start || !end) ? true : (s.trip_date >= start && s.trip_date <= end);
    const matchesPartner = (filterPartner === 'All') ? true : (s.agency_partner === filterPartner);
    return matchesDate && matchesPartner;
  });

  const totals = filtered.reduce((acc, curr) => ({
    mayad: acc.mayad + (curr.mayad_profit || 0),
    partner: acc.partner + (curr.partner_commission || 0),
    pax: acc.pax + (curr.pax || 0)
  }), { mayad: 0, partner: 0, pax: 0 });

  const partners = ['All', 'Mayad Direct', ...new Set(data.map(item => item.agency_partner).filter(p => p !== 'Mayad Direct'))];

  return (
    <div className="max-w-6xl mx-auto p-8 text-black min-h-screen bg-white">
      <header className="flex justify-between items-end border-b-8 border-black pb-6 mb-8 print:hidden">
        <div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter text-black">Audit Ledger</h1>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase mb-1 text-black">Date Range</label>
              <div className="flex gap-1">
                <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border-2 border-black p-1 text-xs font-black text-black" />
                <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border-2 border-black p-1 text-xs font-black text-black" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase mb-1 text-black">Source / Partner</label>
              <select 
                value={filterPartner} 
                onChange={e => setFilterPartner(e.target.value)} 
                className="border-2 border-black p-1 text-xs font-black uppercase bg-yellow-400 text-black"
              >
                {partners.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button onClick={() => window.print()} className="bg-black text-white px-8 py-4 font-black uppercase hover:bg-emerald-600 transition-colors">
          Print Report
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="border-4 border-black p-6 bg-emerald-500 text-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase">Mayad Net Profit</p>
          <p className="text-4xl font-black">₱{totals.mayad.toLocaleString()}</p>
        </div>
        <div className="border-4 border-black p-6 bg-yellow-400 text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase">Partner Commi</p>
          <p className="text-4xl font-black">₱{totals.partner.toLocaleString()}</p>
        </div>
        <div className="border-4 border-black p-6 bg-white text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase text-slate-500">Total Pax Served</p>
          <p className="text-4xl font-black">{totals.pax}</p>
        </div>
      </div>

      <div className="bg-white border-4 border-black overflow-hidden shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)]">
        <table className="w-full text-left">
          <thead className="bg-black text-white uppercase text-[10px] font-black">
            <tr>
              <th className="p-4">Guest / Date</th>
              <th className="p-4">Source</th>
              <th className="p-4 text-center">Pax</th>
              <th className="p-4 text-right">Commi</th>
              <th className="p-4 text-right">Mayad Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {filtered.map(s => (
              <tr key={s.id} className="font-bold text-black">
                <td className="p-4 border-r-2 border-black">
                  <div className="text-sm uppercase leading-none font-black">{s.guest_name}</div>
                  <div className="text-[9px] text-slate-500 mt-1 uppercase font-black">{s.tour_name} — {s.trip_date}</div>
                </td>
                <td className="p-4 text-xs italic border-r-2 border-black font-black">{s.agency_partner}</td>
                <td className="p-4 text-center border-r-2 border-black font-black text-xl bg-slate-50">{s.pax}</td>
                <td className="p-4 text-right text-red-600 border-r-2 border-black font-black">
                   {s.partner_commission > 0 ? `₱${s.partner_commission.toLocaleString()}` : '—'}
                </td>
                <td className="p-4 text-right font-black bg-emerald-50/30">
                  ₱{(s.mayad_profit || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}