'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Define the valid service types to fix the TypeScript error 2367
type ServiceCategory = 'ALL' | 'DAILY TOURS' | 'PRIVATE' | 'LOGISTICS' | 'EXPEDITIONS';

export default function ManagementDashboard() {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceFilter, setServiceFilter] = useState<ServiceCategory>('ALL');
  const [tourVariantFilter, setTourVariantFilter] = useState('ALL');

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

  // Determine if specific tour selection is relevant based on the category
  const isTourService = serviceFilter === 'DAILY TOURS' || serviceFilter === 'PRIVATE' || serviceFilter === 'ALL';

  const filteredData = allBookings.filter(b => {
    const bookingDate = b.trip_date ? b.trip_date.split('T')[0] : "";
    const matchesDate = bookingDate >= startDate && bookingDate <= endDate;
    
    const dbService = b.service_type?.toUpperCase() || "";
    const dbTour = b.tour_name?.toUpperCase() || "";
    const selectedTour = tourVariantFilter.toUpperCase();

    let matchesService = false;
    if (serviceFilter === 'ALL') {
      matchesService = true;
    } else if (serviceFilter === 'DAILY TOURS') {
      matchesService = dbService.includes('DAILY TOUR');
    } else if (serviceFilter === 'PRIVATE') {
      matchesService = dbService.includes('PRIVATE');
    } else if (serviceFilter === 'LOGISTICS') {
      matchesService = dbService.includes('LOGISTICS') || dbService.includes('TRANSFER');
    } else if (serviceFilter === 'EXPEDITIONS') {
      matchesService = dbService.includes('EXPEDITION');
    }

    let matchesVariant = true;
    if (isTourService && selectedTour !== 'ALL') {
        matchesVariant = dbTour === selectedTour || dbTour.includes(selectedTour);
    }

    return matchesDate && matchesService && matchesVariant;
  });

  const totalPax = filteredData.reduce((sum, item) => sum + (Number(item.pax) || 0), 0);

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen text-black font-sans relative">
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; font-size: 10pt; }
          table { width: 100% !important; border-collapse: collapse !important; border: 2px solid black !important; }
          th, td { border: 1px solid black !important; padding: 8px !important; text-align: left !important; }
          th { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; font-weight: 900; }
        }
        .print-only { display: none; }
      `}</style>

      {/* --- PRINT HEADER (Manifest Style) --- */}
      <div className="print-only mb-6 border-b-4 border-black pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">MAYAD EL NIDO</h1>
            <p className="text-lg font-black uppercase text-blue-600">
              {serviceFilter} {tourVariantFilter !== 'ALL' ? `— TOUR ${tourVariantFilter}` : ''}
            </p>
          </div>
          <div className="text-right font-bold">
            <p className="text-2xl">{startDate === endDate ? startDate : `${startDate} >> ${endDate}`}</p>
            <p className="bg-black text-white px-2 py-1 inline-block">TOTAL PAX: {totalPax}</p>
          </div>
        </div>
      </div>

      <header className="no-print mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-blue-600">Booking Audit</h2>
          <button 
            onClick={() => window.print()} 
            className="bg-emerald-500 border-4 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_black] hover:-translate-y-1 active:shadow-none transition-all"
          >
            🖨️ Print Landscape Manifest
          </button>
        </div>

        <div className="flex flex-wrap gap-4 bg-slate-50 p-6 border-4 border-black shadow-[8px_8px_0px_0px_#cbd5e1]">
          {/* Date Controls */}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase mb-1 text-emerald-600">Start Date</span>
            <input type="date" className="border-2 border-black p-2 font-black" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase mb-1 text-emerald-600">End Date</span>
            <input type="date" className="border-2 border-black p-2 font-black" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          {/* Service Category */}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase mb-1 text-emerald-600">Service Category</span>
            <select 
              className="border-2 border-black p-2 font-black bg-white uppercase" 
              value={serviceFilter} 
              onChange={(e) => {
                const val = e.target.value as ServiceCategory;
                setServiceFilter(val);
                if (val === 'LOGISTICS' || val === 'EXPEDITIONS') setTourVariantFilter('ALL');
              }}
            >
              <option value="ALL">ALL SERVICES</option>
              <option value="DAILY TOURS">DAILY TOURS</option>
              <option value="PRIVATE">PRIVATE TOURS</option>
              <option value="LOGISTICS">LOGISTICS</option>
              <option value="EXPEDITIONS">EXPEDITIONS</option>
            </select>
          </div>

          {/* Specific Tour - Automatically Disables */}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase mb-1 text-blue-600">Specific Tour</span>
            <select 
              className="border-2 border-black p-2 font-black bg-white uppercase disabled:bg-slate-200 disabled:opacity-50" 
              value={tourVariantFilter} 
              onChange={(e) => setTourVariantFilter(e.target.value)}
              disabled={serviceFilter === 'LOGISTICS' || serviceFilter === 'EXPEDITIONS'}
            >
              <option value="ALL">ALL TOURS</option>
              <option value="A">TOUR A</option>
              <option value="B">TOUR B</option>
              <option value="C">TOUR C</option>
              <option value="D">TOUR D</option>
            </select>
          </div>
        </div>
      </header>

      {/* --- TABLE (Displays tour_name directly) --- */}
      <div className="overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_black]">
        <table className="w-full text-[11px] font-bold uppercase">
          <thead className="bg-black text-white text-left italic">
            <tr>
              <th className="p-3">Guest Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3 text-center">Pax</th>
              <th className="p-3 text-center">Tour Variant</th>
              <th className="p-3">Hotel / Pickup</th>
              <th className="p-3">Notes / Dietary</th>
              <th className="p-3 text-right no-print">Collected</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => setSelectedBooking(item)} 
                className="border-b-2 border-black hover:bg-yellow-50 cursor-pointer transition-colors"
              >
                <td className="p-3 font-black text-sm">{item.guest_name}</td>
                <td className="p-3 text-blue-700">{item.contact_number || '---'}</td>
                <td className="p-3 text-center text-xl font-black">{item.pax || '0'}</td>
                <td className="p-3 text-center">
                  <span className="bg-black text-white px-3 py-1 rounded-sm font-black text-lg">
                    {item.tour_name || '---'}
                  </span>
                </td>
                <td className="p-3 italic">{item.hotel_name || '---'}</td>
                <td className="p-3 text-rose-700 font-bold">{item.dietary_restrictions || item.notes || 'NONE'}</td>
                <td className="p-3 text-right font-black no-print">₱{item.total_collected?.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="bg-slate-100 border-t-4 border-black font-black">
              <td colSpan={2} className="p-3 text-right italic">Total Manifest Pax:</td>
              <td className="p-3 text-center text-2xl bg-yellow-300 border-x-4 border-black">{totalPax}</td>
              <td colSpan={3} className="p-3 italic text-slate-400 text-[10px]">
                {serviceFilter} Manifest Generated
              </td>
              <td className="no-print"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- DETAILS MODAL --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div className="bg-white border-[6px] border-black w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h3 className="font-black uppercase italic tracking-tighter text-xl">Audit Detail</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-2xl font-black hover:text-rose-500">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Guest</label>
                <p className="text-xl font-black uppercase">{selectedBooking.guest_name}</p>
                <p className="text-blue-600 font-bold">{selectedBooking.contact_number}</p>
              </div>
              <div className="text-right">
                <label className="text-[10px] font-black uppercase text-slate-400">Tour</label>
                <p className="text-3xl font-black text-blue-600 uppercase">TOUR {selectedBooking.tour_name || 'N/A'}</p>
              </div>
              <div className="col-span-2 border-t-2 border-slate-100 pt-4">
                <label className="text-[10px] font-black uppercase text-slate-400">Service Category</label>
                <p className="font-black uppercase">{selectedBooking.service_type}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t-4 border-black flex justify-end">
              <button onClick={() => setSelectedBooking(null)} className="px-6 py-2 border-2 border-black font-black uppercase text-xs hover:bg-black hover:text-white transition-colors">Close Audit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}