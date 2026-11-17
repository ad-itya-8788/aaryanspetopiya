import { Link } from 'react-router-dom';
import { fallbackCategories } from '../data/siteContent.js';
import './CategoryCard.css';

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
        {item.varieties_count > 0 && (
          <small className="category-variety-count">{item.varieties_count} varieties</small>
        )}
      </div>
      <Link className="circle-action" to={categoryPath} aria-label={`Explore ${item.title}`}>
        →
      </Link>
    </article>
  );
}

export default CategoryCard;
