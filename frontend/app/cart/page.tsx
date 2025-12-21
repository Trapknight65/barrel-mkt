'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createOrder } from '@/lib/api';

interface CartItem {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('barrel_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) => {
            const updated = prev
                .map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                        : item
                )
                .filter((item) => item.quantity > 0);
            localStorage.setItem('barrel_cart', JSON.stringify(updated));
            return updated;
        });
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        const token = localStorage.getItem('barrel_token');
        if (!token) {
            window.location.href = '/login?redirect=/cart';
            return;
        }

        setLoading(true);
        try {
            const items = cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            }));
            await createOrder(items);
            localStorage.removeItem('barrel_cart');
            setCart([]);
            alert('Order placed successfully!');
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tight">
                        BARREL
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/shop" className="text-sm font-medium hover:text-[#D4FF00] transition">Shop</Link>
                        <Link href="/cart" className="text-sm font-medium text-[#D4FF00]">Cart ({cart.length})</Link>
                        <Link href="/account" className="text-sm font-medium hover:text-[#D4FF00] transition">Account</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 text-white/50">
                        <p className="text-lg mb-4">Your cart is empty</p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 bg-[#D4FF00] text-black font-bold rounded-full hover:scale-105 transition"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-8">
                            {cart.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex items-center gap-4 bg-white/5 rounded-2xl p-4"
                                >
                                    <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <span className="text-2xl">📦</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.title}</h3>
                                        <p className="text-[#D4FF00]">${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateQuantity(item.productId, -1)}
                                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, 1)}
                                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6">
                            <div className="flex justify-between text-lg mb-4">
                                <span>Total</span>
                                <span className="font-bold text-[#D4FF00]">${total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full py-4 bg-[#D4FF00] text-black font-bold rounded-full hover:scale-[1.02] transition disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Checkout'}
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
