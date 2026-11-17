import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearCsrfToken, downloadFile, request } from './adminApi.js';
import RegistrationDetailsModal from './RegistrationDetailsModal.jsx';

const PetCategoriesManager = lazy(() => import('./ContentManagement.jsx').then((module) => ({ default: module.PetCategoriesManager })));
const PetVarietiesManager = lazy(() => import('./ContentManagement.jsx').then((module) => ({ default: module.PetVarietiesManager })));
const WebsiteImageManager = lazy(() => import('./ContentManagement.jsx').then((module) => ({ default: module.WebsiteImageManager })));
const PetGamesAdmin = lazy(() => import('./PetGamesAdmin.jsx'));

const emptyFilters = { registered_date: '' };

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function RegistrationStatIcon({ variant }) {
  if (variant === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
        <path d="M9 15h2M14 15h2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.6-3.1 2.8-5 5.5-5s4.9 1.9 5.5 5" />
      <path d="M16 5.4a3.2 3.2 0 0 1 0 6.2M17.5 15c2 .5 3.2 2.2 3.5 5" />
    </svg>
  );
}


function paginationItems(currentPage, lastPage) {
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, index) => index + 1);
  const pages = [...new Set([1, 2, currentPage - 1, currentPage, currentPage + 1, lastPage - 1, lastPage])]
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((left, right) => left - right);
  return pages.reduce((items, page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push(`ellipsis-${page}`);
    items.push(page);
    return items;
  }, []);
}

function RegistrationTable({
  registrations,
  compact = false,
  onViewDetails,
}) {
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
          <tr>{columns.map((column) => (
            <th key={column}>{labels[column]}</th>
          ))}</tr>
        </thead>
        <tbody>
          {registrations.map((registration) => (
            <tr key={registration.id}>
              {columns.map((column) => {
                if (column === 'id') return <td key={column}>#{registration.id}</td>;
                if (column === 'full_name') return <td key={column}><strong>{registration.full_name}</strong></td>;
                if (column === 'registered') return <td key={column}>{formatDate(registration.created_at)}</td>;
                if (column === 'insta_id') return <td key={column}>{registration.insta_id || '—'}</td>;
                if (column === 'actions') {
                  return (
                    <td key={column}>
                      <div className="crm-contact-actions">
                        <button className="crm-details-action" type="button" onClick={() => onViewDetails(registration)}>View Details</button>
                      </div>
                    </td>
                  );
                }
                return <td key={column}>{registration[column] || '—'}</td>;
              })}
            </tr>
          ))}
          {registrations.length === 0 && <tr><td className="crm-no-results" colSpan={columns.length}>No registrations match these filters. Try another search or date.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return content;
}

function ActivityChart({ activity = [] }) {
  const counts = new Map(activity.map((item) => [item.date, Number(item.count)]));
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 29 + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { date: key, count: counts.get(key) || 0 };
  });
  const maximum = Math.max(1, ...days.map((item) => item.count));
  const points = days.map((item, index) => `${index * 20},${130 - (item.count / maximum) * 112}`).join(' ');
  const areaPath = `M 0 140 L ${points.replaceAll(' ', ' L ')} L 580 140 Z`;

  return (
    <div className="crm-activity-chart">
      <svg viewBox="0 0 580 165" role="img" aria-label="Daily registrations over the last 30 days">
        <defs><linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#79d34b" stopOpacity=".42" /><stop offset="100%" stopColor="#79d34b" stopOpacity=".02" /></linearGradient></defs>
        {[30, 65, 100, 135].map((y) => <line key={y} x1="0" x2="580" y1={y} y2={y} className="crm-chart-grid" />)}
        <path d={areaPath} fill="url(#activity-fill)" />
        <polyline points={points} fill="none" stroke="#52b52c" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {days.filter((day) => day.count > 0).map((day, index) => {
          const dayIndex = days.indexOf(day);
          return <circle key={day.date} cx={dayIndex * 20} cy={130 - (day.count / maximum) * 112} r="3.5" fill="#fff" stroke="#45a925" strokeWidth="2" aria-label={`${day.date}: ${day.count} registrations`} />;
        })}
      </svg>
      <div className="crm-chart-labels">{[0, 5, 10, 15, 20, 25, 29].map((index) => <span key={days[index].date}>{new Date(`${days[index].date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>)}</div>
    </div>
  );
}

function CategoryDonut({ categories = [] }) {
  const active = categories.filter((category) => category.is_active);
  const colors = ['#48a52a', '#f28c18', '#883bd7', '#25bfd2', '#397df0', '#ec5890', '#85a0ac'];
  const segmentSize = active.length ? 100 / active.length : 100;
  const stops = active.map((category, index) => `${colors[index % colors.length]} ${index * segmentSize}% ${(index + 1) * segmentSize}%`);
  const background = active.length ? `conic-gradient(${stops.join(', ')})` : '#e8edf0';

  return (
    <div className="crm-category-chart">
      <div className="crm-donut" style={{ background }}><div><strong>{active.length}</strong><span>Categories</span></div></div>
      <div className="crm-category-legend">
        {active.map((category, index) => <div key={category.id}><i style={{ background: colors[index % colors.length] }} /><span>{category.title}</span><b>{category.images_count}</b></div>)}
      </div>
    </div>
  );
}

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
  const [registrationData, setRegistrationData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [activeView, setActiveView] = useState(() => (registrationRoute ? 'registrations' : petGamesRoute ? 'pet-games' : (categoryPageRoute || varietyCategoryId || mediaRoute) ? 'content' : 'overview'));
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
  }, [registrationRoute, petGamesRoute, dashboardRoute, categoryPageRoute, varietyCategoryId, pathname]);

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

    return () => { active = false; };
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

    return () => { active = false; };
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
      await downloadFile(`/api/admin/registrations/export${query ? `?${query}` : ''}`, 'registrations.xls');
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
    const destination = view === 'registrations' ? '/admin/registrations' : view === 'pet-games' ? '/admin/pet-games' : '/admin';
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

  if (checking) return <main className="admin-screen"><div className="crm-loading"><span /><strong>Opening your workspace…</strong></div></main>;

  if (!user) {
    return (
      <main className="admin-screen">
        <section className="admin-login-card">
          <Link className="admin-back-link" to="/">Back to website</Link>
          <img src="/logo.png" alt="Aaryans Pet Paradise" />
          <span className="admin-eyebrow">Super Admin</span>
          <h1>Admin sign in</h1>
          <p>Access registrations and manage the website&apos;s photos.</p>
          {error && <p className="admin-alert error" role="alert">{error}</p>}
          <form onSubmit={signIn}>
            <label>Email address<input name="email" type="email" autoComplete="username" required /></label>
            <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
            <button className="primary-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </section>
      </main>
    );
  }

  const pageTitle = activeView === 'overview'
    ? 'Dashboard'
    : activeView === 'registrations'
      ? 'Registrations'
      : activeView === 'pet-games'
        ? 'Pet Games'
      : varietyCategoryId
        ? 'Varieties'
      : ({
        hero: 'Hero / Slider',
        family: 'Family Photos',
        explore: 'Pet Categories',
        gallery: 'Pet Gallery',
      }[contentSection] || 'Website Content');
  const contentItems = [
    { key: 'hero', label: 'Hero / Slider' },
    { key: 'family', label: 'Family Photos' },
    { key: 'explore', label: 'Pet Categories' },
    { key: 'gallery', label: 'Pet Gallery' },
  ];
  const displayedImages = dashboard.images.filter((image) => {
    if (contentSection === 'hero' || contentSection === 'family') return image.section_key === contentSection;
    return contentSection === 'gallery' && (image.section_key === 'gallery' || Boolean(image.pet_category_id));
  });
  const registrationPageNumbers = paginationItems(registrationData.current_page, registrationData.last_page);

  return (
    <main className="admin-screen">
      <div className="crm-shell">
        <aside className="crm-sidebar">
          <Link className="crm-brand" to="/" aria-label="Aaryans Pet Paradise home"><img src="/logo.png" alt="Aaryans Pet Paradise" /></Link>
          <nav className="crm-nav" aria-label="Admin sections">
            <button type="button" className={activeView === 'overview' ? 'active' : ''} onClick={() => selectAdminView('overview')}>Dashboard</button>
            <button type="button" className={activeView === 'registrations' ? 'active' : ''} onClick={() => selectAdminView('registrations')}>Registrations<span className="crm-nav-count">{dashboard.stats.registrations || 0}</span></button>
            <button type="button" className={activeView === 'pet-games' ? 'active' : ''} onClick={() => selectAdminView('pet-games')}>Pet Games</button>
            <button type="button" className={`crm-nav-parent${activeView === 'content' ? ' active' : ''}`} aria-expanded={contentMenuOpen} onClick={() => { setContentMenuOpen((open) => !open); if (activeView !== 'content') openContentSection('explore'); }}>Website Content<span className="crm-nav-chevron">{contentMenuOpen ? 'Hide' : 'Show'}</span></button>
            {contentMenuOpen && <div className="crm-subnav">{contentItems.map((item) => <button type="button" key={item.key} className={activeView === 'content' && contentSection === item.key ? 'active' : ''} onClick={() => openContentSection(item.key)}>{item.label}</button>)}</div>}
          </nav>
          <div className="crm-sidebar-spacer" />
          <Link className="crm-website-link" to="/">View Website</Link>
          <div className="crm-sidebar-bottom">Connected</div>
        </aside>
        <section className="crm-main">
          <header className="crm-topbar">
            <div className="crm-breadcrumb">Workspace <span>/</span> <b>{pageTitle}</b></div>
            <div className="crm-top-actions"><button className="crm-top-registrations" type="button" onClick={() => selectAdminView('registrations')}>Registrations</button><div className="crm-user"><span className="crm-avatar">{(user.name || 'A').charAt(0).toUpperCase()}</span><div><b>{user.name}</b><small>Super Admin</small></div><button type="button" onClick={signOut} disabled={busy}>Sign out</button></div></div>
          </header>
          <div className={`crm-content${activeView === 'registrations' ? ' registrations-view' : ''}`}>
            <div className={`crm-title-row${activeView === 'registrations' ? ' crm-registration-title-row' : ''}`}>
              <div><span className="admin-eyebrow">PET PARADISE CRM</span><h1>{pageTitle}</h1><p>{activeView === 'overview' ? 'Your registrations and website activity at a glance.' : activeView === 'registrations' ? 'Manage and follow up with registered users.' : varietyCategoryId ? 'Manage this category’s varieties.' : contentSection === 'explore' ? 'Manage main pet categories and their varieties.' : 'Manage website images for this section.'}</p></div>
              {activeView === 'registrations' && <div className="crm-registration-hero-pets" aria-hidden="true"><img src="/images/golden-dog.webp" alt="" loading="lazy" decoding="async" /><img src="/images/cats.webp" alt="" loading="lazy" decoding="async" /></div>}
              <span className="crm-date">{formatDate(new Date())}</span>
            </div>
            {(error || status) && <p className={`admin-alert ${error ? 'error' : 'success'}`} role={error ? 'alert' : 'status'}>{error || status}</p>}

            {activeView === 'overview' && (
              <section className="crm-welcome-banner">
                <div className="crm-welcome-copy"><span>AARYANS PET PARADISE · ADMIN WORKSPACE</span><h2>Welcome Back, {user.name}!</h2><p>Here&apos;s what&apos;s happening at Aaryans Pet Paradise today.</p></div>
                <div className="crm-banner-pets" aria-hidden="true"><img src="/images/golden-dog.webp" alt="" loading="lazy" decoding="async" /><img src="/images/cats.webp" alt="" loading="lazy" decoding="async" /></div>
                <div className="crm-banner-sign"><img src="/logo.png" alt="" /></div>
              </section>
            )}

            {activeView === 'overview' && (
              <div className="crm-metrics crm-overview-metrics">
                <article className="crm-overview-metric"><small>Total Registrations</small><strong>{dashboard.stats.registrations || 0}</strong><span className="crm-metric-note">{dashboard.stats.registrations_last_30_days || 0} in the last 30 days</span></article>
                <article className="crm-overview-metric"><small>Visible Categories</small><strong>{dashboard.stats.categories || 0}</strong><span className="crm-metric-note">Explore Paradise sections</span></article>
                <article className="crm-overview-metric"><small>Active Photos</small><strong>{dashboard.stats.photos || 0}</strong><span className="crm-metric-note">Across all sections</span></article>
                <article className="crm-overview-metric"><small>Photo Destinations</small><strong>{dashboard.stats.photo_destinations || 0}</strong><span className="crm-metric-note">With active photos</span></article>
              </div>
            )}

            {activeView === 'overview' && (
              <>
                <div className="crm-overview-grid">
                  <section className="crm-panel crm-activity-panel">
                    <div className="crm-panel-heading"><div><h2>Website Activity <small>(Last 30 Days)</small></h2></div></div>
                    <ActivityChart activity={dashboard.website_activity} />
                  </section>
                  <section className="crm-panel crm-categories-panel">
                    <div className="crm-panel-heading"><div><h2>Category Overview</h2></div><button type="button" className="crm-link-button" onClick={() => openContentSection('explore')}>Manage</button></div>
                    <CategoryDonut categories={dashboard.category_overview} />
                  </section>
                  <section className="crm-panel crm-quick-actions">
                    <div className="crm-panel-heading"><div><h2>Quick Actions</h2></div></div>
                    <button type="button" onClick={() => openContentSection('hero')}>Add / Edit Hero Slider</button>
                    <button type="button" onClick={() => openContentSection('explore')}>Manage Categories</button>
                    <button type="button" onClick={() => openContentSection('gallery')}>Upload Pet Photos</button>
                    <button type="button" onClick={() => selectAdminView('registrations')}>View Registrations</button>
                    <button type="button" onClick={() => selectAdminView('pet-games')}>View Pet Games Data</button>
                  </section>
                </div>
                <section className="crm-panel">
                  <div className="crm-panel-heading"><div><h2>Recent Registrations</h2><p>The latest people joining your community.</p></div><button type="button" className="crm-link-button" onClick={() => selectAdminView('registrations')}>View All Registrations</button></div>
                  {loadingRegistrations ? <p className="crm-empty">Loading registrations…</p> : <RegistrationTable
                    registrations={registrationData.data}
                    compact
                    onViewDetails={openRegistrationDetails}
                  />}
                </section>
              </>
            )}

            {activeView === 'registrations' && (
              <>
                <div className="crm-metrics crm-registration-metrics">
                  <article className="crm-registration-metric green">
                    <span className="crm-metric-icon"><RegistrationStatIcon variant="people" /></span>
                    <small>Total Registrations</small>
                    <strong>{dashboard.stats.registrations || 0}</strong>
                    <span className="crm-metric-note">All saved registrations</span>
                  </article>
                  <article className="crm-registration-metric blue">
                    <span className="crm-metric-icon"><RegistrationStatIcon variant="calendar" /></span>
                    <small>Today&apos;s Registrations</small>
                    <strong>{dashboard.stats.registrations_today || 0}</strong>
                    <span className="crm-metric-note">Registered today</span>
                  </article>
                </div>
                <section className="crm-panel">
                  <div className="crm-panel-heading crm-registration-panel-heading">
                    <div><h2>All Registrations <span className="crm-total">{registrationData.total}</span></h2><p>Search by name, mobile, email, or area. Private details are visible only to the Super Admin.</p></div>
                    <button type="button" className="crm-export-button" disabled={exportingRegistrations || loadingRegistrations} onClick={exportRegistrations}>{exportingRegistrations ? 'Preparing…' : 'Export Excel'}</button>
                  </div>
                  <div className="crm-registration-filters">
                    <label className="crm-filter-search"><input type="search" aria-label="Search by name, mobile, email, or area" placeholder="Search by name, mobile, email, or area..." value={topSearch} onChange={(event) => setTopSearch(event.target.value)} /></label>
                    <label className="crm-registration-date-filter">
                      <span className="crm-date-label">Date</span>
                      <input aria-label="Registration date" type="date" value={filterInputs.registered_date} onChange={(event) => updateDateFilter(event.target.value)} />
                    </label>
                    <div className="crm-filter-actions"><button type="button" onClick={clearFilters}>Reset</button></div>
                  </div>
                  {loadingRegistrations ? <p className="crm-empty">Loading registrations…</p> : <RegistrationTable
                    registrations={registrationData.data}
                    onViewDetails={openRegistrationDetails}
                  />}
                  <div className="crm-table-footer">
                    <div className="crm-pagination">
                      <div className="crm-page-controls">
                        <label>Rows per page<select value={registrationPageSize} onChange={(event) => { setRegistrationPageSize(Number(event.target.value)); setRegistrationPage(1); }}><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></label>
                        <span>{registrationData.total ? `${(registrationData.current_page - 1) * registrationData.per_page + 1}–${Math.min(registrationData.current_page * registrationData.per_page, registrationData.total)} of ${registrationData.total}` : '0 results'}</span>
                        <button type="button" disabled={registrationPage <= 1 || loadingRegistrations} onClick={() => setRegistrationPage((page) => page - 1)}>Prev</button>
                        {registrationPageNumbers.map((page) => typeof page === 'number'
                          ? <button type="button" key={page} className={page === registrationData.current_page ? 'active' : ''} aria-current={page === registrationData.current_page ? 'page' : undefined} onClick={() => setRegistrationPage(page)}>{page}</button>
                          : <span className="crm-page-ellipsis" key={page}>…</span>)}
                        <button type="button" disabled={registrationPage >= registrationData.last_page || loadingRegistrations} onClick={() => setRegistrationPage((page) => page + 1)}>Next</button>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeView === 'pet-games' && (
              <Suspense fallback={<section className="crm-panel"><p className="crm-empty">Loading Pet Games admin…</p></section>}>
                <PetGamesAdmin />
              </Suspense>
            )}

            {activeView === 'content' && (
              <Suspense fallback={<section className="crm-panel"><p className="crm-empty">Loading content manager…</p></section>}>
                {varietyCategoryId
                  ? <PetVarietiesManager
                    category={dashboard.categories.find((category) => category.id === varietyCategoryId)}
                    busy={busy}
                    onAction={runAction}
                    onBack={() => navigate('/admin/pet-categories')}
                  />
                  : contentSection === 'explore'
                    ? <PetCategoriesManager categories={dashboard.categories} busy={busy} onAction={runAction} onOpenVarieties={openVarieties} />
                    : ['hero', 'family', 'gallery'].includes(contentSection)
                      ? <WebsiteImageManager section={contentSection} images={displayedImages} busy={busy} onAction={runAction} />
                      : <PetCategoriesManager categories={dashboard.categories} busy={busy} onAction={runAction} onOpenVarieties={openVarieties} />}
              </Suspense>
            )}
            <footer className="crm-footer">Aaryans Pet Paradise · CRM workspace <span>Changes are saved through the Laravel JSON API.</span></footer>
          </div>
        </section>
      </div>
      {registrationDetails && <RegistrationDetailsModal
        registrationId={registrationDetails.id}
        initialRegistration={registrationDetails}
        onClose={() => setRegistrationDetails(null)}
      />}
    </main>
  );
}

export default AdminPage;
