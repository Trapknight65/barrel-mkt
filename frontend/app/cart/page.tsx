'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createOrder, validateCoupon } from '@/lib/api';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const { cart, updateQuantity, cartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState<{ type: string, value: number, code: string } | null>(null);
    const [couponError, setCouponError] = useState('');

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponError('');
        try {
            const coupon = await validateCoupon(couponCode);
            setDiscount({
                type: coupon.discountType,
                value: Number(coupon.value),
                code: coupon.code
            });
            setCouponCode('');
        } catch (error) {
            setCouponError('Invalid or expired coupon');
        }
    };

    const calculateDiscountAmount = () => {
        if (!discount) return 0;
        if (discount.type === 'PERCENT') {
            return cartTotal * (discount.value / 100);
        }
        return discount.value;
    };

    const finalTotal = Math.max(0, cartTotal - calculateDiscountAmount());

    const handleCheckout = async () => {
        const token = localStorage.getItem('barrel_token');
        if (!token) {
            window.location.href = `/login?redirect=/cart`;
            return;
        }

        setLoading(true);
        try {
            const items = cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            }));
            await createOrder({
                items,
                couponCode: discount?.code
            });
            clearCart();
            window.location.href = '/checkout/success'; // We'll need a success page
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <main className="max-w-7xl mx-auto px-6 pt-12">
                <h1 className="text-6xl font-black tracking-tighter mb-12">YOUR BAG</h1>

                {cart.length === 0 ? (
                    <div className="py-20 text-center border-t border-white/5">
                        <p className="text-white/40 text-xl mb-8">Your bag is currently empty.</p>
                        <Link href="/shop" className="px-12 py-4 bg-[#D4FF00] text-black font-black rounded-full hover:scale-105 transition">
                            BACK TO SHOP
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-16">
                        {/* List */}
                        <div className="lg:col-span-2 space-y-8">
                            {cart.map((item) => (
                                <div key={item.productId} className="flex gap-6 pb-8 border-b border-white/5 group">
                                    <div className="w-32 h-40 bg-white/5 rounded-3xl overflow-hidden border border-white/10 flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-20">📦</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-xl font-bold tracking-tight group-hover:text-[#D4FF00] transition">{item.title}</h3>
                                                <p className="text-xl font-black">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <p className="text-white/40 text-[10px] font-black tracking-widest uppercase mb-4">SKU: {item.sku || 'N/A'}</p>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition font-bold"
                                                >-</button>
                                                <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition font-bold"
                                                >+</button>
                                            </div>
                                            <button
                                                onClick={() => updateQuantity(item.productId, 0)}
                                                className="text-[10px] font-black tracking-widest text-red-500/50 hover:text-red-500 uppercase transition"
                                            >Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-[32px] p-8 border border-white/10">
                                <h2 className="text-2xl font-black tracking-tighter mb-6">ORDER SUMMARY</h2>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-white/60">
                                        <span className="text-sm font-bold uppercase tracking-widest">Subtotal</span>
                                        <span className="font-bold">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-white/60">
                                        <span className="text-sm font-bold uppercase tracking-widest">Shipping</span>
                                        <span className="font-bold text-[#D4FF00]">FREE</span>
                                    </div>
                                    {discount && (
                                        <div className="flex justify-between text-[#D4FF00]">
                                            <span className="text-sm font-bold uppercase tracking-widest">Discount ({discount.code})</span>
                                            <span className="font-bold">-${calculateDiscountAmount().toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-baseline">
                                        <span className="text-xl font-black tracking-tighter uppercase">Total</span>
                                        <span className="text-4xl font-black text-[#D4FF00] tracking-tighter">${finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Coupon UI */}
                                <div className="mb-8">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="PROMO CODE"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black tracking-widest focus:border-[#D4FF00] outline-none"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black tracking-widest transition"
                                        >APPLY</button>
                                    </div>
                                    {couponError && <p className="text-red-500 text-[10px] font-black mt-2 tracking-widest">{couponError}</p>}
                                    {discount && <p className="text-[#D4FF00] text-[10px] font-black mt-2 tracking-widest">PROMO APPLIED!</p>}
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={loading || cart.length === 0}
                                    className="w-full py-5 bg-[#D4FF00] text-black font-black text-xl tracking-tighter rounded-[24px] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'CHECKING OUT...' : 'CHECKOUT NOW'}
                                </button>

                                <div className="mt-6 flex flex-col items-center gap-4 opacity-30 grayscale">
                                    <div className="flex gap-4">
                                        <span className="text-xs font-black tracking-widest uppercase">Secured by Stripe</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
