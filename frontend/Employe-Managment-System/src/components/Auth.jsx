import React, { useState } from 'react';
import { api } from '../api';
import { Lock, Mail, User as UserIcon, LogIn, UserPlus, ArrowRight, AlertCircle, Key, CheckCircle } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Email and Password are required');
    resetMessages();
    setLoading(true);

    try {
      const res = await api.login(email, password);
      onAuthSuccess(res.data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('All fields are required');
    resetMessages();
    setLoading(true);

    try {
      await api.register(name, email, password, role);
      setSuccessMsg('Account registered successfully! Please log in.');
      setView('login');
      // Clear password for safety
      setPassword('');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    resetMessages();
    setLoading(true);

    try {
      await api.forgotPassword(email);
      setSuccessMsg('OTP sent to your email. Please check your inbox.');
      setView('reset');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !otp || !password) return setError('All fields are required');
    resetMessages();
    setLoading(true);

    try {
      await api.resetPassword(email, otp, password);
      setSuccessMsg('Password reset successfully! Please log in with your new password.');
      setView('login');
      setPassword('');
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}>
      <div className="glass-panel animate-fade-in" style={styles.authCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {view === 'login' && 'Sign In'}
            {view === 'register' && 'Create Account'}
            {view === 'forgot' && 'Forgot Password'}
            {view === 'reset' && 'Reset Password'}
          </h2>
          <p style={styles.subtitle}>
            {view === 'login' && 'Access the Employee Management Portal'}
            {view === 'register' && 'Join the workforce management system'}
            {view === 'forgot' && 'Request a password reset OTP'}
            {view === 'reset' && 'Create your new password'}
          </p>
        </div>

        {error && (
          <div style={styles.alertError}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={styles.alertSuccess}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {view === 'login' && (
          <form onSubmit={handleLogin} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} size={18} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={styles.labelRow}>
                <label className="form-label">Password</label>
                <span 
                  onClick={() => { resetMessages(); setView('forgot'); }} 
                  style={styles.forgotLink}
                >
                  Forgot?
                </span>
              </div>
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} size={18} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
              {loading ? <div className="loader" /> : (
                <>
                  <span>Sign In</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={handleRegister} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={styles.inputWrapper}>
                <UserIcon style={styles.inputIcon} size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} size={18} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="john.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} size={18} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Type / Role</label>
              <select 
                className="form-select" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
              {loading ? <div className="loader" /> : (
                <>
                  <span>Register Account</span>
                  <UserPlus size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Account Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} size={18} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
              {loading ? <div className="loader" /> : (
                <>
                  <span>Send Reset OTP</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {view === 'reset' && (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Registered Email</label>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} size={18} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">OTP Verification Code</label>
              <div style={styles.inputWrapper}>
                <Key style={styles.inputIcon} size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} size={18} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
              {loading ? <div className="loader" /> : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          {view === 'login' && (
            <p style={styles.footerText}>
              Don't have an account?{' '}
              <span onClick={() => { resetMessages(); setView('register'); }} style={styles.footerLink}>
                Register here
              </span>
            </p>
          )}

          {view === 'register' && (
            <p style={styles.footerText}>
              Already have an account?{' '}
              <span onClick={() => { resetMessages(); setView('login'); }} style={styles.footerLink}>
                Sign in
              </span>
            </p>
          )}

          {(view === 'forgot' || view === 'reset') && (
            <p style={styles.footerText}>
              Remembered your password?{' '}
              <span onClick={() => { resetMessages(); setView('login'); }} style={styles.footerLink}>
                Go back
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  authContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  authCard: {
    width: '100%',
    maxWidth: '450px',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, var(--text-primary), #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  alertError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  alertSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#a7f3d0',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '15px',
    color: 'var(--text-muted)',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    color: 'var(--color-primary)',
    cursor: 'pointer',
    fontSize: '0.825rem',
    fontWeight: '500',
    transition: 'var(--transition-smooth)',
  },
  submitBtn: {
    marginTop: '10px',
    width: '100%',
    height: '48px',
  },
  footer: {
    marginTop: '25px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  footerLink: {
    color: 'var(--color-primary)',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline',
  },
};
