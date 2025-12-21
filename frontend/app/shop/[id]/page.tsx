'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProduct } from '@/lib/api';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    category?: string;
    stock: number;
}

export default function ProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const data = await getProduct(params.id as string);
                setProduct(data);
            } catch (error) {
                console.error('Failed to load product:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    const addToCart = () => {
        if (!product) return;

        const cart = JSON.parse(localStorage.getItem('barrel_cart') || '[]');
        const existing = cart.find((item: any) => item.productId === product.id);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                productId: product.id,
                title: product.title,
                price: product.price,
                quantity,
                imageUrl: product.imageUrl,
            });
        }

        localStorage.setItem('barrel_cart', JSON.stringify(cart));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-white/50">
                Product not found
            </div>
        );
    }

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
                        <Link href="/cart" className="text-sm font-medium hover:text-[#D4FF00] transition">Cart</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image */}
                    <div className="aspect-square bg-white/5 rounded-3xl flex items-center justify-center">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover rounded-3xl"
                            />
                        ) : (
                            <span className="text-8xl">📦</span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">
                        {product.category && (
                            <span className="text-sm text-[#D4FF00] uppercase tracking-wider mb-2">
                                {product.category}
                            </span>
                        )}
                        <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                        <p className="text-white/60 mb-6 leading-relaxed">{product.description}</p>

                        <p className="text-3xl font-bold text-[#D4FF00] mb-6">
                            ${Number(product.price).toFixed(2)}
                        </p>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-white/50">Quantity:</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition"
                                >
                                    -
                                </button>
                                <span className="w-10 text-center text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={addToCart}
                            className={`w-full py-4 font-bold rounded-full transition ${added
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[#D4FF00] text-black hover:scale-[1.02]'
                                }`}
                        >
                            {added ? '✓ Added to Cart' : 'Add to Cart'}
                        </button>

                        {product.stock > 0 && product.stock < 10 && (
                            <p className="text-sm text-orange-400 mt-4">
                                Only {product.stock} left in stock!
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
