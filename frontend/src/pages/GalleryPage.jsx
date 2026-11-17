import { useState } from 'react';
import { PageIntro } from '../components/SiteChrome.jsx';
import { fallbackCategories } from '../data/siteContent.js';
import './GalleryPage.css';

export function GalleryPage({ categories, galleryImages = [] }) {
  const [active, setActive] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const filters = ['All', ...categories.map((item) => item.title)];
  const photos = galleryImages.length
    ? galleryImages
        .filter((image) => active === 'All' || image.category_name === active)
        .map((image) => ({
          title: image.pet_name || image.category_name || 'Pet',
          image: 'custom-category',
          photo:
            categories.find((category) => category.title === image.category_name)?.photo ||
            fallbackCategories[0].photo,
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
      <PageIntro
        eyebrow="Pet gallery"
        title={
          <>
            A little joy, in
            <br />
            <span>every picture.</span>
          </>
        }
        description="A collection of furry faces and happy moments to brighten your day."
      />
      <div className="filter-row">
        {filters.map((filter) => (
          <button
            className={active === filter ? 'filter-chip selected' : 'filter-chip'}
            key={filter}
            onClick={() => setActive(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="gallery-grid">
        {photos.map((item, index) => (
          <button
            className={`gallery-tile ${item.image}`}
            key={`${item.title}-${item.galleryImage?.id || index}`}
            onClick={() => setSelectedImage(item)}
            aria-label={`View ${item.title} photo`}
          >
            <img
              src={item.galleryImage?.url || fallbackUrl(item)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              onError={useFallbackOnError(item)}
            />
            <span>
              {item.title}
              <b>View photo ↗</b>
            </span>
          </button>
        ))}
      </div>
      {selectedImage && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedImage.title} photo`}
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="lightbox-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close photo"
          >
            ×
          </button>
          <img
            src={selectedImage.galleryImage?.url || fallbackUrl(selectedImage)}
            alt={selectedImage.galleryImage?.alt_text || selectedImage.title}
            onError={useFallbackOnError(selectedImage)}
            onClick={(event) => event.stopPropagation()}
          />
          <p>{selectedImage.title}</p>
        </div>
      )}
    </div>
  );
}

export default GalleryPage;
