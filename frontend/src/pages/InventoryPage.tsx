import React, { useEffect, useState } from 'react';
import { getMyProducts, createProduct, getCategories, createCategory } from '../services/inventory.service';
import { Plus, X } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const InventoryPage: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                getMyProducts(),
                getCategories()
            ]);
            if (prodRes.success) setProducts(prodRes.data.data || []);
            
            let cats = [];
            if (catRes.success) {
                cats = catRes.data.data || [];
                // Auto-seed if empty
                if (cats.length === 0) {
                    try {
                        const seedRes = await createCategory('General');
                        if (seedRes.success) cats = [seedRes.data.data];
                    } catch (e) {
                        console.error('Failed to seed category');
                    }
                }
            }
            setCategories(cats);

        } catch (error) {
            console.error('Failed to load inventory', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);



    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h2 style={{margin: 0}}>My Inventory</h2>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    style={{
                        padding: '0.6rem 1rem',
                        background: '#3182ce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Product List */}
            {loading ? (
                <p>Loading...</p>
            ) : products.length === 0 ? (
                <div style={{textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px'}}>
                    <p style={{color: '#a0aec0'}}>No products found. Start by adding one!</p>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem'}}>
                    {products.map((p) => (
                        <div key={p.id} style={{background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                            <div style={{height: '160px', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <span style={{fontSize: '3rem', color: '#cbd5e0'}}>📦</span>
                            </div>
                            <div style={{padding: '1rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                    <h3 style={{fontSize: '1.1rem', margin: 0}}>{p.name}</h3>
                                    <span style={{fontWeight: 'bold', color: '#2b6cb0'}}>₹{p.price_per_unit}</span>
                                </div>
                                <p style={{fontSize: '0.9rem', color: '#718096', margin: '0 0 1rem 0'}}>{p.description || 'No description'}</p>
                                
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#4a5568'}}>
                                    <span>Qty: {p.available_quantity} {p.unit_type}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Product Modal (Inline for simplicity) */}
            {isFormOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60
                }}>
                    <div style={{background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                            <h3>Add New Product</h3>
                            <button onClick={() => setIsFormOpen(false)} style={{background: 'transparent', border: 'none', cursor: 'pointer'}}><X size={20}/></button>
                        </div>
                        <ProductForm 
                            categories={categories} 
                            onSuccess={() => { setIsFormOpen(false); fetchData(); }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const ProductForm = ({ categories, onSuccess }: { categories: any[], onSuccess: () => void }) => {
    const formik = useFormik({
        initialValues: {
            name: '',
            category_id: categories.length > 0 ? categories[0].id : '',
            price_per_unit: '',
            available_quantity: '',
            unit_type: 'KG', // Enum
            description: ''
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Required'),
            category_id: Yup.string().required('Required'),
            price_per_unit: Yup.number().required('Required').positive(),
            available_quantity: Yup.number().required('Required').min(1),
            description: Yup.string()
        }),
        onSubmit: async (values) => {
            try {
                // If category_id is empty (e.g. still seeding), alert user or handle
                if (!values.category_id && categories.length > 0) values.category_id = categories[0].id;

                await createProduct(values);
                onSuccess();
            } catch (error) {
                alert('Failed to create product');
            }
        },
    });

    const inputStyle = {
        width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '0.25rem', outline: 'none'
    };
    const labelStyle = { display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500, color: '#4a5568' };
    const errStyle = { color: 'red', fontSize: '0.8rem', marginBottom: '1rem' };

    return (
        <form onSubmit={formik.handleSubmit}>
            <div style={{marginBottom: '1rem'}}>
                <label style={labelStyle}>Product Name</label>
                <input style={inputStyle} {...formik.getFieldProps('name')} placeholder="e.g. Fresh Milk" />
                {formik.touched.name && formik.errors.name && <div style={errStyle}>{formik.errors.name}</div>}
            </div>

            <div style={{marginBottom: '1rem'}}>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} {...formik.getFieldProps('category_id')}>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     {categories.length === 0 && <option value="">Loading categories...</option>}
                </select>
                {formik.touched.category_id && formik.errors.category_id && <div style={errStyle}>{formik.errors.category_id as string}</div>}
            </div>

            <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <div style={{flex: 1}}>
                    <label style={labelStyle}>Price (₹)</label>
                    <input type="number" style={inputStyle} {...formik.getFieldProps('price_per_unit')} />
                    {formik.touched.price_per_unit && formik.errors.price_per_unit && <div style={errStyle}>{formik.errors.price_per_unit}</div>}
                </div>
                <div style={{flex: 1}}>
                    <label style={labelStyle}>Quantity</label>
                    <input type="number" style={inputStyle} {...formik.getFieldProps('available_quantity')} />
                    {formik.touched.available_quantity && formik.errors.available_quantity && <div style={errStyle}>{formik.errors.available_quantity}</div>}
                </div>
                <div style={{width: '80px'}}>
                    <label style={labelStyle}>Unit</label>
                    <select style={inputStyle} {...formik.getFieldProps('unit_type')}>
                        <option value="KG">KG</option>
                        <option value="LITRE">L</option>
                        <option value="UNIT">Unit</option>
                    </select>
                </div>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
                <label style={labelStyle}>Description</label>
                <textarea style={{...inputStyle, minHeight: '80px'}} {...formik.getFieldProps('description')} />
            </div>

            <button type="submit" style={{width: '100%', padding: '0.875rem', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'}}>
                Create Product
            </button>
        </form>
    );
};

export default InventoryPage;
