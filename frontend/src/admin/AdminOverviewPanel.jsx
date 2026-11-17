import { ActivityChart, CategoryDonut } from './DashboardCharts.jsx';
import { RegistrationTable } from './RegistrationTable.jsx';
import './AdminOverviewPanel.css';

export default function AdminOverviewPanel({
  activeView,
  user,
  dashboard,
  loadingRegistrations,
  registrationData,
  openRegistrationDetails,
  openContentSection,
  selectAdminView,
}) {
  return (
    <>
      {activeView === 'overview' && (
        <section className="crm-welcome-banner">
          <div className="crm-welcome-copy">
            <span>AARYANS PET PARADISE · ADMIN WORKSPACE</span>
            <h2>Welcome Back, {user.name}!</h2>
            <p>Here&apos;s what&apos;s happening at Aaryans Pet Paradise today.</p>
          </div>
          <div className="crm-banner-pets" aria-hidden="true">
            <img src="/images/golden-dog.webp" alt="" loading="lazy" decoding="async" />
            <img src="/images/cats.webp" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="crm-banner-sign">
            <img src="/logo.png" alt="" />
          </div>
        </section>
      )}

      {activeView === 'overview' && (
        <div className="crm-metrics crm-overview-metrics">
          <article className="crm-overview-metric">
            <small>Total Registrations</small>
            <strong>{dashboard.stats.registrations || 0}</strong>
            <span className="crm-metric-note">
              {dashboard.stats.registrations_last_30_days || 0} in the last 30 days
            </span>
          </article>
          <article className="crm-overview-metric">
            <small>Visible Categories</small>
            <strong>{dashboard.stats.categories || 0}</strong>
            <span className="crm-metric-note">Explore Paradise sections</span>
          </article>
          <article className="crm-overview-metric">
            <small>Active Photos</small>
            <strong>{dashboard.stats.photos || 0}</strong>
            <span className="crm-metric-note">Across all sections</span>
          </article>
          <article className="crm-overview-metric">
            <small>Photo Destinations</small>
            <strong>{dashboard.stats.photo_destinations || 0}</strong>
            <span className="crm-metric-note">With active photos</span>
          </article>
        </div>
      )}

      {activeView === 'overview' && (
        <>
          <div className="crm-overview-grid">
            <section className="crm-panel crm-activity-panel">
              <div className="crm-panel-heading">
                <div>
                  <h2>
                    Website Activity <small>(Last 30 Days)</small>
                  </h2>
                </div>
              </div>
              <ActivityChart activity={dashboard.website_activity} />
            </section>
            <section className="crm-panel crm-categories-panel">
              <div className="crm-panel-heading">
                <div>
                  <h2>Category Overview</h2>
                </div>
                <button
                  type="button"
                  className="crm-link-button"
                  onClick={() => openContentSection('explore')}
                >
                  Manage
                </button>
              </div>
              <CategoryDonut categories={dashboard.category_overview} />
            </section>
            <section className="crm-panel crm-quick-actions">
              <div className="crm-panel-heading">
                <div>
                  <h2>Quick Actions</h2>
                </div>
              </div>
              <button type="button" onClick={() => openContentSection('hero')}>
                Add / Edit Hero Slider
              </button>
              <button type="button" onClick={() => openContentSection('explore')}>
                Manage Categories
              </button>
              <button type="button" onClick={() => openContentSection('gallery')}>
                Upload Pet Photos
              </button>
              <button type="button" onClick={() => selectAdminView('registrations')}>
                View Registrations
              </button>
              <button type="button" onClick={() => selectAdminView('pet-games')}>
                View Pet Games Data
              </button>
            </section>
          </div>
          <section className="crm-panel">
            <div className="crm-panel-heading">
              <div>
                <h2>Recent Registrations</h2>
                <p>The latest people joining your community.</p>
              </div>
              <button
                type="button"
                className="crm-link-button"
                onClick={() => selectAdminView('registrations')}
              >
                View All Registrations
              </button>
            </div>
            {loadingRegistrations ? (
              <p className="crm-empty">Loading registrations…</p>
            ) : (
              <RegistrationTable
                registrations={registrationData.data}
                compact
                onViewDetails={openRegistrationDetails}
              />
            )}
          </section>
        </>
      )}
    </>
  );
}
