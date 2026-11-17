import { lazy, Suspense, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import AreaCombobox from './AreaCombobox.jsx';
const AdminPage = lazy(() => import('./AdminPage.jsx'));
const PetGamesPage = lazy(() => import('./PetGamesPage.jsx'));

const fallbackCategories = [
  { title: 'Dogs', slug: 'dogs', description: 'Loyal, playful and always by your side.', image: 'dogs', photo: '/images/dogs.webp' },
  { title: 'Cats', slug: 'cats', description: 'Independent, loving and full of charm.', image: 'cats', photo: '/images/cats.webp' },
  { title: 'Puppies', slug: 'puppies', description: 'Bundles of joy with endless love.', image: 'puppies', photo: '/images/puppies.webp' },
  { title: 'Kittens', slug: 'kittens', description: 'Tiny paws, big dreams and playful hearts.', image: 'kittens', photo: '/images/kittens.webp' },
  { title: 'Pet Care', slug: 'pet-care', description: 'Nutrition, grooming and care tips.', image: 'caret', photo: '/images/pet-care.webp' },
  { title: 'Pet Community', slug: 'pet-community', description: 'Connect, share and grow together.', image: 'community', photo: '/images/community.webp' },
];

const familyFeatures = [
  { title: 'Love', text: 'Because they feel it, just like we do.' },
  { title: 'Nutrition', text: 'Right food for a healthier life.' },
  { title: 'Safety', text: 'A secure and pet-friendly space.' },
  { title: 'Health', text: 'Care for a happier, healthier life.' },
  { title: 'Happiness', text: 'Joyful, active and stress-free.' },
  { title: 'Companionship', text: 'A bond that makes life richer.' },
];

const reasons = [
  { label: 'Trusted Care' },
  { label: 'Pet Loving Community' },
  { label: 'Caring Environment' },
  { label: 'Quality Guidance' },
  { label: 'Growing Together' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="topbar">
      <Link to="/" className="brand-wrap" aria-label="Aaryans Pet Paradise home" onClick={closeMenu}>
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
        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
        <NavLink to="/about" onClick={closeMenu}>About Us</NavLink>
        <NavLink to="/explore" onClick={closeMenu}>Explore Paradise</NavLink>
        <NavLink to="/gallery" onClick={closeMenu}>Pet Gallery</NavLink>
        <NavLink to="/pet-games" onClick={closeMenu}>Pet Games</NavLink>
        <NavLink to="/help" onClick={closeMenu}>Help &amp; Support</NavLink>
        <NavLink to="/contact" onClick={closeMenu}>Contact Us</NavLink>
        <NavLink className="mobile-register-link" to="/register" onClick={closeMenu}>Join / Register</NavLink>
      </nav>
      <div className="nav-actions">
        <Link className="primary-button small" to="/register">Join / Register</Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Link to="/" className="footer-brand"><img src="/logo.png" alt="Aaryans Pet Paradise" /></Link>
        <p>A happy place for pets and the people who love them.</p>
        <div className="footer-links">
          <Link to="/about">About us</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/help">Help &amp; Support</Link>
          <Link to="/contact">Contact</Link>
          <Link className="admin-login-link" to="/admin">Admin Login</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Aaryans Pet Paradise · Aaryans World School, Next Bhilarewadi, Pune – 411046, Maharashtra, India</span>
        <span>Made with ❤️ by <a href="https://aayojanai.com/" target="_blank" rel="noreferrer">Aayojan AI</a></span>
      </div>
    </footer>
  );
}

function CategoryCard({ item, large = false }) {
  const fallbackImage = item.photo || fallbackCategories[0].photo;
  const image = item.cover_image_url || item.images?.[0]?.url || fallbackImage;
  const categoryPath = `/explore-paradise/${encodeURIComponent(item.slug || item.title.toLowerCase().replace(/\s+/g, '-'))}`;

  return (
    <article className={`mini-card${large ? ' mini-card-large' : ''}`}>
      <Link
        className={`card-image ${item.image}`}
        to={categoryPath}
        aria-label={`Explore ${item.title}`}
      >
        <img
          src={image}
          alt={`${item.title} category`}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
          }}
        />
      </Link>
      <div className="card-content">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {item.varieties_count > 0 && <small className="category-variety-count">{item.varieties_count} varieties</small>}
      </div>
      <Link className="circle-action" to={categoryPath} aria-label={`Explore ${item.title}`}>→</Link>
    </article>
  );
}

function HomePage({ categories, heroImages = [], familyImages = [] }) {
  const heroImage = heroImages[0]?.url;
  const familyImage = familyImages[0]?.url;
  const [failedImages, setFailedImages] = useState([]);
  const activeHeroImage = heroImage && !failedImages.includes(heroImage) ? heroImage : null;
  const activeFamilyImage = familyImage && !failedImages.includes(familyImage) ? familyImage : null;
  const markImageFailed = (url) => setFailedImages((current) => current.includes(url) ? current : [...current, url]);
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
          <div className="eyebrow"><span>Welcome to Aaryans Pet Paradise</span></div>
          <h1>Every Little Life<br />Deserves a <span>World of Love.</span></h1>
          <p>Welcome to Aaryans Pet Paradise — a place where every paw finds happiness, every heart finds care, and every little life matters.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/explore">Explore Our Paradise <span aria-hidden="true">→</span></Link>
            <Link className="secondary-button" to="/register">Register With Us</Link>
            <Link className="secondary-button pet-games-hero-button" to="/pet-games">Play Pet Games <span aria-hidden="true">🎮</span></Link>
          </div>
          <div className="feature-pills" aria-label="Pet values">
            <span>Adopt</span><span>Care</span><span>Nurture</span><span>Community</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Happy pets">
          <div className="collage-bg-wrapper" style={activeHeroImage ? { backgroundImage: `linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,0)),url("${activeHeroImage}")` } : undefined}>
            {activeHeroImage && <img className="image-load-probe" src={activeHeroImage} alt="" aria-hidden="true" onError={() => markImageFailed(activeHeroImage)} />}
            <div className="pet-card--label"><div className="signboard"><span>Pets</span><span>Family</span><span>Happiness</span><span>Together</span></div></div>
          </div>
        </div>
      </section>

      <section className="explore-shell" id="explore">
        <div className="section-title centered"><h2>Explore Our Paradise</h2></div>
        <div className="card-grid">{categories.map((item) => <CategoryCard item={item} key={item.title} />)}</div>
      </section>

      <section className="family-section" id="about">
        <div className="family-visual"><div className="family-photo" style={activeFamilyImage ? { backgroundImage: `url("${activeFamilyImage}")` } : undefined}>{activeFamilyImage && <img className="image-load-probe" src={activeFamilyImage} alt="" aria-hidden="true" onError={() => markImageFailed(activeFamilyImage)} />}</div></div>
        <div className="family-copy">
          <div className="section-title left"><h2>More Than Pets.<br />They&apos;re Family.</h2></div>
          <p>At Aaryans Pet Paradise, we believe pets are not just animals, they are family. We&apos;re here to create a loving, safe and happy space for every pet and every family.</p>
          <div className="family-features">{familyFeatures.map((item) => <div className="feature-item" key={item.title}><div><h4>{item.title}</h4><p>{item.text}</p></div></div>)}</div>
          <Link className="primary-button" to="/about">Know More About Us <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="choose-us">
        <div className="choose-us-title"><h2>Why Choose<br />Aaryans Pet Paradise?</h2></div>
        <div className="value-grid">{reasons.map((item) => <div className="value-item" key={item.label}><h3>{item.label}</h3></div>)}</div>
      </section>

      <section className="home-cta">
        <div><p className="eyebrow-label">A little more love goes a long way</p><h2>Find your place in our pet-loving community.</h2></div>
        <Link className="secondary-button" to="/register">Join Our Paradise <span aria-hidden="true">→</span></Link>
      </section>
      {knowledgePopupOpen && (
        <div className="pet-knowledge-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setKnowledgePopupOpen(false); }}>
          <section className="pet-knowledge-modal" role="dialog" aria-modal="true" aria-labelledby="pet-knowledge-title">
            <button type="button" className="pet-knowledge-close" aria-label="Close" onClick={() => setKnowledgePopupOpen(false)}>×</button>
            <span className="pet-knowledge-icon" aria-hidden="true">🧠</span>
            <span className="page-eyebrow">A fun little challenge</span>
            <h2 id="pet-knowledge-title">Check Your Pet Knowledge</h2>
            <p>Think you know your animal friends? Play, learn and discover something new.</p>
            <div className="pet-knowledge-actions">
              <Link className="primary-button" to="/pet-games" onClick={() => setKnowledgePopupOpen(false)}>Play Now <span aria-hidden="true">→</span></Link>
              <button type="button" className="secondary-button" onClick={() => setKnowledgePopupOpen(false)}>Maybe later</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function PageIntro({ eyebrow, title, description }) {
  return <section className="page-intro"><span className="page-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></section>;
}

function AboutPage() {
  return (
    <div className="inner-page">
      <PageIntro eyebrow="Our story" title={<>More Than Pets.<br /><span>They&apos;re Family.</span></>} description="Aaryans Pet Paradise is a place built around the joy, care and companionship pets bring to our lives." />
      <section className="about-feature">
        <div className="about-image" role="img" aria-label="A person spending time with a dog" />
        <div><span className="page-eyebrow">A place for every paw</span><h2>Every little life matters.</h2><p>We believe every pet deserves kindness, care and a welcoming community. Our goal is to bring pet lovers together and make it easier to find helpful information, discover pet-friendly resources and celebrate the bond we share with animals.</p><p>We&apos;re growing this paradise with love. Explore our pages, learn more about pet care and join our community.</p><Link className="primary-button" to="/explore">Explore Paradise →</Link></div>
      </section>
      <section className="about-values"><div className="section-title centered"><h2>What matters to us</h2></div><div className="value-grid">{reasons.map((item) => <div className="value-item" key={item.label}><h3>{item.label}</h3></div>)}</div></section>
    </div>
  );
}

function ExplorePage({ categories }) {
  const [params, setParams] = useSearchParams();
  const currentCategory = params.get('category');
  const shown = currentCategory ? categories.filter((item) => item.title === currentCategory) : categories;
  return (
    <div className="inner-page">
      <PageIntro eyebrow="Explore our paradise" title={<>A happy place for<br /><span>every kind of paw.</span></>} description="Find inspiration, care ideas and community for the pets who make life brighter." />
      <div className="filter-row"><button className={!currentCategory ? 'filter-chip selected' : 'filter-chip'} onClick={() => setParams({})}>All categories</button>{categories.map((item) => <button className={currentCategory === item.title ? 'filter-chip selected' : 'filter-chip'} key={item.title} onClick={() => setParams({ category: item.title })}>{item.title}</button>)}</div>
      <div className="card-grid explore-grid">{shown.map((item) => <CategoryCard item={item} large key={item.title} />)}</div>
      <section className="care-note"><div><h2>Care starts with curiosity.</h2><p>Explore the gallery for a little inspiration, or get in touch if you have a question for our team.</p></div><Link className="primary-button" to="/help">Visit Help &amp; Support →</Link></section>
    </div>
  );
}

function CategoryDetailPage({ categories, useFallbackCategories }) {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [varietySearch, setVarietySearch] = useState('');
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    setCategory(null);
    setVarietySearch('');
    setSelectedVariety(null);
    setError('');
    setLoading(true);

    fetch(`${apiBase}/api/categories/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'This pet category is not available.' : 'Could not load this pet category.');
        return response.json();
      })
      .then(setCategory)
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!selectedVariety) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedVariety(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedVariety]);

  const staticCategory = useFallbackCategories
    ? categories.find((item) => item.slug === slug)
    : null;
  const content = category || staticCategory;

  if (!content && loading) return <div className="inner-page"><p className="category-page-status" role="status">Loading category…</p></div>;
  if (!content) return <div className="inner-page"><PageIntro eyebrow="Explore our paradise" title={<>Category<br /><span>not found.</span></>} description={error || 'This category may be hidden or no longer available.'} /><Link className="primary-button" to="/explore">Back to Pet Categories →</Link></div>;

  const fallback = categories.find((item) => item.slug === content.slug) || fallbackCategories[0];
  const varieties = category?.varieties || [];
  const fallbackVarietyImage = fallback.photo;
  const normalizedSearch = varietySearch.trim().toLowerCase();
  const visibleVarieties = varieties.filter((variety) => (
    `${variety.name} ${variety.short_description || ''} ${variety.detailed_description || ''}`.toLowerCase().includes(normalizedSearch)
  ));
  const handleVarietyImageError = (event) => {
    if (event.currentTarget.src === fallbackVarietyImage) event.currentTarget.hidden = true;
    else event.currentTarget.src = fallbackVarietyImage;
  };

  return (
    <div className="inner-page category-detail-page">
      <PageIntro eyebrow="Explore our paradise" title={<>{content.title}<br /><span>and their varieties.</span></>} description={content.short_description || content.description || fallback.description} />
      {content.detailed_description && <p className="category-detail-copy">{content.detailed_description}</p>}
      <section className="category-varieties-section">
        <div className="section-title centered"><h2>{content.title} varieties</h2></div>
        {varieties.length ? (
          <>
            <div className="category-variety-toolbar">
              <label className="category-variety-search"><input type="search" aria-label={`Search ${content.title} varieties`} placeholder={`Search ${content.title.toLowerCase()} varieties…`} value={varietySearch} onChange={(event) => setVarietySearch(event.target.value)} /></label>
              <span className="category-variety-results">{visibleVarieties.length} of {varieties.length} varieties</span>
            </div>
            {visibleVarieties.length ? (
              <div className="category-variety-grid explore-grid">{visibleVarieties.map((variety) => (
                <button className="mini-card mini-card-large category-variety-card" type="button" key={variety.id} onClick={() => setSelectedVariety(variety)} aria-label={`View details for ${variety.name}`}>
                  <span className={`card-image ${fallback.image}`}><img src={variety.image_url || fallbackVarietyImage} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={handleVarietyImageError} /></span>
                  <span className="card-content"><span className="variety-card-title">{variety.name}</span><span className="variety-card-description">{variety.short_description || `Discover more about ${variety.name}.`}</span></span>
                  <span className="variety-card-action" aria-hidden="true">View details <span>→</span></span>
                </button>
              ))}</div>
            ) : <p className="category-page-status" role="status">No varieties match “{varietySearch}”.</p>}
          </>
        ) : (
          <p className="category-page-status" role={loading ? 'status' : undefined}>
            {loading ? 'Loading varieties…' : `More ${content.title.toLowerCase()} information will be added soon.`}
          </p>
        )}
      </section>
      <Link className="primary-button category-back-link" to="/explore">← Back to Pet Categories</Link>
      {selectedVariety && (
        <div className="variety-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedVariety(null); }}>
          <section className="variety-detail-modal" role="dialog" aria-modal="true" aria-labelledby="variety-detail-title">
            <div className="variety-detail-header"><span>{content.title} variety</span><button type="button" onClick={() => setSelectedVariety(null)} aria-label="Close variety details">×</button></div>
            <div className="variety-detail-layout">
              <img className="variety-detail-main-image" src={selectedVariety.image_url || fallbackVarietyImage} alt={selectedVariety.name} onError={handleVarietyImageError} />
              <div className="variety-detail-copy">
                <h2 id="variety-detail-title">{selectedVariety.name}</h2>
                <p className="variety-detail-intro">{selectedVariety.short_description || `Discover more about ${selectedVariety.name}.`}</p>
                <p>{selectedVariety.detailed_description || 'More information about this variety will be added soon.'}</p>
                {Array.isArray(selectedVariety.characteristics) && selectedVariety.characteristics.length > 0 && (
                  <div className="variety-detail-features">
                    <h3>Key characteristics</h3>
                    <ul>{selectedVariety.characteristics.map((characteristic) => <li key={characteristic}>{characteristic}</li>)}</ul>
                  </div>
                )}
                {selectedVariety.images?.some((image) => image.url) && (
                  <div className="variety-detail-gallery">
                    <h3>More photos</h3>
                    <div>{selectedVariety.images.filter((image) => image.url).map((image) => <img key={image.id} src={image.url} alt={image.alt_text || selectedVariety.name} onError={handleVarietyImageError} />)}</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function GalleryPage({ categories, galleryImages = [] }) {
  const [active, setActive] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const filters = ['All', ...categories.map((item) => item.title)];
  const photos = galleryImages.length
    ? galleryImages
      .filter((image) => active === 'All' || image.category_name === active)
      .map((image) => ({
        title: image.pet_name || image.category_name || 'Pet',
        image: 'custom-category',
        photo: categories.find((category) => category.title === image.category_name)?.photo || fallbackCategories[0].photo,
        galleryImage: image,
      }))
    : categories
      .filter((item) => active === 'All' || item.title === active)
      .map((item) => ({ ...item, galleryImage: null }));
  const fallbackUrl = (item) => item.photo || fallbackCategories[0].photo;
  const useFallbackOnError = (item) => (event) => {
    if (event.currentTarget.src === fallbackUrl(item)) event.currentTarget.hidden = true;
    else event.currentTarget.src = fallbackUrl(item);
  };
  return (
    <div className="inner-page">
      <PageIntro eyebrow="Pet gallery" title={<>A little joy, in<br /><span>every picture.</span></>} description="A collection of furry faces and happy moments to brighten your day." />
      <div className="filter-row">{filters.map((filter) => <button className={active === filter ? 'filter-chip selected' : 'filter-chip'} key={filter} onClick={() => setActive(filter)}>{filter}</button>)}</div>
      <div className="gallery-grid">{photos.map((item, index) => <button className={`gallery-tile ${item.image}`} key={`${item.title}-${item.galleryImage?.id || index}`} onClick={() => setSelectedImage(item)} aria-label={`View ${item.title} photo`}><img src={item.galleryImage?.url || fallbackUrl(item)} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={useFallbackOnError(item)} /><span>{item.title}<b>View photo ↗</b></span></button>)}</div>
      {selectedImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${selectedImage.title} photo`} onClick={() => setSelectedImage(null)}><button className="lightbox-close" onClick={() => setSelectedImage(null)} aria-label="Close photo">×</button><img src={selectedImage.galleryImage?.url || fallbackUrl(selectedImage)} alt={selectedImage.galleryImage?.alt_text || selectedImage.title} onError={useFallbackOnError(selectedImage)} onClick={(event) => event.stopPropagation()} /><p>{selectedImage.title}</p></div>}
    </div>
  );
}

function HelpPage() {
  const faqs = [
    { question: 'How do I join Aaryans Pet Paradise?', answer: 'Use the Join / Register page to share your contact and address details. The registration form is ready to collect your information.' },
    { question: 'Can I find pet care information here?', answer: 'Yes. Visit Explore Paradise for our pet care and community categories. We are continuing to add useful information.' },
    { question: 'How can I contact the team?', answer: 'Send a message through our Contact Us form or visit the address listed on that page.' },
    { question: 'Are all services shown on this site available?', answer: 'Please contact us to confirm current availability. We do not list unconfirmed services as offered.' },
  ];
  return <div className="inner-page"><PageIntro eyebrow="We are here to help" title={<>How can we<br /><span>help you today?</span></>} description="Browse common questions or send us a message. We’ll be happy to point you in the right direction." /><div className="help-layout"><div className="faq-list">{faqs.map((item, index) => <details className="faq-item" key={item.question} open={index === 0}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></div></div>;
}

function ContactPage() {
  return <div className="inner-page"><PageIntro eyebrow="Get in touch" title={<>We&apos;d love to<br /><span>hear from you.</span></>} description="Find our location and visit us at Aaryans Pet Paradise." /><div className="contact-layout contact-layout-single"><aside className="contact-card"><span className="page-eyebrow">Visit us</span><h2>Aaryans Pet Paradise</h2><p>Aaryans World School,<br />Next Bhilarewadi, Bhilarewadi,<br />Pune – 411046, Maharashtra, India.</p><div className="map-placeholder">📍 &nbsp; Bhilarewadi, Pune</div><p className="muted">Phone, email and opening hours will be added when confirmed.</p></aside></div></div>;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [area, setArea] = useState('');
  const [formValues, setFormValues] = useState({ fullName: '', mobile: '', email: '', instaId: '', address: '' });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const completedFields = [
    Boolean(formValues.fullName.trim()),
    /^[6-9][0-9]{9}$/.test(formValues.mobile.trim()),
    Boolean(area.trim()),
    Boolean(formValues.address.trim()),
  ];
  const progress = Math.round((completedFields.filter(Boolean).length / completedFields.length) * 100);

  const updateFormField = (event) => {
    const { name, value } = event.currentTarget;
    setFormValues((current) => ({ ...current, [name]: value }));
    setSubmissionError('');
  };

  useEffect(() => {
    if (!showSuccessToast) return undefined;
    const timer = setTimeout(() => setShowSuccessToast(false), 5200);
    return () => clearTimeout(timer);
  }, [showSuccessToast]);

  const submit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

    if (!area.trim()) {
      setSubmissionError('Please select or enter your area.');
      return;
    }

    setSubmitting(true);
    setSubmissionError('');

    try {
      const response = await fetch(`${apiBase}/api/registrations`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.get('fullName'),
          mobile: formData.get('mobile'),
          email: formData.get('email') || null,
          insta_id: formData.get('instaId') || null,
          area: area.trim(),
          address: formData.get('address'),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const validationMessage = result.errors && Object.values(result.errors).flat()[0];
        throw new Error(validationMessage || result.message || 'We could not submit your registration. Please try again.');
      }

      setSubmitted(true);
      setShowSuccessToast(true);
      formElement.reset();
      setArea('');
      setFormValues({ fullName: '', mobile: '', email: '', instaId: '', address: '' });
    } catch (error) {
      setSubmissionError(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="inner-page register-page">
      <section className="register-layout" aria-label="Join Aaryans Pet Paradise">
        <aside className="register-story">
          <div className="register-story-copy">
            <span className="register-kicker">Join our pet-loving family</span>
            <h1>Aaryan&apos;s Pet Paradise <span>Community</span></h1>
            <p>Be part of a caring community built for pet lovers and their furry friends.</p>
            <ul className="register-benefits">
              <li><span><strong>Discover our pets</strong><small>Explore breeds, photos and details</small></span></li>
              <li><span><strong>Get updates</strong><small>Stay informed about new additions</small></span></li>
              <li><span><strong>Connect with pet lovers</strong><small>Share the joy of caring for pets</small></span></li>
            </ul>
          </div>
          <div className="register-pet-photo" role="img" aria-label="A happy dog and cat" />
        </aside>

        <div className="register-wrap">
          {showSuccessToast && (
            <div className="success-toast" role="status" aria-live="polite">
              <div className="success-toast-copy">
                <strong>Registration successful</strong>
                <span>Your details have been saved. We&apos;ll contact you soon.</span>
              </div>
              <button type="button" className="success-toast-close" aria-label="Dismiss notification" onClick={() => setShowSuccessToast(false)}>×</button>
              <span className="success-toast-progress" aria-hidden="true" />
            </div>
          )}
          {submitted ? (
            <div className="confirmation-card success-card">
              <h2>You&apos;re on the list!</h2>
              <p>Your registration has been received. Our team can now follow up with you.</p>
              <button className="primary-button" onClick={() => { setSubmitted(false); setShowSuccessToast(false); }}>Add another registration</button>
              <button className="text-button" onClick={() => navigate('/')}>Back to home</button>
            </div>
          ) : (
            <form className="form-card register-form" onSubmit={submit}>
              <div className="register-form-heading">
                <div><h2>Your details</h2><p className="muted">Fields marked <span>*</span> are required.</p></div>
              </div>
              <div className="register-progress-wrap">
                <div className="register-progress-copy"><span>Form progress</span><strong>{completedFields.filter(Boolean).length} of {completedFields.length} required fields</strong></div>
                <div className="register-progress" role="progressbar" aria-label="Required fields completed" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>
              {submissionError && <p className="admin-alert error" role="alert">{submissionError}</p>}
              <div className="form-grid">
                <label className={`register-field${completedFields[0] ? ' is-complete' : ''}`}><span className="field-label">Full name <b>*</b></span><span className="input-shell"><input name="fullName" autoComplete="name" placeholder="Enter your full name" value={formValues.fullName} onChange={updateFormField} required /></span></label>
                <label className={`register-field${completedFields[1] ? ' is-complete' : ''}`}><span className="field-label">Mobile number <b>*</b></span><span className="input-shell"><input name="mobile" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian mobile number" autoComplete="tel" placeholder="Enter mobile number" value={formValues.mobile} onChange={updateFormField} required /></span></label>
                <label className="register-field span-two"><span className="field-label">Email address</span><span className="input-shell"><input name="email" type="email" autoComplete="email" placeholder="Enter your email address" value={formValues.email} onChange={updateFormField} /></span></label>
                <label className="register-field span-two"><span className="field-label">Instagram ID</span><span className="input-shell"><input name="instaId" autoComplete="username" placeholder="Enter your Instagram handle" value={formValues.instaId} onChange={updateFormField} /></span></label>
                <label className={`register-field span-two${completedFields[2] ? ' is-complete' : ''}`}><span className="field-label">Area / locality <b>*</b></span><AreaCombobox value={area} onChange={(nextArea) => { setArea(nextArea || ''); setSubmissionError(''); }} /></label>
                <label className={`register-field span-two${completedFields[3] ? ' is-complete' : ''}`}><span className="field-label">Complete address <b>*</b></span><span className="input-shell textarea-shell"><textarea name="address" rows="3" autoComplete="street-address" placeholder="Enter your complete address" value={formValues.address} onChange={updateFormField} required /></span></label>
              </div>
              <button className="primary-button register-submit" type="submit" disabled={submitting}> {submitting ? 'Submitting…' : 'Complete registration'}</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function SiteLayout() {
  const { pathname, search } = useLocation();
  const [websiteData, setWebsiteData] = useState(null);
  const [websiteDataReady, setWebsiteDataReady] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    fetch(`${apiBase}/api/homepage`, { headers: { Accept: 'application/json' }, signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Homepage API returned HTTP ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (active) {
          setWebsiteData(data);
        }
      })
      .catch((error) => {
        if (active) {
          console.warn('Using built-in Pet Paradise content because the backend is unavailable.', error);
        }
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (active) {
          setWebsiteDataReady(true);
        }
      });

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const categories = websiteData?.categories?.length
    ? websiteData.categories.map((category) => {
      const fallback = fallbackCategories.find((item) => item.slug === category.slug);

      return {
        ...category,
        image: fallback?.image || 'custom-category',
        photo: fallback?.photo || fallbackCategories[0].photo,
        description: category.short_description || fallback?.description || 'Discover more for pets and their families.',
        isCustom: !fallback,
      };
    })
    : fallbackCategories;
  const useFallbackCategories = websiteDataReady && !websiteData?.categories?.length;
  const heroImages = websiteData?.hero_images || [];
  const familyImages = websiteData?.family_images || [];
  const galleryImages = websiteData?.gallery_images || [];

  useEffect(() => {
    const targets = document.querySelectorAll([
      '.hero-copy',
      '.hero-visual',
      '.section-title',
      '.mini-card',
      '.family-visual',
      '.family-copy',
      '.choose-us-title',
      '.value-item',
      '.home-cta',
      '.page-intro',
      '.about-feature > *',
      '.about-values',
      '.filter-row',
      '.care-note',
      '.gallery-tile',
      '.faq-item',
      '.contact-layout > *',
      '.register-story',
      '.register-wrap',
    ].join(','));

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    targets.forEach((target, index) => {
      target.classList.add('reveal-on-scroll');
      target.classList.remove('is-visible');
      target.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [pathname, search, websiteData]);

  if (pathname.startsWith('/admin')) {
    return <Suspense fallback={<main className="admin-screen"><div className="crm-loading"><span /><strong>Opening your workspace…</strong></div></main>}><AdminPage /></Suspense>;
  }

  return (
    <div className="site">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage categories={categories} heroImages={heroImages} familyImages={familyImages} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/explore" element={<ExplorePage categories={categories} />} />
          <Route path="/explore-paradise/:slug" element={<CategoryDetailPage categories={categories} useFallbackCategories={useFallbackCategories} />} />
          <Route path="/gallery" element={<GalleryPage categories={categories} galleryImages={galleryImages} />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pet-games" element={<Suspense fallback={<main className="pet-games-content"><p className="pet-game-loading">Opening Pet Games Paradise…</p></main>}><PetGamesPage /></Suspense>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SiteLayout />
    </BrowserRouter>
  );
}

function PageNotFound() {
  return <div className="inner-page not-found"><PageIntro eyebrow="Page not found" title={<>Oops, that page<br /><span>isn&apos;t here.</span></>} description="The link may have changed. Head back home and explore from there." /><Link className="primary-button" to="/">Back to home →</Link></div>;
}

export default App;
