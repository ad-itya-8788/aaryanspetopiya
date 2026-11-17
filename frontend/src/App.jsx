import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { Footer, Header } from './components/SiteChrome.jsx';
import { fallbackCategories } from './data/siteContent.js';
import AboutPage from './pages/AboutPage.jsx';
import CategoryDetailPage from './pages/CategoryDetailPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import HomePage from './pages/HomePage.jsx';
import PageNotFound from './pages/PageNotFound.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const AdminPage = lazy(() => import('./AdminPage.jsx'));
const PetGamesPage = lazy(() => import('./PetGamesPage.jsx'));

function SiteLayout() {
  const { pathname, search } = useLocation();
  const [websiteData, setWebsiteData] = useState(null);
  const [websiteDataReady, setWebsiteDataReady] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    fetch(`${apiBase}/api/homepage`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Homepage API returned HTTP ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (active) {
          setWebsiteData(data);
        }
      })
      .catch((error) => {
        if (active) {
          console.warn(
            'Using built-in Pet Paradise content because the backend is unavailable.',
            error,
          );
        }
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (active) {
          setWebsiteDataReady(true);
        }
      });

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const categories = websiteData?.categories?.length
    ? websiteData.categories.map((category) => {
        const fallback = fallbackCategories.find((item) => item.slug === category.slug);

        return {
          ...category,
          image: fallback?.image || 'custom-category',
          photo: fallback?.photo || fallbackCategories[0].photo,
          description:
            category.short_description ||
            fallback?.description ||
            'Discover more for pets and their families.',
          isCustom: !fallback,
        };
      })
    : fallbackCategories;
  const useFallbackCategories = websiteDataReady && !websiteData?.categories?.length;
  const heroImages = websiteData?.hero_images || [];
  const familyImages = websiteData?.family_images || [];
  const galleryImages = websiteData?.gallery_images || [];

  useEffect(() => {
    const targets = document.querySelectorAll(
      [
        '.hero-copy',
        '.hero-visual',
        '.section-title',
        '.mini-card',
        '.family-visual',
        '.family-copy',
        '.choose-us-title',
        '.value-item',
        '.home-cta',
        '.page-intro',
        '.about-feature > *',
        '.about-values',
        '.filter-row',
        '.care-note',
        '.gallery-tile',
        '.faq-item',
        '.contact-layout > *',
        '.register-story',
        '.register-wrap',
      ].join(','),
    );

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' },
    );

    targets.forEach((target, index) => {
      target.classList.add('reveal-on-scroll');
      target.classList.remove('is-visible');
      target.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [pathname, search, websiteData]);

  if (pathname.startsWith('/admin')) {
    return (
      <Suspense
        fallback={
          <main className="admin-screen">
            <div className="crm-loading">
              <span />
              <strong>Opening your workspace…</strong>
            </div>
          </main>
        }
      >
        <AdminPage />
      </Suspense>
    );
  }

  return (
    <div className="site">
      <Header />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                categories={categories}
                heroImages={heroImages}
                familyImages={familyImages}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/explore" element={<ExplorePage categories={categories} />} />
          <Route
            path="/explore-paradise/:slug"
            element={
              <CategoryDetailPage
                categories={categories}
                useFallbackCategories={useFallbackCategories}
              />
            }
          />
          <Route
            path="/gallery"
            element={<GalleryPage categories={categories} galleryImages={galleryImages} />}
          />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/pet-games"
            element={
              <Suspense
                fallback={
                  <main className="pet-games-content">
                    <p className="pet-game-loading">Opening Pet Games Paradise…</p>
                  </main>
                }
              >
                <PetGamesPage />
              </Suspense>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SiteLayout />
    </BrowserRouter>
  );
}

export default App;
