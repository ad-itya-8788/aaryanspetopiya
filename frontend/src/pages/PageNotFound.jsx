import { Link } from 'react-router-dom';
import { PageIntro } from '../components/SiteChrome.jsx';
import './PageNotFound.css';

export function PageNotFound() {
  return (
    <div className="inner-page not-found">
      <PageIntro
        eyebrow="Page not found"
        title={
          <>
            Oops, that page
            <br />
            <span>isn&apos;t here.</span>
          </>
        }
        description="The link may have changed. Head back home and explore from there."
      />
      <Link className="primary-button" to="/">
        Back to home →
      </Link>
    </div>
  );
}

export default PageNotFound;
