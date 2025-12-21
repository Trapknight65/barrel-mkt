'use client';

import { useState, useEffect } from 'react';
import { getProducts, updateProduct } from '@/lib/api';

interface Product {
    id: string;
    title: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
    sku: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setEditForm({
            title: product.title,
            price: product.price,
            stock: product.stock,
            category: product.category,
            imageUrl: product.imageUrl,
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        setSaving(true);
        try {
            await updateProduct(editingProduct.id, editForm);
            await loadProducts(); // Reload to see changes
            setEditingProduct(null); // Close modal
        } catch (error) {
            console.error('Failed to update product:', error);
            alert('Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Products</h1>
                    <p className="text-white/50">Manage your product catalog.</p>
                </div>
            </div>

            <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-white/50">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden">
                                            {product.imageUrl && (
                                                <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <span className="font-medium">{product.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-white/50">{product.sku}</td>
                                <td className="px-6 py-4">${product.price}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-white/50">{product.category}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="text-[#D4FF00] hover:underline"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/50 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title || ''}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.price || 0}
                                        onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Stock</label>
                                    <input
                                        type="number"
                                        value={editForm.stock || 0}
                                        onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-white/50 mb-2">Category</label>
                                <input
                                    type="text"
                                    value={editForm.category || ''}
                                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/50 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={editForm.imageUrl || ''}
                                    onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-[#D4FF00] outline-none"
                                />
                            </div>
                            <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-[#D4FF00] text-black rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
