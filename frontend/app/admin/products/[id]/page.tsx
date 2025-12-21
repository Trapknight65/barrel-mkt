'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        sku: '',
        category: '',
        imageUrl: '',
        stock: '0',
    });

    useEffect(() => {
        async function loadProduct() {
            try {
                const product = await fetchAPI(`/products/${params.id}`);
                setForm({
                    title: product.title,
                    description: product.description,
                    price: String(product.price),
                    sku: product.sku,
                    category: product.category || '',
                    imageUrl: product.imageUrl || '',
                    stock: String(product.stock),
                });
            } catch (error) {
                alert('Product not found');
                router.push('/admin/products');
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await fetchAPI(`/products/${params.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    stock: parseInt(form.stock),
                }),
            });
            router.push('/admin/products');
        } catch (error) {
            alert('Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    const categories = ['bike', 'camera', 'skate', 'moto', 'accessories'];

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/products" className="text-white/50 hover:text-white">
                    ← Back
                </Link>
                <h1 className="text-3xl font-bold">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm text-white/50 mb-2">Title *</label>
                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm text-white/50 mb-2">Description *</label>
                    <textarea
                        required
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] focus:outline-none resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-white/50 mb-2">Price ($) *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/50 mb-2">SKU *</label>
                        <input
                            type="text"
                            required
                            value={form.sku}
                            onChange={(e) => setForm({ ...form, sku: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] focus:outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-white/50 mb-2">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] focus:outline-none"
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-white/50 mb-2">Stock</label>
                        <input
                            type="number"
                            value={form.stock}
                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-white/50 mb-2">Image URL</label>
                    <input
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] focus:outline-none"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-4 bg-[#D4FF00] text-black font-bold rounded-full hover:scale-105 transition disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link
                        href="/admin/products"
                        className="px-8 py-4 bg-white/10 rounded-full hover:bg-white/20 transition"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
