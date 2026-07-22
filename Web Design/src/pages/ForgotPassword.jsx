import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Reuse login layout styles
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();
  
  // Refs for OTP inputs
  const otpRefs = [
    useRef(null), useRef(null), useRef(null), 
    useRef(null), useRef(null), useRef(null)
  ];

  // Auto focus first OTP input when reaching step 2
  useEffect(() => {
    document.title = "Forgot Password - Portofio"; // Update tab title

    if (step === 2 && otpRefs[0].current) {
      otpRefs[0].current.focus();
    }
  }, [step]);

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (contact) {
      setStep(2);
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      alert('OTP Verified! In a real app, you would reset the password here.');
      navigate('/login');
    }
  };

  const handleOtpChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, ''); // only allow numbers
    
    if (value.length > 0) {
      // Update state
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Move focus to next input
      if (index < 5) {
        otpRefs[index + 1].current.focus();
      }
    } else {
      // If deleted
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move to previous on backspace if empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="login-page-container">
      {/* Left Side: Image and Branding */}
      <div className="login-left">
        {/* Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
          alt="Workspace Background" 
          className="login-bg-img"
        />
        
        {/* Gradient Overlay */}
        <div className="login-image-overlay"></div>

        {/* Decorative Blobs */}
        <div className="blob-shape blob-1"></div>
        <div className="blob-shape blob-2"></div>


        {/* Content */}
        <div className="login-content">
          <div style={{ marginBottom: '3rem' }}>
            <img src="/Logo Portofio - 3.png" alt="Portofio Logo" style={{ height: '36px', objectFit: 'contain' }} />
          </div>

          <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1>
              Lost access?<br/>
              <span className="highlight" style={{ fontStyle: 'italic', fontWeight: 300 }}>We've got</span> you covered.
            </h1>
            <p>
              Securely reset your password and get back to managing your beautiful portfolio in no time.
            </p>
          </div>

          <div className="login-features">
            <div className="feature-icons">
              <div>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>brush</span>
              </div>
              <div>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>bar_chart</span>
              </div>
              <div>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>public</span>
              </div>
            </div>
            <span>Portofio Creator Studio</span>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="login-right">
        {/* Mobile Navbar */}
        <div className="mobile-navbar">
          <Link to="/login" className="mobile-back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          {/* Navbar dikosongkan tanpa teks */}
        </div>

        <div className="form-wrapper relative" style={{ overflow: 'hidden' }}>
          
          {/* STEP 1: Input Email/Phone */}
          <div className={`step-container ${step === 1 ? 'step-active' : 'step-hidden'}`}>
            <div className="form-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" style={{ color: 'inherit', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Back to Login">
                  <span className="material-symbols-outlined" style={{ fontSize: '1em', marginTop: '2px' }}>arrow_back</span>
                </Link>
                Forgot Password
              </h2>
              <p>Enter your email or phone number to receive a secure OTP code.</p>
            </div>

            <form onSubmit={handleSendOTP} className="login-form">
              <div className="input-group">
                <label htmlFor="contact">Email / Phone Number</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>account_circle</span>
                  </div>
                  <input 
                    type="text" 
                    id="contact" 
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. name@domain.com or 62812345678" 
                    className="input-field" 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn-login" style={{ marginTop: '0.5rem' }}>
                Send OTP Code
              </button>
            </form>
          </div>

          {/* STEP 2: Input OTP */}
          <div className={`step-container ${step === 2 ? 'step-active' : 'step-hidden'}`}>
            <div className="form-header">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', padding: 0 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_back</span>
                Change Contact Info
              </button>
              <h2>Verify OTP</h2>
              <p>We've sent a 6-digit code to <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{contact}</span>. Enter it below.</p>
            </div>

            <form onSubmit={handleVerifyOTP} className="login-form">
              {/* OTP Boxes */}
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {otp.map((digit, index) => (
                  <input 
                    key={index}
                    ref={otpRefs[index]}
                    type="text" 
                    maxLength={1} 
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="otp-input" 
                    required 
                  />
                ))}
              </div>

              <button type="submit" className="btn-login" style={{ backgroundColor: 'var(--text-primary)' }}>
                Verify & Continue
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Didn't receive the code?{' '}
                  <button type="button" onClick={() => alert('OTP Resent!')} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 500, cursor: 'pointer' }}>
                    Resend OTP
                  </button>
                </p>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
