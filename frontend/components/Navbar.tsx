'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
    const pathname = usePathname();
    const { cartCount } = useCart();

    // Don't show navbar in admin
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#D4FF00] rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                        <span className="text-black font-black text-xl">B</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter">BARREL</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        href="/shop"
                        className={`text-sm font-bold tracking-widest hover:text-[#D4FF00] transition ${pathname === '/shop' ? 'text-[#D4FF00]' : 'text-white/70'}`}
                    >
                        SHOP
                    </Link>
                    <Link
                        href="/about"
                        className={`text-sm font-bold tracking-widest hover:text-[#D4FF00] transition ${pathname === '/about' ? 'text-[#D4FF00]' : 'text-white/70'}`}
                    >
                        MISSION
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/cart" className="relative p-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🛒</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4FF00] text-black text-[10px] font-black rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/login"
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition"
                    >
                        LOGIN
                    </Link>
                </div>
            </div>
        </header>
    );
}
