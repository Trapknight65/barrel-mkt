'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getProduct } from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    category?: string;
    stock: number;
    sku?: string;
}

export default function ProductDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addItem } = useCart();

    useEffect(() => {
        async function load() {
            try {
                const data = await getProduct(params.id);
                setProduct(data);
            } catch (error) {
                console.error('Failed to load product:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    const handleAddToCart = () => {
        if (!product) return;
        setIsAdding(true);
        addItem({
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity,
            imageUrl: product.imageUrl,
            sku: product.sku
        });
        setTimeout(() => setIsAdding(false), 800);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
                <div className="text-6xl mb-4">🏜️</div>
                <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                <p className="text-white/50 mb-8 max-w-xs">The gear you're looking for might have been retired or moved.</p>
                <Link href="/shop" className="px-8 py-3 bg-[#D4FF00] text-black font-bold rounded-full">
                    BACK TO SHOP
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pb-20">
            <main className="max-w-7xl mx-auto px-6 pt-12">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Visuals Column */}
                    <div className="space-y-6 sticky top-32">
                        <div className="aspect-[4/5] bg-white/5 rounded-[40px] overflow-hidden border border-white/10 group relative">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl grayscale opacity-20">📦</div>
                            )}
                            <div className="absolute top-6 left-6 flex gap-2">
                                <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest border border-white/10">PREMIUM SELECTION</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="py-6">
                        <div className="flex items-center gap-2 text-[#D4FF00] font-black text-xs tracking-[0.2em] mb-4 uppercase">
                            <span className="w-8 h-[1px] bg-[#D4FF00]" />
                            {product.category || 'Gear'}
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
                            {product.title}
                        </h1>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-5xl font-black text-[#D4FF00] tracking-tighter">
                                ${Number(product.price).toFixed(2)}
                            </span>
                            <span className="text-white/30 line-through text-xl">
                                ${(Number(product.price) * 1.2).toFixed(2)}
                            </span>
                        </div>

                        <p className="text-xl text-white/60 leading-relaxed mb-10 font-medium">
                            {product.description}
                        </p>

                        <div className="space-y-8">
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-6">
                                <span className="text-xs font-black tracking-widest text-white/40 uppercase">Quantity</span>
                                <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 p-1">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition font-bold"
                                    >- </button>
                                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition font-bold"
                                    >+</button>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className={`relative h-20 rounded-[28px] font-black text-xl tracking-tighter overflow-hidden transition-all active:scale-95 ${isAdding ? 'bg-white text-black scale-95' : 'bg-[#D4FF00] text-black hover:shadow-[0_0_40px_rgba(212,255,0,0.3)]'
                                        }`}
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                        {isAdding ? '✓ ADDED' : 'ADD TO BAG'}
                                    </div>
                                    {isAdding && <div className="absolute inset-0 bg-white animate-pulse" />}
                                </button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">⚡</span>
                                    <div>
                                        <p className="text-xs font-black tracking-tight mb-1">EXPRESS SHIPPING</p>
                                        <p className="text-[10px] text-white/40 uppercase font-bold">Priority Processing</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">🛡️</span>
                                    <div>
                                        <p className="text-xs font-black tracking-tight mb-1">WARRANTY INCLUDED</p>
                                        <p className="text-[10px] text-white/40 uppercase font-bold">1 Year Protection</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
