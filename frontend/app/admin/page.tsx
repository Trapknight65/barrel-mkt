'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

interface Stats {
    products: number;
    orders: number;
    users: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, users: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const products = await fetchAPI('/products');
                setStats({
                    products: products.length,
                    orders: 0, // TODO: implement orders count endpoint
                    users: 0,  // TODO: implement users count endpoint
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const cards = [
        { label: 'Products', value: stats.products, icon: '📦', color: '#D4FF00' },
        { label: 'Orders', value: stats.orders, icon: '🛒', color: '#FF2E00' },
        { label: 'Users', value: stats.users, icon: '👥', color: '#00D4FF' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {cards.map((card) => (
                            <div
                                key={card.label}
                                className="bg-white/5 rounded-2xl p-6 border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">{card.icon}</span>
                                    <span
                                        className="text-4xl font-bold"
                                        style={{ color: card.color }}
                                    >
                                        {card.value}
                                    </span>
                                </div>
                                <p className="text-white/50">{card.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="/admin/products/new"
                            className="flex items-center gap-4 bg-[#D4FF00]/10 border border-[#D4FF00]/30 rounded-xl p-4 hover:bg-[#D4FF00]/20 transition"
                        >
                            <span className="text-2xl">➕</span>
                            <div>
                                <p className="font-medium text-[#D4FF00]">Add New Product</p>
                                <p className="text-sm text-white/50">Create a new product listing</p>
                            </div>
                        </a>
                        <a
                            href="/admin/orders"
                            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
                        >
                            <span className="text-2xl">📋</span>
                            <div>
                                <p className="font-medium">View Orders</p>
                                <p className="text-sm text-white/50">Manage customer orders</p>
                            </div>
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}
