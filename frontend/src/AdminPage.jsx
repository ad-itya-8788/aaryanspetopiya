import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminPage.css';
import { clearCsrfToken, downloadFile, request } from './adminApi.js';
import RegistrationDetailsModal from './RegistrationDetailsModal.jsx';
import { paginationItems, formatDate } from './admin/registrationUtils.js';

const AdminOverviewPanel = lazy(() => import('./admin/AdminOverviewPanel.jsx'));
const AdminRegistrationsPanel = lazy(() => import('./admin/AdminRegistrationsPanel.jsx'));
const PetCategoriesManager = lazy(() =>
  import('./ContentManagement.jsx').then((module) => ({ default: module.PetCategoriesManager })),
);
const PetVarietiesManager = lazy(() =>
  import('./ContentManagement.jsx').then((module) => ({ default: module.PetVarietiesManager })),
);
const WebsiteImageManager = lazy(() =>
  import('./ContentManagement.jsx').then((module) => ({ default: module.WebsiteImageManager })),
);
const PetGamesAdmin = lazy(() => import('./PetGamesAdmin.jsx'));

const emptyFilters = { registered_date: '' };

function AdminPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const varietyRoute = pathname.match(/^\/admin\/pet-categories\/(\d+)\/varieties$/);
  const categoryPageRoute = pathname === '/admin/pet-categories';
  const mediaRoute = pathname.match(/^\/admin\/website-images\/(hero|family|gallery)$/);
  const registrationRoute = pathname === '/admin/registrations';
  const petGamesRoute = pathname === '/admin/pet-games';
  const dashboardRoute = pathname === '/admin/dashboard';
  const varietyCategoryId = varietyRoute ? Number(varietyRoute[1]) : null;
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState({ categories: [], images: [], stats: {} });
  const [registrationData, setRegistrationData] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [activeView, setActiveView] = useState(() =>
    registrationRoute
      ? 'registrations'
      : petGamesRoute
        ? 'pet-games'
        : categoryPageRoute || varietyCategoryId || mediaRoute
          ? 'content'
          : 'overview',
  );
  const [contentSection, setContentSection] = useState(() => mediaRoute?.[1] || 'explore');
  const [contentMenuOpen, setContentMenuOpen] = useState(true);
  const [topSearch, setTopSearch] = useState('');
  const [filterInputs, setFilterInputs] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [registrationPage, setRegistrationPage] = useState(1);
  const [registrationPageSize, setRegistrationPageSize] = useState(25);
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [exportingRegistrations, setExportingRegistrations] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const data = await request('/api/admin/dashboard');
    setDashboard(data);
  };

  useEffect(() => {
    if (registrationRoute) {
      setActiveView('registrations');
    } else if (petGamesRoute) {
      setActiveView('pet-games');
    } else if (pathname === '/admin' || dashboardRoute) {
      setActiveView('overview');
    } else if (categoryPageRoute || varietyCategoryId) {
      setActiveView('content');
      setContentSection('explore');
      setContentMenuOpen(true);
    } else if (mediaRoute) {
      setActiveView('content');
      setContentSection(mediaRoute[1]);
      setContentMenuOpen(true);
    }
  }, [
    registrationRoute,
    petGamesRoute,
    dashboardRoute,
    categoryPageRoute,
    varietyCategoryId,
    pathname,
  ]);

  useEffect(() => {
    let active = true;
    request('/api/admin/csrf')
      .then(() => request('/api/admin/me'))
      .then(async (data) => {
        if (!active) return;
        setUser(data.user);
        await refresh();
      })
      .catch((requestError) => {
        if (active && requestError.status !== 401) setError(requestError.message);
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user || !['overview', 'registrations'].includes(activeView)) return undefined;
    let active = true;
    const page = activeView === 'overview' ? 1 : registrationPage;
    const perPage = activeView === 'overview' ? 5 : registrationPageSize;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (activeView === 'registrations') {
      Object.entries(appliedFilters).forEach(([key, value]) => params.set(key, value));
    }
    setLoadingRegistrations(true);
    request(`/api/admin/registrations?${params}`)
      .then((data) => {
        if (active) setRegistrationData(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoadingRegistrations(false);
      });

    return () => {
      active = false;
    };
  }, [user, activeView, appliedFilters, registrationPage, registrationPageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = topSearch.trim();
      setAppliedFilters((current) => {
        if ((current.q ?? '') === query) return current;
        const next = { ...current };
        if (query) next.q = query;
        else delete next.q;
        return next;
      });
      setRegistrationPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [topSearch]);

  const updateDateFilter = (value) => {
    setFilterInputs((current) => ({ ...current, registered_date: value }));
    setAppliedFilters((current) => {
      if ((current.registered_date ?? '') === value) return current;
      const next = { ...current };
      if (value) next.registered_date = value;
      else delete next.registered_date;
      return next;
    });
    setRegistrationPage(1);
  };

  const clearFilters = () => {
    setFilterInputs({ ...emptyFilters });
    setTopSearch('');
    setAppliedFilters({});
    setRegistrationPage(1);
  };

  const exportRegistrations = async () => {
    setExportingRegistrations(true);
    setError('');
    setStatus('');
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => params.set(key, value));
    const query = params.toString();

    try {
      await downloadFile(
        `/api/admin/registrations/export${query ? `?${query}` : ''}`,
        'registrations.xls',
      );
      setStatus('Excel export downloaded.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExportingRegistrations(false);
    }
  };

  const openContentSection = (section) => {
    setActiveView('content');
    setContentSection(section);
    setError('');
    setStatus('');
    const destinations = {
      explore: '/admin/pet-categories',
      hero: '/admin/website-images/hero',
      family: '/admin/website-images/family',
      gallery: '/admin/website-images/gallery',
    };
    navigate(destinations[section] || '/admin');
  };

  const selectAdminView = (view) => {
    const destination =
      view === 'registrations'
        ? '/admin/registrations'
        : view === 'pet-games'
          ? '/admin/pet-games'
          : '/admin';
    setActiveView(view);
    if (pathname !== destination) navigate(destination);
    if (view === 'registrations') {
      refresh().catch((requestError) => setError(requestError.message));
    }
  };

  const openVarieties = (category) => {
    setActiveView('content');
    setContentSection('explore');
    navigate(`/admin/pet-categories/${category.id}/varieties`);
  };

  const openRegistrationDetails = (registration) => {
    setRegistrationDetails(registration);
    setError('');
    setStatus('');
  };

  const runAction = async (action, successMessage) => {
    setBusy(true);
    setError('');
    setStatus('');
    try {
      await action();
      await refresh();
      setStatus(successMessage);
      return true;
    } catch (actionError) {
      setError(actionError.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const signIn = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    await runAction(async () => {
      const data = await request('/api/admin/login', {
        method: 'POST',
        body: { email: form.get('email'), password: form.get('password') },
      });
      setUser(data.user);
      formElement.reset();
    }, 'Signed in successfully.');
  };

  const signOut = async () => {
    setBusy(true);
    setError('');
    setStatus('');
    try {
      await request('/api/admin/logout', { method: 'POST' });
      setUser(null);
      clearCsrfToken();
      setStatus('Signed out.');
      setActiveView('overview');
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy(false);
    }
  };

  if (checking)
    return (
      <main className="admin-screen">
        <div className="crm-loading">
          <span />
          <strong>Opening your workspace…</strong>
        </div>
      </main>
    );

  if (!user) {
    return (
      <main className="admin-screen">
        <section className="admin-login-card">
          <Link className="admin-back-link" to="/">
            Back to website
          </Link>
          <img src="/logo.png" alt="Aaryans Pet Paradise" />
          <span className="admin-eyebrow">Super Admin</span>
          <h1>Admin sign in</h1>
          <p>Access registrations and manage the website&apos;s photos.</p>
          {error && (
            <p className="admin-alert error" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={signIn}>
            <label>
              Email address
              <input name="email" type="email" autoComplete="username" required />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button className="primary-button" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  const pageTitle =
    activeView === 'overview'
      ? 'Dashboard'
      : activeView === 'registrations'
        ? 'Registrations'
        : activeView === 'pet-games'
          ? 'Pet Games'
          : varietyCategoryId
            ? 'Varieties'
            : {
                hero: 'Hero / Slider',
                family: 'Family Photos',
                explore: 'Pet Categories',
                gallery: 'Pet Gallery',
              }[contentSection] || 'Website Content';
  const contentItems = [
    { key: 'hero', label: 'Hero / Slider' },
    { key: 'family', label: 'Family Photos' },
    { key: 'explore', label: 'Pet Categories' },
    { key: 'gallery', label: 'Pet Gallery' },
  ];
  const displayedImages = dashboard.images.filter((image) => {
    if (contentSection === 'hero' || contentSection === 'family')
      return image.section_key === contentSection;
    return (
      contentSection === 'gallery' &&
      (image.section_key === 'gallery' || Boolean(image.pet_category_id))
    );
  });
  const registrationPageNumbers = paginationItems(
    registrationData.current_page,
    registrationData.last_page,
  );

  return (
    <main className="admin-screen">
      <div className="crm-shell">
        <aside className="crm-sidebar">
          <Link className="crm-brand" to="/" aria-label="Aaryans Pet Paradise home">
            <img src="/logo.png" alt="Aaryans Pet Paradise" />
          </Link>
          <nav className="crm-nav" aria-label="Admin sections">
            <button
              type="button"
              className={activeView === 'overview' ? 'active' : ''}
              onClick={() => selectAdminView('overview')}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={activeView === 'registrations' ? 'active' : ''}
              onClick={() => selectAdminView('registrations')}
            >
              Registrations
              <span className="crm-nav-count">{dashboard.stats.registrations || 0}</span>
            </button>
            <button
              type="button"
              className={activeView === 'pet-games' ? 'active' : ''}
              onClick={() => selectAdminView('pet-games')}
            >
              Pet Games
            </button>
            <button
              type="button"
              className={`crm-nav-parent${activeView === 'content' ? ' active' : ''}`}
              aria-expanded={contentMenuOpen}
              onClick={() => {
                setContentMenuOpen((open) => !open);
                if (activeView !== 'content') openContentSection('explore');
              }}
            >
              Website Content
              <span className="crm-nav-chevron">{contentMenuOpen ? 'Hide' : 'Show'}</span>
            </button>
            {contentMenuOpen && (
              <div className="crm-subnav">
                {contentItems.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={
                      activeView === 'content' && contentSection === item.key ? 'active' : ''
                    }
                    onClick={() => openContentSection(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </nav>
          <div className="crm-sidebar-spacer" />
          <Link className="crm-website-link" to="/">
            View Website
          </Link>
          <div className="crm-sidebar-bottom">Connected</div>
        </aside>
        <section className="crm-main">
          <header className="crm-topbar">
            <div className="crm-breadcrumb">
              Workspace <span>/</span> <b>{pageTitle}</b>
            </div>
            <div className="crm-top-actions">
              <button
                className="crm-top-registrations"
                type="button"
                onClick={() => selectAdminView('registrations')}
              >
                Registrations
              </button>
              <div className="crm-user">
                <span className="crm-avatar">{(user.name || 'A').charAt(0).toUpperCase()}</span>
                <div>
                  <b>{user.name}</b>
                  <small>Super Admin</small>
                </div>
                <button type="button" onClick={signOut} disabled={busy}>
                  Sign out
                </button>
              </div>
            </div>
          </header>
          <div
            className={`crm-content${activeView === 'registrations' ? ' registrations-view' : ''}`}
          >
            <div
              className={`crm-title-row${activeView === 'registrations' ? ' crm-registration-title-row' : ''}`}
            >
              <div>
                <span className="admin-eyebrow">PET PARADISE CRM</span>
                <h1>{pageTitle}</h1>
                <p>
                  {activeView === 'overview'
                    ? 'Your registrations and website activity at a glance.'
                    : activeView === 'registrations'
                      ? 'Manage and follow up with registered users.'
                      : varietyCategoryId
                        ? 'Manage this category’s varieties.'
                        : contentSection === 'explore'
                          ? 'Manage main pet categories and their varieties.'
                          : 'Manage website images for this section.'}
                </p>
              </div>
              {activeView === 'registrations' && (
                <div className="crm-registration-hero-pets" aria-hidden="true">
                  <img src="/images/golden-dog.webp" alt="" loading="lazy" decoding="async" />
                  <img src="/images/cats.webp" alt="" loading="lazy" decoding="async" />
                </div>
              )}
              <span className="crm-date">{formatDate(new Date())}</span>
            </div>
            {(error || status) && (
              <p
                className={`admin-alert ${error ? 'error' : 'success'}`}
                role={error ? 'alert' : 'status'}
              >
                {error || status}
              </p>
            )}

            <Suspense
              fallback={
                <section className="crm-panel">
                  <p className="crm-empty">Loading admin view…</p>
                </section>
              }
            >
              {activeView === 'overview' && (
                <AdminOverviewPanel
                  activeView={activeView}
                  user={user}
                  dashboard={dashboard}
                  loadingRegistrations={loadingRegistrations}
                  registrationData={registrationData}
                  openRegistrationDetails={openRegistrationDetails}
                  openContentSection={openContentSection}
                  selectAdminView={selectAdminView}
                />
              )}
              {activeView === 'registrations' && (
                <AdminRegistrationsPanel
                  activeView={activeView}
                  dashboard={dashboard}
                  registrationData={registrationData}
                  exportingRegistrations={exportingRegistrations}
                  loadingRegistrations={loadingRegistrations}
                  exportRegistrations={exportRegistrations}
                  topSearch={topSearch}
                  setTopSearch={setTopSearch}
                  filterInputs={filterInputs}
                  updateDateFilter={updateDateFilter}
                  clearFilters={clearFilters}
                  registrationPageSize={registrationPageSize}
                  setRegistrationPageSize={setRegistrationPageSize}
                  registrationPage={registrationPage}
                  setRegistrationPage={setRegistrationPage}
                  registrationPageNumbers={registrationPageNumbers}
                  openRegistrationDetails={openRegistrationDetails}
                />
              )}
            </Suspense>

            {activeView === 'pet-games' && (
              <Suspense
                fallback={
                  <section className="crm-panel">
                    <p className="crm-empty">Loading Pet Games admin…</p>
                  </section>
                }
              >
                <PetGamesAdmin />
              </Suspense>
            )}

            {activeView === 'content' && (
              <Suspense
                fallback={
                  <section className="crm-panel">
                    <p className="crm-empty">Loading content manager…</p>
                  </section>
                }
              >
                {varietyCategoryId ? (
                  <PetVarietiesManager
                    category={dashboard.categories.find(
                      (category) => category.id === varietyCategoryId,
                    )}
                    busy={busy}
                    onAction={runAction}
                    onBack={() => navigate('/admin/pet-categories')}
                  />
                ) : contentSection === 'explore' ? (
                  <PetCategoriesManager
                    categories={dashboard.categories}
                    busy={busy}
                    onAction={runAction}
                    onOpenVarieties={openVarieties}
                  />
                ) : ['hero', 'family', 'gallery'].includes(contentSection) ? (
                  <WebsiteImageManager
                    section={contentSection}
                    images={displayedImages}
                    busy={busy}
                    onAction={runAction}
                  />
                ) : (
                  <PetCategoriesManager
                    categories={dashboard.categories}
                    busy={busy}
                    onAction={runAction}
                    onOpenVarieties={openVarieties}
                  />
                )}
              </Suspense>
            )}
            <footer className="crm-footer">
              Aaryans Pet Paradise · CRM workspace{' '}
              <span>Changes are saved through the Laravel JSON API.</span>
            </footer>
          </div>
        </section>
      </div>
      {registrationDetails && (
        <RegistrationDetailsModal
          registrationId={registrationDetails.id}
          initialRegistration={registrationDetails}
          onClose={() => setRegistrationDetails(null)}
        />
      )}
    </main>
  );
}

export default AdminPage;
