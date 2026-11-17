import { useEffect, useState } from 'react';
import { request } from './adminApi.js';

function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function RegistrationDetailsModal({ registrationId, initialRegistration, onClose }) {
  const [detail, setDetail] = useState(() => (initialRegistration ? { registration: initialRegistration } : null));
  const [loading, setLoading] = useState(!initialRegistration);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (initialRegistration) setDetail({ registration: initialRegistration });
    setLoading(!initialRegistration);
    request(`/api/admin/registrations/${registrationId}`)
      .then((data) => {
        if (active) setDetail(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [registrationId, initialRegistration]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const registration = detail?.registration;

  return (
    <div
      className="crm-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="crm-registration-modal" role="dialog" aria-modal="true" aria-labelledby="crm-registration-modal-title">
        <header className="crm-registration-modal-header">
          <div className="crm-registration-modal-title-wrap">
            <div>
              <span className="crm-registration-modal-eyebrow">REGISTRATION</span>
              <h2 id="crm-registration-modal-title">Registration Details</h2>
            </div>
          </div>
          <button type="button" className="crm-modal-close" onClick={onClose} aria-label="Close dialog">Close</button>
        </header>

        {loading && !registration ? (
          <div className="crm-modal-loading" role="status">Loading registration details…</div>
        ) : registration ? (
          <div className="crm-registration-modal-body">
            <section className="crm-registration-details" aria-label="Registration information">
              <div className="crm-registration-person"><div><small>{registration.full_name}</small><strong>Registration ID: #{registration.id}</strong></div></div>
              <div className="crm-registration-phone"><div><small>{registration.mobile}</small><strong>Mobile</strong></div></div>
              <div><small>Email</small><strong>{registration.email || '—'}</strong></div>
              <div><small>Instagram ID</small><strong>{registration.insta_id || '—'}</strong></div>
              <div><small>City / District</small><strong>{[registration.city, registration.district].filter(Boolean).join(', ') || '—'}</strong></div>
              <div><small>PIN code / State</small><strong>{[registration.pincode, registration.state].filter(Boolean).join(' · ') || '—'}</strong></div>
              <div><small>Registration date</small><strong>{formatDateTime(registration.created_at)}</strong></div>
              {registration.address && <div className="crm-registration-address"><small>Address</small><strong>{[registration.area, registration.address].filter(Boolean).join(', ')}</strong></div>}
            </section>
          </div>
        ) : (
          <div className="crm-modal-error" role="alert">{error || 'Registration details could not be loaded.'}</div>
        )}
      </section>
    </div>
  );
}

export default RegistrationDetailsModal;
