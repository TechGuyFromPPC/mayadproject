'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard/Audit', path: '/reports' },
  { name: 'Island Tours', path: '/tours' },
  { name: 'Private Tours', path: '/tours/services/private-tours' },
  { name: 'Transfers & Rentals', path: '/tours/services/transfers' },
  { name: 'Expeditions', path: '/tours/services/expeditions' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black text-white h-screen sticky top-0 flex flex-col p-6 hidden md:flex">
      <div className="mb-10">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Mayad</h2>
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`block p-4 font-black uppercase text-xs border-2 transition-all ${
                isActive 
                ? 'bg-yellow-400 text-black border-yellow-400 translate-x-2' 
                : 'border-transparent hover:border-white'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <p className="text-[9px] font-bold text-slate-500 uppercase">
          Branch: <span className="text-yellow-400">Updates</span>
        </p>
      </div>
    </aside>
  );
}