'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettlementsPage() {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  
  const [amountInput, setAmountInput] = useState('');
  const [modeInput, setModeInput] = useState('Cash');
  const [refInput, setRefInput] = useState('');

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceFilter, setServiceFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('trip_date', { ascending: false });
    if (data) setAllBookings(data);
  }

  async function handleUpdateStatus(type: 'mayad' | 'partner') {
    if (!amountInput) return alert("Please enter the amount.");

    const updates = type === 'mayad' 
      ? { 
          mayad_commi_status: 'COLLECTED', 
          mayad_commi_amount: Number(amountInput),
          mayad_payment_mode: modeInput,
          mayad_tx_id: refInput 
        }
      : { 
          partner_payment_status: 'PAID', 
          partner_payout_amount: Number(amountInput),
          partner_payment_mode: modeInput,
          partner_tx_id: refInput 
        };

    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', selectedBooking.id);

    if (!error) {
      resetModal();
      fetchData();
    }
  }

  const resetModal = () => {
    setSelectedBooking(null);
    setAmountInput('');
    setRefInput('');
    setModeInput('Cash');
  };

  const filteredData = allBookings.filter(b => {
    const bookingDate = b.trip_date ? b.trip_date.split('T')[0] : "";
    return (bookingDate >= startDate && bookingDate <= endDate) && 
           (serviceFilter === 'ALL' || b.service_type?.toUpperCase().includes(serviceFilter.replace('S','')));
  });

  const stats = filteredData.reduce((acc, curr) => {
    const isPartner = curr.booking_source?.toLowerCase() === 'partner';
    const isDailyTour = curr.service_type?.toUpperCase().includes('TOUR');
    const paxCount = Number(curr.pax) || 1;

    let partnerCut = 0;
    let mayaNetTarget = 0;

    if (isDailyTour) {
        partnerCut = isPartner ? (300 * paxCount) : 0;
        mayaNetTarget = isPartner ? (100 * paxCount) : (400 * paxCount);
    } else {
        partnerCut = Number(curr.partner_commission) || 0;
        mayaNetTarget = (Number(curr.gross_amount) || 0) - partnerCut;
    }

    const gross = Number(curr.gross_amount) || 0;
    const deposit = Number(curr.total_collected) || 0;
    const settledCommi = curr.mayad_commi_status === 'COLLECTED' ? Number(curr.mayad_commi_amount) : 0;
    
    const totalCashInHand = deposit + settledCommi;

    acc.grossTotal += gross;
    acc.partnerTotal += partnerCut;
    acc.mayaNetTarget += mayaNetTarget;
    acc.actualCollected += totalCashInHand;
    acc.outstandingBalance += (gross - totalCashInHand);

    return acc;
  }, { 
    grossTotal: 0, 
    partnerTotal: 0, 
    mayaNetTarget: 0, 
    actualCollected: 0, 
    outstandingBalance: 0 
  });

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-black font-sans relative">
      
      <header className="flex justify-between items-end border-b-8 border-black pb-4 mb-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-black">Financial Audit</h1>
          <p className="text-sm font-bold text-slate-500 uppercase mt-2">Mayad El Nido • Internal Ledger</p>
        </div>
        <button onClick={() => window.print()} className="no-print bg-black text-white px-8 py-3 font-black uppercase text-xs hover:bg-emerald-600 transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
          Print Audit Report
        </button>
      </header>

      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_black]">
        <div className="flex flex-col">
          <label className="text-[10px] font-black uppercase mb-1 text-slate-400">Date Range Selection</label>
          <div className="flex gap-2 items-center">
            <input type="date" className="border-4 border-black p-2 w-full font-black text-sm outline-none focus:bg-yellow-50" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="font-black">TO</span>
            <input type="date" className="border-4 border-black p-2 w-full font-black text-sm outline-none focus:bg-yellow-50" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        
        <div className="flex flex-col">
          <label className="text-[10px] font-black uppercase mb-1 text-slate-400">Filter By Service</label>
          <select className="border-4 border-black p-2 font-black text-sm uppercase outline-none focus:bg-yellow-50 h-full" value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
            <option value="ALL">All Services</option>
            <option value="DAILY TOURS">Daily Tours</option>
            <option value="LOGISTICS">Logistics</option>
            <option value="PRIVATE">Private Tours</option>
            <option value="EXPEDITION">Expeditions</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_black]">
          <p className="text-[10px] font-black uppercase text-slate-400 text-black">Gross Sales</p>
          <p className="text-xl font-black text-black">₱{stats.grossTotal.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 border-4 border-black p-4 shadow-[4px_4px_0px_0px_black]">
          <p className="text-[10px] font-black uppercase text-rose-600">Partner Payouts</p>
          <p className="text-xl font-black text-rose-700">₱{stats.partnerTotal.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 border-4 border-black p-4 shadow-[4px_4px_0px_0px_black]">
          <p className="text-[10px] font-black uppercase text-emerald-600">Maya Target Net</p>
          <p className="text-xl font-black text-emerald-700">₱{stats.mayaNetTarget.toLocaleString()}</p>
        </div>
        <div className="bg-blue-600 border-4 border-black p-4 text-white shadow-[4px_4px_0px_0px_black]">
          <p className="text-[10px] font-black uppercase text-blue-200">Cash Collected</p>
          <p className="text-xl font-black">₱{stats.actualCollected.toLocaleString()}</p>
        </div>
        <div className={`${stats.outstandingBalance > 0 ? 'bg-amber-400' : 'bg-slate-200'} border-4 border-black p-4 shadow-[4px_4px_0px_0px_black]`}>
          <p className="text-[10px] font-black uppercase text-black/50">Balance Owed</p>
          <p className="text-xl font-black text-black">₱{stats.outstandingBalance.toLocaleString()}</p>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print">
          <div className="bg-white border-[6px] border-black w-full max-w-md shadow-[12px_12px_0px_0px_black]">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h3 className="font-black uppercase italic">Settlement: {selectedBooking.guest_name}</h3>
              <button onClick={resetModal} className="text-2xl font-black hover:text-rose-500">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Amount (₱)</label>
                  <input type="number" className="w-full border-4 border-black p-2 font-black outline-none text-black" value={amountInput} onChange={e => setAmountInput(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Mode</label>
                  <select className="w-full border-4 border-black p-2 font-black outline-none text-black" value={modeInput} onChange={e => setModeInput(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Ref ID / Notes</label>
                <input type="text" className="w-full border-4 border-black p-2 font-black outline-none text-black" placeholder="Reference Number" value={refInput} onChange={e => setRefInput(e.target.value)} />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button onClick={() => handleUpdateStatus('mayad')} className="bg-emerald-500 border-4 border-black p-3 font-black uppercase hover:bg-emerald-400 text-white">Collect Mayad Commi ✅</button>
                <button onClick={() => handleUpdateStatus('partner')} className="bg-blue-500 border-4 border-black p-3 font-black uppercase text-white hover:bg-blue-400">Mark Partner Paid 💸</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-4 border-black overflow-x-auto shadow-[8px_8px_0px_0px_black]">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase italic">
              <th className="p-3 border-r border-slate-700">Date/Guest</th>
              <th className="p-3 border-r border-slate-700 text-center">Type</th>
              <th className="p-3 border-r border-slate-700 text-right">Gross</th>
              <th className="p-3 border-r border-slate-700 text-right">Collected</th>
              <th className="p-3 border-r border-slate-700 text-right text-rose-400">Balance</th>
              <th className="p-3 border-r border-slate-700 text-center">Maya Commi</th>
              <th className="p-3 text-center">Partner Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((b) => {
               const paxCount = Number(b.pax) || 1;
               const currentCollected = (Number(b.total_collected) || 0) + (b.mayad_commi_status === 'COLLECTED' ? Number(b.mayad_commi_amount) : 0);
               const balance = (Number(b.gross_amount) || 0) - currentCollected;
               const isPartner = b.booking_source?.toLowerCase() === 'partner';
               const targetCommi = isPartner ? (100 * paxCount) : (400 * paxCount);

               return (
                <tr key={b.id} onClick={() => setSelectedBooking(b)} className="border-b border-black hover:bg-yellow-50 cursor-pointer group text-black">
                  <td className="p-3 border-r border-slate-200">
                    <div className="font-black text-sm">{b.guest_name} <span className="text-[10px] font-normal">({paxCount} pax)</span></div>
                    <div className="text-[9px] text-slate-400">{b.trip_date}</div>
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center uppercase font-bold text-[9px]">
                    <span className={isPartner ? 'text-orange-600' : 'text-blue-600'}>{b.booking_source || 'Direct'}</span>
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-black">
                    ₱{Number(b.gross_amount || 0).toLocaleString()}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-black text-emerald-700 bg-emerald-50/30">
                    ₱{currentCollected.toLocaleString()}
                  </td>
                  <td className={`p-3 border-r border-slate-200 text-right font-black ${balance > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                    ₱{balance.toLocaleString()}
                  </td>
                  
                  <td className="p-3 border-r border-slate-200 text-center">
                    <span className="font-black text-emerald-700 text-sm">₱{targetCommi.toLocaleString()}</span>
                  </td>

                  <td className="p-3">
                    {b.partner_payment_status === 'PAID' ? (
                      <div className="bg-blue-100 p-2 border-2 border-blue-500 rounded text-center">
                        <span className="block font-black text-blue-700 text-[10px]">₱{b.partner_payout_amount}</span>
                        <span className="text-[7px] uppercase leading-none">Paid Partner</span>
                      </div>
                    ) : (
                      <div className="text-center italic text-slate-300">
                        {isPartner ? `Unpaid (₱${300 * paxCount})` : '---'}
                      </div>
                    )}
                  </td>
                </tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}