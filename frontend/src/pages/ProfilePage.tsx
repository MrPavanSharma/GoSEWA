import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Save, Plus, X, ZoomIn, RotateCw, MapPin } from 'lucide-react';
import styles from '../styles/Auth.module.css';
import Cropper from 'react-easy-crop';
import { getProfile, updateProfile, uploadProfilePhoto } from '../services/profile.service';
import getCroppedImg from '../utils/cropUtils';
// Import locations
import { INDIAN_STATES_CITIES, ESTABLISHMENT_YEARS } from '../utils/locations';

    interface UserProfile {
      id: number;
      full_name: string;
      email: string;
      phone: string;
      profile_image_url: string | null;
      user_type?: string;
      gaushala_name?: string;
      registration_number?: string;
      establishment_year?: number;
      ownership_type?: string;
      // Address Fields
      premises_name?: string;
      street_address?: string;
      state?: string;
      city?: string;
      pincode?: string;
    }

    const ProfilePage: React.FC = () => {
      const navigate = useNavigate();
      const [user, setUser] = useState<UserProfile | null>(null);
      const [loading, setLoading] = useState(true);
      
      // Image Upload & Crop State
      const fileInputRef = useRef<HTMLInputElement>(null);
      const [imageSrc, setImageSrc] = useState<string | null>(null);
      const [crop, setCrop] = useState({ x: 0, y: 0 });
      const [zoom, setZoom] = useState(1);
      const [rotation, setRotation] = useState(0);
      const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
      const [isEditorOpen, setIsEditorOpen] = useState(false);

      useEffect(() => {
        fetchProfile();
      }, []);

      const fetchProfile = async () => {
        try {
          const data = await getProfile();
          setUser(data);
          console.log('User Data:', data);
        } catch (error) {
          toast.error('Failed to load profile');
          navigate('/login');
        } finally {
          setLoading(false);
        }
      };

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
          full_name: user?.full_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          // Gaushala fields
          gaushala_name: user?.gaushala_name || '',
          registration_number: user?.registration_number || '',
          establishment_year: user?.establishment_year || '',
          ownership_type: user?.ownership_type || '',
          // Address Fields
          premises_name: user?.premises_name || '',
          street_address: user?.street_address || '',
          state: user?.state || '',
          city: user?.city || '',
          pincode: user?.pincode || '',
        },
        validationSchema: Yup.object({
          full_name: Yup.string().required('Name is required'),
          email: Yup.string().email('Invalid email address').required('Email is required'),
          phone: Yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
          // Conditional Validation for Gaushala
          gaushala_name: Yup.string().test('is-gaushala', 'Gaushala Name is required', function(val) {
            return user?.user_type === 'GAUSHALA' ? !!val : true;
          }),
          registration_number: Yup.string().test('is-gaushala', 'Registration Number is required', function(val) {
            return user?.user_type === 'GAUSHALA' ? !!val : true;
          }),
          establishment_year: Yup.string().test('is-gaushala', 'Year is required', function(val) {
             return user?.user_type === 'GAUSHALA' ? !!val : true;
          }),
          ownership_type: Yup.string().test('is-gaushala', 'Ownership Type is required', function(val) {
            return user?.user_type === 'GAUSHALA' ? !!val : true;
          }),
          // Address Validation
           premises_name: Yup.string().test('is-gaushala', 'Premises Name is required', function(val) {
             return user?.user_type === 'GAUSHALA' ? !!val : true;
           }),
           street_address: Yup.string().test('is-gaushala', 'Street Address is required', function(val) {
             return user?.user_type === 'GAUSHALA' ? !!val : true;
           }),
           state: Yup.string().test('is-gaushala', 'State is required', function(val) {
             return user?.user_type === 'GAUSHALA' ? !!val : true;
           }),
           city: Yup.string().test('is-gaushala', 'City is required', function(val) {
             return user?.user_type === 'GAUSHALA' ? !!val : true;
           }),
           pincode: Yup.string()
             .matches(/^[1-9][0-9]{5}$/, 'Invalid Pincode')
             .test('is-gaushala', 'Pincode is required', function(val) {
               return user?.user_type === 'GAUSHALA' ? !!val : true;
             }),
        }),
        onSubmit: async (values) => {
          try {
            await updateProfile({
              full_name: values.full_name,
              email: values.email,
              phone: values.phone,
              // Gaushala fields
              gaushala_name: values.gaushala_name,
              registration_number: values.registration_number,
              establishment_year: Number(values.establishment_year),
              ownership_type: values.ownership_type,
               // Address Fields
              premises_name: values.premises_name,
              street_address: values.street_address,
              state: values.state,
              city: values.city,
              pincode: values.pincode,
            });

            toast.success('Profile updated successfully');
            // Remove navigation call to keep user on profile page after save
            // navigate('/'); 
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
          }
        },
      });

      const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          const imageDataUrl = await readFile(file);
          setImageSrc(imageDataUrl);
          setIsEditorOpen(true);
          // Reset editor state
          setZoom(1);
          setRotation(0);
          setCrop({ x: 0, y: 0 });
        }
      };

      const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.addEventListener('load', () => resolve(reader.result as string));
          reader.readAsDataURL(file);
        });
      };

      const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
      };

      const handleSaveCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
          const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
          if (croppedImageBlob) {
            const file = new File([croppedImageBlob], "profile_photo.jpg", { type: "image/jpeg" });
            await uploadImage(file);
            setIsEditorOpen(false);
            setImageSrc(null);
          }
        } catch (e) {
          console.error(e);
          toast.error('Failed to crop image');
        }
      };

      const uploadImage = async (file: File) => {
        const toastId = toast.loading('Uploading photo...');
        try {
          await uploadProfilePhoto(file);
          await fetchProfile(); // Refresh profile to get new image URL
          toast.success('Photo updated successfully', { id: toastId });
        } catch (error) {
          console.error(error);
          toast.error('Failed to upload photo', { id: toastId });
        }
      };

      const closeEditor = () => {
        setIsEditorOpen(false);
        setImageSrc(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      };

      if (loading) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#0f172a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        );
      }

      return (
        <div style={{
          maxWidth: '1000px',
          margin: '40px auto',
          padding: '0 20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '800px' }}>
              
              {/* Personal Information Section */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                 <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: user?.profile_image_url ? `url(${user.profile_image_url}) center/cover no-repeat` : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '4px solid white',
                        boxShadow: '0 0 0 2px #e2e8f0',
                        overflow: 'hidden'
                        }}>
                        {!user?.profile_image_url && (
                            <span style={{ fontSize: '48px', fontWeight: '600', color: '#64748b' }}>
                            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        )}
                        </div>

                        {/* Plus Icon Trigger */}
                        <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            position: 'absolute',
                            bottom: '5px',
                            right: '5px',
                            background: 'linear-gradient(to right, #4299e1, #667eea)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transition: 'transform 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                        <Plus size={18} strokeWidth={3} color="white" style={{ minWidth: '18px' }} />
                        </button>
                        <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} /> Personal Information
                </h3>
                
                <form onSubmit={formik.handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label htmlFor="full_name" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          id="full_name"
                          type="text"
                          {...formik.getFieldProps('full_name')}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            fontSize: '14px',
                            border: `1px solid ${formik.touched.full_name && formik.errors.full_name ? '#ef4444' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: '#f8fafc'
                          }}
                        />
                      </div>
                      {formik.touched.full_name && formik.errors.full_name && (
                        <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.full_name}</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label htmlFor="phone" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Phone Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          id="phone"
                          type="text"
                          {...formik.getFieldProps('phone')}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            fontSize: '14px',
                            border: `1px solid ${formik.touched.phone && formik.errors.phone ? '#ef4444' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: '#f8fafc'
                          }}
                        />
                      </div>
                      {formik.touched.phone && formik.errors.phone && (
                        <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.phone}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="email" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        id="email"
                        type="email"
                        {...formik.getFieldProps('email')}
                        disabled
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 36px',
                          fontSize: '14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          outline: 'none',
                          background: '#f1f5f9',
                          color: '#64748b',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>
                  </div>

                  {/* Gaushala Specific Fields */}
                  {user?.user_type === 'GAUSHALA' && (
                    <>
                      <div style={{ height: '1px', background: '#e2e8f0', margin: '16px 0' }}></div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Gaushala Details</h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label htmlFor="gaushala_name" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Name of Gaushala</label>
                          <input
                            id="gaushala_name"
                            type="text"
                            {...formik.getFieldProps('gaushala_name')}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              fontSize: '14px',
                              border: `1px solid ${formik.touched.gaushala_name && formik.errors.gaushala_name ? '#ef4444' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              outline: 'none',
                              background: '#f8fafc'
                            }}
                          />
                          {formik.touched.gaushala_name && formik.errors.gaushala_name && (
                            <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.gaushala_name}</div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label htmlFor="registration_number" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Registration No</label>
                          <input
                            id="registration_number"
                            type="text"
                            {...formik.getFieldProps('registration_number')}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              fontSize: '14px',
                              border: `1px solid ${formik.touched.registration_number && formik.errors.registration_number ? '#ef4444' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              outline: 'none',
                              background: '#f8fafc'
                            }}
                          />
                          {formik.touched.registration_number && formik.errors.registration_number && (
                            <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.registration_number}</div>
                          )}
                        </div>

                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="establishment_year" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Year of Establishment</label>
                            <select
                                id="establishment_year"
                                {...formik.getFieldProps('establishment_year')}
                                style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: `1px solid ${formik.touched.establishment_year && formik.errors.establishment_year ? '#ef4444' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                outline: 'none',
                                background: '#f8fafc',
                                appearance: 'auto'
                                }}
                            >
                                <option value="">Select Year</option>
                                {ESTABLISHMENT_YEARS.map(year => (
                                <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            {formik.touched.establishment_year && formik.errors.establishment_year && (
                                <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.establishment_year}</div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label htmlFor="ownership_type" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Type of Ownership</label>
                          <select
                            id="ownership_type"
                            {...formik.getFieldProps('ownership_type')}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              fontSize: '14px',
                              border: `1px solid ${formik.touched.ownership_type && formik.errors.ownership_type ? '#ef4444' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              outline: 'none',
                              background: '#f8fafc'
                            }}
                          >
                            <option value="">Select Type</option>
                            <option value="trust">Trust</option>
                            <option value="individual">Individual</option>
                            <option value="private">Private</option>
                            <option value="government">Government</option>
                            <option value="ngo">NGO</option>
                            <option value="other">Other</option>
                          </select>
                          {formik.touched.ownership_type && formik.errors.ownership_type && (
                            <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.ownership_type}</div>
                          )}
                        </div>
                      </div>

                      <div style={{ height: '1px', background: '#e2e8f0', margin: '16px 0' }}></div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <MapPin size={20} />  Address Details
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="premises_name" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Premises Name / Building</label>
                            <input
                            id="premises_name"
                            type="text"
                            {...formik.getFieldProps('premises_name')}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: `1px solid ${formik.touched.premises_name && formik.errors.premises_name ? '#ef4444' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                outline: 'none',
                                background: '#f8fafc'
                            }}
                            />
                            {formik.touched.premises_name && formik.errors.premises_name && (
                            <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.premises_name}</div>
                            )}
                        </div>

                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="street_address" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Street Address</label>
                            <input
                            id="street_address"
                            type="text"
                            {...formik.getFieldProps('street_address')}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: `1px solid ${formik.touched.street_address && formik.errors.street_address ? '#ef4444' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                outline: 'none',
                                background: '#f8fafc'
                            }}
                            />
                            {formik.touched.street_address && formik.errors.street_address && (
                            <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.street_address}</div>
                            )}
                        </div>
                      </div>

                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="state" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>State</label>
                            <select
                                id="state"
                                {...formik.getFieldProps('state')}
                                onChange={(e) => {
                                   formik.handleChange(e);
                                   formik.setFieldValue('city', ''); // Reset city on state change
                                }}
                                style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: `1px solid ${formik.touched.state && formik.errors.state ? '#ef4444' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                outline: 'none',
                                background: '#f8fafc'
                                }}
                            >
                                <option value="">Select State</option>
                                {Object.keys(INDIAN_STATES_CITIES).map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            {formik.touched.state && formik.errors.state && (
                                <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.state}</div>
                            )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="city" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>City</label>
                            <select
                                id="city"
                                {...formik.getFieldProps('city')}
                                disabled={!formik.values.state}
                                style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: `1px solid ${formik.touched.city && formik.errors.city ? '#ef4444' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                outline: 'none',
                                background: '#f8fafc',
                                cursor: !formik.values.state ? 'not-allowed' : 'auto'
                                }}
                            >
                                <option value="">Select City</option>
                                {formik.values.state && INDIAN_STATES_CITIES[formik.values.state]?.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            {formik.touched.city && formik.errors.city && (
                                <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.city}</div>
                            )}
                            </div>

                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="pincode" style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Pincode</label>
                            <input
                                id="pincode"
                                type="text"
                                maxLength={6}
                                {...formik.getFieldProps('pincode')}
                                style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: `1px solid ${formik.touched.pincode && formik.errors.pincode ? '#ef4444' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                outline: 'none',
                                background: '#f8fafc'
                                }}
                            />
                            {formik.touched.pincode && formik.errors.pincode && (
                                <div style={{ fontSize: '12px', color: '#ef4444' }}>{formik.errors.pincode}</div>
                            )}
                            </div>
                       </div>
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button
                      type="submit"
                      disabled={!formik.isValid || formik.isSubmitting}
                      className={styles.button}
                      style={{
                        width: 'auto',
                        marginTop: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: (!formik.isValid || formik.isSubmitting) ? 0.7 : 1,
                      }}
                    >
                      {formik.isSubmitting ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Image Editor Modal */}
          {isEditorOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backdropFilter: 'blur(5px)'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '500px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{
                   padding: '16px 24px',
                   borderBottom: '1px solid #e2e8f0',
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Edit Photo</h3>
                  <button 
                    onClick={closeEditor}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div style={{ position: 'relative', height: '300px', background: '#333' }}>
                  <Cropper
                    image={imageSrc || ''}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                  />
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                      <span>Zoom</span>
                      <ZoomIn size={16} />
                    </div>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#0f172a' }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                      <span>Rotation</span>
                      <RotateCw size={16} />
                    </div>
                     <input
                      type="range"
                      value={rotation}
                      min={0}
                      max={360}
                      step={1}
                      aria-labelledby="Rotation"
                      onChange={(e) => setRotation(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#0f172a' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      onClick={closeEditor}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        color: '#64748b',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCroppedImage}
                      className={styles.button}
                      style={{
                          width: 'auto',
                          marginTop: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 24px' 
                      }}
                    >
                      <Save size={16} /> Save Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default ProfilePage;
