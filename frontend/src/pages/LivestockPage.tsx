import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getLivestock, createLivestock, deleteLivestock, addHealthRecord, updateLivestock } from '../services/livestock.service';
import { Plus, Trash2, Heart, Activity, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const LivestockPage: React.FC = () => {
    const [livestock, setLivestock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [showHealthForm, setShowHealthForm] = useState(false);

    useEffect(() => {
        fetchLivestock();
    }, []);

    const fetchLivestock = async () => {
        try {
            setLoading(true);
            const res = await getLivestock();
            if (res.success) setLivestock(res.data.data || []);
        } catch (error) {
            console.error('Failed to load livestock', error);
            toast.error('Failed to load livestock');
        } finally {
            setLoading(false);
        }
    };

    const livestockForm = useFormik({
        initialValues: {
            tag_id: '',
            type: 'COW',
            breed: '',
            age: '',
            health_status: 'HEALTHY'
        },
        validationSchema: Yup.object({
            tag_id: Yup.string().required('Required'),
            type: Yup.string().required('Required'),
            breed: Yup.string(),
            age: Yup.number().min(0),
        }),
        onSubmit: async (values) => {
            try {
                if (editId) {
                    await updateLivestock(editId, {
                        ...values,
                        age: values.age ? parseInt(values.age) : undefined
                    });
                    toast.success('Livestock updated successfully!');
                } else {
                    await createLivestock({
                        ...values,
                        age: values.age ? parseInt(values.age) : undefined
                    });
                    toast.success('Livestock added successfully!');
                }
                setShowAddForm(false);
                setEditId(null);
                livestockForm.resetForm();
                fetchLivestock();
            } catch (error: any) {
                toast.error(error.response?.data?.message || `Failed to ${editId ? 'update' : 'add'} livestock`);
            }
        },
    });

    const handleEdit = (animal: any) => {
        setEditId(animal.id);
        livestockForm.setValues({
            tag_id: animal.tag_id,
            type: animal.type,
            breed: animal.breed || '',
            age: animal.age ? animal.age.toString() : '',
            health_status: animal.health_status
        });
        setShowAddForm(true);
    };

    const healthForm = useFormik({
        initialValues: {
            checkup_date: new Date().toISOString().split('T')[0],
            diagnosis: '',
            treatment: '',
            vet_name: ''
        },
        validationSchema: Yup.object({
            checkup_date: Yup.string().required('Required'),
            diagnosis: Yup.string().required('Required'),
        }),
        onSubmit: async (values) => {
            try {
                await addHealthRecord(selectedAnimal.id, values);
                toast.success('Health record added!');
                setShowHealthForm(false);
                healthForm.resetForm();
                setSelectedAnimal(null);
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to add health record');
            }
        },
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this livestock?')) return;
        try {
            await deleteLivestock(id);
            toast.success('Livestock removed');
            fetchLivestock();
        } catch (error) {
            toast.error('Failed to remove livestock');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'HEALTHY': return '#d1fae5';
            case 'SICK': return '#fee2e2';
            case 'UNDER_TREATMENT': return '#fef3c7';
            default: return '#f3f4f6';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'HEALTHY': return '#065f46';
            case 'SICK': return '#991b1b';
            case 'UNDER_TREATMENT': return '#92400e';
            default: return '#374151';
        }
    };

    if (loading) return <div>Loading livestock...</div>;

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h1 style={{margin: 0}}>Livestock Management</h1>
                <button
                    onClick={() => {
                        setEditId(null);
                        livestockForm.resetForm();
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
                    <Plus size={20} /> Add Livestock
                </button>
            </div>

            {/* Livestock Grid */}
            {livestock.length === 0 ? (
                <div style={{textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px'}}>
                    <Activity size={64} style={{color: '#cbd5e0', margin: '0 auto 1rem'}} />
                    <h2 style={{color: '#4a5568', marginBottom: '0.5rem'}}>No livestock registered</h2>
                    <p style={{color: '#a0aec0'}}>Add your first animal to start tracking</p>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem'}}>
                    {livestock.map((animal) => (
                        <div key={animal.id} style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem'}}>
                                <div>
                                    <h3 style={{margin: '0 0 0.5rem 0'}}>Tag: {animal.tag_id}</h3>
                                    <p style={{color: '#718096', fontSize: '0.9rem', margin: 0}}>
                                        {animal.type} • {animal.breed || 'Unknown breed'}
                                    </p>
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: getStatusColor(animal.health_status),
                                    color: getStatusTextColor(animal.health_status),
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    {animal.health_status}
                                </span>
                            </div>

                            <div style={{marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #f7fafc'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                    <span style={{color: '#718096'}}>Age:</span>
                                    <span style={{fontWeight: 500}}>{animal.age || 'N/A'} years</span>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <span style={{color: '#718096'}}>Added:</span>
                                    <span style={{fontWeight: 500}}>
                                        {new Date(animal.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div style={{display: 'flex', gap: '0.5rem'}}>
                                <button
                                    onClick={() => handleEdit(animal)}
                                    style={{
                                        padding: '0.75rem',
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
                                    onClick={() => {
                                        setSelectedAnimal(animal);
                                        setShowHealthForm(true);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: '#ebf8ff',
                                        color: '#2b6cb0',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Heart size={16} /> Health Record
                                </button>
                                <button
                                    onClick={() => handleDelete(animal.id)}
                                    style={{
                                        padding: '0.75rem',
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
                        </div>
                    ))}
                </div>
            )}

            {/* Add Livestock Modal */}
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
                    <div style={{background: 'white', padding: '2rem', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflowY: 'auto'}}>
                        <h2 style={{margin: '0 0 1.5rem 0'}}>{editId ? 'Edit Livestock' : 'Add New Livestock'}</h2>
                        <form onSubmit={livestockForm.handleSubmit}>
                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Tag ID</label>
                                <input
                                    type="text"
                                    {...livestockForm.getFieldProps('tag_id')}
                                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                />
                            </div>

                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Type</label>
                                <select
                                    {...livestockForm.getFieldProps('type')}
                                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                >
                                    <option value="COW">Cow</option>
                                    <option value="BUFFALO">Buffalo</option>
                                    <option value="CALF">Calf</option>
                                    <option value="BULL">Bull</option>
                                </select>
                            </div>

                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Breed</label>
                                <input
                                    type="text"
                                    {...livestockForm.getFieldProps('breed')}
                                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                />
                            </div>

                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Age (years)</label>
                                <input
                                    type="number"
                                    {...livestockForm.getFieldProps('age')}
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
                                    {editId ? 'Update Livestock' : 'Add Livestock'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditId(null);
                                        livestockForm.resetForm();
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

            {/* Health Record Modal */}
            {showHealthForm && selectedAnimal && (
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
                        <h2 style={{margin: '0 0 1.5rem 0'}}>Add Health Record - {selectedAnimal.tag_id}</h2>
                        <form onSubmit={healthForm.handleSubmit}>
                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Checkup Date</label>
                                <input
                                    type="date"
                                    {...healthForm.getFieldProps('checkup_date')}
                                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                />
                            </div>

                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Diagnosis</label>
                                <textarea
                                    {...healthForm.getFieldProps('diagnosis')}
                                    rows={3}
                                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                />
                            </div>

                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Treatment</label>
                                <textarea
                                    {...healthForm.getFieldProps('treatment')}
                                    rows={2}
                                    style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px'}}
                                />
                            </div>

                            <div style={{marginBottom: '1rem'}}>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Vet Name</label>
                                <input
                                    type="text"
                                    {...healthForm.getFieldProps('vet_name')}
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
                                    Add Record
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowHealthForm(false);
                                        setSelectedAnimal(null);
                                        healthForm.resetForm();
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

export default LivestockPage;
