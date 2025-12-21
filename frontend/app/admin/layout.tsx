'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem('barrel_token');
        if (!token) {
            router.push('/login?redirect=/admin');
            return;
        }

        // Decode JWT to check role (simple decode, not verification)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'ADMIN') {
                setIsAdmin(true);
            } else {
                alert('Access denied. Admin only.');
                router.push('/');
            }
        } catch {
            router.push('/login?redirect=/admin');
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAdmin) return null;

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/products', label: 'Products', icon: '📦' },
        { href: '/admin/orders', label: 'Orders', icon: '🛒' },
        { href: '/admin/users', label: 'Users', icon: '👥' },
        { href: '/admin/suppliers', label: 'Suppliers', icon: '🌍' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 p-6 flex flex-col">
                <Link href="/" className="text-2xl font-bold text-[#D4FF00] mb-8">
                    BARREL
                </Link>
                <p className="text-xs text-white/30 mb-6 uppercase tracking-wider">Admin Panel</p>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === item.href
                                ? 'bg-[#D4FF00] text-black font-medium'
                                : 'hover:bg-white/5'
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="pt-6 border-t border-white/10 mt-6">
                    <button
                        onClick={() => {
                            localStorage.removeItem('barrel_token');
                            router.push('/login');
                        }}
                        className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-400/10 rounded-xl transition"
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
