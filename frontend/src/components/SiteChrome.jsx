import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './SiteChrome.css';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="topbar">
      <Link
        to="/"
        className="brand-wrap"
        aria-label="Aaryans Pet Paradise home"
        onClick={closeMenu}
      >
        <img src="/logo.png" alt="Aaryans Pet Paradise" className="brand-logo" />
      </Link>
      <button
        className={`menu-toggle${menuOpen ? ' is-open' : ''}`}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
        <NavLink to="/" end onClick={closeMenu}>
          Home
        </NavLink>
        <NavLink to="/about" onClick={closeMenu}>
          About Us
        </NavLink>
        <NavLink to="/explore" onClick={closeMenu}>
          Explore Paradise
        </NavLink>
        <NavLink to="/gallery" onClick={closeMenu}>
          Pet Gallery
        </NavLink>
        <NavLink to="/pet-games" onClick={closeMenu}>
          Pet Games
        </NavLink>
        <NavLink to="/help" onClick={closeMenu}>
          Help &amp; Support
        </NavLink>
        <NavLink to="/contact" onClick={closeMenu}>
          Contact Us
        </NavLink>
        <NavLink className="mobile-register-link" to="/register" onClick={closeMenu}>
          Join / Register
        </NavLink>
      </nav>
      <div className="nav-actions">
        <Link className="primary-button small" to="/register">
          Join / Register
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Link to="/" className="footer-brand">
          <img src="/logo.png" alt="Aaryans Pet Paradise" />
        </Link>
        <p>A happy place for pets and the people who love them.</p>
        <div className="footer-links">
          <Link to="/about">About us</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/help">Help &amp; Support</Link>
          <Link to="/contact">Contact</Link>
          <Link className="admin-login-link" to="/admin">
            Admin Login
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          Aaryans Pet Paradise · Aaryans World School, Next Bhilarewadi, Pune – 411046, Maharashtra,
          India
        </span>
        <span>
          Made with ❤️ by{' '}
          <a href="https://aayojanai.com/" target="_blank" rel="noreferrer">
            Aayojan AI
          </a>
        </span>
      </div>
    </footer>
  );
}

export function PageIntro({ eyebrow, title, description }) {
  return (
    <section className="page-intro">
      <span className="page-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
