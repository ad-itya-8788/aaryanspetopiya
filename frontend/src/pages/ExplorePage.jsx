import { Link, useSearchParams } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard.jsx';
import { PageIntro } from '../components/SiteChrome.jsx';
import './ExplorePage.css';

export function ExplorePage({ categories }) {
  const [params, setParams] = useSearchParams();
  const currentCategory = params.get('category');
  const shown = currentCategory
    ? categories.filter((item) => item.title === currentCategory)
    : categories;
  return (
    <div className="inner-page">
      <PageIntro
        eyebrow="Explore our paradise"
        title={
          <>
            A happy place for
            <br />
            <span>every kind of paw.</span>
          </>
        }
        description="Find inspiration, care ideas and community for the pets who make life brighter."
      />
      <div className="filter-row">
        <button
          className={!currentCategory ? 'filter-chip selected' : 'filter-chip'}
          onClick={() => setParams({})}
        >
          All categories
        </button>
        {categories.map((item) => (
          <button
            className={currentCategory === item.title ? 'filter-chip selected' : 'filter-chip'}
            key={item.title}
            onClick={() => setParams({ category: item.title })}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="card-grid explore-grid">
        {shown.map((item) => (
          <CategoryCard item={item} large key={item.title} />
        ))}
      </div>
      <section className="care-note">
        <div>
          <h2>Care starts with curiosity.</h2>
          <p>
            Explore the gallery for a little inspiration, or get in touch if you have a question for
            our team.
          </p>
        </div>
        <Link className="primary-button" to="/help">
          Visit Help &amp; Support →
        </Link>
      </section>
    </div>
  );
}

export default ExplorePage;
