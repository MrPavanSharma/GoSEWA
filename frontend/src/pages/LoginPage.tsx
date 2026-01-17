import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../context/auth.context';
import styles from '../styles/Auth.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;
      const res = await axios.post('http://localhost:3000/api/v1/auth/google', { token: credential });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        toast.success('Google Login successful!');
        window.location.href = '/'; // Hard redirect to ensure state update
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google Login failed');
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        await login(values.email, values.password);
        toast.success('Login successful!');
        navigate('/'); // Redirect to Dashboard
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome</h1>

        <form onSubmit={formik.handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className={styles.error}>{formik.errors.email}</div>
            ) : null}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                {...formik.getFieldProps('password')}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className={styles.error}>{formik.errors.password}</div>
            ) : null}
          </div>

          <button type="submit" className={styles.button}>Sign In</button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast.error('Google Login connection failed');
            }}
          />
        </div>

        <div className={styles.link}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
