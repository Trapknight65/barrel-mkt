'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: { email: string; name?: string };
    items: { quantity: number; price: number; product: { title: string } }[];
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PAID: 'bg-blue-500/20 text-blue-400',
    SHIPPED: 'bg-purple-500/20 text-purple-400',
    DELIVERED: 'bg-green-500/20 text-green-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadOrders() {
        try {
            const data = await fetchAPI('/orders/admin/all');
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    async function updateStatus(orderId: string, status: string) {
        try {
            await fetchAPI(`/orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            loadOrders();
        } catch (error) {
            alert('Failed to update order status');
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Orders</h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 text-white/50">
                    <p className="text-lg">No orders yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white/5 rounded-2xl p-6 border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-white/50">Order ID</p>
                                    <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-white/50">Total</p>
                                    <p className="text-xl font-bold text-[#D4FF00]">
                                        ${Number(order.totalAmount).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                                    {order.status}
                                </span>
                                <span className="text-white/50 text-sm">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                                <span className="text-white/50 text-sm">
                                    {order.user?.email || 'Unknown user'}
                                </span>
                            </div>

                            <div className="border-t border-white/10 pt-4 mb-4">
                                <p className="text-sm text-white/50 mb-2">Items:</p>
                                <div className="space-y-1">
                                    {order.items.map((item, i) => (
                                        <p key={i} className="text-sm">
                                            {item.quantity}x {item.product?.title || 'Product'} - ${Number(item.price).toFixed(2)}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => updateStatus(order.id, status)}
                                        disabled={order.status === status}
                                        className={`px-3 py-1 rounded-lg text-xs transition ${order.status === status
                                                ? 'bg-white/20 cursor-not-allowed'
                                                : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
