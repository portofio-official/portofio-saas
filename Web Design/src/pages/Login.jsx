import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Default to login mode
  const [phone, setPhone] = useState('');

  // Update tab title dynamically
  useEffect(() => {
    document.title = isLogin ? "Login - Portofio" : "Create Account - Portofio";
  }, [isLogin]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Hanya boleh angka
    
    // Jika diawali angka 0, otomatis ubah jadi 62
    if (val.startsWith('0')) {
      val = '62' + val.substring(1);
    } 
    // Jika diawali angka selain 6 (misal langsung mengetik 8), tambahkan 62 di depannya
    else if (val.length > 0 && !val.startsWith('6')) {
      val = '62' + val;
    }
    
    setPhone(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Login submitted");
    } else {
      console.log("Register submitted");
    }
  };

  return (
    <div className="login-page-container">
      {/* Left Side: Image and Branding */}
      <div className="login-left">
        {/* Background Image (Professional Workspace) */}
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

        {/* Back to Website Link */}
        <Link to="/" className="login-back-link">
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>arrow_back</span>
          <span>Back</span>
        </Link>

        {/* Content */}
        <div className="login-content">
          <div style={{ marginBottom: '3rem' }}>
            <img src="/Logo Portofio - 3.png" alt="Portofio Logo" style={{ height: '36px', objectFit: 'contain' }} />
          </div>

          <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1>
              Your Work,<br/>
              <span className="highlight">Beautifully</span> Showcased.
            </h1>
            <p>
              Sign in to manage your portfolio, customize your templates, and track your analytics in one unified dashboard.
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
          {isLogin ? (
            <Link to="/" className="mobile-back-btn">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
          ) : (
            <button 
              type="button" 
              className="mobile-back-btn" 
              onClick={() => setIsLogin(true)}
              style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          {isLogin ? <h1 className="mobile-nav-title">Login</h1> : <div></div>}
          <div style={{ width: '2.5rem' }}></div> {/* Spacer for perfect centering */}
        </div>

        <div className="form-wrapper">
          {/* Header */}
          <div className="form-header">
            <h2>{isLogin ? "Welcome to Portofio" : "Create an Account"}</h2>
            <p>{isLogin ? "Please enter your details to sign in." : "Fill in your details below to get started."}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            
            {/* Registration Fields */}
            {!isLogin && (
              <>
                <div className="name-row">
                  <div className="input-group">
                    <label htmlFor="firstName">First Name</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>person</span>
                      </div>
                      <input type="text" id="firstName" name="firstName" placeholder="First Name" className="input-field" required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="lastName">Last Name</label>
                    <div className="input-wrapper no-icon">
                      <input type="text" id="lastName" name="lastName" placeholder="Last Name" className="input-field" required />
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>call</span>
                    </div>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="e.g. 6281234567890" 
                      pattern="^62[0-9]{8,15}$"
                      title="Phone number must start with '62' without the '+' sign (e.g. 6281234567890)"
                      className="input-field" 
                      required 
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>mail</span>
                </div>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  className="input-field" 
                  required 
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>lock</span>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  className="input-field" 
                  required 
                />
                {/* Show/Hide Password Toggle */}
                <button type="button" className="eye-button" onClick={togglePassword} aria-label="Toggle password visibility">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>lock</span>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    placeholder="Confirm your password" 
                    className="input-field" 
                    required 
                  />
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password (Only Login) */}
            {isLogin && (
              <div className="form-options">
                <label className="remember-me" htmlFor="remember-me">
                  <input id="remember-me" name="remember-me" type="checkbox" />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-login">
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
            
          </form>

          {/* Footer Text */}
          <div className="login-footer">
            {isLogin ? (
              <p>Don't have an account? <a href="#signup" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>Sign up for free</a></p>
            ) : (
              <p>Already have an account? <a href="#signin" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>Sign in here</a></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
