import React, { useEffect, useState } from 'react';
import { getMarketplaceProducts, addToCart } from '../services/marketplace.service';
import { getCategories } from '../services/inventory.service';
import { Search, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MarketplacePage: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [selectedCategory]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                getMarketplaceProducts({ category_id: selectedCategory || undefined }),
                getCategories()
            ]);
            if (prodRes.success) setProducts(prodRes.data.data || []);
            if (catRes.success) setCategories(catRes.data.data || []);
        } catch (error) {
            console.error('Failed to load marketplace', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId: string) => {
        try {
            await addToCart(productId, 1);
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{margin: '0 0 0.5rem 0'}}>Marketplace</h1>
                <p style={{color: '#718096'}}>Browse and shop from verified Gaushalas</p>
            </div>

            {/* Search & Filters */}
            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
                <div style={{flex: 1, minWidth: '250px', position: 'relative'}}>
                    <Search size={20} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0'}} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            outline: 'none'
                        }}
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        outline: 'none',
                        minWidth: '150px'
                    }}
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Product Grid */}
            {loading ? (
                <p>Loading products...</p>
            ) : filteredProducts.length === 0 ? (
                <div style={{textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px'}}>
                    <p style={{color: '#a0aec0'}}>No products found</p>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem'}}>
                    {filteredProducts.map((product) => (
                        <div key={product.id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div 
                                onClick={() => navigate(`/products/${product.id}`)}
                                style={{height: '200px', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                            >
                                <span style={{fontSize: '4rem', color: '#cbd5e0'}}>📦</span>
                            </div>
                            <div style={{padding: '1rem'}}>
                                <h3 style={{fontSize: '1.1rem', margin: '0 0 0.5rem 0', cursor: 'pointer'}} onClick={() => navigate(`/products/${product.id}`)}>
                                    {product.name}
                                </h3>
                                <p style={{fontSize: '0.9rem', color: '#718096', margin: '0 0 1rem 0', height: '40px', overflow: 'hidden'}}>
                                    {product.description || 'Fresh from the Gaushala'}
                                </p>
                                
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                                    <div>
                                        <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#2b6cb0'}}>₹{product.price_per_unit}</span>
                                        <span style={{fontSize: '0.85rem', color: '#718096', marginLeft: '0.25rem'}}>/{product.unit_type}</span>
                                    </div>
                                    <span style={{fontSize: '0.85rem', color: product.available_quantity > 0 ? '#38a169' : '#e53e3e'}}>
                                        {product.available_quantity > 0 ? `${product.available_quantity} in stock` : 'Out of stock'}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleAddToCart(product.id)}
                                    disabled={product.available_quantity === 0}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: product.available_quantity > 0 ? '#3182ce' : '#cbd5e0',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: product.available_quantity > 0 ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <ShoppingCart size={18} />
                                    {product.available_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MarketplacePage;
