import { PageIntro } from '../components/SiteChrome.jsx';
import './ContactPage.css';

export function ContactPage() {
  return (
    <div className="inner-page">
      <PageIntro
        eyebrow="Get in touch"
        title={
          <>
            We&apos;d love to
            <br />
            <span>hear from you.</span>
          </>
        }
        description="Find our location and visit us at Aaryans Pet Paradise."
      />
      <div className="contact-layout contact-layout-single">
        <aside className="contact-card">
          <span className="page-eyebrow">Visit us</span>
          <h2>Aaryans Pet Paradise</h2>
          <p>
            Aaryans World School,
            <br />
            Next Bhilarewadi, Bhilarewadi,
            <br />
            Pune – 411046, Maharashtra, India.
          </p>
          <div className="map-placeholder">📍 &nbsp; Bhilarewadi, Pune</div>
          <p className="muted">Phone, email and opening hours will be added when confirmed.</p>
        </aside>
      </div>
    </div>
  );
}

export default ContactPage;
