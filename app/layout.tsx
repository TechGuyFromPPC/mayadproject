'use client'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="relative min-h-screen font-sans">
        {/* BLURRED BACKGROUND IMAGE */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <Image
            src="/mayad-bg.jpg" // Use your El Nido photo here
            alt="Background"
            fill
            className="object-cover blur-md brightness-75 scale-105"
            priority
          />
          {/* DARK OVERLAY FOR READABILITY */}
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

          <div className="flex h-full border-l-4 border-black">
            <Link 
              href="/" 
              className={`h-full flex items-center px-10 text-sm font-black uppercase tracking-widest transition-all
                ${pathname === '/' ? 'bg-black text-white' : 'text-black hover:bg-black/5'}`}
            >
              New Booking
            </Link>
            <Link 
              href="/reports" 
              className={`h-full flex items-center px-10 text-sm font-black uppercase tracking-widest transition-all border-l-4 border-black
                ${pathname === '/reports' ? 'bg-black text-white' : 'text-black hover:bg-black/5'}`}
            >
              Sales History
            </Link>
          </div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  )
}