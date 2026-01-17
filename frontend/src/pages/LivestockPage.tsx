import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getLivestock, createLivestock, deleteLivestock, addHealthRecord, updateLivestock } from '../services/livestock.service';
import { Trash2, Heart, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

interface Livestock {
    id: string;
    tag_id: string;
    name?: string;
    rfid_tag?: string;
    type: string;
    breed: string;
    age: number;
    gender: 'MALE' | 'FEMALE';
    current_status: string;
    current_group?: string;
    lactation_number: number;
    health_status: string;
    milking_status: string;
    last_checkup?: string;
    next_due?: string;
    image?: string;
    created_at?: string;
}

const LivestockPage: React.FC = () => {
    const [livestock, setLivestock] = useState<Livestock[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [showHealthForm, setShowHealthForm] = useState(false);

    // Pagination & Filter State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [breedFilter, setBreedFilter] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLivestock();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, limit, searchTerm, statusFilter, breedFilter]);

    const fetchLivestock = async () => {
        try {
            setLoading(true);
            const res = await getLivestock({ 
                page, 
                limit, 
                search: searchTerm, 
                status: statusFilter,
                breed: breedFilter 
            });
            
            if (res.success) {
                setLivestock(res.data.data || []);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.totalPages);
                } else if (res.pagination) {
                     setTotalPages(res.pagination.totalPages);
                }
            } else if (Array.isArray(res)) {
                setLivestock(res);
            }
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
            rfid_tag: '',
            type: 'COW',
            breed: '',
            age: '',
            gender: 'FEMALE',
            current_status: 'MILKING',
            current_group: '',
            lactation_number: 0,
            entry_type: 'BIRTH',
            entry_date: new Date().toISOString().split('T')[0],
        },
        validationSchema: Yup.object({
            tag_id: Yup.string().required('Tag ID is required'),
            rfid_tag: Yup.string(),
            type: Yup.string().required('Required'),
            breed: Yup.string(),
            age: Yup.number().min(0),
            gender: Yup.string().required('Required'),
            current_status: Yup.string().required('Required'),
            lactation_number: Yup.number().min(0),
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
            rfid_tag: animal.rfid_tag || '',
            type: animal.type,
            breed: animal.breed || '',
            age: animal.age ? animal.age.toString() : '',
            gender: animal.gender || 'FEMALE',
            current_status: animal.current_status || 'MILKING',
            current_group: animal.current_group || '',
            lactation_number: animal.lactation_number || 0,
            entry_type: 'BIRTH',
            entry_date: new Date().toISOString().split('T')[0],
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



    // Handlers for search/filter should reset page to 1
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };
    
    // ... helper for pagination
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // ... existing helpers ...

    if (loading && page === 1 && !livestock.length) return <div>Loading livestock...</div>;

    return (
        <div>
            {/* Search and Filter Controls */}
            <div style={{marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <input 
                    type="text" 
                    placeholder="Search by Tag ID, RFID, Name..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px'}}
                />
                <select 
                    value={statusFilter} 
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', minWidth: '150px'}}
                >
                    <option value="">All Statuses</option>
                    <option value="MILKING">Milking</option>
                    <option value="DRY">Dry</option>
                    <option value="HEIFER">Heifer</option>
                    <option value="CALF">Calf</option>
                    <option value="SOLD">Sold</option>
                    <option value="DEAD">Dead</option>
                </select>
                <input 
                    type="text" 
                    placeholder="Filter by Breed..." 
                    value={breedFilter}
                    onChange={(e) => { setBreedFilter(e.target.value); setPage(1); }}
                    style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', minWidth: '150px'}}
                />
                <button 
                    onClick={() => {
                        setEditId(null);
                        livestockForm.resetForm();
                        setShowAddForm(true);
                    }}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginLeft: 'auto'
                    }}
                >
                    <span style={{fontSize: '1.2rem', lineHeight: 1}}>+</span> Add Animal
                </button>
            </div>

            {/* Livestock Table View */}
            <div style={{overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '800px'}}>
                    <thead>
                        <tr style={{background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
                            <th style={{padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#4a5568'}}>Tag ID</th>
                            <th style={{padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#4a5568'}}>RFID</th>
                            <th style={{padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#4a5568'}}>Type/Breed</th>
                            <th style={{padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#4a5568'}}>Group</th>
                            <th style={{padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#4a5568'}}>Status</th>
                            <th style={{padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#4a5568'}}>Lactation</th>
                            <th style={{padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#4a5568'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {livestock.map((animal) => (
                            <tr key={animal.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                                <td style={{padding: '1rem'}}>
                                    <div style={{fontWeight: 500, color: '#2d3748'}}>{animal.tag_id}</div>
                                    <div style={{fontSize: '0.875rem', color: '#718096'}}>{animal.gender}</div>
                                </td>
                                <td style={{padding: '1rem', color: '#4a5568'}}>{animal.rfid_tag || '-'}</td>
                                <td style={{padding: '1rem'}}>
                                    <div>{animal.type}</div>
                                    <div style={{fontSize: '0.875rem', color: '#718096'}}>{animal.breed}</div>
                                </td>
                                <td style={{padding: '1rem', color: '#4a5568'}}>{animal.current_group || '-'}</td>
                                <td style={{padding: '1rem'}}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        background: getStatusColor(animal.current_status),
                                        color: getStatusTextColor(animal.current_status)
                                    }}>
                                        {animal.current_status}
                                    </span>
                                </td>
                                <td style={{padding: '1rem', color: '#4a5568'}}>{animal.lactation_number || 0}</td>
                                <td style={{padding: '1rem', textAlign: 'right'}}>
                                    <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                                        <button onClick={() => handleEdit(animal)} style={{padding: '0.5rem', background: '#edf2f7', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(animal.id)} style={{padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem'}}>
                <div style={{color: '#718096', fontSize: '0.875rem'}}>
                    Page {page} of {totalPages}
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button 
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        style={{padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: page === 1 ? '#f7fafc' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer'}}
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        style={{padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: page === totalPages ? '#f7fafc' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer'}}
                    >
                        Next
                    </button>
                </div>
            </div>



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
