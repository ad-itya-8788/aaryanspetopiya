import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard.jsx';
import { familyFeatures, reasons } from '../data/siteContent.js';
import './HomePage.css';

export function HomePage({ categories, heroImages = [], familyImages = [] }) {
  const heroImage = heroImages[0]?.url;
  const familyImage = familyImages[0]?.url;
  const [failedImages, setFailedImages] = useState([]);
  const activeHeroImage = heroImage && !failedImages.includes(heroImage) ? heroImage : null;
  const activeFamilyImage = familyImage && !failedImages.includes(familyImage) ? familyImage : null;
  const markImageFailed = (url) =>
    setFailedImages((current) => (current.includes(url) ? current : [...current, url]));
  const [knowledgePopupOpen, setKnowledgePopupOpen] = useState(false);

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem('pet-knowledge-popup-shown') === '1';
    } catch {
      alreadyShown = false;
    }
    if (alreadyShown) return undefined;
    const timer = window.setTimeout(() => {
      setKnowledgePopupOpen(true);
      try {
        window.sessionStorage.setItem('pet-knowledge-popup-shown', '1');
      } catch {
        // The popup still works if browser storage is unavailable.
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!knowledgePopupOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setKnowledgePopupOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [knowledgePopupOpen]);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>Welcome to Aaryans Pet Paradise</span>
          </div>
          <h1>
            Every Little Life
            <br />
            Deserves a <span>World of Love.</span>
          </h1>
          <p>
            Welcome to Aaryans Pet Paradise — a place where every paw finds happiness, every heart
            finds care, and every little life matters.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/explore">
              Explore Our Paradise <span aria-hidden="true">→</span>
            </Link>
            <Link className="secondary-button" to="/register">
              Register With Us
            </Link>
            <Link className="secondary-button pet-games-hero-button" to="/pet-games">
              Play Pet Games <span aria-hidden="true">🎮</span>
            </Link>
          </div>
          <div className="feature-pills" aria-label="Pet values">
            <span>Adopt</span>
            <span>Care</span>
            <span>Nurture</span>
            <span>Community</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Happy pets">
          <div
            className="collage-bg-wrapper"
            style={
              activeHeroImage
                ? {
                    backgroundImage: `linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,0)),url("${activeHeroImage}")`,
                  }
                : undefined
            }
          >
            {activeHeroImage && (
              <img
                className="image-load-probe"
                src={activeHeroImage}
                alt=""
                aria-hidden="true"
                onError={() => markImageFailed(activeHeroImage)}
              />
            )}
            <div className="pet-card--label">
              <div className="signboard">
                <span>Pets</span>
                <span>Family</span>
                <span>Happiness</span>
                <span>Together</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="explore-shell" id="explore">
        <div className="section-title centered">
          <h2>Explore Our Paradise</h2>
        </div>
        <div className="card-grid">
          {categories.map((item) => (
            <CategoryCard item={item} key={item.title} />
          ))}
        </div>
      </section>

      <section className="family-section" id="about">
        <div className="family-visual">
          <div
            className="family-photo"
            style={
              activeFamilyImage ? { backgroundImage: `url("${activeFamilyImage}")` } : undefined
            }
          >
            {activeFamilyImage && (
              <img
                className="image-load-probe"
                src={activeFamilyImage}
                alt=""
                aria-hidden="true"
                onError={() => markImageFailed(activeFamilyImage)}
              />
            )}
          </div>
        </div>
        <div className="family-copy">
          <div className="section-title left">
            <h2>
              More Than Pets.
              <br />
              They&apos;re Family.
            </h2>
          </div>
          <p>
            At Aaryans Pet Paradise, we believe pets are not just animals, they are family.
            We&apos;re here to create a loving, safe and happy space for every pet and every family.
          </p>
          <div className="family-features">
            {familyFeatures.map((item) => (
              <div className="feature-item" key={item.title}>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Link className="primary-button" to="/about">
            Know More About Us <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="choose-us">
        <div className="choose-us-title">
          <h2>
            Why Choose
            <br />
            Aaryans Pet Paradise?
          </h2>
        </div>
        <div className="value-grid">
          {reasons.map((item) => (
            <div className="value-item" key={item.label}>
              <h3>{item.label}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <p className="eyebrow-label">A little more love goes a long way</p>
          <h2>Find your place in our pet-loving community.</h2>
        </div>
        <Link className="secondary-button" to="/register">
          Join Our Paradise <span aria-hidden="true">→</span>
        </Link>
      </section>
      {knowledgePopupOpen && (
        <div
          className="pet-knowledge-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setKnowledgePopupOpen(false);
          }}
        >
          <section
            className="pet-knowledge-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pet-knowledge-title"
          >
            <button
              type="button"
              className="pet-knowledge-close"
              aria-label="Close"
              onClick={() => setKnowledgePopupOpen(false)}
            >
              ×
            </button>
            <span className="pet-knowledge-icon" aria-hidden="true">
              🧠
            </span>
            <span className="page-eyebrow">A fun little challenge</span>
            <h2 id="pet-knowledge-title">Check Your Pet Knowledge</h2>
            <p>Think you know your animal friends? Play, learn and discover something new.</p>
            <div className="pet-knowledge-actions">
              <Link
                className="primary-button"
                to="/pet-games"
                onClick={() => setKnowledgePopupOpen(false)}
              >
                Play Now <span aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setKnowledgePopupOpen(false)}
              >
                Maybe later
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default HomePage;
