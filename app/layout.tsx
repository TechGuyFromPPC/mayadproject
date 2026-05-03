'use client'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Helper to check if we are in the services sub-directory
  const isServices = pathname.includes('/tours/services');

  return (
    <html lang="en">
      <body className="relative min-h-screen font-sans overflow-x-hidden">
        {/* BLURRED BACKGROUND IMAGE */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <Image
            src="/mayad-bg.jpg"
            alt="Background"
            fill
            className="object-cover blur-md brightness-75 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        </div>

        {/* NAVIGATION BAR */}
        <nav className="border-b-[4px] border-black px-6 py-0 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50 h-20">
          <div className="flex items-center gap-2">
             <span className="font-black uppercase tracking-tighter text-2xl text-black">
               MAYAD
             </span>
             <span className="font-light uppercase tracking-widest text-xl text-black">
               EL NIDO
             </span>
          </div>

          <div className="flex h-full border-l-4 border-black overflow-x-auto">
            <Link 
              href="/" 
              className={`h-full flex items-center px-6 text-[10px] font-black uppercase tracking-widest transition-all
                ${pathname === '/' ? 'bg-black text-white' : 'text-black hover:bg-black/5'}`}
            >
              Island Tours
            </Link>

            <Link 
              href="/tours/services/private-tours" 
              className={`h-full flex items-center px-6 text-[10px] font-black uppercase tracking-widest transition-all border-l-4 border-black
                ${pathname.includes('private-tours') ? 'bg-black text-white' : 'text-black hover:bg-black/5'}`}
            >
              Private
            </Link>

            <Link 
              href="/tours/services/transfers" 
              className={`h-full flex items-center px-6 text-[10px] font-black uppercase tracking-widest transition-all border-l-4 border-black
                ${pathname.includes('transfers') ? 'bg-black text-white' : 'text-black hover:bg-black/5'}`}
            >
              Logistics
            </Link>

            <Link 
              href="/tours/services/expeditions" 
              className={`h-full flex items-center px-6 text-[10px] font-black uppercase tracking-widest transition-all border-l-4 border-black
                ${pathname.includes('expeditions') ? 'bg-black text-white' : 'text-black hover:bg-black/5'}`}
            >
              Expeditions
            </Link>

            <Link 
              href="/reports" 
              className={`h-full flex items-center px-6 text-[10px] font-black uppercase tracking-widest transition-all border-l-4 border-black
                ${pathname === '/reports' ? 'bg-emerald-500 text-white' : 'text-black hover:bg-black/5'}`}
            >
              Sales History
            </Link>
          </div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="relative z-10 p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  )
}