import React, { useState, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.jpg';
import '../Auth.css';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { AuthContext } from '../context/AuthContext';

function Auth({ onSuccess }) {
  const { setToken, setUser } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api/auth';
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const url = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/register`;
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await axios.post(url, body);
      if (isLogin) {
        const { token, customer } = response.data;
        localStorage.setItem('token', token);

        // Set user data in context (this will also save to localStorage)
        setToken(token);
        setUser(customer);

        setSuccess('Login successful!');

        // Call onSuccess callback if provided (for protected checkout)
        if (onSuccess) {
          onSuccess(customer);
        } else {
          // Default behavior - redirect to home
          setTimeout(() => navigate('/home'), 1500);
        }
      } else {
        setSuccess('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An unexpected error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_BASE_URL}/forgot-password`, { email: resetEmail });
      setSuccess("OTP sent to your email.");
      setForgotPasswordStep(2);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send OTP.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, { email: resetEmail, otp });
      setSuccess("OTP verified! Set your new password.");
      setTempToken(response.data.token);
      setForgotPasswordStep(3);
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired OTP.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/reset-password`, { token: tempToken, newPassword });
      setSuccess("Password reset successful! Redirecting to login.");
      setForgotPasswordStep(0);
      setIsLogin(true);
      setTempToken('');
      setNewPassword('');
      setConfirmPassword('');
      setResetEmail('');
      setOtp('');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordResetForm = () => (
    <div className="auth-form">
      {forgotPasswordStep === 1 && (
        <Form onSubmit={handleForgotPasswordRequest}>
          <h2>Forgot Password</h2>
          <Form.Group className="form-group">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </Form>
      )}

      {forgotPasswordStep === 2 && (
        <Form onSubmit={handleVerifyOTP}>
          <h2>Verify OTP</h2>
          <Form.Group className="form-group">
            <Form.Label>OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </Form.Group>
          <Button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </Form>
      )}

      {forgotPasswordStep === 3 && (
        <Form onSubmit={handleResetPassword}>
          <h2>Set New Password</h2>
          <Form.Group className="form-group">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Reset Password'}
          </Button>
        </Form>
      )}
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-header">
        <img src={logo} alt="Logo" />
      </div>

      {error && <Alert variant="danger" className="auth-alert">{error}</Alert>}
      {success && <Alert variant="success" className="auth-alert">{success}</Alert>}

      {forgotPasswordStep > 0 ? (
        renderPasswordResetForm()
      ) : (
        <div className="auth-form">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <Form onSubmit={handleSubmit}>
            {!isLogin && (
              <Form.Group className="form-group">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
            )}
            <Form.Group className="form-group">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="someone@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isLogin && (
                <div className="forgot" onClick={() => setForgotPasswordStep(1)}>
                  Forgot password?
                </div>
              )}
            </Form.Group>
            <Button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Login Now' : 'Sign Up Now'}
            </Button>
          </Form>

          {isLogin && (
            <>
              <div className="divider">or</div>
              <GoogleAuthButton
                setSuccess={setSuccess}
                setError={setError}
                navigate={navigate}
              />
            </>
          )}

          <div className="signup">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
              {isLogin ? "Sign up" : "Login"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Auth;
