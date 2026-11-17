import { Link } from 'react-router-dom';
import { PageIntro } from '../components/SiteChrome.jsx';
import { reasons } from '../data/siteContent.js';
import './AboutPage.css';

export function AboutPage() {
  return (
    <div className="inner-page">
      <PageIntro
        eyebrow="Our story"
        title={
          <>
            More Than Pets.
            <br />
            <span>They&apos;re Family.</span>
          </>
        }
        description="Aaryans Pet Paradise is a place built around the joy, care and companionship pets bring to our lives."
      />
      <section className="about-feature">
        <div className="about-image" role="img" aria-label="A person spending time with a dog" />
        <div>
          <span className="page-eyebrow">A place for every paw</span>
          <h2>Every little life matters.</h2>
          <p>
            We believe every pet deserves kindness, care and a welcoming community. Our goal is to
            bring pet lovers together and make it easier to find helpful information, discover
            pet-friendly resources and celebrate the bond we share with animals.
          </p>
          <p>
            We&apos;re growing this paradise with love. Explore our pages, learn more about pet care
            and join our community.
          </p>
          <Link className="primary-button" to="/explore">
            Explore Paradise →
          </Link>
        </div>
      </section>
      <section className="about-values">
        <div className="section-title centered">
          <h2>What matters to us</h2>
        </div>
        <div className="value-grid">
          {reasons.map((item) => (
            <div className="value-item" key={item.label}>
              <h3>{item.label}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
