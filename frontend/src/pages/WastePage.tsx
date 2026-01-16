import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getWasteLogs, createWasteLog, getWasteStats, deleteWasteLog, updateWasteLog } from '../services/waste.service';
import { Plus, Trash2, TrendingUp, Calendar, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const WastePage: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [logsRes, statsRes] = await Promise.all([
                getWasteLogs(),
                getWasteStats().catch(() => ({ success: false }))
            ]);

            if (logsRes.success) setLogs(logsRes.data.data || []);
            if (statsRes.success) setStats(statsRes.data.data);
        } catch (error) {
            console.error('Failed to load waste data', error);
            toast.error('Failed to load waste logs');
        } finally {
            setLoading(false);
        }
    };

    const wasteForm = useFormik({
        initialValues: {
            waste_type: 'COW_DUNG',
            quantity: '',
            unit: 'KG',
            collection_date: new Date().toISOString().split('T')[0],
            notes: ''
        },
        validationSchema: Yup.object({
            waste_type: Yup.string().required('Required'),
            quantity: Yup.number().min(0.1, 'Must be greater than 0').required('Required'),
            unit: Yup.string().required('Required'),
            collection_date: Yup.string().required('Required'),
        }),
        onSubmit: async (values) => {
            try {
                if (editId) {
                    await updateWasteLog(editId, {
                        ...values,
                        quantity: parseFloat(values.quantity)
                    });
                    toast.success('Waste log updated successfully!');
                } else {
                    await createWasteLog({
                        ...values,
                        quantity: parseFloat(values.quantity)
                    });
                    toast.success('Waste log added successfully!');
                }
                setShowAddForm(false);
                setEditId(null);
                wasteForm.resetForm();
                fetchData();
            } catch (error: any) {
                toast.error(error.response?.data?.message || `Failed to ${editId ? 'update' : 'add'} waste log`);
            }
        },
    });

    const handleEdit = (log: any) => {
        setEditId(log.id);
        wasteForm.setValues({
            waste_type: log.waste_type,
            quantity: log.quantity.toString(),
            unit: log.unit,
            collection_date: log.collection_date.split('T')[0],
            notes: log.notes || ''
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this log?')) return;
        try {
            await deleteWasteLog(id);
            toast.success('Log deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete log');
        }
    };

    const getWasteTypeLabel = (type: string) => {
        const labels: any = {
            'COW_DUNG': 'Cow Dung',
            'URINE': 'Urine',
            'BIOGAS_SLURRY': 'Biogas Slurry',
            'OTHER': 'Other'
        };
        return labels[type] || type;
    };

    if (loading) return <div>Loading waste logs...</div>;

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h1 style={{margin: 0}}>Waste Logging</h1>
                <button
                    onClick={() => {
                        setEditId(null);
                        wasteForm.resetForm();
                        setShowAddForm(true);
                    }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#3182ce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Plus size={20} /> Log Waste
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem'}}>
                    <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                background: '#ebf8ff',
                                color: '#3182ce',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p style={{color: '#718096', fontSize: '0.9rem', margin: 0}}>Total This Month</p>
                                <h2 style={{margin: 0, fontSize: '1.75rem'}}>{stats.total_month || 0} KG</h2>
                            </div>
                        </div>
                    </div>

                    <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                background: '#f0fff4',
                                color: '#38a169',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p style={{color: '#718096', fontSize: '0.9rem', margin: 0}}>Today's Collection</p>
                                <h2 style={{margin: 0, fontSize: '1.75rem'}}>{stats.total_today || 0} KG</h2>
                            </div>
                        </div>
                    </div>

                    <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                background: '#fffaf0',
                                color: '#f59e0b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                📊
                            </div>
                            <div>
                                <p style={{color: '#718096', fontSize: '0.9rem', margin: 0}}>Avg Daily</p>
                                <h2 style={{margin: 0, fontSize: '1.75rem'}}>{stats.avg_daily || 0} KG</h2>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Waste Logs Table */}
            <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                <h3 style={{margin: '0 0 1.5rem 0'}}>Recent Logs</h3>
                
                {logs.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '3rem', color: '#a0aec0'}}>
                        <p>No waste logs yet. Start logging your daily waste collection!</p>
                    </div>
                ) : (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{borderBottom: '2px solid #e2e8f0'}}>
                                <th style={{textAlign: 'left', padding: '0.75rem', color: '#718096'}}>Date</th>
                                <th style={{textAlign: 'left', padding: '0.75rem', color: '#718096'}}>Type</th>
                                <th style={{textAlign: 'right', padding: '0.75rem', color: '#718096'}}>Quantity</th>
                                <th style={{textAlign: 'left', padding: '0.75rem', color: '#718096'}}>Notes</th>
                                <th style={{textAlign: 'center', padding: '0.75rem', color: '#718096'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} style={{borderBottom: '1px solid #f7fafc'}}>
                                    <td style={{padding: '1rem', fontWeight: 500}}>
                                        {new Date(log.collection_date).toLocaleDateString()}
                                    </td>
                                    <td style={{padding: '1rem'}}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: '#ebf8ff',
                                            color: '#2b6cb0',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600
                                        }}>
                                            {getWasteTypeLabel(log.waste_type)}
                                        </span>
                                    </td>
                                    <td style={{padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#2b6cb0'}}>
                                        {log.quantity} {log.unit}
                                    </td>
                                    <td style={{padding: '1rem', color: '#718096'}}>
                                        {log.notes || '-'}
                                    </td>
                                    <td style={{padding: '1rem', textAlign: 'center'}}>
                                        <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem'}}>
                                            <button
                                                onClick={() => handleEdit(log)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: '#edf2f7',
                                                    color: '#4a5568',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(log.id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: '#fff5f5',
                                                    color: '#e53e3e',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Waste Log Modal */}
            {showAddForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{background: 'white', padding: '2rem', borderRadius: '12px', width: '500px'}}>
                        <h2 style={{margin: '0 0 1.5rem 0'}}>{editId ? 'Edit Waste Log' : 'Log Waste Collection'}</h2>
                        <form onSubmit={wasteForm.handleSubmit}>
                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Waste Type</label>
                                <select
                                    {...wasteForm.getFieldProps('waste_type')}
                                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                >
                                    <option value="COW_DUNG">Cow Dung</option>
                                    <option value="URINE">Urine</option>
                                    <option value="BIOGAS_SLURRY">Biogas Slurry</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Quantity</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...wasteForm.getFieldProps('quantity')}
                                        style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                    />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Unit</label>
                                    <select
                                        {...wasteForm.getFieldProps('unit')}
                                        style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                    >
                                        <option value="KG">KG</option>
                                        <option value="LITERS">Liters</option>
                                        <option value="TONS">Tons</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Collection Date</label>
                                <input
                                    type="date"
                                    {...wasteForm.getFieldProps('collection_date')}
                                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                />
                            </div>

                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Notes (Optional)</label>
                                <textarea
                                    {...wasteForm.getFieldProps('notes')}
                                    rows={3}
                                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                />
                            </div>

                            <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem',
                                        background: '#3182ce',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editId ? 'Update Log' : 'Add Log'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditId(null);
                                        wasteForm.resetForm();
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem',
                                        background: '#f7fafc',
                                        color: '#4a5568',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WastePage;
