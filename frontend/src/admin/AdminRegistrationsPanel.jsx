import { RegistrationStatIcon, RegistrationTable } from './RegistrationTable.jsx';
import './AdminRegistrationsPanel.css';

export default function AdminRegistrationsPanel({
  activeView,
  dashboard,
  registrationData,
  exportingRegistrations,
  loadingRegistrations,
  exportRegistrations,
  topSearch,
  setTopSearch,
  filterInputs,
  updateDateFilter,
  clearFilters,
  registrationPageSize,
  setRegistrationPageSize,
  registrationPage,
  setRegistrationPage,
  registrationPageNumbers,
  openRegistrationDetails,
}) {
  return (
    <>
      {activeView === 'registrations' && (
        <>
          <div className="crm-metrics crm-registration-metrics">
            <article className="crm-registration-metric green">
              <span className="crm-metric-icon">
                <RegistrationStatIcon variant="people" />
              </span>
              <small>Total Registrations</small>
              <strong>{dashboard.stats.registrations || 0}</strong>
              <span className="crm-metric-note">All saved registrations</span>
            </article>
            <article className="crm-registration-metric blue">
              <span className="crm-metric-icon">
                <RegistrationStatIcon variant="calendar" />
              </span>
              <small>Today&apos;s Registrations</small>
              <strong>{dashboard.stats.registrations_today || 0}</strong>
              <span className="crm-metric-note">Registered today</span>
            </article>
          </div>
          <section className="crm-panel">
            <div className="crm-panel-heading crm-registration-panel-heading">
              <div>
                <h2>
                  All Registrations <span className="crm-total">{registrationData.total}</span>
                </h2>
                <p>
                  Search by name, mobile, email, or area. Private details are visible only to the
                  Super Admin.
                </p>
              </div>
              <button
                type="button"
                className="crm-export-button"
                disabled={exportingRegistrations || loadingRegistrations}
                onClick={exportRegistrations}
              >
                {exportingRegistrations ? 'Preparing…' : 'Export Excel'}
              </button>
            </div>
            <div className="crm-registration-filters">
              <label className="crm-filter-search">
                <input
                  type="search"
                  aria-label="Search by name, mobile, email, or area"
                  placeholder="Search by name, mobile, email, or area..."
                  value={topSearch}
                  onChange={(event) => setTopSearch(event.target.value)}
                />
              </label>
              <label className="crm-registration-date-filter">
                <span className="crm-date-label">Date</span>
                <input
                  aria-label="Registration date"
                  type="date"
                  value={filterInputs.registered_date}
                  onChange={(event) => updateDateFilter(event.target.value)}
                />
              </label>
              <div className="crm-filter-actions">
                <button type="button" onClick={clearFilters}>
                  Reset
                </button>
              </div>
            </div>
            {loadingRegistrations ? (
              <p className="crm-empty">Loading registrations…</p>
            ) : (
              <RegistrationTable
                registrations={registrationData.data}
                onViewDetails={openRegistrationDetails}
              />
            )}
            <div className="crm-table-footer">
              <div className="crm-pagination">
                <div className="crm-page-controls">
                  <label>
                    Rows per page
                    <select
                      value={registrationPageSize}
                      onChange={(event) => {
                        setRegistrationPageSize(Number(event.target.value));
                        setRegistrationPage(1);
                      }}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </label>
                  <span>
                    {registrationData.total
                      ? `${(registrationData.current_page - 1) * registrationData.per_page + 1}–${Math.min(registrationData.current_page * registrationData.per_page, registrationData.total)} of ${registrationData.total}`
                      : '0 results'}
                  </span>
                  <button
                    type="button"
                    disabled={registrationPage <= 1 || loadingRegistrations}
                    onClick={() => setRegistrationPage((page) => page - 1)}
                  >
                    Prev
                  </button>
                  {registrationPageNumbers.map((page) =>
                    typeof page === 'number' ? (
                      <button
                        type="button"
                        key={page}
                        className={page === registrationData.current_page ? 'active' : ''}
                        aria-current={page === registrationData.current_page ? 'page' : undefined}
                        onClick={() => setRegistrationPage(page)}
                      >
                        {page}
                      </button>
                    ) : (
                      <span className="crm-page-ellipsis" key={page}>
                        …
                      </span>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={
                      registrationPage >= registrationData.last_page || loadingRegistrations
                    }
                    onClick={() => setRegistrationPage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
