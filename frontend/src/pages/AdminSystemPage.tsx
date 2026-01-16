import React, { useEffect, useState } from 'react';
import { getSystemMetrics, getSystemHealth } from '../services/admin.service';
import { Activity, Server, Database, Zap } from 'lucide-react';


const AdminSystemPage: React.FC = () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [metricsRes, healthRes] = await Promise.all([
                getSystemMetrics().catch(() => ({ success: false })),
                getSystemHealth().catch(() => ({ success: false }))
            ]);

            if (metricsRes.success) setMetrics(metricsRes.data.data);
            if (healthRes.success) setHealth(healthRes.data.data);
        } catch (error) {
            console.error('Failed to load system data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading system metrics...</div>;

    return (
        <div>
            <h1 style={{marginBottom: '2rem'}}>System Monitoring</h1>

            {/* Health Status */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem'}}>
                <MetricCard
                    title="API Status"
                    value={health?.status || 'Unknown'}
                    icon={<Server size={24} />}
                    color="#3182ce"
                    isStatus
                />
                <MetricCard
                    title="Database"
                    value={health?.database || 'Unknown'}
                    icon={<Database size={24} />}
                    color="#38a169"
                    isStatus
                />
                <MetricCard
                    title="Uptime"
                    value={metrics?.uptime || '0h'}
                    icon={<Activity size={24} />}
                    color="#f59e0b"
                />
                <MetricCard
                    title="Active Users"
                    value={metrics?.active_users || 0}
                    icon={<Zap size={24} />}
                    color="#9f7aea"
                />
            </div>

            {/* System Metrics */}
            <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                <h3 style={{margin: '0 0 1.5rem 0'}}>Performance Metrics</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem'}}>
                    <div>
                        <p style={{color: '#718096', fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>CPU Usage</p>
                        <div style={{display: 'flex', alignItems: 'baseline', gap: '0.5rem'}}>
                            <h2 style={{margin: 0, fontSize: '2rem'}}>{metrics?.cpu_usage || 0}%</h2>
                            <span style={{color: '#718096'}}>/ 100%</span>
                        </div>
                        <div style={{width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginTop: '0.5rem'}}>
                            <div style={{
                                width: `${metrics?.cpu_usage || 0}%`,
                                height: '100%',
                                background: '#3182ce',
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>

                    <div>
                        <p style={{color: '#718096', fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>Memory Usage</p>
                        <div style={{display: 'flex', alignItems: 'baseline', gap: '0.5rem'}}>
                            <h2 style={{margin: 0, fontSize: '2rem'}}>{metrics?.memory_usage || 0}%</h2>
                            <span style={{color: '#718096'}}>/ 100%</span>
                        </div>
                        <div style={{width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginTop: '0.5rem'}}>
                            <div style={{
                                width: `${metrics?.memory_usage || 0}%`,
                                height: '100%',
                                background: '#38a169',
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>

                    <div>
                        <p style={{color: '#718096', fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>Disk Usage</p>
                        <div style={{display: 'flex', alignItems: 'baseline', gap: '0.5rem'}}>
                            <h2 style={{margin: 0, fontSize: '2rem'}}>{metrics?.disk_usage || 0}%</h2>
                            <span style={{color: '#718096'}}>/ 100%</span>
                        </div>
                        <div style={{width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginTop: '0.5rem'}}>
                            <div style={{
                                width: `${metrics?.disk_usage || 0}%`,
                                height: '100%',
                                background: '#f59e0b',
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Stats */}
            <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                <h3 style={{margin: '0 0 1.5rem 0'}}>API Statistics</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem'}}>
                    <div>
                        <p style={{color: '#718096', fontSize: '0.9rem', margin: 0}}>Total Requests</p>
                        <h3 style={{margin: '0.5rem 0 0 0', fontSize: '1.5rem'}}>{metrics?.total_requests || 0}</h3>
                    </div>
                    <div>
                        <p style={{color: '#718096', fontSize: '0.9rem', margin: 0}}>Success Rate</p>
                        <h3 style={{margin: '0.5rem 0 0 0', fontSize: '1.5rem', color: '#38a169'}}>
                            {metrics?.success_rate || 0}%
                        </h3>
                    </div>
                    <div>
                        <p style={{color: '#718096', fontSize: '0.9rem', margin: 0}}>Avg Response Time</p>
                        <h3 style={{margin: '0.5rem 0 0 0', fontSize: '1.5rem'}}>{metrics?.avg_response_time || 0}ms</h3>
                    </div>
                    <div>
                        <p style={{color: '#718096', fontSize: '0.9rem', margin: 0}}>Error Rate</p>
                        <h3 style={{margin: '0.5rem 0 0 0', fontSize: '1.5rem', color: '#e53e3e'}}>
                            {metrics?.error_rate || 0}%
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, color, isStatus }: any) => (
    <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
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
            <div>
                <p style={{color: '#718096', fontSize: '0.9rem', margin: 0}}>{title}</p>
                <h2 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    color: isStatus ? (value === 'healthy' || value === 'connected' ? '#38a169' : '#e53e3e') : '#1a202c'
                }}>
                    {isStatus ? value.toUpperCase() : value}
                </h2>
            </div>
        </div>
    </div>
);

export default AdminSystemPage;
