'use client';

import { useState } from 'react';
import { searchCJProducts, createProduct } from '@/lib/api';

interface CJProduct {
    id: string; // V2 uses 'id', not 'pid'
    nameEn: string; // V2 uses 'nameEn'
    productImage: string;
    sellPrice: string;
    categoryId: string;
    sku: string; // V2 uses 'sku'
}

export default function AdminSuppliersPage() {
    const [keyword, setKeyword] = useState('');
    const [products, setProducts] = useState<CJProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState<string | null>(null);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await searchCJProducts(keyword);
            if (data && data.list) {
                console.log('[DEBUG] CJ Product Sample:', data.list[0]);
                setProducts(data.list);
            } else {
                setProducts([]);
            }
        } catch (error: any) {
            console.error('Search failed:', error);
            alert(`Search failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleImport(product: CJProduct) {
        setImporting(product.id);
        try {
            // Map CJ product to our schema
            const productData = {
                title: product.nameEn,
                description: `Imported from CJ. SKU: ${product.sku}`,
                price: parseFloat(product.sellPrice) * 1.5, // 50% markup by default
                sku: product.sku,
                stock: 100, // Default stock as we don't sync real-time yet
                category: 'Imported',
                imageUrl: product.productImage,
                supplierId: product.id,
            };

            await createProduct(productData);
            alert(`Imported "${product.productNameEn}" successfully!`);
        } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import product');
        } finally {
            setImporting(null);
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">CJ Dropshipping Integration</h1>
                <p className="text-white/50">Search the CJ catalog and import products directly to your store.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-4 mb-10">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search for products (e.g. 'watch', 'hoodie')..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4FF00]"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-[#D4FF00] text-black font-bold rounded-xl hover:scale-105 transition disabled:opacity-50"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 flex flex-col">
                            <div className="aspect-square relative">
                                <img
                                    src={product.productImage}
                                    alt={product.nameEn}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md">
                                    SKU: {product.sku}
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-medium text-lg leading-snug mb-2 line-clamp-2" title={product.nameEn}>
                                    {product.nameEn}
                                </h3>
                                <div className="mt-auto flex items-center justify-between pt-4">
                                    <div>
                                        <p className="text-xs text-white/50">Cost Price</p>
                                        <p className="text-[#D4FF00] font-bold text-xl">${product.sellPrice}</p>
                                    </div>
                                    <button
                                        onClick={() => handleImport(product)}
                                        disabled={importing === product.id}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition disabled:opacity-50 text-sm font-bold"
                                    >
                                        {importing === product.id ? 'Importing...' : 'Import +'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !loading && (
                    <div className="text-center py-20 text-white/30 border-2 border-dashed border-white/10 rounded-3xl">
                        <p className="text-xl">Search for a keyword above to see products</p>
                    </div>
                )
            )}
        </div>
    );
}
