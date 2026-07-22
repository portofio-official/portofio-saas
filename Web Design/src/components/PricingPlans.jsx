import React, { useState } from 'react';
import './PricingPlans.css';

function PricingPlans() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="pricing-section" id="pricing">
      <div className="container reveal-on-scroll">
        <div className="pricing-header">
          <h2>Simple, Transparent <span className="text-highlight">Pricing</span></h2>
          <p>Start for free, upgrade when you need more power. Cancel anytime.</p>
          
          <div className="billing-toggle">
            <span className={!isAnnual ? 'active' : ''}>Monthly</span>
            <button 
              className={`toggle-btn ${isAnnual ? 'annual' : ''}`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <div className="toggle-circle"></div>
            </button>
            <span className={isAnnual ? 'active' : ''}>
              Annually <span className="save-badge">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="pricing-grid">
          {/* Basic Tier */}
          <div className="pricing-card">
            <div className="card-header">
              <h3>Basic</h3>
              <p>Perfect to get started</p>
            </div>
            <div className="card-price">
              <span className="currency">IDR</span>
              <span className="amount">{isAnnual ? '350.000' : '49.000'}</span>
              <span className="period">{isAnnual ? '/yr' : '/mo'}</span>
            </div>
            <button className="btn-pricing outline">Get Started</button>
            <div className="card-features">
              <p className="features-title">What's included:</p>
              <ul>
                <li><span className="icon check">✓</span> 1 Portfolio Website</li>
                <li><span className="icon check">✓</span> Standard Templates</li>
                <li><span className="icon check">✓</span> Portofio Subdomain</li>
                <li><span className="icon cross">✕</span> Custom Domain</li>
                <li><span className="icon cross">✕</span> Advanced Analytics</li>
              </ul>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="pricing-card">
            <div className="card-header">
              <h3>Premium</h3>
              <p>For serious creators</p>
            </div>
            <div className="card-price">
              <span className="currency">IDR</span>
              <span className="amount">{isAnnual ? '650.000' : '79.000'}</span>
              <span className="period">{isAnnual ? '/yr' : '/mo'}</span>
            </div>
            <button className="btn-pricing outline">Get Started</button>
            <div className="card-features">
              <p className="features-title">Everything in Free, plus:</p>
              <ul>
                <li><span className="icon check">✓</span> 5 Portfolio Websites</li>
                <li><span className="icon check">✓</span> Premium Templates</li>
                <li><span className="icon check">✓</span> Custom Domain Support</li>
                <li><span className="icon check">✓</span> Basic Analytics</li>
                <li><span className="icon check">✓</span> Remove Branding</li>
              </ul>
            </div>
          </div>

          {/* Custom Tier */}
          <div className="pricing-card">
            <div className="card-header">
              <h3>Custom</h3>
              <p>For agencies and studios</p>
            </div>
            <div className="card-price">
              <span className="currency">IDR</span>
              <span className="amount">{isAnnual ? '1.300.000' : '149.000'}</span>
              <span className="period">{isAnnual ? '/yr' : '/mo'}</span>
            </div>
            <button className="btn-pricing outline">Contact Sales</button>
            <div className="card-features">
              <p className="features-title">Everything in Pro, plus:</p>
              <ul>
                <li><span className="icon check">✓</span> Unlimited Websites</li>
                <li><span className="icon check">✓</span> Advanced Analytics</li>
                <li><span className="icon check">✓</span> Client Handoff Tools</li>
                <li><span className="icon check">✓</span> Custom CSS/JS</li>
                <li><span className="icon check">✓</span> Priority 24/7 Support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingPlans;
