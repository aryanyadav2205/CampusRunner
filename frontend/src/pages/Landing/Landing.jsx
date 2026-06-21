import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Sun, Moon, Package, IndianRupee, Star, Users, ClipboardList,
  PersonStanding, ShieldCheck, CheckCircle2, Lock, CreditCard,
  MessageSquare, Headphones, ArrowRight, Play, ChevronRight, ChevronLeft,
  Truck, MapPin, CircleCheckBig
} from "lucide-react";
import "./Landing.css";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing-page">
      {/* ==================== NAVBAR ==================== */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-nav-logo">
            <img src="/logo.png" alt="Campus Runner Logo" />
            <span>Campus Runner</span>
          </Link>

          <ul className="landing-nav-links">
            <li><a href="#hero" className="active">Home</a></li>
            <li><a href="#how-it-works">How it Works</a></li>
            <li><a href="#for-runners">For Runners</a></li>
            <li><a href="#for-students">For Students</a></li>
            <li><a href="#safety">Safety</a></li>
            <li><a href="#testimonials">About Us</a></li>
          </ul>

          <div className="landing-nav-actions">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/login" className="landing-btn-login">Log in</Link>
            <Link to="/login" className="landing-btn-signup">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* ==================== HERO ==================== */}
      <section className="landing-hero" id="hero">
        <div className="landing-hero-text">
          <h1>
            Someone's<br />already going.<br />
            <span className="highlight">Let them bring<br />yours too.</span>
          </h1>
          <p>
            Get your parcels delivered across campus or earn money delivering for others.
          </p>
          <div className="landing-hero-buttons">
            <Link to="/login" className="hero-btn-primary">
              <Package size={18} />
              Need a Delivery
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Send a parcel</span>
            </Link>
            <Link to="/login" className="hero-btn-secondary">
              <IndianRupee size={18} />
              Start Earning
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Become a runner</span>
            </Link>
          </div>
          <div className="hero-trust">
            <div className="hero-trust-avatars">
              <span>A</span>
              <span>R</span>
              <span>K</span>
              <span>S</span>
            </div>
            <span>500+ students trust Campus Runner 🟢</span>
          </div>
        </div>

        <div className="landing-hero-visual">
          {/* Floating cards */}
          <div className="hero-float-card top-left">
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ color: "#2563eb", fontSize: "0.7rem" }}>●</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>New Request</span>
            </div>
            <div className="card-title">Amazon Package</div>
            <div className="card-subtitle">BH-4, Room 312</div>
            <div className="card-badge blue">💎 ₹40 Reward</div>
          </div>

          <div className="hero-float-card top-right">
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ color: "#22c55e", fontSize: "0.7rem" }}>●</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Picked Up</span>
            </div>
            <div className="card-title">Courier Hub</div>
            <div className="card-subtitle">10:45 AM</div>
          </div>

          <div className="hero-float-card bottom-right">
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <CircleCheckBig size={14} style={{ color: "#22c55e" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#22c55e" }}>Delivered</span>
            </div>
            <div className="card-title">BH-4, Room 312</div>
            <div className="card-badge green">₹40 Earned</div>
          </div>

          <img src="/hero-illustration.png" alt="Campus Runner delivery illustration" />
        </div>
      </section>

      {/* ==================== STATS BAR ==================== */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          <div className="stat-item">
            <div className="stat-icon"><Package size={22} /></div>
            <div className="stat-content">
              <h3>1,245+</h3>
              <p>Deliveries Completed</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><IndianRupee size={22} /></div>
            <div className="stat-content">
              <h3>₹42,000+</h3>
              <p>Earned by Students</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Star size={22} /></div>
            <div className="stat-content">
              <h3>98%</h3>
              <p>Success Rate</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Users size={22} /></div>
            <div className="stat-content">
              <h3>500+</h3>
              <p>Active Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="landing-how" id="how-it-works">
        <h2>How it works?</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-icon"><ClipboardList size={28} /></div>
            <h3>1. Create Request</h3>
            <p>Add parcel details and set your reward.</p>
          </div>
          <div className="how-arrow">- - - →</div>
          <div className="how-step">
            <div className="how-step-icon"><PersonStanding size={28} /></div>
            <h3>2. Runner Accepts</h3>
            <p>Nearby runner accepts your request.</p>
          </div>
          <div className="how-arrow">- - - →</div>
          <div className="how-step">
            <div className="how-step-icon"><ShieldCheck size={28} /></div>
            <h3>3. OTP Verified</h3>
            <p>Confirm OTP on delivery. Parcel safely delivered!</p>
          </div>
        </div>
      </section>

      {/* ==================== DUAL CTA ==================== */}
      <section className="landing-dual-cta" id="for-runners">
        <div className="dual-cta-grid">
          {/* Runner Card */}
          <div className="dual-cta-card">
            <div className="dual-cta-content">
              <div className="label">Already going out?</div>
              <h3>Earn Money</h3>
              <p>Pick up parcels, deliver across campus and earn on every trip.</p>
              <ul className="dual-cta-features">
                <li><span className="check">✓</span> Flexible timings</li>
                <li><span className="check">✓</span> Great earnings</li>
                <li><span className="check">✓</span> Help your fellow students</li>
              </ul>
              <Link to="/login" className="dual-cta-btn primary">
                Become a Runner <ArrowRight size={16} />
              </Link>
            </div>
            <div className="dual-cta-image">
              <img src="/runner-cta.png" alt="Become a runner" />
              <div className="cta-earnings-badge">
                <div className="desc">Today's Earnings</div>
                <div className="amount">₹320</div>
                <div className="desc">3 Deliveries Completed</div>
              </div>
            </div>
          </div>

          {/* Requester Card */}
          <div className="dual-cta-card" id="for-students">
            <div className="dual-cta-content">
              <div className="label">Need a Parcel</div>
              <h3>Delivered?</h3>
              <p>We'll get it to you safely and on time.</p>
              <ul className="dual-cta-features">
                <li><span className="check">✓</span> Verified student runners</li>
                <li><span className="check">✓</span> Real-time tracking</li>
                <li><span className="check">✓</span> Secure & reliable</li>
              </ul>
              <Link to="/login" className="dual-cta-btn blue">
                Create a Request <ArrowRight size={16} />
              </Link>
            </div>
            <div className="dual-cta-image">
              <img src="/requester-cta.png" alt="Create a request" />
              <div className="cta-earnings-badge">
                <div className="desc">Starting at</div>
                <div className="amount" style={{ color: "var(--primary-color)" }}>₹20</div>
                <div className="desc">Per Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SAFETY ==================== */}
      <section className="landing-safety" id="safety">
        <h2>Your Safety, Our Priority</h2>
        <div className="safety-grid">
          <div className="safety-item">
            <div className="safety-icon blue"><CheckCircle2 size={22} /></div>
            <h4>Verified Students</h4>
            <p>All users are verified with college ID</p>
          </div>
          <div className="safety-item">
            <div className="safety-icon indigo"><Lock size={22} /></div>
            <h4>OTP Verification</h4>
            <p>Every delivery is secure with OTP</p>
          </div>
          <div className="safety-item">
            <div className="safety-icon green"><CreditCard size={22} /></div>
            <h4>Secure Payments</h4>
            <p>Safe & encrypted transactions</p>
          </div>
          <div className="safety-item">
            <div className="safety-icon amber"><Star size={22} /></div>
            <h4>Ratings & Reviews</h4>
            <p>Real reviews from real students</p>
          </div>
          <div className="safety-item">
            <div className="safety-icon red"><Headphones size={22} /></div>
            <h4>24/7 Support</h4>
            <p>We're always here to help you</p>
          </div>
        </div>
      </section>

      {/* ==================== TRACKING TIMELINE ==================== */}
      <section className="landing-tracking" id="tracking">
        <div className="tracking-wrapper">
          <div className="tracking-text">
            <h2>Track Every Step</h2>
            <p>Stay updated with real-time tracking from pickup to delivery.</p>

          </div>
          <div className="tracking-timeline">
            <div className="track-step">
              <div className="track-step-dot"><ClipboardList size={18} /></div>
              <div className="track-step-label">Request Created</div>
              <div className="track-step-time">10:30 AM</div>
            </div>
            <div className="track-step">
              <div className="track-step-dot"><PersonStanding size={18} /></div>
              <div className="track-step-label">Runner Assigned</div>
              <div className="track-step-time">10:31 AM</div>
            </div>
            <div className="track-step">
              <div className="track-step-dot"><Package size={18} /></div>
              <div className="track-step-label">Picked Up</div>
              <div className="track-step-time">10:45 AM</div>
            </div>
            <div className="track-step">
              <div className="track-step-dot"><Truck size={18} /></div>
              <div className="track-step-label">Out for Delivery</div>
              <div className="track-step-time">11:15 AM</div>
            </div>
            <div className="track-step">
              <div className="track-step-dot" style={{ background: "#22c55e" }}>
                <CircleCheckBig size={18} />
              </div>
              <div className="track-step-label">Delivered</div>
              <div className="track-step-time">11:25 AM</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="landing-testimonials" id="testimonials">
        <h2>Loved by Students</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar" style={{ background: "#6366f1" }}>A</div>
              <div>
                <div className="testimonial-name">Aryan, BH-4</div>
                <div className="testimonial-stars">★★★★★</div>
              </div>
            </div>
            <div className="testimonial-text">
              Saved me a trip to the mall. Super convenient!
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar" style={{ background: "#ec4899" }}>R</div>
              <div>
                <div className="testimonial-name">Riya, GH-1</div>
                <div className="testimonial-stars">★★★★★</div>
              </div>
            </div>
            <div className="testimonial-text">
              Reliable and fast service. Highly recommended!
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar" style={{ background: "#f97316" }}>K</div>
              <div>
                <div className="testimonial-name">Kabir, BH-3</div>
                <div className="testimonial-stars">★★★★★</div>
              </div>
            </div>
            <div className="testimonial-text">
              Earned ₹250 in one week. Great experience!
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER CTA ==================== */}
      <section className="landing-footer-cta">
        <div className="footer-cta-inner">
          <div className="footer-cta-text">
            <h2>Ready to save time or earn money?</h2>
            <p>Join thousands of students using Campus Runner.</p>
          </div>
          <div className="footer-cta-buttons">
            <Link to="/login" className="footer-cta-btn white">
              Get Started <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="footer-cta-btn outline">
              Become a Runner <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="landing-footer">
        <p className="tagline">"Someone's already going. Let them bring yours too."</p>
        <p>&copy; {new Date().getFullYear()} Campus Runner. Peer-to-Peer Campus Delivery Network.</p>
      </footer>
    </div>
  );
}
