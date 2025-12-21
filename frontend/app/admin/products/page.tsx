'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { fetchAPI, uploadProductsCsv } from '@/lib/api';

interface Product {
    id: string;
    title: string;
    price: number;
    category?: string;
    stock: number;
    imageUrl?: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function loadProducts() {
        try {
            const data = await fetchAPI('/products');
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await fetchAPI(`/products/${id}`, { method: 'DELETE' });
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            alert('Failed to delete product');
        }
    }

    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const result = await uploadProductsCsv(file);
            alert(`Imported: ${result.imported} products\nFailed: ${result.failed} items`);
            loadProducts();
        } catch (error) {
            console.error(error);
            alert('Failed to upload CSV');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Products</h1>
                <div>
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition mr-4"
                    >
                        Import CSV
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="px-6 py-3 bg-[#D4FF00] text-black font-bold rounded-full hover:scale-105 transition"
                    >
                        + Add Product
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-white/50">
                    <p className="text-lg mb-4">No products yet</p>
                    <Link
                        href="/admin/products/new"
                        className="inline-block px-6 py-3 bg-[#D4FF00] text-black font-bold rounded-full"
                    >
                        Add your first product
                    </Link>
                </div>
            ) : (
                <div className="bg-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="text-left p-4 text-white/50 font-medium">Product</th>
                                <th className="text-left p-4 text-white/50 font-medium">Category</th>
                                <th className="text-left p-4 text-white/50 font-medium">Price</th>
                                <th className="text-left p-4 text-white/50 font-medium">Stock</th>
                                <th className="text-right p-4 text-white/50 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-t border-white/5 hover:bg-white/5">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <span>📦</span>
                                                )}
                                            </div>
                                            <span className="font-medium">{product.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white/70">{product.category || '-'}</td>
                                    <td className="p-4 text-[#D4FF00] font-medium">${Number(product.price).toFixed(2)}</td>
                                    <td className="p-4">{product.stock}</td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition mr-2"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
