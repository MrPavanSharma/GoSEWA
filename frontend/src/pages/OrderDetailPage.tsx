import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder, trackOrder } from '../services/order.service';
import { ArrowLeft, MapPin, CreditCard, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [tracking, setTracking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const [orderRes, trackRes] = await Promise.all([
                getOrderById(id!),
                trackOrder(id!).catch(() => null) // Tracking might not exist
            ]);

            if (orderRes.success) setOrder(orderRes.data.data);
            if (trackRes?.success) setTracking(trackRes.data.data);
        } catch (error) {
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            await cancelOrder(id!);
            toast.success('Order cancelled successfully');
            fetchOrderDetails();
        } catch (error) {
            toast.error('Failed to cancel order');
        }
    };

    if (loading) return <div>Loading order details...</div>;
    if (!order) return <div>Order not found</div>;

    const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

    return (
        <div>
            {/* Back Button */}
            <button
                onClick={() => navigate('/orders')}
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
                <ArrowLeft size={20} /> Back to Orders
            </button>

            <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem'}}>
                {/* Order Details */}
                <div>
                    {/* Header */}
                    <div style={{background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                            <div>
                                <h1 style={{margin: '0 0 0.5rem 0'}}>Order #{order.id.substring(0, 8)}</h1>
                                <p style={{color: '#718096', margin: 0}}>
                                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <span style={{
                                padding: '0.5rem 1rem',
                                background: order.status === 'DELIVERED' ? '#d1fae5' : '#dbeafe',
                                color: order.status === 'DELIVERED' ? '#065f46' : '#1e40af',
                                borderRadius: '8px',
                                fontWeight: 600
                            }}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div style={{background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                        <h3 style={{margin: '0 0 1.5rem 0'}}>Order Items</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            {order.items?.map((item: any, index: number) => (
                                <div key={index} style={{display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f7fafc'}}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        background: '#f7fafc',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem'
                                    }}>
                                        📦
                                    </div>
                                    <div style={{flex: 1}}>
                                        <h4 style={{margin: '0 0 0.25rem 0'}}>{item.product_name || 'Product'}</h4>
                                        <p style={{color: '#718096', fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>
                                            Quantity: {item.quantity}
                                        </p>
                                        <p style={{fontWeight: 600, color: '#2b6cb0', margin: 0}}>
                                            ₹{parseFloat(item.price).toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )) || <p style={{color: '#a0aec0'}}>No items found</p>}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div style={{background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                        <h3 style={{margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <MapPin size={20} /> Delivery Address
                        </h3>
                        <p style={{color: '#4a5568', lineHeight: '1.6', margin: 0}}>
                            {order.delivery_address}
                        </p>
                    </div>

                    {/* Payment Info */}
                    <div style={{background: 'white', padding: '2rem', borderRadius: '12px'}}>
                        <h3 style={{margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <CreditCard size={20} /> Payment Information
                        </h3>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                            <span style={{color: '#718096'}}>Payment Method:</span>
                            <span style={{fontWeight: 600}}>{order.payment_method}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span style={{color: '#718096'}}>Payment Status:</span>
                            <span style={{fontWeight: 600, color: order.payment_status === 'PAID' ? '#10b981' : '#f59e0b'}}>
                                {order.payment_status || 'PENDING'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Order Summary */}
                    <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                        <h3 style={{margin: '0 0 1.5rem 0'}}>Order Summary</h3>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                            <span style={{color: '#718096'}}>Subtotal:</span>
                            <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0'}}>
                            <span style={{color: '#718096'}}>Delivery:</span>
                            <span>₹50.00</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold'}}>
                            <span>Total:</span>
                            <span style={{color: '#2b6cb0'}}>₹{(parseFloat(order.total_amount) + 50).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Tracking */}
                    {tracking && (
                        <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                            <h3 style={{margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <Truck size={20} /> Tracking
                            </h3>
                            <div style={{fontSize: '0.9rem', color: '#4a5568'}}>
                                <p style={{margin: '0 0 0.5rem 0'}}>Status: <strong>{tracking.status}</strong></p>
                                <p style={{margin: 0}}>Location: {tracking.current_location || 'In transit'}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {canCancel && (
                        <button
                            onClick={handleCancelOrder}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#fff5f5',
                                color: '#e53e3e',
                                border: '1px solid #feb2b2',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
