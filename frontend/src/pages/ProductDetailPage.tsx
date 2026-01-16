import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addToCart } from '../services/marketplace.service';
import { getProductReviews, deleteReview } from '../services/review.service';
import { ArrowLeft, ShoppingCart, Star, Trash2 } from 'lucide-react';
import ReviewForm from '../components/ReviewForm';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProduct();
            fetchReviews();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await getProductById(id!);
            if (res.success) setProduct(res.data.data);
        } catch (error) {
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await getProductReviews(id!);
            if (res.success) setReviews(res.data.data || []);
        } catch (error) {
            console.error('Failed to load reviews');
        }
    };

    const handleAddToCart = async () => {
        try {
            await addToCart(product.id, quantity);
            toast.success(`Added ${quantity} item(s) to cart!`);
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await deleteReview(reviewId);
            toast.success('Review deleted');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    if (loading) return <div>Loading product...</div>;
    if (!product) return <div>Product not found</div>;

    // Calculate rating
    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 'New';

    return (
        <div>
            {/* Back Button */}
            <button 
                onClick={() => navigate('/marketplace')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#3182ce',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    fontSize: '1rem'
                }}
            >
                <ArrowLeft size={20} /> Back to Marketplace
            </button>

            {/* Product Detail */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem'}}>
                {/* Image */}
                <div style={{background: '#f7fafc', borderRadius: '12px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontSize: '8rem', color: '#cbd5e0'}}>📦</span>
                </div>

                {/* Details */}
                <div>
                    <h1 style={{fontSize: '2rem', margin: '0 0 0.5rem 0'}}>{product.name}</h1>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                        <span style={{color: '#718096'}}>{avgRating} ({reviews.length} reviews)</span>
                    </div>

                    <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '1rem'}}>
                        ₹{product.price_per_unit}
                        <span style={{fontSize: '1rem', color: '#718096', fontWeight: 'normal'}}>/{product.unit_type}</span>
                    </div>

                    <p style={{color: '#4a5568', lineHeight: '1.6', marginBottom: '1.5rem'}}>
                        {product.description || 'Fresh and organic product directly from verified Gaushalas. Supporting local farmers and sustainable practices.'}
                    </p>

                    <div style={{background: '#f7fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                            <span style={{color: '#718096'}}>Availability:</span>
                            <span style={{fontWeight: 600, color: product.available_quantity > 0 ? '#38a169' : '#e53e3e'}}>
                                {product.available_quantity > 0 ? `${product.available_quantity} in stock` : 'Out of stock'}
                            </span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span style={{color: '#718096'}}>Unit Type:</span>
                            <span style={{fontWeight: 600}}>{product.unit_type}</span>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Quantity:</label>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem'
                                }}
                            >-</button>
                            <span style={{fontSize: '1.2rem', fontWeight: 600, minWidth: '40px', textAlign: 'center'}}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(product.available_quantity, quantity + 1))}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem'
                                }}
                            >+</button>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={product.available_quantity === 0}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: product.available_quantity > 0 ? '#3182ce' : '#cbd5e0',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            cursor: product.available_quantity > 0 ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        <ShoppingCart size={22} />
                        {product.available_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>

            {/* Reviews Section */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
                {/* Review Form */}
                <ReviewForm productId={product.id} onSuccess={fetchReviews} />

                {/* Reviews List */}
                <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                    <h3 style={{margin: '0 0 1.5rem 0'}}>Customer Reviews</h3>
                    {reviews.length === 0 ? (
                        <p style={{color: '#a0aec0'}}>No reviews yet. Be the first to review!</p>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                            {reviews.map((review) => (
                                <div key={review.id} style={{borderBottom: '1px solid #f7fafc', paddingBottom: '1.5rem'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%', background: '#ebf8ff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#2b6cb0', fontWeight: 'bold'
                                            }}>
                                                {review.User?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p style={{margin: 0, fontWeight: 600}}>{review.User?.full_name || 'Anonymous'}</p>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            size={12} 
                                                            fill={i < review.rating ? '#f59e0b' : 'none'} 
                                                            color={i < review.rating ? '#f59e0b' : '#cbd5e0'} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                            <span style={{fontSize: '0.85rem', color: '#a0aec0'}}>
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                            {/* Allow deletion for demo/owner purposes */}
                                            <button 
                                                onClick={() => handleDeleteReview(review.id)}
                                                style={{border: 'none', background: 'none', cursor: 'pointer', color: '#e53e3e', padding: '0.25rem'}}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{color: '#4a5568', lineHeight: '1.5', margin: 0}}>
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
