import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth.context";
import styles from "../styles/Auth.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;
      const res = await axios.post('http://localhost:5000/api/auth/google', { token: credential });
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
      name: "",
      email: "",
      phone: "",
      user_type: "ENTREPRENEUR", // Default
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      phone: Yup.string().required("Required"),
      user_type: Yup.string().required("Required"),
      password: Yup.string()
        .min(6, "Must be 6 chars or more")
        .required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        await register(
          values.email,
          values.password,
          values.name,
          values.phone,
          values.user_type,
        );
        toast.success("Registration successful!");
        navigate("/");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: "500px" }}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join the GoSEWA community</p>

        <form onSubmit={formik.handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              className={styles.input}
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <div className={styles.error}>{formik.errors.name}</div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                className={styles.input}
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <div className={styles.error}>{formik.errors.email}</div>
              )}
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Contact Number</label>
              <div className={styles.phoneWrapper}>
                  <span className={styles.phonePrefix}>+91</span>
                  <input
                    type="text"
                    className={styles.phoneInput}
                    {...formik.getFieldProps("phone")}
                  />
              </div>
              {formik.touched.phone && formik.errors.phone && (
                <div className={styles.error}>{formik.errors.phone}</div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>I am a:</label>
            <select
              className={styles.input}
              {...formik.getFieldProps("user_type")}
            >
              <option value="ENTREPRENEUR">Entrepreneur</option>
              <option value="GAUSHALA">Gaushala</option>
              <option value="TRANSPORTER">Transporter</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
                <input 
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
            {formik.touched.password && formik.errors.password && <div className={styles.error}>{formik.errors.password}</div>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.passwordWrapper}>
                <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className={styles.input} 
                    {...formik.getFieldProps('confirmPassword')} 
                />
                <button 
                    type="button" 
                    className={styles.eyeBtn}
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                >
                    {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className={styles.error}>{formik.errors.confirmPassword}</div>}
          </div>

          <button type="submit" className={styles.button}>
            Sign Up
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GoogleLogin
                text="signup_with"
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    toast.error('Google Login connection failed');
                }}
            />
        </div>

        <div className={styles.link}>
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
