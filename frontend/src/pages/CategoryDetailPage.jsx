import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageIntro } from '../components/SiteChrome.jsx';
import { fallbackCategories } from '../data/siteContent.js';
import './CategoryDetailPage.css';

export function CategoryDetailPage({ categories, useFallbackCategories }) {
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
        if (!response.ok)
          throw new Error(
            response.status === 404
              ? 'This pet category is not available.'
              : 'Could not load this pet category.',
          );
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

  if (!content && loading)
    return (
      <div className="inner-page">
        <p className="category-page-status" role="status">
          Loading category…
        </p>
      </div>
    );
  if (!content)
    return (
      <div className="inner-page">
        <PageIntro
          eyebrow="Explore our paradise"
          title={
            <>
              Category
              <br />
              <span>not found.</span>
            </>
          }
          description={error || 'This category may be hidden or no longer available.'}
        />
        <Link className="primary-button" to="/explore">
          Back to Pet Categories →
        </Link>
      </div>
    );

  const fallback = categories.find((item) => item.slug === content.slug) || fallbackCategories[0];
  const varieties = category?.varieties || [];
  const fallbackVarietyImage = fallback.photo;
  const normalizedSearch = varietySearch.trim().toLowerCase();
  const visibleVarieties = varieties.filter((variety) =>
    `${variety.name} ${variety.short_description || ''} ${variety.detailed_description || ''}`
      .toLowerCase()
      .includes(normalizedSearch),
  );
  const handleVarietyImageError = (event) => {
    if (event.currentTarget.src === fallbackVarietyImage) event.currentTarget.hidden = true;
    else event.currentTarget.src = fallbackVarietyImage;
  };

  return (
    <div className="inner-page category-detail-page">
      <PageIntro
        eyebrow="Explore our paradise"
        title={
          <>
            {content.title}
            <br />
            <span>and their varieties.</span>
          </>
        }
        description={content.short_description || content.description || fallback.description}
      />
      {content.detailed_description && (
        <p className="category-detail-copy">{content.detailed_description}</p>
      )}
      <section className="category-varieties-section">
        <div className="section-title centered">
          <h2>{content.title} varieties</h2>
        </div>
        {varieties.length ? (
          <>
            <div className="category-variety-toolbar">
              <label className="category-variety-search">
                <input
                  type="search"
                  aria-label={`Search ${content.title} varieties`}
                  placeholder={`Search ${content.title.toLowerCase()} varieties…`}
                  value={varietySearch}
                  onChange={(event) => setVarietySearch(event.target.value)}
                />
              </label>
              <span className="category-variety-results">
                {visibleVarieties.length} of {varieties.length} varieties
              </span>
            </div>
            {visibleVarieties.length ? (
              <div className="category-variety-grid explore-grid">
                {visibleVarieties.map((variety) => (
                  <button
                    className="mini-card mini-card-large category-variety-card"
                    type="button"
                    key={variety.id}
                    onClick={() => setSelectedVariety(variety)}
                    aria-label={`View details for ${variety.name}`}
                  >
                    <span className={`card-image ${fallback.image}`}>
                      <img
                        src={variety.image_url || fallbackVarietyImage}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        onError={handleVarietyImageError}
                      />
                    </span>
                    <span className="card-content">
                      <span className="variety-card-title">{variety.name}</span>
                      <span className="variety-card-description">
                        {variety.short_description || `Discover more about ${variety.name}.`}
                      </span>
                    </span>
                    <span className="variety-card-action" aria-hidden="true">
                      View details <span>→</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="category-page-status" role="status">
                No varieties match “{varietySearch}”.
              </p>
            )}
          </>
        ) : (
          <p className="category-page-status" role={loading ? 'status' : undefined}>
            {loading
              ? 'Loading varieties…'
              : `More ${content.title.toLowerCase()} information will be added soon.`}
          </p>
        )}
      </section>
      <Link className="primary-button category-back-link" to="/explore">
        ← Back to Pet Categories
      </Link>
      {selectedVariety && (
        <div
          className="variety-detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedVariety(null);
          }}
        >
          <section
            className="variety-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="variety-detail-title"
          >
            <div className="variety-detail-header">
              <span>{content.title} variety</span>
              <button
                type="button"
                onClick={() => setSelectedVariety(null)}
                aria-label="Close variety details"
              >
                ×
              </button>
            </div>
            <div className="variety-detail-layout">
              <img
                className="variety-detail-main-image"
                src={selectedVariety.image_url || fallbackVarietyImage}
                alt={selectedVariety.name}
                onError={handleVarietyImageError}
              />
              <div className="variety-detail-copy">
                <h2 id="variety-detail-title">{selectedVariety.name}</h2>
                <p className="variety-detail-intro">
                  {selectedVariety.short_description ||
                    `Discover more about ${selectedVariety.name}.`}
                </p>
                <p>
                  {selectedVariety.detailed_description ||
                    'More information about this variety will be added soon.'}
                </p>
                {Array.isArray(selectedVariety.characteristics) &&
                  selectedVariety.characteristics.length > 0 && (
                    <div className="variety-detail-features">
                      <h3>Key characteristics</h3>
                      <ul>
                        {selectedVariety.characteristics.map((characteristic) => (
                          <li key={characteristic}>{characteristic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {selectedVariety.images?.some((image) => image.url) && (
                  <div className="variety-detail-gallery">
                    <h3>More photos</h3>
                    <div>
                      {selectedVariety.images
                        .filter((image) => image.url)
                        .map((image) => (
                          <img
                            key={image.id}
                            src={image.url}
                            alt={image.alt_text || selectedVariety.name}
                            onError={handleVarietyImageError}
                          />
                        ))}
                    </div>
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

export default CategoryDetailPage;
