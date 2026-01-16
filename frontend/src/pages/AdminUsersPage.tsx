import React, { useEffect, useState } from 'react';
import { getAdminUsers, verifyUser, suspendUser } from '../services/admin.service';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = filter !== 'ALL' ? { user_type: filter } : {};
            const res = await getAdminUsers(params);
            if (res.success) setUsers(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId: string) => {
        try {
            await verifyUser(userId);
            toast.success('User verified');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to verify user');
        }
    };

    const handleSuspend = async (userId: string) => {
        if (!window.confirm('Are you sure you want to suspend this user?')) return;
        try {
            await suspendUser(userId);
            toast.success('User suspended');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to suspend user');
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <h1 style={{marginBottom: '2rem'}}>User Management</h1>

            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '2rem'}}>
                {['ALL', 'ENTREPRENEUR', 'GAUSHALA', 'ADMIN'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: filter === type ? '2px solid #3182ce' : '1px solid #e2e8f0',
                            background: filter === type ? '#ebf8ff' : 'white',
                            color: filter === type ? '#2b6cb0' : '#4a5568',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: filter === type ? 600 : 400
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div style={{background: 'white', padding: '1.5rem', borderRadius: '12px'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{borderBottom: '2px solid #e2e8f0'}}>
                            <th style={{textAlign: 'left', padding: '0.75rem', color: '#718096'}}>Name</th>
                            <th style={{textAlign: 'left', padding: '0.75rem', color: '#718096'}}>Email</th>
                            <th style={{textAlign: 'left', padding: '0.75rem', color: '#718096'}}>Type</th>
                            <th style={{textAlign: 'center', padding: '0.75rem', color: '#718096'}}>Status</th>
                            <th style={{textAlign: 'center', padding: '0.75rem', color: '#718096'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{borderBottom: '1px solid #f7fafc'}}>
                                <td style={{padding: '1rem', fontWeight: 500}}>{user.full_name}</td>
                                <td style={{padding: '1rem', color: '#718096'}}>{user.email}</td>
                                <td style={{padding: '1rem'}}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: '#ebf8ff',
                                        color: '#2b6cb0',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}>
                                        {user.user_type}
                                    </span>
                                </td>
                                <td style={{padding: '1rem', textAlign: 'center'}}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: user.is_verified ? '#d1fae5' : '#fee2e2',
                                        color: user.is_verified ? '#065f46' : '#991b1b',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}>
                                        {user.is_verified ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                                <td style={{padding: '1rem', textAlign: 'center'}}>
                                    <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
                                        {!user.is_verified && (
                                            <button
                                                onClick={() => handleVerify(user.id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: '#f0fff4',
                                                    color: '#22543d',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                                title="Verify"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSuspend(user.id)}
                                            style={{
                                                padding: '0.5rem',
                                                background: '#fff5f5',
                                                color: '#e53e3e',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                            title="Suspend"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersPage;
