'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ManagementDashboard() {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
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
    
    if (error) console.error(error);
    if (data) setAllBookings(data);
  }

  const filteredData = allBookings.filter(b => {
    const bookingDate = b.trip_date ? b.trip_date.split('T')[0] : "";
    const matchesDate = bookingDate >= startDate && bookingDate <= endDate;
    const dbService = b.service_type?.toUpperCase().trim() || "";
    const selected = serviceFilter.toUpperCase();

    let matchesService = false;
    if (selected === 'ALL') {
      matchesService = true;
    } else if (selected === 'DAILY TOURS') {
      matchesService = dbService.includes('DAILY TOUR');
    } else if (selected === 'LOGISTICS') {
      matchesService = dbService.includes('LOGISTICS');
    } else {
      matchesService = dbService === selected;
    }

    return matchesDate && matchesService;
  });

  const totalPax = filteredData.reduce((sum, item) => sum + (Number(item.pax) || 0), 0);

  const getServiceColor = (type: string) => {
    const s = type?.toUpperCase() || "";
    if (s.includes('LOGISTICS')) return 'bg-amber-400 text-black';
    if (s.includes('DAILY TOUR')) return 'bg-sky-500 text-white';
    if (s.includes('PRIVATE')) return 'bg-orange-500 text-white';
    return 'bg-slate-200 text-slate-800';
  };

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen text-black font-sans relative">
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 5mm; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .hide-price-print { display: none !important; }
          
          /* Force table to use full width and show all guest info */
          .printable-table { 
            width: 100% !important; 
            border: 2px solid black !important; 
            table-layout: auto !important;
          }
          th, td { 
            border: 1px solid black !important; 
            padding: 8px !important; 
            font-size: 10pt !important;
          }
          .guest-cell { width: 20%; font-weight: 900 !important; }
          .contact-cell { width: 15%; }
        }
        .print-only { display: none; }
      `}</style>

      {/* --- MODAL (Quick View) --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div className="bg-white border-[6px] border-black w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h3 className="font-black uppercase italic tracking-tighter text-xl">Booking Detail</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-2xl font-black hover:text-rose-500">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Guest</label>
                <p className="text-lg font-black uppercase">{selectedBooking.guest_name}</p>
                <p className="text-blue-600 font-bold">{selectedBooking.contact_number}</p>
              </div>
              <div className="text-right">
                <label className="text-[10px] font-black uppercase text-slate-400">Status</label>
                <p className="font-black text-emerald-600 uppercase italic">Confirmed</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t-4 border-black flex justify-end">
              <button onClick={() => setSelectedBooking(null)} className="px-6 py-2 border-2 border-black font-black uppercase text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PRINT HEADER --- */}
      <div className="print-only mb-6 border-b-[4px] border-black pb-2">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">MAYAD EL NIDO</h1>
            <p className="text-sm font-black text-emerald-700 uppercase tracking-widest">Daily Dispatch Manifest</p>
          </div>
          <div className="text-right font-black uppercase text-xl bg-black text-white px-4 py-1">
            {startDate === endDate ? startDate : `${startDate} >> ${endDate}`}
          </div>
        </div>
      </div>

      <header className="no-print mb-8">
        <div className="flex justify-between items-center border-b-8 border-black pb-4 mb-6">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-blue-600">Booking Audit</h2>
          <button onClick={() => window.print()} className="bg-emerald-500 border-4 border-black px-8 py-3 font-black uppercase shadow-[4px_4px_0px_0px_black] active:shadow-none transition-all hover:-translate-y-1">
            🖨️ Print Manifest
          </button>
        </div>

        <div className="flex flex-wrap gap-6 bg-slate-50 p-6 border-4 border-black shadow-[8px_8px_0px_0px_#cbd5e1]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase mb-1 text-emerald-600">Start Date</span>
            <input type="date" className="border-2 border-black p-2 font-black" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase mb-1 text-emerald-600">End Date</span>
            <input type="date" className="border-2 border-black p-2 font-black" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase mb-1 text-emerald-600">Service</span>
            <select className="border-2 border-black p-2 font-black bg-white uppercase" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
              <option value="ALL">ALL SERVICES</option>
              <option value="DAILY TOURS">DAILY TOURS</option>
              <option value="LOGISTICS">LOGISTICS</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </div>
        </div>
      </header>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] no-print">
        <table className="w-full text-[11px] font-bold uppercase">
          <thead className="bg-black text-white text-left italic">
            <tr>
              <th className="p-3">Guest Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3 text-center">Pax</th>
              <th className="p-3">Hotel / Pickup</th>
              <th className="p-3">Service</th>
              <th className="p-3 bg-rose-900/50">Dietary</th>
              <th className="p-3 text-right">Collected</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} onClick={() => setSelectedBooking(item)} className="border-b-2 border-black hover:bg-yellow-50 cursor-pointer">
                <td className="p-3 font-black text-sm">{item.guest_name}</td>
                <td className="p-3 text-blue-700">{item.contact_number || '---'}</td>
                <td className="p-3 text-center text-xl font-black">{item.pax || '0'}</td>
                <td className="p-3 italic">{item.hotel_name || '---'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 font-black text-[9px] ${getServiceColor(item.service_type)}`}>
                    {item.service_type}
                  </span>
                </td>
                <td className="p-3 text-rose-700 bg-rose-50/30">{item.dietary_restrictions || 'NONE'}</td>
                <td className="p-3 text-right font-black">₱{item.total_collected?.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="bg-slate-100 border-t-4 border-black font-black">
              <td colSpan={2} className="p-3 text-right text-base italic uppercase">Total Operational Pax:</td>
              <td className="p-3 text-center text-3xl bg-yellow-300 border-x-4 border-black">{totalPax}</td>
              <td colSpan={4} className="p-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- PRINT-ONLY VERSION OF TABLE (EXCLUDES COLLECTED) --- */}
      <div className="print-only">
        <table className="printable-table w-full uppercase">
          <thead className="bg-slate-200">
            <tr>
              <th className="guest-cell">Guest Name</th>
              <th className="contact-cell">Contact</th>
              <th className="text-center">Pax</th>
              <th>Hotel / Pickup</th>
              <th>Service Type</th>
              <th>Dietary Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td className="font-black">{item.guest_name}</td>
                <td className="text-[10px]">{item.contact_number || 'N/A'}</td>
                <td className="text-center font-black text-lg">{item.pax}</td>
                <td className="italic text-[10px]">{item.hotel_name || '---'}</td>
                <td>{item.service_type}</td>
                <td className="font-bold text-rose-800">{item.dietary_restrictions || 'NONE'}</td>
              </tr>
            ))}
            <tr className="bg-slate-100">
              <td colSpan={2} className="text-right font-black uppercase italic">Total Manifest Pax:</td>
              <td className="text-center font-black text-2xl">{totalPax}</td>
              <td colSpan={3}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}