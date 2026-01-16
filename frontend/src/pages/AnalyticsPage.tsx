import React, { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { getSalesAnalytics, getRevenueMetrics, getTopProducts } from '../services/analytics.service';


const AnalyticsPage: React.FC = () => {
    const [salesData, setSalesData] = useState<any[]>([]);
    const [revenue, setRevenue] = useState<any>(null);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [salesRes, revenueRes, productsRes] = await Promise.all([
                getSalesAnalytics({ period }).catch(() => ({ success: false, data: { data: [] } })),
                getRevenueMetrics().catch(() => ({ success: false, data: { data: {} } })),
                getTopProducts(5).catch(() => ({ success: false, data: { data: [] } }))
            ]);

            if (salesRes.success) setSalesData(salesRes.data.data || generateMockSalesData());
            else setSalesData(generateMockSalesData());

            if (revenueRes.success) setRevenue(revenueRes.data.data || generateMockRevenue());
            else setRevenue(generateMockRevenue());

            if (productsRes.success) setTopProducts(productsRes.data.data || generateMockProducts());
            else setTopProducts(generateMockProducts());
        } catch (error) {
            console.error('Failed to load analytics', error);
            // Use mock data for demo
            setSalesData(generateMockSalesData());
            setRevenue(generateMockRevenue());
            setTopProducts(generateMockProducts());
        } finally {
            setLoading(false);
        }
    };

    const generateMockSalesData = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            date: day,
            sales: Math.floor(Math.random() * 50000) + 10000,
            orders: Math.floor(Math.random() * 50) + 10
        }));
    };

    const generateMockRevenue = () => ({
        total: 245000,
        growth: 12.5,
        orders: 156,
        customers: 89
    });

    const generateMockProducts = () => [
        { name: 'Cow Milk', sales: 45000, quantity: 450 },
        { name: 'Ghee', sales: 38000, quantity: 120 },
        { name: 'Paneer', sales: 28000, quantity: 200 },
        { name: 'Curd', sales: 22000, quantity: 300 },
        { name: 'Butter', sales: 18000, quantity: 150 }
    ];

    const COLORS = ['#3182ce', '#38a169', '#f59e0b', '#e53e3e', '#9f7aea'];

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h1 style={{margin: 0}}>Analytics Dashboard</h1>
                
                <div style={{display: 'flex', gap: '0.5rem'}}>
                    {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: period === p ? '2px solid #3182ce' : '1px solid #e2e8f0',
                                background: period === p ? '#ebf8ff' : 'white',
                                color: period === p ? '#2b6cb0' : '#4a5568',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: period === p ? 600 : 400,
                                textTransform: 'capitalize'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Cards */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem'}}>
                <MetricCard
                    title="Total Revenue"
                    value={`₹${revenue.total.toLocaleString()}`}
                    change={`+${revenue.growth}%`}
                    icon={<DollarSign size={24} />}
                    color="#3182ce"
                />
                <MetricCard
                    title="Total Orders"
                    value={revenue.orders}
                    change="+8.2%"
                    icon={<ShoppingBag size={24} />}
                    color="#38a169"
                />
                <MetricCard
                    title="Customers"
                    value={revenue.customers}
                    change="+15.3%"
                    icon={<Users size={24} />}
                    color="#f59e0b"
                />
                <MetricCard
                    title="Avg Order Value"
                    value={`₹${Math.floor(revenue.total / revenue.orders)}`}
                    change="+4.1%"
                    icon={<TrendingUp size={24} />}
                    color="#9f7aea"
                />
            </div>

            {/* Charts */}
            <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem'}}>
                {/* Sales Trend */}
                <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                    <h3 style={{margin: '0 0 1.5rem 0'}}>Sales Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="sales" stroke="#3182ce" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products Pie */}
                <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                    <h3 style={{margin: '0 0 1.5rem 0'}}>Top Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={topProducts}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => entry.name}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="sales"
                            >
                                {topProducts.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products Table */}
            <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                <h3 style={{margin: '0 0 1.5rem 0'}}>Best Selling Products</h3>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{borderBottom: '2px solid #e2e8f0'}}>
                            <th style={{textAlign: 'left', padding: '0.75rem', color: '#718096'}}>Product</th>
                            <th style={{textAlign: 'right', padding: '0.75rem', color: '#718096'}}>Quantity Sold</th>
                            <th style={{textAlign: 'right', padding: '0.75rem', color: '#718096'}}>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map((product, index) => (
                            <tr key={index} style={{borderBottom: '1px solid #f7fafc'}}>
                                <td style={{padding: '1rem', fontWeight: 500}}>{product.name}</td>
                                <td style={{padding: '1rem', textAlign: 'right', color: '#718096'}}>{product.quantity}</td>
                                <td style={{padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#2b6cb0'}}>
                                    ₹{product.sales.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, change, icon, color }: any) => (
    <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem'}}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: `${color}20`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <span style={{
                padding: '0.25rem 0.5rem',
                background: '#d1fae5',
                color: '#065f46',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 600
            }}>
                {change}
            </span>
        </div>
        <p style={{color: '#718096', fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>{title}</p>
        <h2 style={{margin: 0, fontSize: '1.75rem', color: '#1a202c'}}>{value}</h2>
    </div>
);

export default AnalyticsPage;
