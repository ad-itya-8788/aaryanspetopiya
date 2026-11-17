import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaCombobox from '../AreaCombobox.jsx';
import './RegisterPage.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [area, setArea] = useState('');
  const [formValues, setFormValues] = useState({
    fullName: '',
    mobile: '',
    email: '',
    instaId: '',
    address: '',
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const completedFields = [
    Boolean(formValues.fullName.trim()),
    /^[6-9][0-9]{9}$/.test(formValues.mobile.trim()),
    Boolean(area.trim()),
    Boolean(formValues.address.trim()),
  ];
  const progress = Math.round(
    (completedFields.filter(Boolean).length / completedFields.length) * 100,
  );

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
        throw new Error(
          validationMessage ||
            result.message ||
            'We could not submit your registration. Please try again.',
        );
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
            <h1>
              Aaryan&apos;s Pet Paradise <span>Community</span>
            </h1>
            <p>Be part of a caring community built for pet lovers and their furry friends.</p>
            <ul className="register-benefits">
              <li>
                <span>
                  <strong>Discover our pets</strong>
                  <small>Explore breeds, photos and details</small>
                </span>
              </li>
              <li>
                <span>
                  <strong>Get updates</strong>
                  <small>Stay informed about new additions</small>
                </span>
              </li>
              <li>
                <span>
                  <strong>Connect with pet lovers</strong>
                  <small>Share the joy of caring for pets</small>
                </span>
              </li>
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
              <button
                type="button"
                className="success-toast-close"
                aria-label="Dismiss notification"
                onClick={() => setShowSuccessToast(false)}
              >
                ×
              </button>
              <span className="success-toast-progress" aria-hidden="true" />
            </div>
          )}
          {submitted ? (
            <div className="confirmation-card success-card">
              <h2>You&apos;re on the list!</h2>
              <p>Your registration has been received. Our team can now follow up with you.</p>
              <button
                className="primary-button"
                onClick={() => {
                  setSubmitted(false);
                  setShowSuccessToast(false);
                }}
              >
                Add another registration
              </button>
              <button className="text-button" onClick={() => navigate('/')}>
                Back to home
              </button>
            </div>
          ) : (
            <form className="form-card register-form" onSubmit={submit}>
              <div className="register-form-heading">
                <div>
                  <h2>Your details</h2>
                  <p className="muted">
                    Fields marked <span>*</span> are required.
                  </p>
                </div>
              </div>
              <div className="register-progress-wrap">
                <div className="register-progress-copy">
                  <span>Form progress</span>
                  <strong>
                    {completedFields.filter(Boolean).length} of {completedFields.length} required
                    fields
                  </strong>
                </div>
                <div
                  className="register-progress"
                  role="progressbar"
                  aria-label="Required fields completed"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={progress}
                >
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>
              {submissionError && (
                <p className="admin-alert error" role="alert">
                  {submissionError}
                </p>
              )}
              <div className="form-grid">
                <label className={`register-field${completedFields[0] ? ' is-complete' : ''}`}>
                  <span className="field-label">
                    Full name <b>*</b>
                  </span>
                  <span className="input-shell">
                    <input
                      name="fullName"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={formValues.fullName}
                      onChange={updateFormField}
                      required
                    />
                  </span>
                </label>
                <label className={`register-field${completedFields[1] ? ' is-complete' : ''}`}>
                  <span className="field-label">
                    Mobile number <b>*</b>
                  </span>
                  <span className="input-shell">
                    <input
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      title="Enter a valid 10-digit Indian mobile number"
                      autoComplete="tel"
                      placeholder="Enter mobile number"
                      value={formValues.mobile}
                      onChange={updateFormField}
                      required
                    />
                  </span>
                </label>
                <label className="register-field span-two">
                  <span className="field-label">Email address</span>
                  <span className="input-shell">
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      value={formValues.email}
                      onChange={updateFormField}
                    />
                  </span>
                </label>
                <label className="register-field span-two">
                  <span className="field-label">Instagram ID</span>
                  <span className="input-shell">
                    <input
                      name="instaId"
                      autoComplete="username"
                      placeholder="Enter your Instagram handle"
                      value={formValues.instaId}
                      onChange={updateFormField}
                    />
                  </span>
                </label>
                <label
                  className={`register-field span-two${completedFields[2] ? ' is-complete' : ''}`}
                >
                  <span className="field-label">
                    Area / locality <b>*</b>
                  </span>
                  <AreaCombobox
                    value={area}
                    onChange={(nextArea) => {
                      setArea(nextArea || '');
                      setSubmissionError('');
                    }}
                  />
                </label>
                <label
                  className={`register-field span-two${completedFields[3] ? ' is-complete' : ''}`}
                >
                  <span className="field-label">
                    Complete address <b>*</b>
                  </span>
                  <span className="input-shell textarea-shell">
                    <textarea
                      name="address"
                      rows="3"
                      autoComplete="street-address"
                      placeholder="Enter your complete address"
                      value={formValues.address}
                      onChange={updateFormField}
                      required
                    />
                  </span>
                </label>
              </div>
              <button
                className="primary-button register-submit"
                type="submit"
                disabled={submitting}
              >
                {' '}
                {submitting ? 'Submitting…' : 'Complete registration'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;
