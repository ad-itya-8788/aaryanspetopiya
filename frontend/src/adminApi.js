const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
let csrfToken = '';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError')
      throw new ApiError('The server took too long to respond. Please retry.', 0);
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  if (method !== 'GET' && !csrfToken) {
    const csrfResponse = await fetchWithTimeout(`${apiBase}/api/admin/csrf`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    const csrfData = await csrfResponse.json();
    if (!csrfResponse.ok)
      throw new ApiError(
        csrfData.message || 'Could not start a secure session.',
        csrfResponse.status,
      );
    csrfToken = csrfData.csrf_token;
  }

  const headers = { Accept: 'application/json' };
  if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const response = await fetchWithTimeout(`${apiBase}${path}`, {
    method,
    credentials: 'same-origin',
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validationMessage = data.errors && Object.values(data.errors).flat()[0];
    throw new ApiError(
      validationMessage || data.message || `Request failed (${response.status}).`,
      response.status,
    );
  }
  if (data.csrf_token) csrfToken = data.csrf_token;
  return data;
}

export async function downloadFile(path, fallbackFilename) {
  const response = await fetchWithTimeout(`${apiBase}${path}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/vnd.ms-excel' },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.message || `Download failed (${response.status}).`, response.status);
  }

  const disposition = response.headers.get('Content-Disposition') || '';
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || fallbackFilename;
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function clearCsrfToken() {
  csrfToken = '';
}
