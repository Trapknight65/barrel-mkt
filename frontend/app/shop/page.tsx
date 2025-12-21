'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/api';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    category?: string;
}

const categories = [
    { id: 'all', label: 'All' },
    { id: 'bike', label: 'Bike' },
    { id: 'camera', label: 'Camera' },
    { id: 'skate', label: 'Skate' },
    { id: 'moto', label: 'Moto' },
];

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                const category = activeCategory === 'all' ? undefined : activeCategory;
                const data = await getProducts(category);
                setProducts(data);
            } catch (error) {
                console.error('Failed to load products:', error);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, [activeCategory]);

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tight">
                        BARREL
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/shop" className="text-sm font-medium text-[#D4FF00]">Shop</Link>
                        <Link href="/cart" className="text-sm font-medium hover:text-[#D4FF00] transition">Cart</Link>
                        <Link href="/account" className="text-sm font-medium hover:text-[#D4FF00] transition">Account</Link>
                    </nav>
                </div>
            </header>

            {/* Category Filter */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id
                                    ? 'bg-[#D4FF00] text-black'
                                    : 'bg-white/5 hover:bg-white/10 text-white'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <main className="max-w-7xl mx-auto px-4 pb-16">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-white/50">
                        <p className="text-lg">No products found in this category.</p>
                        <p className="text-sm mt-2">Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/shop/${product.id}`}
                                className="group bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.02]"
                            >
                                <div className="aspect-square bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl">📦</span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-white group-hover:text-[#D4FF00] transition">
                                        {product.title}
                                    </h3>
                                    <p className="text-sm text-white/50 mt-1 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <p className="text-lg font-bold text-[#D4FF00] mt-3">
                                        ${Number(product.price).toFixed(2)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
