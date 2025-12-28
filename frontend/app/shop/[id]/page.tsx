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
    const productId = params.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addItem } = useCart();

    useEffect(() => {
        if (!productId) return;
        async function load() {
            try {
                const data = await getProduct(productId);
                setProduct(data);
            } catch (error) {
                console.error('Failed to load product:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [productId]);

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
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black mb-4">PRODUCT NOT FOUND</h1>
                <p className="text-white/50 mb-8">The gear you're looking for has moved on.</p>
                <Link href="/shop" className="px-8 py-3 bg-[#D4FF00] text-black font-black rounded-full hover:scale-105 transition">
                    BACK TO SHOP
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#D4FF00] selection:text-black">
            <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
                <div className="grid lg:grid-cols-2 gap-20 items-start">
                    {/* Left: Product Image */}
                    <div className="sticky top-24">
                        <div className="aspect-[4/5] bg-white/5 rounded-[40px] overflow-hidden border border-white/10 group">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl grayscale opacity-20">📦</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="pt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10">
                                {product.category || 'GEAR'}
                            </span>
                            <span className="w-2 h-2 bg-[#D4FF00] rounded-full animate-pulse" />
                            <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">
                                IN STOCK
                            </span>
                        </div>

                        <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic">
                            {product.title}
                        </h1>

                        <div className="flex items-baseline gap-4 mb-12">
                            <span className="text-5xl font-black text-[#D4FF00] tracking-tighter">${product.price}</span>
                            <span className="text-xl text-white/30 font-bold line-through">${(product.price * 1.5).toFixed(2)}</span>
                        </div>

                        <div className="space-y-8 mb-16">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <h3 className="text-xs font-black tracking-widest text-[#D4FF00] uppercase mb-4">Description</h3>
                                <div
                                    className="text-lg text-white/70 leading-relaxed font-medium"
                                    dangerouslySetInnerHTML={{ __html: product.description || "The ultimate performance gear for those who push boundaries. Meticulously designed for reliability and style." }}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 p-6 bg-white/5 border border-white/10 rounded-3xl">
                                    <h3 className="text-xs font-black tracking-widest text-white/40 uppercase mb-2">Quantity</h3>
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-xl hover:bg-[#D4FF00] hover:text-black transition-colors font-black text-xl"
                                        >-</button>
                                        <span className="text-2xl font-black">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-xl hover:bg-[#D4FF00] hover:text-black transition-colors font-black text-xl"
                                        >+</button>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 bg-black border border-white/10 rounded-3xl flex flex-col justify-center">
                                    <h3 className="text-xs font-black tracking-widest text-white/40 uppercase mb-1">SKU</h3>
                                    <p className="text-sm font-black tracking-widest">{product.sku || 'BR-DARK-99'}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className={`w-full py-6 rounded-[32px] font-black text-2xl tracking-tighter transition-all duration-300 flex items-center justify-center gap-4 ${isAdding
                                ? 'bg-white text-black scale-95'
                                : 'bg-[#D4FF00] text-black hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(212,255,0,0.2)]'
                                }`}
                        >
                            {isAdding ? (
                                <>
                                    <span className="animate-bounce">✓</span>
                                    ADDED TO BAG
                                </>
                            ) : (
                                <>
                                    ADD TO BAG — ${(product.price * quantity).toFixed(2)}
                                </>
                            )}
                        </button>

                        <div className="mt-12 flex items-center justify-between px-4 opacity-30 grayscale">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black tracking-widest uppercase">7-Day Ship</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black tracking-widest uppercase">Premium Quality</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black tracking-widest uppercase">Secured</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
