import { useEffect, useMemo, useState } from 'react';
import { request } from './adminApi.js';

const categoryFallbacks = {
  dogs: '/images/dogs.webp',
  cats: '/images/cats.webp',
  puppies: '/images/puppies.webp',
  kittens: '/images/kittens.webp',
  'pet-care': '/images/pet-care.webp',
  'pet-community': '/images/community.webp',
};

function fallbackUrl(slug) {
  return categoryFallbacks[slug] || categoryFallbacks.dogs;
}

function ImagePicker({ label, name, initialUrl, required = false, multiple = false }) {
  const [preview, setPreview] = useState(initialUrl || '');
  const [localUrls, setLocalUrls] = useState([]);
  useEffect(() => {
    setPreview(initialUrl || '');
  }, [initialUrl]);
  useEffect(() => () => localUrls.forEach((url) => URL.revokeObjectURL(url)), [localUrls]);
  const selectFiles = (event) => {
    const urls = Array.from(event.target.files || []).map((file) => URL.createObjectURL(file));
    setLocalUrls((current) => [...current, ...urls]);
    if (urls[0]) setPreview(urls[0]);
  };

  return (
    <label className="cms-image-picker">
      <span>{label}</span>
      {preview && <img src={preview} alt="Selected image preview" onError={(event) => { event.currentTarget.hidden = true; }} />}
      <input name={name} type="file" accept="image/jpeg,image/png,image/webp" required={required} multiple={multiple} onChange={selectFiles} />
      <small>JPG, PNG or WebP · maximum 5 MB per image</small>
    </label>
  );
}

function CategoryForm({ category, busy, onCancel, onSave }) {
  const formId = 'cms-category-form';
  return (
    <div className="cms-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="cms-modal" role="dialog" aria-modal="true" aria-labelledby="cms-category-title">
        <div className="crm-panel-heading"><div><h2 id="cms-category-title">{category?.id ? 'Edit Category' : 'Add Main Category'}</h2><p>Set the category details and choose its public images.</p></div><button type="button" className="cms-close" onClick={onCancel} aria-label="Close">Close</button></div>
        <form id={formId} className="cms-form-grid" onSubmit={onSave}>
          <label>Category name<input name="title" defaultValue={category?.title || ''} maxLength="100" required /></label>
          <label className="cms-span-two">Short description<textarea name="short_description" defaultValue={category?.short_description || ''} maxLength="500" rows="2" /></label>
          <label className="cms-span-two">Detailed description<textarea name="detailed_description" defaultValue={category?.detailed_description || ''} maxLength="10000" rows="4" /></label>
          <ImagePicker label="Main cover image" name="cover_image" initialUrl={category?.cover_image_url || category?.images?.[0]?.url} />
          <ImagePicker label="Optional category banner" name="banner_image" initialUrl={category?.banner_image_url} />
          <label>Display order<input name="display_order" type="number" min="0" max="10000" defaultValue={category?.display_order ?? 0} required /></label>
          <label className="cms-toggle"><input name="is_active" type="checkbox" defaultChecked={category?.is_active ?? true} /> Published</label>
        </form>
        <div className="cms-modal-actions"><button type="button" onClick={onCancel}>Cancel</button><button className="crm-primary-button" type="submit" form={formId} disabled={busy}>{busy ? 'Saving…' : 'Save Category'}</button></div>
      </section>
    </div>
  );
}

export function PetCategoriesManager({ categories, busy, onAction, onOpenVarieties }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [localBusy, setLocalBusy] = useState(false);
  const filtered = useMemo(() => categories.filter((category) => (
    category.title.toLowerCase().includes(search.toLowerCase())
    && (visibility === 'all' || (visibility === 'published') === category.is_active)
  )), [categories, search, visibility]);

  const saveCategory = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = new FormData();
    ['title', 'short_description', 'detailed_description', 'display_order'].forEach((key) => body.append(key, form.get(key) || ''));
    body.append('is_active', form.has('is_active') ? '1' : '0');
    ['cover_image', 'banner_image'].forEach((key) => { if (form.get(key)?.size) body.append(key, form.get(key)); });
    if (editing?.id) body.append('_method', 'PUT');
    setLocalBusy(true);
    const saved = await onAction(
      () => request(editing?.id ? `/api/admin/categories/${editing.id}` : '/api/admin/categories', { method: 'POST', body }),
      editing?.id ? 'Category updated.' : 'Category added.',
    );
    setLocalBusy(false);
    if (saved) setEditing(null);
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete ${category.title}, its varieties, and related photos?`)) return;
    await onAction(() => request(`/api/admin/categories/${category.id}`, { method: 'DELETE' }), 'Category deleted.');
  };

  return (
    <section className="crm-panel cms-category-page">
      <div className="cms-toolbar">
        <label className="cms-search"><input aria-label="Search categories" placeholder="Search categories (e.g. Dogs, Cats...)" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <label className="cms-status-filter">Status<select value={visibility} onChange={(event) => setVisibility(event.target.value)}><option value="all">All categories</option><option value="published">Published</option><option value="hidden">Hidden</option></select></label>
        <button className="crm-primary-button" type="button" onClick={() => setEditing({})}>Add Main Category</button>
      </div>
      {filtered.length ? <div className="cms-category-grid">{filtered.map((category) => (
        <article className="cms-category-card" key={category.id}>
          <img className="cms-category-cover" src={category.cover_image_url || category.images?.[0]?.url || fallbackUrl(category.slug)} alt={`${category.title} cover`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = fallbackUrl(category.slug); }} />
          <div className="cms-category-body">
            <div className="cms-category-heading"><h2>{category.title}</h2><span className={`cms-status ${category.is_active ? 'published' : 'hidden'}`}>{category.is_active ? 'Published' : 'Hidden'}</span></div>
            <p>{category.short_description || 'Add a short description for this pet category.'}</p>
            <div className="cms-category-meta"><span>{category.varieties_count || 0} varieties</span><span>Order {category.display_order}</span></div>
            <div className="cms-card-actions">
              <button className="cms-icon-action" type="button" title="Edit category" aria-label="Edit category" onClick={() => setEditing(category)}>Edit</button>
              <button className="cms-icon-action cms-primary-action" type="button" title="Manage varieties" aria-label="Manage varieties" onClick={() => onOpenVarieties(category)}>Varieties</button>
              <button className="cms-icon-action cms-delete-link" type="button" title="Delete category" aria-label="Delete category" disabled={busy} onClick={() => removeCategory(category)}>Delete</button>
            </div>
          </div>
        </article>
      ))}</div> : <p className="crm-empty">No categories match this search.</p>}
      {editing && <CategoryForm category={editing.id ? editing : null} busy={busy || localBusy} onCancel={() => setEditing(null)} onSave={saveCategory} />}
    </section>
  );
}

function VarietyForm({ category, variety, busy, onCancel, onSave }) {
  const formId = 'cms-variety-form';
  return (
    <div className="cms-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="cms-modal" role="dialog" aria-modal="true" aria-labelledby="cms-variety-title">
        <div className="crm-panel-heading"><div><h2 id="cms-variety-title">{variety ? 'Edit Variety' : 'Add New Variety'} - {category.title}</h2><p>Varieties are saved only under this category.</p></div><button type="button" className="cms-close" onClick={onCancel} aria-label="Close">Close</button></div>
        <form id={formId} className="cms-form-grid" onSubmit={onSave}>
          <label>Variety name<input name="name" defaultValue={variety?.name || ''} maxLength="120" required /></label>
          <label className="cms-span-two">Short description<textarea name="short_description" defaultValue={variety?.short_description || ''} rows="2" maxLength="500" /></label>
          <label className="cms-span-two">Detailed description<textarea name="detailed_description" defaultValue={variety?.detailed_description || ''} rows="3" maxLength="10000" /></label>
          <ImagePicker label="Main variety image" name="image" initialUrl={variety?.image_url} required={!variety} />
          <ImagePicker label="Additional images (optional)" name="additional_images[]" multiple />
          <label>Display order<input name="display_order" type="number" min="0" max="10000" defaultValue={variety?.display_order ?? 0} required /></label>
          <label className="cms-toggle"><input name="is_active" type="checkbox" defaultChecked={variety?.is_active ?? true} /> Published</label>
        </form>
        <div className="cms-modal-actions"><button type="button" onClick={onCancel}>Cancel</button><button className="crm-primary-button" type="submit" form={formId} disabled={busy}>{busy ? 'Saving…' : 'Save Variety'}</button></div>
      </section>
    </div>
  );
}

export function PetVarietiesManager({ category, busy, onAction, onBack }) {
  const [varieties, setVarieties] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadVarieties = async () => {
    if (!category) return;
    setLoading(true);
    try {
      const data = await request(`/api/admin/categories/${category.id}/varieties`);
      setVarieties(data.varieties);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVarieties(); }, [category?.id]);

  const saveVariety = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = new FormData();
    ['name', 'short_description', 'detailed_description', 'display_order'].forEach((key) => body.append(key, form.get(key) || ''));
    body.append('is_active', form.has('is_active') ? '1' : '0');
    if (form.get('image')?.size) body.append('image', form.get('image'));
    Array.from(form.getAll('additional_images[]')).forEach((image) => { if (image.size) body.append('additional_images[]', image); });
    const editingVariety = editing?.id ? editing : null;
    if (editingVariety) body.append('_method', 'PUT');
    const saved = await onAction(
      () => request(editingVariety ? `/api/admin/varieties/${editingVariety.id}` : `/api/admin/categories/${category.id}/varieties`, { method: 'POST', body }),
      editingVariety ? 'Variety updated.' : 'Variety added.',
    );
    if (saved) {
      setEditing(null);
      await loadVarieties();
    }
  };

  const removeVariety = async (variety) => {
    if (!window.confirm(`Delete ${variety.name} and its additional photos?`)) return;
    if (await onAction(() => request(`/api/admin/varieties/${variety.id}`, { method: 'DELETE' }), 'Variety deleted.')) await loadVarieties();
  };

  const removeImage = async (image) => {
    if (!window.confirm('Delete this additional image?')) return;
    if (await onAction(() => request(`/api/admin/variety-images/${image.id}`, { method: 'DELETE' }), 'Additional image deleted.')) await loadVarieties();
  };

  const shown = varieties.filter((variety) => (
    variety.name.toLowerCase().includes(search.toLowerCase())
    && (visibility === 'all' || (visibility === 'published') === variety.is_active)
  ));

  if (!category) return <section className="crm-panel"><p className="crm-empty">This category is unavailable. <button type="button" onClick={onBack}>Back to Categories</button></p></section>;

  return (
    <section className="crm-panel cms-varieties-page">
      <div className="cms-variety-header">
        <img src={category.cover_image_url || category.images?.[0]?.url || fallbackUrl(category.slug)} alt={`${category.title} category`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = fallbackUrl(category.slug); }} />
        <div><div className="cms-breadcrumb">Dashboard / <button type="button" onClick={onBack}>Pet Categories</button> / {category.title} / Varieties</div><h2>{category.title} varieties</h2><p>{category.short_description || 'Manage varieties belonging to this category.'}</p><div className="cms-category-meta"><span>{varieties.length} total</span><span>{varieties.filter((item) => item.is_active).length} published</span></div></div>
        <button className="crm-primary-button" type="button" onClick={() => setEditing({})}>Add New Variety</button>
      </div>
      <div className="cms-toolbar"><label className="cms-search"><input aria-label="Search varieties" placeholder="Search varieties" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="cms-status-filter">Status<select value={visibility} onChange={(event) => setVisibility(event.target.value)}><option value="all">All varieties</option><option value="published">Published</option><option value="hidden">Hidden</option></select></label><button type="button" onClick={onBack}>Back to Categories</button></div>
      {error && <p className="admin-alert error" role="alert">{error}</p>}
      {loading ? <p className="crm-empty">Loading varieties…</p> : shown.length ? <div className="cms-category-grid">{shown.map((variety) => (
        <article className="cms-category-card cms-variety-card" key={variety.id}>
          {variety.image_url ? <img className="cms-category-cover" src={variety.image_url} alt={variety.name} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = fallbackUrl(category.slug); }} /> : <div className="cms-image-empty">No image</div>}
          <div className="cms-category-body"><div className="cms-category-heading"><h2>{variety.name}</h2><span className={`cms-status ${variety.is_active ? 'published' : 'hidden'}`}>{variety.is_active ? 'Published' : 'Hidden'}</span></div><p>{variety.short_description || 'No short description yet.'}</p><div className="cms-category-meta"><span>Order {variety.display_order}</span><span>{variety.images?.length || 0} additional images</span></div>
            {variety.images?.length > 0 && <div className="cms-extra-images">{variety.images.map((image) => image.url && <div key={image.id}><img src={image.url} alt={image.alt_text || variety.name} loading="lazy" decoding="async" /><button type="button" onClick={() => removeImage(image)} aria-label="Delete additional image">Remove</button></div>)}</div>}
            <div className="cms-card-actions"><button type="button" onClick={() => setEditing(variety)}>Edit</button><button className="cms-delete-link" type="button" disabled={busy} onClick={() => removeVariety(variety)}>Delete</button></div>
          </div>
        </article>
      ))}</div> : <p className="crm-empty">No varieties in {category.title} yet. Add one to get started.</p>}
      {editing && <VarietyForm category={category} variety={editing.id ? editing : null} busy={busy} onCancel={() => setEditing(null)} onSave={saveVariety} />}
    </section>
  );
}

const imageSectionTitles = {
  hero: ['Homepage Hero / Slider', 'Manage the photos shown in the homepage hero.'],
  family: ['Family Photos', 'Manage photos for the family section.'],
  gallery: ['Pet Gallery', 'Manage standalone gallery photos and their details.'],
};

export function WebsiteImageManager({ section, images, busy, onAction }) {
  const [localBusy, setLocalBusy] = useState(false);
  const [title, description] = imageSectionTitles[section];

  const saveImage = async (event, image) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = new FormData();
    body.append('section_key', section);
    ['pet_name', 'alt_text', 'display_order'].forEach((key) => body.append(key, form.get(key) || ''));
    body.append('is_active', form.has('is_active') ? '1' : '0');
    if (form.get('image')?.size) body.append('image', form.get('image'));
    body.append('_method', 'PUT');
    await onAction(() => request(`/api/admin/images/${image.id}`, { method: 'POST', body }), 'Photo updated.');
  };

  const addImage = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const body = new FormData();
    body.append('section_key', section);
    ['pet_name', 'alt_text', 'display_order'].forEach((key) => body.append(key, form.get(key) || ''));
    body.append('is_active', form.has('is_active') ? '1' : '0');
    body.append('image', form.get('image'));
    setLocalBusy(true);
    const saved = await onAction(() => request('/api/admin/images', { method: 'POST', body }), 'Photo uploaded.');
    setLocalBusy(false);
    if (saved) formElement.reset();
  };

  const removeImage = async (image) => {
    if (!window.confirm('Delete this photo?')) return;
    await onAction(() => request(`/api/admin/images/${image.id}`, { method: 'DELETE' }), 'Photo deleted.');
  };

  return (
    <section className="crm-panel cms-media-page">
      <div className="crm-panel-heading"><div><h2>{title}</h2><p>{description} JPG, PNG or WebP · maximum 5 MB.</p></div></div>
      <form className="cms-upload-card" onSubmit={addImage}>
        <h3>Add {section === 'hero' ? 'Hero Image' : section === 'family' ? 'Family Photo' : 'Gallery Photo'}</h3>
        <div className="cms-form-grid">
          <ImagePicker label="Choose image" name="image" required />
          <label>{section === 'gallery' ? 'Pet name (optional)' : 'Image title (optional)'}<input name="pet_name" maxLength="100" /></label>
          <label>Alternative text<input name="alt_text" maxLength="255" placeholder="Describe this image" /></label>
          <label>Display order<input name="display_order" type="number" min="0" max="10000" defaultValue="0" required /></label>
          <label className="cms-toggle"><input name="is_active" type="checkbox" defaultChecked /> Published</label>
        </div>
        <button className="crm-primary-button" type="submit" disabled={busy || localBusy}>{localBusy ? 'Uploading…' : 'Upload Image'}</button>
      </form>
      <div className="crm-panel-heading cms-library-heading"><div><h2>Current images <span className="crm-total">{images.length}</span></h2></div></div>
      {images.length ? <div className="cms-media-grid">{images.map((image) => (
        <form className="cms-media-card" key={image.id} onSubmit={(event) => saveImage(event, image)}>
          <img src={image.url || fallbackUrl('dogs')} alt={image.alt_text || image.pet_name || 'Pet photo'} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = fallbackUrl('dogs'); }} />
          <div className="cms-form-grid"><label>Title / pet name<input name="pet_name" defaultValue={image.pet_name || ''} maxLength="100" /></label><label>Alternative text<input name="alt_text" defaultValue={image.alt_text || ''} maxLength="255" /></label><ImagePicker label="Replace image" name="image" initialUrl={image.url} /><label>Display order<input name="display_order" type="number" min="0" max="10000" defaultValue={image.display_order} required /></label><label className="cms-toggle"><input name="is_active" type="checkbox" defaultChecked={image.is_active} /> Published</label></div>
          <div className="cms-card-actions"><button className="crm-primary-button" type="submit" disabled={busy}>Save Changes</button><button className="cms-delete-link" type="button" disabled={busy} onClick={() => removeImage(image)}>Delete</button></div>
        </form>
      ))}</div> : <p className="crm-empty">No images in this section yet. The public website will keep its built-in fallback images.</p>}
    </section>
  );
}
