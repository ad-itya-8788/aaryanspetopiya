import { formatDate } from './registrationUtils.js';
import './RegistrationTable.css';

export function RegistrationStatIcon({ variant }) {
  if (variant === 'calendar') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
        <path d="M9 15h2M14 15h2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.6-3.1 2.8-5 5.5-5s4.9 1.9 5.5 5" />
      <path d="M16 5.4a3.2 3.2 0 0 1 0 6.2M17.5 15c2 .5 3.2 2.2 3.5 5" />
    </svg>
  );
}

export function RegistrationTable({ registrations, compact = false, onViewDetails }) {
  const columns = ['full_name', 'mobile', 'email', 'insta_id', 'area', 'registered', 'actions'];
  const labels = {
    full_name: 'Full Name',
    mobile: 'Mobile Number',
    email: 'Email',
    insta_id: 'Instagram ID',
    area: 'Area / Locality',
    registered: 'Registration Date',
    actions: 'Actions',
  };
  const content = (
    <div className="crm-table-wrap">
      <table className={`crm-table${compact ? ' compact' : ' crm-registrations-table'}`}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{labels[column]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {registrations.map((registration) => (
            <tr key={registration.id}>
              {columns.map((column) => {
                if (column === 'id') return <td key={column}>#{registration.id}</td>;
                if (column === 'full_name')
                  return (
                    <td key={column}>
                      <strong>{registration.full_name}</strong>
                    </td>
                  );
                if (column === 'registered')
                  return <td key={column}>{formatDate(registration.created_at)}</td>;
                if (column === 'insta_id')
                  return <td key={column}>{registration.insta_id || '—'}</td>;
                if (column === 'actions') {
                  return (
                    <td key={column}>
                      <div className="crm-contact-actions">
                        <button
                          className="crm-details-action"
                          type="button"
                          onClick={() => onViewDetails(registration)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  );
                }
                return <td key={column}>{registration[column] || '—'}</td>;
              })}
            </tr>
          ))}
          {registrations.length === 0 && (
            <tr>
              <td className="crm-no-results" colSpan={columns.length}>
                No registrations match these filters. Try another search or date.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return content;
}
